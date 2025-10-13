module.exports = {
     root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended', //esta vuelta habilita el prettier del eslint
  ],
  ignorePatterns: ['dist/', 'node_modules/'],
  rules: {
    // Aquí se personalizan las reglas de ESLint, ejemplo: 
    '@typescript-eslint/no-unused-vars': ['warn'],
  },
};