import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MyRTC from './src/container/Signal';

const App = () => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={[{ fontSize: 24 }]}>hello talkie_talkie</Text>
      <MyRTC />
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
