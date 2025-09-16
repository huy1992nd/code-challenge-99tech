/* eslint-env node */
module.exports = {
	root: true,
	ignorePatterns: ['dist/**', 'node_modules/**'],
	overrides: [
		{
			files: ['src/problem5/**/*.{ts,tsx}'],
			parser: '@typescript-eslint/parser',
			parserOptions: {
				tsconfigRootDir: __dirname,
				project: ['./src/problem5/tsconfig.json'],
				sourceType: 'module'
			},
			plugins: ['@typescript-eslint', 'prettier'],
			extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
			rules: {
				'prettier/prettier': ['error']
			}
		}
	]
};


