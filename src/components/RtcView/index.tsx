import React from 'react';
import { StyleSheet } from 'react-native';

import { RTCView, MediaStream } from 'react-native-webrtc';

type TStream = {
  stream: MediaStream;
};

function RtcView({ stream }: TStream) {
  return <RTCView streamURL={stream.toURL()} style={styles.stream} />;
}

const styles = StyleSheet.create({
  stream: {
    flex: 1,
  },
});
export default RtcView;
