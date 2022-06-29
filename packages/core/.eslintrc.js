module.exports = {
  extends: ['airbnb', 'prettier'],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'import/no-extraneous-dependencies': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-props-no-spreading': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'import/prefer-default-export': 'off',
    'arrow-body-style': 'off',
    'no-shadow': 'off',
    'no-continue': 'off',
  },
};
