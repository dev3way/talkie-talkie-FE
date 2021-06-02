/* eslint-disable import/extensions */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Test from './src/components/HashInput';

const App = () => {
  return (
    <View style={styles.sectionContainer}>
      <Test />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 50,
    paddingHorizontal: 24,
  },
});

export default App;
