module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    // Allow console.log in test files and development
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["warn", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_",
      "ignoreRestSiblings": true
    }],
    "@typescript-eslint/no-explicit-any": "error",
  },
  ignorePatterns: [
    "node_modules",
    "dist",
    ".astro",
    "playwright-report/**",
    "coverage/**",
    ".next/**",
    "build/**"
  ],
  overrides: [
    {
      // Allow console.log in test files
      files: ["**/*.test.ts", "**/*.spec.ts", "e2e/**/*", "src/mocks/**/*"],
      rules: {
        "no-console": "off",
        "@typescript-eslint/no-explicit-any": "off"
      }
    }
  ]
}; 