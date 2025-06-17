module.exports = {
  moduleFileExtensions: ["js", "json", "vue"],
  transform: {
    "^.+\\.js$": "babel-jest",
    "^.+\\.vue$": "@vue/vue3-jest",
  },
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/front-end/src/$1",
    "^@api/(.*)$": "<rootDir>/front-end/src/api/$1",
    "^@stores/(.*)$": "<rootDir>/front-end/src/stores/$1"
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "/back-end/"
  ],
  roots: ["<rootDir>/front-end"],
  transformIgnorePatterns: ["/node_modules/"],
  setupFilesAfterEnv: ["<rootDir>/front-end/tests/jest/setup.js"]
};