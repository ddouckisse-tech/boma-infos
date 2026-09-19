import assert from "node:assert/strict";
import { test } from "node:test";
import type { Id } from "../convex/_generated/dataModel";
import { renditionUrlOf } from "../convex/model/media";

// A stored picture with the five widths the médiathèque encodes.
const WIDTHS = [240, 320, 640, 960, 1280];
const row = {
  storage: WIDTHS.map((w) => ({
    format: "webp" as const,
    w,
    h: Math.round((w * 9) / 16),
    bytes: w * 40,
    storageId: `file-${w}` as Id<"_storage">,
  })),
};

/** Fake storage: counts lookups; the files listed in `missing` are gone. */
function storage(missing: readonly number[] = []) {
  const lookups: string[] = [];
  return {
    lookups,
    ctx: {
      storage: {
        getUrl: async (id: Id<"_storage">) => {
          lookups.push(id);
          return missing.some((w) => id === `file-${w}`)
            ? null
            : `https://files.test/${id}`;
        },
      },
    } as unknown as Parameters<typeof renditionUrlOf>[0],
  };
}

test("une seule lecture par image : la plus petite version assez large", async () => {
  const { ctx, lookups } = storage();
  assert.equal(
    await renditionUrlOf(ctx, row, 320),
    "https://files.test/file-320"
  );
  assert.deepEqual(lookups, ["file-320"]);
});

test("aperçu publicitaire : la version de 640 px, sans lire les autres", async () => {
  const { ctx, lookups } = storage();
  assert.equal(
    await renditionUrlOf(ctx, row, 640),
    "https://files.test/file-640"
  );
  assert.equal(lookups.length, 1);
});

test("rien d'assez large : la plus grande version disponible", async () => {
  const { ctx, lookups } = storage();
  assert.equal(
    await renditionUrlOf(ctx, row, 4000),
    "https://files.test/file-1280"
  );
  assert.deepEqual(lookups, ["file-1280"]);
});

test("fichier disparu : la version suivante, puis les plus petites", async () => {
  const { ctx, lookups } = storage([320, 640, 960, 1280]);
  assert.equal(
    await renditionUrlOf(ctx, row, 320),
    "https://files.test/file-240"
  );
  assert.deepEqual(lookups, [
    "file-320",
    "file-640",
    "file-960",
    "file-1280",
    "file-240",
  ]);
});

test("ordre des versions indifférent", async () => {
  const { ctx } = storage();
  const shuffled = { storage: [...row.storage].reverse() };
  assert.equal(
    await renditionUrlOf(ctx, shuffled, 320),
    "https://files.test/file-320"
  );
});

test("photothèque de démonstration : aucune lecture", async () => {
  const { ctx, lookups } = storage();
  assert.equal(
    await renditionUrlOf(ctx, { storage: undefined }, 320),
    undefined
  );
  assert.equal(await renditionUrlOf(ctx, { storage: [] }, 320), undefined);
  assert.equal(lookups.length, 0);
});
