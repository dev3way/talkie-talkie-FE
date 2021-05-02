import React from 'react';
import { RTCView, MediaStream } from 'react-native-webrtc';

type TStream = {
  stream: MediaStream;
};

function RtcView({ stream }: TStream) {
  return <RTCView streamURL={stream.toURL()} />;
}

export default RtcView;
