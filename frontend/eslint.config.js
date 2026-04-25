import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintConfigPrettierPrettier from "eslint-config-prettier/prettier";
import { defineConfig, globalIgnores } from "eslint/config";

/** Prettier enforced only here until the rest of the codebase is formatted on another branch */
const authFiles = [
  "src/components/Login.jsx",
  "src/components/Register.jsx",
  "src/components/AuthContext.jsx",
  "src/components/AuthProvider.jsx",
  "src/hooks/useAuth.js",
  "src/hooks/useRefreshToken.js",
  "src/hooks/useValidateLoginForm.js",
  "src/hooks/useValidateSignUpForm.js",
];

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
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
]);
