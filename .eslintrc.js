module.exports = {
  root: true,
  extends: ['airbnb', 'plugin:jsx-a11y/recommended', '@react-native-community'],
  rules: {
    'react/jsx-filename-extension': [1, { extensions: ['.tsx'] }],
    'import/no-unresolved': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
  },
};
