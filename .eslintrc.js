module.exports = {
  root: true,
  extends: ['airbnb', 'plugin:jsx-a11y/recommended', '@react-native-community'],
  rules: {
    'react/jsx-filename-extension': [1, { extensions: ['.tsx'] }],
    'import/extensions': 'off',
  },
  settings: {
    'import/resolver': { node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] } },
  },
};
