const path = require('path');

module.exports = {
  preset: 'jest-expo',
  rootDir: '../../',
  roots: ['<rootDir>/apps/mobile'],
  displayName: 'mobile',
  setupFilesAfterEnv: ['<rootDir>/apps/mobile/jest.setup.js'],
  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', {
      configFile: path.resolve(__dirname, 'babel.config.js'),
      root: path.resolve(__dirname)
    }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|lucide-react-native|socket.io-client|axios|react-native-gifted-charts)',
  ],
  testMatch: [
    '<rootDir>/apps/mobile/**/__tests__/**/*.[jt]s?(x)',
    '<rootDir>/apps/mobile/**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/apps/mobile/src/$1',
  },
};
