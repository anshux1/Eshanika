import babelParser from "@babel/eslint-parser";
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import { globalIgnores } from "eslint/config";
import turboPlugin from "eslint-plugin-turbo";

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx,mts,cts}"],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: [
            ["@babel/preset-react", { runtime: "automatic" }],
            "@babel/preset-typescript",
          ],
        },
      },
    },
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    rules: {
      // Babel parses TypeScript syntax but ESLint core rules do not understand
      // that type-only identifiers are erased before runtime.
      "no-undef": "off",
      "no-unused-vars": "off",
    },
  },
  globalIgnores(["dist/**", "coverage/**", "node_modules/**"]),
];
