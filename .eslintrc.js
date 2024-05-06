const eslintConfig = require("@keeex/eslint-config");

module.exports = eslintConfig(
  {
    import: {detectImportCycle: 1},
    jsx: true,
  },
  {
    overrides: [
      {
        env: {browser: true},
        files: ["react/**/*.js"],
        rules: {
          // disabled for compatibility purpose
          "prefer-named-capture-group": "off",
          "react/no-array-index-key": "warn",
        },
      },
      {
        env: {browser: true},
        files: ["webres/views/*.js"],
      },
      {
        files: ["db/**/*.js"],
        rules: {
          "max-lines-per-function": "off",
          "no-magic-numbers": "off",
        },
      },
    ],
  },
);
