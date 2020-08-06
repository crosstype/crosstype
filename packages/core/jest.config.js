const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require('./tsconfig');

module.exports = {
  testEnvironment: "node",
  preset: 'ts-jest',
  testRegex: '.*(test|spec)\\.tsx?$',
  moduleFileExtensions: [ 'ts', 'tsx', 'js', 'jsx', 'json', 'node' ],
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/test/tsconfig.json'
    }
  },
  modulePaths: [ "<rootDir>" ],
  testTimeout: 10000,
  roots: [ '<rootDir>' ],

  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/src/' })
}
