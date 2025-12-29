module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@babel/eslint-parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
    requireConfigFile: false,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended'
  ],
  plugins: ['vue'],
  ignorePatterns: [
    'dist/', 'node_modules/', 'public/service-worker.js',
    'playwright.config.js', 'vite.config*.js', 'vitest.config.js', 'tailwind.config.js',
    'public/firebase-messaging-sw.js' // Service Worker имеет свои globals
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/multi-word-component-names': 'off',
    'no-unused-vars': ['error', { 
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_',
      'caughtErrorsIgnorePattern': '^_'
    }],
    'no-empty': ['error', { 'allowEmptyCatch': true }],
    'vue/no-v-html': 'warn' // XSS предупреждение, но не ошибка
  }
}












