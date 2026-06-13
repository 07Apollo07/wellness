import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Disable specific rules that cause many false positives in this project.
  {
    rules: {
      // Allow setState inside useEffect when needed.
      "react-hooks/set-state-in-effect": "off",
      // Allow impure functions like Date.now in render (handled safely).
      "react-hooks/purity": "off",
      // Permit explicit any types for quick prototyping.
      "@typescript-eslint/no-explicit-any": "off",
      // Suppress unescaped entity warnings.
      "react/no-unescaped-entities": "off",
      // Allow img tags without Next.js Image component.
      "@next/next/no-img-element": "off",
      // Suppress unused variable warnings.
      "@typescript-eslint/no-unused-vars": "off",
      // Disable exhaustive deps warnings for useEffect.
      "react-hooks/exhaustive-deps": "off",
      // Disable immutability warnings for setState calls.
      "react-hooks/immutability": "off",
    },
  },
]);

export default eslintConfig;
