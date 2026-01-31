import pluginJs from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: ['**/dist/**', 'generated/**', 'generated/**', 'node_modules/**'],
  },
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-duplicate-imports': 'error',
      'no-shadow': 'error',
      'no-var': 'error',
      'no-empty-function': 'off',
      'no-empty': 'error',
      'prefer-const': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'sort-imports': 'off',
      'no-sparse-arrays': 'off',
      'no-constant-condition': 'off',

      '@typescript-eslint/no-empty-object-type': 'off',
      'no-useless-escape': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-prototype-builtins': 'off',
      'no-unsafe-optional-chaining': 'off',
      'react/display-name': 'off',
      'no-case-declarations': 'off',
      'no-extra-boolean-cast': 'off',
      'no-undef': 'off',
      'react-hooks/exhaustive-deps': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',

      semi: ['error', 'never'],
      // quotes: [
      //   'error',
      //   'single',
      //   'double',
      //   { avoidEscape: true, allowTemplateLiterals: true },
      // ],
    },
  },
]
