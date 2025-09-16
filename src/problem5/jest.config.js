/** @type {import('jest').Config} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/src'],
	moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
	testMatch: ['**/__tests__/**/*.test.ts'],
	coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
};


