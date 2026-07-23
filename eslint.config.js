import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  // ─── Ignored paths ─────────────────────────────────────────────────────────
  {
    ignores: [
      'dist',
      'node_modules',
      'public',
      '*.cjs',
      '*.config.js',
      'vite.config.js',
      // ⚠ Chat.jsx is 10K+ lines — exclude from lint until dedicated refactor sprint
      'src/pages/Chat.jsx',
    ],
  },

  // ─── React / JSX files (src/ only) ─────────────────────────────────────────
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: 'detect' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier: prettierPlugin,
    },
    rules: {
      // ── ESLint recommended — downgraded to warn for gradual adoption ─────────
      ...Object.fromEntries(
        Object.entries(js.configs.recommended.rules).map(([rule, val]) => [
          rule,
          Array.isArray(val) ? ['warn', ...val.slice(1)] : val === 'error' ? 'warn' : val,
        ])
      ),

      // ── React rules ────────────────────────────────────────────────────────
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,

      // ── React-Refresh (Vite HMR) ────────────────────────────────────────────
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // ── Disabled / relaxed for legacy codebase ──────────────────────────────
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      'react/display-name': 'off',
      'react/no-unknown-property': 'off',
      'react/jsx-no-undef': 'warn',
      'react-hooks/rules-of-hooks': 'warn',

      // ── Code quality — warn only (safe for gradual adoption) ────────────────
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'no-debugger': 'warn',
      'no-undef': 'warn',

      // ── Prettier integration — runs Prettier as an ESLint rule ──────────────
      'prettier/prettier': 'warn',
    },
  },

  // ─── Prettier disables all conflicting ESLint style rules ─────────────────
  prettierConfig,
];
