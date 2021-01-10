module.exports = {
  preset: 'ts-jest',
  coverageReporters: [
    "json-summary",
    "text",
    "lcov"
  ],
  collectCoverage: true,
  testEnvironment: 'node',
  collectCoverageFrom: [
    "src/**/*.ts"
  ]
};