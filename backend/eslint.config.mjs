import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintConfigPrettierPrettier from "eslint-config-prettier/prettier";

/** Prettier enforced only here until the rest of the codebase is formatted on another branch */
const authFiles = [
  "src/controllers/auth.controller.ts",
  "src/service/auth.service.ts",
  "src/routes/auth.ts",
  "src/utils/authHelper.ts",
  "src/tests/authTests/**/*.ts",
];

export default [
  {
    ignores: ["node_modules/**", "dist/**"],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["src/**/*.{ts,tsx,js}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
      },
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        module: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        test: "readonly",
        expect: "readonly",
        describe: "readonly",
      },
    },
    rules: {
      "no-console": "off",
      "no-unused-vars": "warn",

      "no-restricted-imports": [
        "error",
        {
          patterns: ["*.test.ts"],
        },
      ],

      "@typescript-eslint/no-var-requires": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "none",
          caughtErrors: "none",
          ignoreRestSiblings: true,
          vars: "all",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",

      "no-var": "warn",
      "object-shorthand": "off",

      "no-use-before-define": "off",
      "@typescript-eslint/no-use-before-define": [
        "error",
        { functions: false, classes: false, variables: false },
      ],
    },
  },

  {
    files: authFiles,
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...eslintConfigPrettier.rules,
      ...eslintConfigPrettierPrettier.rules,
      "prettier/prettier": "error",
    },
  },
];
