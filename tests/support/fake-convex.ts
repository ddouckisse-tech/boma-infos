import schema from "../../convex/schema";

/**
 * An in-memory stand-in for a Convex context — `ctx.db`, file storage, the
 * scheduler, a signed-in administrator — enough to run the real handlers
 * (`handlerOf`) in `bun test`, and to count what they read against the
 * limits of one execution: 4,096 reads (index ranges, `db.get` calls and,
 * as production showed on 19/09/2026, `storage.getUrl` calls), 16 MiB,
 * 32,000 documents.
 *
 * Tables and indexes come from the real schema (`convex/schema.ts`): a query
 * on an index that does not exist, a range that skips one of its fields, a
 * search on an undeclared field or filter fails here as it would on Convex.
 * Documents come back in Convex's order — index fields, then
 * `_creationTime` — or by relevance for a search, and every document a query
 * reads is counted, with its size in bytes, including those a `.filter()`
 * then drops.
 *
 * It proves bounds; it does not emulate Convex. Validators do not run, a
 * handler that throws keeps the writes it made (no rollback), a cursor is a
 * position (a write between two pages shifts it), and `maximumRowsRead` /
 * `maximumBytesRead` are ignored.
 */

type Value = unknown;

export type FakeDoc = Record<string, Value> & {
  _id: string;
  _creationTime: number;
};

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

/** Every index ends with `_creationTime`, as Convex appends it. */
const TABLES: Record<string, TableSpec> = Object.fromEntries(
  Object.entries(schema.tables as unknown as Record<string, SchemaTable>).map(
    ([name, table]) => [
      name,
      {
        indexes: [
          { name: "by_creation_time", fields: ["_creationTime"] },
          ...table[" indexes"]().map((index) => ({
            name: index.indexDescriptor,
            fields: [...index.fields, "_creationTime"],
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

function specOf(table: string): TableSpec {
  const spec = TABLES[table];
  if (!spec) throw new Error(`Unknown table ${table}`);
  return spec;
}

/* ------------------------------------------------------------ ordering */

/**
 * Convex's order of types: undefined < null < bigint < number < boolean <
 * string < bytes < array < object.
 */
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

function compareValues(a: Value, b: Value): number {
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

const encoder = new TextEncoder();
const sizeOf = (doc: FakeDoc): number =>
  encoder.encode(JSON.stringify(doc)).length;

/* -------------------------------------------------------------- search */

/** Words as Convex indexes them: Tantivy's `SimpleTokenizer`, lower-cased. */
const wordsIn = (text: string): string[] =>
  text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);

/** An indexed text's distinct words, and how many words it has (memoised). */
const tokens = new Map<string, { words: Set<string>; length: number }>();
function tokensOf(text: string) {
  let entry = tokens.get(text);
  if (!entry) {
    const words = wordsIn(text);
    entry = { words: new Set(words), length: words.length };
    tokens.set(text, entry);
  }
  return entry;
}

/**
 * What a search finds, most relevant first. Convex ranks by BM25 and more;
 * this keeps its broad lines: every term matches a whole word, except the
 * last, which matches a prefix; more terms matched first, then the shorter
 * text (BM25 favours it), then the newest — Convex's documented tie-break.
 * A document without the searched field is not in the index.
 */
function relevant(rows: FakeDoc[], field: string, text: string): FakeDoc[] {
  const terms = wordsIn(text);
  const last = terms.length - 1;
  const found: { doc: FakeDoc; hits: number; length: number }[] = [];
  for (const doc of rows) {
    const value = doc[field];
    if (typeof value !== "string") continue;
    const { words, length } = tokensOf(value);
    const hits = terms.filter((term, position) =>
      position === last
        ? [...words].some((word) => word.startsWith(term))
        : words.has(term)
    ).length;
    if (hits > 0) found.push({ doc, hits, length });
  }
  return found
    .sort(
      (a, b) =>
        b.hits - a.hits ||
        a.length - b.length ||
        b.doc._creationTime - a.doc._creationTime
    )
    .map((entry) => entry.doc);
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

function satisfies(doc: FakeDoc, conditions: Condition[]): boolean {
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

/* ------------------------------------------------------------- filters */

/** A `.filter()` expression, evaluated on each document read. */
class Expression {
  constructor(readonly evaluate: (doc: FakeDoc) => Value) {}
}

const valueOf = (operand: Value, doc: FakeDoc): Value =>
  operand instanceof Expression ? operand.evaluate(doc) : operand;

const compared = (test: (order: number) => boolean) => (a: Value, b: Value) =>
  new Expression((doc) =>
    test(compareValues(valueOf(a, doc), valueOf(b, doc)))
  );

/** Convex's filter builder: fields, comparisons and logic — no arithmetic. */
const filterBuilder = {
  field: (name: string) => new Expression((doc) => doc[name]),
  eq: compared((order) => order === 0),
  neq: compared((order) => order !== 0),
  lt: compared((order) => order < 0),
  lte: compared((order) => order <= 0),
  gt: compared((order) => order > 0),
  gte: compared((order) => order >= 0),
  and: (...operands: Value[]) =>
    new Expression((doc) =>
      operands.every((operand) => Boolean(valueOf(operand, doc)))
    ),
  or: (...operands: Value[]) =>
    new Expression((doc) =>
      operands.some((operand) => Boolean(valueOf(operand, doc)))
    ),
  not: (operand: Value) => new Expression((doc) => !valueOf(operand, doc)),
};

/* ------------------------------------------------------------- the db */

export type ReadStats = {
  /** Documents read: handed back, or scanned then dropped by a `.filter()`. */
  documents: number;
  /** Their size, as JSON in UTF-8. */
  bytes: number;
  /**
   * Index ranges read: each `collect`, `take`, `first`, `unique`, `paginate`
   * or loop.
   */
  ranges: number;
  /** `db.get` calls, the document found or not. */
  gets: number;
  /** `storage.getUrl` calls. */
  urls: number;
  /** Documents read, per table. */
  tables: Record<string, number>;
  /** Tables a query read without an index, i.e. in full. */
  unindexed: string[];
};

const noReads = (): ReadStats => ({
  documents: 0,
  bytes: 0,
  ranges: 0,
  gets: 0,
  urls: 0,
  tables: {},
  unindexed: [],
});

/** A call handed to `ctx.scheduler.runAfter`. */
export type Scheduled = {
  delay: number;
  fn: unknown;
  args: Record<string, Value>;
};

export function createFakeDb(options: { start?: number } = {}) {
  const tables = new Map<string, Map<string, FakeDoc>>();
  let clock = options.start ?? 1_700_000_000_000;
  let sequence = 0;
  const reads = noReads();
  const writes: { table: string; op: string; id: string }[] = [];
  const scheduled: Scheduled[] = [];

  const rowsOf = (table: string) => {
    specOf(table);
    let rows = tables.get(table);
    if (!rows) tables.set(table, (rows = new Map()));
    return rows;
  };

  /** Counts one document read from `table`. */
  const bill = (table: string, doc: FakeDoc) => {
    reads.documents += 1;
    reads.bytes += sizeOf(doc);
    reads.tables[table] = (reads.tables[table] ?? 0) + 1;
  };

  /**
   * Ids look like `articles:12`: the table of an id never written, or of a
   * deleted document, is still known — `db.get` answers `null`, as on Convex.
   */
  const tableOfId = (id: string): string => {
    const [table, serial = ""] = id.split(":");
    if (!TABLES[table] || !/^\d+$/.test(serial)) {
      throw new Error(`Invalid id ${id}`);
    }
    return table;
  };

  const resolve = (tableOrId: string, maybeId?: unknown): [string, string] => {
    if (typeof maybeId !== "string") return [tableOfId(tableOrId), tableOrId];
    if (tableOfId(maybeId) !== tableOrId) {
      throw new Error(`${maybeId} is not an id of ${tableOrId}`);
    }
    return [tableOrId, maybeId];
  };

  const store = (table: string, docs: readonly Record<string, Value>[]) => {
    const rows = rowsOf(table);
    return docs.map((fields) => {
      const id = `${table}:${(sequence += 1)}`;
      clock += 1;
      const doc = {
        ...structuredClone(fields),
        _id: id,
        _creationTime: clock,
      } as FakeDoc;
      for (const key of Object.keys(doc))
        if (doc[key] === undefined) delete doc[key];
      rows.set(id, doc);
      return id;
    });
  };

  function query(table: string) {
    const spec = specOf(table);
    let index: IndexSpec = spec.indexes[0];
    let indexed = false;
    const conditions: Condition[] = [];
    let search: {
      spec: SearchSpec;
      text: string;
      filters: Condition[];
    } | null = null;
    let order: "asc" | "desc" = "asc";
    const predicates: Expression[] = [];

    /** The documents the query walks through, in the order it reads them. */
    const walk = (): FakeDoc[] => {
      reads.ranges += 1;
      if (!indexed) reads.unindexed.push(table);
      const rows = [...rowsOf(table).values()];
      if (search) {
        const { spec: found, text, filters } = search;
        return relevant(
          rows.filter((doc) => satisfies(doc, filters)),
          found.searchField,
          text
        );
      }
      const keyed = rows
        .filter((doc) => satisfies(doc, conditions))
        .sort((a, b) => {
          for (const field of index.fields) {
            const result = compareValues(a[field], b[field]);
            if (result !== 0) return result;
          }
          return 0;
        });
      return order === "desc" ? keyed.reverse() : keyed;
    };

    const passes = (doc: FakeDoc) =>
      predicates.every((predicate) => Boolean(predicate.evaluate(doc)));

    /**
     * Reads from `start` until `limit` documents pass the filters: every
     * document read is counted, kept or not.
     */
    const readFrom = (rows: FakeDoc[], start: number, limit: number) => {
      const kept: FakeDoc[] = [];
      let end = start;
      while (end < rows.length && kept.length < limit) {
        const doc = rows[end];
        end += 1;
        bill(table, doc);
        if (passes(doc)) kept.push(structuredClone(doc));
      }
      return { kept, end };
    };

    const builder = {
      withIndex(
        name: string,
        range?: (q: ReturnType<typeof rangeBuilder>) => unknown
      ) {
        const found = spec.indexes.find((entry) => entry.name === name);
        if (!found) throw new Error(`Unknown index ${table}.${name}`);
        index = found;
        indexed = true;
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
        indexed = true;
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
      /** Narrows what the query returns — not what it reads. */
      filter(predicate: (q: typeof filterBuilder) => Value) {
        const expression = predicate(filterBuilder);
        predicates.push(
          expression instanceof Expression
            ? expression
            : new Expression(() => expression)
        );
        return builder;
      },
      async collect() {
        return readFrom(walk(), 0, Infinity).kept;
      },
      async take(n: number) {
        return readFrom(walk(), 0, n).kept;
      },
      async first() {
        return readFrom(walk(), 0, 1).kept[0] ?? null;
      },
      /** Two documents read at most, as on Convex, to tell one from several. */
      async unique() {
        const { kept } = readFrom(walk(), 0, 2);
        if (kept.length > 1) {
          throw new Error(`unique(): several documents in ${table}`);
        }
        return kept[0] ?? null;
      },
      async paginate({
        cursor,
        numItems,
      }: {
        cursor: string | null;
        numItems: number;
      }) {
        const rows = walk();
        const { kept, end } = readFrom(
          rows,
          cursor ? Number(cursor) : 0,
          numItems
        );
        return {
          page: kept,
          continueCursor: String(end),
          isDone: end >= rows.length,
        };
      },
      /** A loop reads only what it consumes: breaking out stops the reads. */
      async *[Symbol.asyncIterator]() {
        for (const doc of walk()) {
          bill(table, doc);
          if (passes(doc)) yield structuredClone(doc);
        }
      },
    };
    return builder;
  }

  const db = {
    query,
    async get(tableOrId: string, maybeId?: string) {
      const [table, id] = resolve(tableOrId, maybeId);
      reads.gets += 1;
      const doc = rowsOf(table).get(id);
      if (!doc) return null;
      bill(table, doc);
      return structuredClone(doc);
    },
    async insert(table: string, fields: Record<string, Value>) {
      const [id] = store(table, [fields]);
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
      } as FakeDoc);
      writes.push({ table, op: "replace", id });
    },
    async delete(tableOrId: string, maybeId?: string) {
      const [table, id] = resolve(tableOrId, maybeId);
      if (!rowsOf(table).delete(id)) {
        throw new Error(`delete: no document ${id}`);
      }
      writes.push({ table, op: "delete", id });
    },
  };

  const storage = {
    /** Each URL counts among the 4,096 reads (production, 19/09/2026). */
    async getUrl(storageId: string) {
      reads.urls += 1;
      return `https://files.test/${storageId}`;
    },
    async delete() {},
  };

  const scheduler = {
    async runAfter(
      delay: number,
      fn: unknown,
      args: Record<string, Value> = {}
    ) {
      scheduled.push({ delay, fn, args });
      return `scheduled:${scheduled.length}`;
    },
  };

  return {
    db,
    storage,
    scheduler,
    reads,
    writes,
    /** What the scheduler received, oldest first. */
    scheduled,
    /**
     * Adds documents as they stood before the call measured: no read, no
     * write is counted.
     */
    seed(table: string, docs: readonly Record<string, Value>[]): string[] {
      return store(table, docs);
    },
    /** Every document of a table, without counting it as a read. */
    all(table: string): FakeDoc[] {
      return [...rowsOf(table).values()].map((doc) => structuredClone(doc));
    },
    resetReads() {
      Object.assign(reads, noReads());
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
 * what `requirePermission` reads. File storage and the scheduler come with it.
 */
export function signedIn(fake: FakeDb) {
  if (!fake.all("users").some((row) => row.authSubject === "user-admin")) {
    fake.seed("users", [
      {
        authSubject: "user-admin",
        displayName: "Recette",
        email: "recette@local.test",
        roleSlug: "administrateur",
        active: true,
        createdAt: 0,
      },
    ]);
  }
  return {
    db: fake.db,
    storage: fake.storage,
    scheduler: fake.scheduler,
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
        ? {
            _id: "session-admin",
            userId: "user-admin",
            expiresAt: Date.now() + 3_600_000,
          }
        : args.model === "user"
          ? {
              _id: "user-admin",
              email: "recette@local.test",
              name: "Recette",
              twoFactorEnabled: false,
            }
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
