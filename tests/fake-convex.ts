import schema from "../convex/schema";

/**
 * In-memory stand-in for the parts of a Convex context the médiathèque
 * functions touch — enough to run their real handlers and to count what the
 * database bills against the per-execution limits: index ranges (every
 * `db.query` that reads), `db.get` calls, `storage.getUrl` calls, and the
 * documents they return. Indexes are read from `convex/schema.ts`, so a
 * query on an index the schema does not declare fails here as it would on
 * the deployment. It proves bounds; it does not emulate Convex.
 */

export type FakeDoc = Record<string, unknown> & {
  _id: string;
  _creationTime: number;
};

type Condition = {
  field: string;
  op: "eq" | "gt" | "gte" | "lt" | "lte";
  value: unknown;
};

type Expr =
  | { kind: "field"; name: string }
  | { kind: "literal"; value: unknown }
  | { kind: "op"; op: string; args: Expr[] };

type TableDefinition = {
  " indexes"(): { indexDescriptor: string; fields: string[] }[];
  searchIndexes: {
    indexDescriptor: string;
    searchField: string;
    filterFields: string[];
  }[];
};

function definitionOf(table: string): TableDefinition {
  const definition = (schema.tables as Record<string, unknown>)[table];
  if (!definition) throw new Error(`Table absente du schéma : ${table}`);
  return definition as TableDefinition;
}

function indexFields(table: string, name: string): string[] {
  const index = definitionOf(table)
    [" indexes"]()
    .find((entry) => entry.indexDescriptor === name);
  if (!index) throw new Error(`Index absent du schéma : ${table}.${name}`);
  return index.fields;
}

/** Convex order: undefined < null < numbers < booleans < strings. */
function rank(value: unknown): number {
  if (value === undefined) return 0;
  if (value === null) return 1;
  if (typeof value === "number") return 2;
  if (typeof value === "boolean") return 3;
  if (typeof value === "string") return 4;
  return 5;
}

function compare(a: unknown, b: unknown): number {
  const order = rank(a) - rank(b);
  if (order !== 0) return order;
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") {
    return Number(a) - Number(b);
  }
  if (typeof a === "string" && typeof b === "string") {
    return a < b ? -1 : a > b ? 1 : 0;
  }
  return 0;
}

function holds(condition: Condition, value: unknown): boolean {
  const order = compare(value, condition.value);
  switch (condition.op) {
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
}

const toExpr = (value: unknown): Expr =>
  typeof value === "object" && value !== null && "kind" in value
    ? (value as Expr)
    : { kind: "literal", value };

const filterBuilder = {
  field: (name: string): Expr => ({ kind: "field", name }),
  eq: (a: unknown, b: unknown): Expr => ({
    kind: "op",
    op: "eq",
    args: [toExpr(a), toExpr(b)],
  }),
  neq: (a: unknown, b: unknown): Expr => ({
    kind: "op",
    op: "neq",
    args: [toExpr(a), toExpr(b)],
  }),
  and: (...args: unknown[]): Expr => ({
    kind: "op",
    op: "and",
    args: args.map(toExpr),
  }),
  or: (...args: unknown[]): Expr => ({
    kind: "op",
    op: "or",
    args: args.map(toExpr),
  }),
  not: (a: unknown): Expr => ({ kind: "op", op: "not", args: [toExpr(a)] }),
};

function evaluate(expr: Expr, doc: FakeDoc): unknown {
  if (expr.kind === "field") return doc[expr.name];
  if (expr.kind === "literal") return expr.value;
  const values = expr.args.map((arg) => evaluate(arg, doc));
  switch (expr.op) {
    case "eq":
      return compare(values[0], values[1]) === 0;
    case "neq":
      return compare(values[0], values[1]) !== 0;
    case "and":
      return values.every(Boolean);
    case "or":
      return values.some(Boolean);
    case "not":
      return !values[0];
  }
  throw new Error(`Opérateur de filtre non simulé : ${expr.op}`);
}

export type Stats = {
  /** Index ranges read: each `collect`, `take`, `first`, `unique`, `paginate`. */
  ranges: number;
  gets: number;
  urls: number;
  documents: number;
  byTable: Record<string, number>;
  /** Tables read without an index, i.e. in full. */
  unindexed: string[];
};

const emptyStats = (): Stats => ({
  ranges: 0,
  gets: 0,
  urls: 0,
  documents: 0,
  byTable: {},
  unindexed: [],
});

class FakeQuery {
  private conditions: Condition[] = [];
  private fields: string[] = [];
  private descending = false;
  private indexed = false;
  private search?: { terms: string[]; field: string; eqs: Condition[] };
  private predicate?: Expr;

  constructor(
    private readonly db: FakeDb,
    private readonly table: string
  ) {}

  withIndex(name: string, range?: (q: unknown) => unknown) {
    this.indexed = true;
    this.fields = indexFields(this.table, name);
    if (range) {
      const builder = Object.fromEntries(
        (["eq", "gt", "gte", "lt", "lte"] as const).map((op) => [
          op,
          (field: string, value: unknown) => {
            if (!this.fields.includes(field)) {
              throw new Error(`${field} n'est pas dans ${this.table}.${name}`);
            }
            this.conditions.push({ field, op, value });
            return builder;
          },
        ])
      );
      range(builder);
    }
    return this;
  }

  withSearchIndex(name: string, filter: (q: unknown) => unknown) {
    this.indexed = true;
    const index = definitionOf(this.table).searchIndexes.find(
      (entry) => entry.indexDescriptor === name
    );
    if (!index) throw new Error(`Recherche absente du schéma : ${name}`);
    const search = { terms: [] as string[], field: index.searchField, eqs: [] };
    const builder = {
      search: (field: string, text: string) => {
        if (field !== index.searchField) throw new Error(`Champ ${field}`);
        search.terms = text.split(" ").filter(Boolean);
        return builder;
      },
      eq: (field: string, value: unknown) => {
        if (!index.filterFields.includes(field)) {
          throw new Error(`${field} n'est pas un filtre de ${name}`);
        }
        (search.eqs as Condition[]).push({ field, op: "eq", value });
        return builder;
      },
    };
    filter(builder);
    this.search = search;
    return this;
  }

  order(direction: "asc" | "desc") {
    this.descending = direction === "desc";
    return this;
  }

  filter(predicate: (q: typeof filterBuilder) => Expr) {
    this.predicate = predicate(filterBuilder);
    return this;
  }

  private matching(): FakeDoc[] {
    let rows = this.db
      .rows(this.table)
      .filter((doc) =>
        this.conditions.every((condition) =>
          holds(condition, doc[condition.field])
        )
      );
    if (this.search) {
      const { terms, field, eqs } = this.search;
      const last = terms.length - 1;
      const score = (doc: FakeDoc) => {
        const tokens = String(doc[field] ?? "").split(" ");
        return terms.filter((term, index) =>
          tokens.some((token) =>
            index === last ? token.startsWith(term) : token === term
          )
        ).length;
      };
      rows = rows
        .filter((doc) => doc[field] !== undefined && score(doc) > 0)
        .filter((doc) =>
          eqs.every((condition) => doc[condition.field] === condition.value)
        )
        .sort(
          (a, b) =>
            score(b) - score(a) ||
            String(a[field]).length - String(b[field]).length ||
            a._creationTime - b._creationTime
        );
    } else {
      rows.sort((a, b) => {
        for (const name of this.fields) {
          const order = compare(a[name], b[name]);
          if (order !== 0) return order;
        }
        return a._creationTime - b._creationTime;
      });
      if (this.descending) rows.reverse();
    }
    if (this.predicate) {
      const predicate = this.predicate;
      rows = rows.filter((doc) => Boolean(evaluate(predicate, doc)));
    }
    return rows;
  }

  private bill(rows: FakeDoc[]): void {
    const stats = this.db.stats;
    stats.ranges += 1;
    stats.documents += rows.length;
    stats.byTable[this.table] = (stats.byTable[this.table] ?? 0) + rows.length;
    if (!this.indexed) stats.unindexed.push(this.table);
  }

  async collect() {
    const rows = this.matching();
    this.bill(rows);
    return rows;
  }

  async take(count: number) {
    const rows = this.matching().slice(0, count);
    this.bill(rows);
    return rows;
  }

  async first() {
    return (await this.take(1))[0] ?? null;
  }

  async unique() {
    const rows = this.matching();
    this.bill(rows.slice(0, 2));
    if (rows.length > 1) throw new Error("unique() : plusieurs documents");
    return rows[0] ?? null;
  }

  async paginate(options: { cursor: string | null; numItems: number }) {
    const rows = this.matching();
    const start = options.cursor ? Number(options.cursor) : 0;
    const page = rows.slice(start, start + options.numItems);
    this.bill(page);
    return {
      page,
      isDone: start + page.length >= rows.length,
      continueCursor: String(start + page.length),
    };
  }
}

export class FakeDb {
  private tables = new Map<string, FakeDoc[]>();
  private sequence = 0;
  stats: Stats = emptyStats();

  rows(table: string): FakeDoc[] {
    let rows = this.tables.get(table);
    if (!rows) {
      rows = [];
      this.tables.set(table, rows);
    }
    return rows;
  }

  /** Adds documents without billing them — the state before the call measured. */
  seed(table: string, docs: readonly Record<string, unknown>[]): string[] {
    return docs.map((doc) => {
      const _id = `${table}|${this.sequence}`;
      this.rows(table).push({ ...doc, _id, _creationTime: this.sequence });
      this.sequence += 1;
      return _id;
    });
  }

  resetStats(): void {
    this.stats = emptyStats();
  }

  query(table: string) {
    definitionOf(table);
    return new FakeQuery(this, table);
  }

  async get(id: string) {
    this.stats.gets += 1;
    const doc = this.rows(id.split("|")[0]).find((row) => row._id === id);
    if (doc) this.stats.documents += 1;
    return doc ?? null;
  }

  async insert(table: string, value: Record<string, unknown>) {
    return this.seed(table, [value])[0];
  }

  async patch(id: string, value: Record<string, unknown>) {
    const doc = this.rows(id.split("|")[0]).find((row) => row._id === id);
    if (!doc) throw new Error(`patch : ${id} introuvable`);
    for (const [field, next] of Object.entries(value)) {
      if (next === undefined) delete doc[field];
      else doc[field] = next;
    }
  }

  async delete(id: string) {
    const rows = this.rows(id.split("|")[0]);
    const index = rows.findIndex((row) => row._id === id);
    if (index >= 0) rows.splice(index, 1);
  }
}

export type Scheduled = { delay: number; args: Record<string, unknown> };

/**
 * A signed-in administrator's context: Better Auth answers through
 * `runQuery` (session, then user), the profile lives in `users`.
 */
export function fakeContext(db: FakeDb) {
  if (!db.rows("users").some((row) => row.authSubject === "user-admin")) {
    db.seed("users", [
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
  const scheduled: Scheduled[] = [];
  const ctx = {
    db,
    auth: {
      getUserIdentity: async () => ({
        subject: "user-admin",
        sessionId: "session-admin",
        tokenIdentifier: "test|user-admin",
        issuer: "test",
      }),
    },
    runQuery: async (_ref: unknown, args: { model?: string }) =>
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
    storage: {
      getUrl: async (id: string) => {
        db.stats.urls += 1;
        return `https://files.test/${id}`;
      },
      delete: async () => undefined,
    },
    scheduler: {
      runAfter: async (
        delay: number,
        _fn: unknown,
        args: Record<string, unknown>
      ) => {
        scheduled.push({ delay, args });
        return "scheduled";
      },
    },
  };
  return { ctx, scheduled };
}

/** The handler behind a registered Convex function (what `convex-test` calls). */
export function handlerOf<Args, Result>(
  registered: unknown
): (ctx: unknown, args: Args) => Promise<Result> {
  const handler = (registered as { _handler?: unknown })._handler;
  if (typeof handler !== "function") throw new Error("Pas une fonction Convex");
  return handler as (ctx: unknown, args: Args) => Promise<Result>;
}
