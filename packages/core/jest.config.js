module.exports = {
  testEnvironment: "node",
  preset: 'ts-jest',
  roots: [ './test' ],
  testRegex: '.*(test|spec)\\.tsx?$',
  moduleFileExtensions: [ 'ts', 'tsx', 'js', 'jsx', 'json', 'node' ],
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/test/tsconfig.json'
    }
  },
  modulePaths: [ "<rootDir>/node_modules" ],
  testTimeout: 10000,

  moduleNameMapper: {
    "#(.*)": [ "<rootDir>src/$1", "<rootDir>generated/$1" ]
  }
}
