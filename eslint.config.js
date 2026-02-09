import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['.svelte-kit/**', 'build/**', 'node_modules/**']
  },
  js.configs.recommended,
  ...svelte.configs['flat/recommended'],
  {
    files: ['**/*.{js,ts,mjs,cjs}'],
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.browser,
        ...globals.node,
        $state: 'readonly',
        $derived: 'readonly',
        $effect: 'readonly',
        $props: 'readonly',
        $bindable: 'readonly',
        $inspect: 'readonly'
      }
    }
  },
  {
    files: ['**/*.d.ts'],
    rules: {
      'no-unused-vars': 'off'
    }
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tsParser
      },
      globals: {
        ...globals.browser,
        $state: 'readonly',
        $derived: 'readonly',
        $effect: 'readonly',
        $props: 'readonly',
        $bindable: 'readonly',
        $inspect: 'readonly'
      }
    },
    rules: {
      ...svelte.configs['flat/recommended'].reduce((acc, config) => {
        if (config.rules) {
          Object.assign(acc, config.rules);
        }
        return acc;
      }, {}),
      'svelte/a11y_label_has_associated_control': 'off',
      'svelte/a11y_no_noninteractive_element_interactions': 'off'
    }
  }
];
