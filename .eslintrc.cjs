module.exports = {
    root: true,
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    env: {
        node: true,
        es6: true
    },
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'import'],
    rules: {
        semi: ['error', 'never'],
        quotes: ['error', 'single'],
        indent: [2, 4],
        'import/extensions': ['error', 'ignorePackages']
    }
}
