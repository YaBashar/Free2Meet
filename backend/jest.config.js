module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  maxWorkers: 1,

  transform: {
    '^.+\\.(ts|tsx|js)$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'json'], 

  globals: {
    'ts-jest': {
      tsconfig: {
        resolveJsonModule: true,
        esModuleInterop: true,
      },
    },
  },
};