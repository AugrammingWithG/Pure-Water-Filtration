import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

// Plugins are registered by hand rather than spreading the plugins' own shared
// configs: eslint-plugin-react-hooks still ships `plugins` as an eslintrc-style
// array, which ESLint 10 flat config rejects. Only their rule sets are reused.
export default [
  // legacy/ is the untouched reference prototype — not linted.
  { ignores: ['dist', 'legacy'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...reactRefresh.configs.vite.rules,
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    // Build-time tooling, run with node rather than in the browser.
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: globals.node },
  },
  {
    // The scene layer and the camera rig are deliberately imperative: they
    // mutate three.js objects (camera, materials, meshes) inside useFrame and
    // seed particles with Math.random(). That is the documented
    // react-three-fiber model, but it trips the React Compiler rules that
    // eslint-plugin-react-hooks v7 enables. React state is never touched here.
    files: ['src/three/**/*.{js,jsx}', 'src/hooks/**/*.{js,jsx}'],
    rules: {
      'react-hooks/immutability': 'off',
      'react-hooks/purity': 'off',
    },
  },
]
