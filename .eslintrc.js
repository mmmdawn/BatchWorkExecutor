module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
    },
    plugins: ['@typescript-eslint'],
    extends: [
        'plugin:@typescript-eslint/recommended',
    ],
    rules:  {
        // "@typescript-eslint/explicit-function-return-type": "off",
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/no-var-requires': 0
    }
}