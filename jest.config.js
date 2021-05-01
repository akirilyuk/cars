module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['jest-extended'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.js'],
  coveragePathIgnorePatterns: ['/node_modules/']
};
