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
    }
}