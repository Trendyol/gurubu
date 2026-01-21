const path = require('path');

module.exports = {
  // Tell Jest to look for files relative to the project root
  rootDir: path.join(__dirname, '.'), // Since this is in the root, '.' is enough
  
  testEnvironment: 'node',
  
  testMatch: ['<rootDir>/api/**/*.test.js'],
  
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  verbose: true,
  forceExit: true,
  clearMocks: true,
};