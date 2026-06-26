import uniHelper from '@uni-helper/eslint-config'

export default uniHelper(
  {
    vue: true,
    ignores: [
      '**/uni_modules/',
      'dist',
      'auto-import.d.ts',
      'uni-pages.d.ts',
    ],
    rules: {
      'no-useless-return': 'off',
      'no-console': 'off',
      'no-unused-vars': 'off',
      'vue/no-unused-refs': 'off',
      'unused-imports/no-unused-vars': 'off',
      'eslint-comments/no-unlimited-disable': 'off',
    },
  },
)
