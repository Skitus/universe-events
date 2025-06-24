module.exports = {
  root: true,
  env: { node: true, es2022: true },
  parser: '@typescript-eslint/parser',
  parserOptions: { tsconfigRootDir: __dirname },
  plugins: ['@typescript-eslint', 'import', 'prettier'],
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
  ],
  rules: {
    'import/prefer-default-export': 'off',
    'no-useless-constructor': 'off',
    'no-empty-function': ['error', { allow: ['constructors'] }],
    'class-methods-use-this': 'off',
    'import/extensions': ['error', 'ignorePackages', { ts: 'never', js: 'never' }],
    'prettier/prettier': ['error'],
  },
  overrides: [
    {
      files: ['**/test/**/*.{ts,js,tsx}', '**/*.spec.ts', '**/*.e2e-spec.ts'],
      env: { jest: true },
      rules: {
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
        'import/no-unresolved': 'off',
        'import/no-useless-path-segments': 'off',
      },
    },
  ],
  ignorePatterns: ['dist', 'node_modules', '*.json', '*.yml', '*.md'],
  settings: {
    'import/resolver': {
      typescript: { alwaysTryTypes: true },
    },
  },
};
