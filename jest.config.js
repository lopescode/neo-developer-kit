/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  // The real `vscode` module only exists inside the extension host, so unit
  // tests resolve it to a lightweight mock instead.
  moduleNameMapper: {
    "^vscode$": "<rootDir>/src/test/vscodeMock.ts",
  },
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      // The project tsconfig uses module "Node16"; force CommonJS for Jest.
      { tsconfig: { module: "commonjs" } },
    ],
  },
};
