import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores([
    // Ignores par défaut de eslint-config-next :
    ".next/**",
    "out/**",
    "build/**",
    // Captures et scripts de recette locaux, comme dans .gitignore.
    "output/**",
    "next-env.d.ts",
    // Code généré par Convex : jamais édité à la main.
    "convex/_generated/**",
  ]),
  {
    rules: {
      // Convention maison : jamais de `any` non justifié par un commentaire.
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
]);

export default eslintConfig;
