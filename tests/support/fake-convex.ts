import schema from "../../convex/schema";

/**
 * An in-memory stand-in for `ctx.db`, enough to run the journal's queries
 * and the article writes in `bun test` — and to count what they read.
 *
 * Indexes come from the real schema (`convex/schema.ts`): a query on an
 * index that does not exist, or a range that skips one of its fields, fails
 * here as it would on Convex. Documents are ordered like Convex orders them
 * — index fields, then `_creationTime` — and every document a query hands
 * back is counted, with its size in bytes.
 */

type Value = unknown;
type Doc = Record<string, Value> & { _id: string; _creationTime: number };

type IndexSpec = { name: string; fields: string[] };
type SearchSpec = { name: string; searchField: string; filterFields: string[] };

type TableSpec = {
  indexes: IndexSpec[];
  searchIndexes: SearchSpec[];
};

type SchemaTable = {
  " indexes"(): { indexDescriptor: string; fields: string[] }[];
  searchIndexes: {
    indexDescriptor: string;
    searchField: string;
    filterFields: string[];
  }[];
};

const TABLES: Record<string, TableSpec> = Object.fromEntries(
  Object.entries(schema.tables as unknown as Record<string, SchemaTable>).map(
    ([name, table]) => [
      name,
      {
        indexes: [
          { name: "by_creation_time", fields: [] },
          ...table[" indexes"]().map((index) => ({
            name: index.indexDescriptor,
            fields: index.fields,
          })),
        ],
        searchIndexes: table.searchIndexes.map((index) => ({
          name: index.indexDescriptor,
          searchField: index.searchField,
          filterFields: index.filterFields,
        })),
      },
    ]
  )
);

/* ------------------------------------------------------------ ordering */

const TYPE_RANK = (value: Value): number => {
  if (value === undefined) return 0;
  if (value === null) return 1;
  if (typeof value === "bigint") return 2;
  if (typeof value === "number") return 3;
  if (typeof value === "boolean") return 4;
  if (typeof value === "string") return 5;
  if (Array.isArray(value)) return 7;
  return 8;
};

export function compareValues(a: Value, b: Value): number {
  const rank = TYPE_RANK(a) - TYPE_RANK(b);
  if (rank !== 0) return rank;
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "string" && typeof b === "string") {
    return a < b ? -1 : a > b ? 1 : 0;
  }
  if (typeof a === "boolean" && typeof b === "boolean") {
    return Number(a) - Number(b);
  }
  return 0;
}

const sizeOf = (doc: Doc): number =>
  new TextEncoder().encode(JSON.stringify(doc)).length;

/** Words of a searchable text, as a full-text index tokenises it (memoised). */
const tokens = new Map<string, Set<string>>();
function wordsOf(text: string): Set<string> {
  let words = tokens.get(text);
  if (!words) {
    words = new Set(text.toLowerCase().split(/[^\p{L}\p{N}]+/u));
    tokens.set(text, words);
  }
  return words;
}

/* -------------------------------------------------------------- ranges */

type Condition = {
  op: "eq" | "gt" | "gte" | "lt" | "lte";
  field: string;
  value: Value;
};

function rangeBuilder(fields: string[], conditions: Condition[]) {
  let position = 0;
  let lower = false;
  let upper = false;
  const next = (op: Condition["op"], field: string, value: Value) => {
    if (op === "eq") {
      if (lower || upper || fields[position] !== field) {
        throw new Error(
          `Range: eq(${field}) out of index order (${fields.join(", ")})`
        );
      }
      position += 1;
    } else {
      if (fields[position] !== field) {
        throw new Error(
          `Range: ${op}(${field}) is not the next field (${fields.join(", ")})`
        );
      }
      if (op === "gt" || op === "gte") {
        if (lower || upper)
          throw new Error("Range: lower bound after another bound");
        lower = true;
      } else {
        if (upper) throw new Error("Range: two upper bounds");
        upper = true;
      }
    }
    conditions.push({ op, field, value });
    return builder;
  };
  const builder = {
    eq: (field: string, value: Value) => next("eq", field, value),
    gt: (field: string, value: Value) => next("gt", field, value),
    gte: (field: string, value: Value) => next("gte", field, value),
    lt: (field: string, value: Value) => next("lt", field, value),
    lte: (field: string, value: Value) => next("lte", field, value),
  };
  return builder;
}

function satisfies(doc: Doc, conditions: Condition[]): boolean {
  return conditions.every(({ op, field, value }) => {
    const order = compareValues(doc[field], value);
    switch (op) {
      case "eq":
        return order === 0;
      case "gt":
        return order > 0;
      case "gte":
        return order >= 0;
      case "lt":
        return order < 0;
      case "lte":
        return order <= 0;
    }
  });
}

/* ------------------------------------------------------------- the db */

export type ReadStats = {
  documents: number;
  bytes: number;
  queries: number;
  /** Documents read, per table. */
  tables: Record<string, number>;
};

export function createFakeDb(options: { start?: number } = {}) {
  const tables = new Map<string, Map<string, Doc>>();
  const tableOf = new Map<string, string>();
  let clock = options.start ?? 1_700_000_000_000;
  let sequence = 0;
  const reads: ReadStats = { documents: 0, bytes: 0, queries: 0, tables: {} };
  const writes: { table: string; op: string; id: string }[] = [];

  const rowsOf = (table: string) => {
    if (!TABLES[table]) throw new Error(`Unknown table ${table}`);
    let rows = tables.get(table);
    if (!rows) tables.set(table, (rows = new Map()));
    return rows;
  };

  const count = (doc: Doc): Doc => {
    const table = tableOf.get(doc._id) ?? "?";
    reads.documents += 1;
    reads.bytes += sizeOf(doc);
    reads.tables[table] = (reads.tables[table] ?? 0) + 1;
    return structuredClone(doc);
  };

  const resolve = (tableOrId: string, maybeId?: unknown): [string, string] => {
    if (typeof maybeId === "string") return [tableOrId, maybeId];
    const table = tableOf.get(tableOrId);
    if (!table) throw new Error(`Unknown id ${tableOrId}`);
    return [table, tableOrId];
  };

  function query(table: string) {
    const spec = TABLES[table];
    if (!spec) throw new Error(`Unknown table ${table}`);
    let index: IndexSpec = spec.indexes[0];
    const conditions: Condition[] = [];
    let search: {
      spec: SearchSpec;
      text: string;
      filters: Condition[];
    } | null = null;
    let order: "asc" | "desc" = "asc";

    const ordered = (): Doc[] => {
      reads.queries += 1;
      const rows = [...rowsOf(table).values()];
      if (search) {
        const terms = search.text
          .toLowerCase()
          .split(/[^\p{L}\p{N}]+/u)
          .filter(Boolean);
        const field = search.spec.searchField;
        return rows
          .filter((doc) => satisfies(doc, search!.filters))
          .map((doc) => {
            const words = wordsOf(String(doc[field] ?? ""));
            const hits = terms.filter((term, position) =>
              position === terms.length - 1
                ? [...words].some((word) => word.startsWith(term))
                : words.has(term)
            ).length;
            return { doc, hits };
          })
          .filter((entry) => entry.hits > 0)
          .sort(
            (a, b) =>
              b.hits - a.hits || b.doc._creationTime - a.doc._creationTime
          )
          .map((entry) => entry.doc);
      }
      const keyed = rows
        .filter((doc) => satisfies(doc, conditions))
        .sort((a, b) => {
          for (const field of index.fields) {
            const result = compareValues(a[field], b[field]);
            if (result !== 0) return result;
          }
          return a._creationTime - b._creationTime;
        });
      return order === "desc" ? keyed.reverse() : keyed;
    };

    const builder = {
      withIndex(
        name: string,
        range?: (q: ReturnType<typeof rangeBuilder>) => unknown
      ) {
        const found = spec.indexes.find((entry) => entry.name === name);
        if (!found) throw new Error(`Unknown index ${table}.${name}`);
        index = found;
        if (range) range(rangeBuilder(found.fields, conditions));
        return builder;
      },
      withSearchIndex(
        name: string,
        build: (q: {
          search: (field: string, text: string) => unknown;
        }) => unknown
      ) {
        const found = spec.searchIndexes.find((entry) => entry.name === name);
        if (!found) throw new Error(`Unknown search index ${table}.${name}`);
        const filters: Condition[] = [];
        const filter = {
          eq(field: string, value: Value) {
            if (!found.filterFields.includes(field)) {
              throw new Error(`Search filter on ${field} is not declared`);
            }
            filters.push({ op: "eq", field, value });
            return filter;
          },
        };
        build({
          search(field: string, text: string) {
            if (field !== found.searchField) {
              throw new Error(`Search on ${field}, not ${found.searchField}`);
            }
            search = { spec: found, text, filters };
            return filter;
          },
        });
        return builder;
      },
      order(direction: "asc" | "desc") {
        if (search) throw new Error("A search is ordered by relevance");
        order = direction;
        return builder;
      },
      async collect() {
        return ordered().map(count);
      },
      async take(n: number) {
        return ordered().slice(0, n).map(count);
      },
      async first() {
        const [doc] = ordered();
        return doc ? count(doc) : null;
      },
      async unique() {
        const found = ordered();
        if (found.length > 1)
          throw new Error(`unique(): ${found.length} documents`);
        return found[0] ? count(found[0]) : null;
      },
      async paginate({
        cursor,
        numItems,
      }: {
        cursor: string | null;
        numItems: number;
      }) {
        const all = ordered();
        const start = cursor ? Number(cursor) : 0;
        const page = all.slice(start, start + numItems).map(count);
        const end = start + page.length;
        return {
          page,
          continueCursor: String(end),
          isDone: end >= all.length,
        };
      },
      async *[Symbol.asyncIterator]() {
        for (const doc of ordered()) yield count(doc);
      },
    };
    return builder;
  }

  const db = {
    query,
    async get(tableOrId: string, maybeId?: string) {
      const [table, id] = resolve(tableOrId, maybeId);
      const doc = rowsOf(table).get(id);
      return doc ? count(doc) : null;
    },
    async insert(table: string, fields: Record<string, Value>) {
      const id = `${table}:${(sequence += 1)}`;
      clock += 1;
      const doc = {
        ...structuredClone(fields),
        _id: id,
        _creationTime: clock,
      } as Doc;
      for (const key of Object.keys(doc))
        if (doc[key] === undefined) delete doc[key];
      rowsOf(table).set(id, doc);
      tableOf.set(id, table);
      writes.push({ table, op: "insert", id });
      return id;
    },
    async patch(
      tableOrId: string,
      idOrFields: unknown,
      maybeFields?: Record<string, Value>
    ) {
      const [table, id] =
        maybeFields === undefined
          ? resolve(tableOrId)
          : resolve(tableOrId, idOrFields);
      const fields = (maybeFields ?? idOrFields) as Record<string, Value>;
      const doc = rowsOf(table).get(id);
      if (!doc) throw new Error(`patch: no document ${id}`);
      for (const [key, value] of Object.entries(fields)) {
        if (value === undefined) delete doc[key];
        else doc[key] = structuredClone(value);
      }
      writes.push({ table, op: "patch", id });
    },
    async replace(
      tableOrId: string,
      idOrFields: unknown,
      maybeFields?: Record<string, Value>
    ) {
      const [table, id] =
        maybeFields === undefined
          ? resolve(tableOrId)
          : resolve(tableOrId, idOrFields);
      const fields = (maybeFields ?? idOrFields) as Record<string, Value>;
      const doc = rowsOf(table).get(id);
      if (!doc) throw new Error(`replace: no document ${id}`);
      rowsOf(table).set(id, {
        ...structuredClone(fields),
        _id: id,
        _creationTime: doc._creationTime,
      } as Doc);
      writes.push({ table, op: "replace", id });
    },
    async delete(tableOrId: string, maybeId?: string) {
      const [table, id] = resolve(tableOrId, maybeId);
      rowsOf(table).delete(id);
      writes.push({ table, op: "delete", id });
    },
  };

  return {
    db,
    reads,
    writes,
    /** Every document of a table, without counting it as a read. */
    all(table: string): Doc[] {
      return [...rowsOf(table).values()].map((doc) => structuredClone(doc));
    },
    resetReads() {
      reads.documents = 0;
      reads.bytes = 0;
      reads.queries = 0;
      reads.tables = {};
      writes.length = 0;
    },
    /** Moves the clock the next insert stamps `_creationTime` with. */
    tick(ms: number) {
      clock += ms;
    },
  };
}

export type FakeDb = ReturnType<typeof createFakeDb>;

/**
 * A signed-in administrator on `fake`: Better Auth answers through
 * `runQuery` (the session, then the user) and the profile is a `users` row —
 * what `requirePermission` reads.
 */
export async function signedIn(fake: FakeDb) {
  if (!fake.all("users").some((row) => row.authSubject === "user-admin")) {
    await fake.db.insert("users", {
      authSubject: "user-admin",
      displayName: "Recette",
      email: "recette@local.test",
      roleSlug: "administrateur",
      active: true,
      createdAt: 0,
    });
  }
  return {
    db: fake.db,
    auth: {
      getUserIdentity: async () => ({
        subject: "user-admin",
        sessionId: "session-admin",
        tokenIdentifier: "test|user-admin",
        issuer: "test",
      }),
    },
    runQuery: async (_reference: unknown, args: { model?: string }) =>
      args.model === "session"
        ? { _id: "session-admin", userId: "user-admin", expiresAt: Infinity }
        : args.model === "user"
          ? { _id: "user-admin", email: "recette@local.test", name: "Recette" }
          : null,
  };
}

/** A registered Convex function's handler, the way `convex-test` reaches it. */
export function handlerOf<Args, Result>(
  fn: unknown
): (ctx: unknown, args: Args) => Promise<Result> {
  const handler = (
    fn as { _handler?: (ctx: unknown, args: Args) => Promise<Result> }
  )._handler;
  if (typeof handler !== "function")
    throw new Error("No _handler on this function");
  return handler;
}
