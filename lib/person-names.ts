/** Explicit name parts avoid guessing where a compound family name starts. */
export type PersonIdentity = {
  readonly givenNames: string;
  readonly familyNames: string;
};

const clean = (value: string): string => value.trim().replace(/\s+/gu, " ");

export function normalizePersonIdentity(identity: PersonIdentity): PersonIdentity {
  return {
    givenNames: clean(identity.givenNames)
      .toLocaleLowerCase("fr-FR")
      .replace(/\p{L}[\p{L}\p{M}]*/gu, (part) =>
        part[0].toLocaleUpperCase("fr-FR") + part.slice(1)
      ),
    familyNames: clean(identity.familyNames).toLocaleUpperCase("fr-FR"),
  };
}

export function formatPersonIdentity(identity: PersonIdentity): string {
  const normalized = normalizePersonIdentity(identity);
  return [normalized.givenNames, normalized.familyNames].filter(Boolean).join(" ");
}

/** Replace only explicitly identified people, leaving organisations and URLs alone. */
export function createPersonNameNormalizer(identities: readonly PersonIdentity[]) {
  const replacements = new Map(
    identities.map((identity) => {
      const original = [clean(identity.givenNames), clean(identity.familyNames)]
        .filter(Boolean).join(" ");
      return [original.toLocaleLowerCase("fr-FR"), formatPersonIdentity(identity)];
    })
  );
  const alternatives = [...replacements.keys()]
    .sort((left, right) => right.length - left.length)
    .map((name) => name.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"));
  if (!alternatives.length) return (text: string): string => text;
  const pattern = new RegExp(
    `(?<![\\p{L}\\p{M}])(?:${alternatives.join("|")})(?![\\p{L}\\p{M}])`,
    "giu"
  );
  return (text: string): string => text.replace(
    pattern,
    (name) => replacements.get(name.toLocaleLowerCase("fr-FR")) ?? name
  );
}
