const path = require('path');

module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.vue$': 'vue3-jest',
    '^.+\\.js$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'json', 'vue'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // 👇 Adiciona isto:
  transformIgnorePatterns: [
    '/node_modules/(?!(axios)/)' // diz ao Jest para também transformar o axios
  ]
}
