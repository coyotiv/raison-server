import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  transformIgnorePatterns: ['node_modules/(?!(better-auth|@noble))'],
  collectCoverage: true,
  coverageReporters: ['clover', 'json', 'lcov', 'text', 'text-summary'],
  coveragePathIgnorePatterns: ['/node_modules/', '/__tests__/'],
  detectOpenHandles: true,
  forceExit: true,
  testTimeout: 30000,
  testMatch: ['**/__tests__/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
  },
  clearMocks: true,
}

export default config
