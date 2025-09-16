/* eslint-env node */
const js = require('@eslint/js');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = [
	{ ignores: ['dist/**', 'node_modules/**'] },
	// App TypeScript files
	{
		files: ['src/problem5/**/*.{ts,tsx}'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				tsconfigRootDir: __dirname,
				project: ['./src/problem5/tsconfig.json'],
				sourceType: 'module'
			},
			globals: {
				console: 'readonly',
				process: 'readonly',
				module: 'readonly',
				require: 'readonly',
				__dirname: 'readonly'
			}
		},
		plugins: {
			'@typescript-eslint': tsPlugin,
			prettier: prettierPlugin
		},
		rules: {
			...js.configs.recommended.rules,
			...tsPlugin.configs.recommended.rules,
			'prettier/prettier': 'error',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
		}
	},
	// Jest test files
	{
		files: ['src/problem5/**/__tests__/**/*.ts'],
		languageOptions: {
			globals: {
				describe: 'readonly',
				test: 'readonly',
				expect: 'readonly',
				beforeEach: 'readonly',
				afterEach: 'readonly',
				jest: 'readonly'
			}
		}
	}
];


