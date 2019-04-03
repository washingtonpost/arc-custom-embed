module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    // https://github.com/typescript-eslint/typescript-eslint/issues/251#issuecomment-463943250
    tsconfigRootDir: __dirname,
    project: 'tsconfig.json',
    ecmaFeatures: {
      jsx: true
    }
  },
  extends: [
    'react-app',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    // prettier configs should come last to avoid rule conflicts
    // https://github.com/prettier/eslint-config-prettier#installation
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint',
    'prettier/standard',
    'prettier/react'
  ],
  plugins: [
    'react-hooks',
    '@typescript-eslint',
    'prettier',
    'react',
    'standard'
  ],
  env: {
    browser: true,
    jest: true
  },
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off'
  },
  overrides: [
    {
      files: ['*locale.js'],
      rules: {
        camelcase: 'off',
        '@typescript-eslint/camelcase': 'off'
      }
    }
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  globals: {
    $: 'readonly'
  }
}
