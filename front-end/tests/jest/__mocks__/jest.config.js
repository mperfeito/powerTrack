module.exports = {
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['js', 'json', 'vue'],
    transform: {
      '^.+\\.js$': 'babel-jest',
      '^.+\\.vue$': '@vue/vue3-jest'
    },
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/../src/$1'
    },
    roots: ['<rootDir>/jest'],
    setupFiles: ['<rootDir>/jest/setup.js']
  }
  