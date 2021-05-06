import React, { useEffect, useState } from 'react';

import { mediaDevices, MediaStream } from 'react-native-webrtc';

import { Button, View } from 'react-native';
import MyRTC from './MyRTC';
import RtcView from '../../components/RtcView';
import MySocket from './MySocket';

function streamGuard(stream: boolean | MediaStream): stream is boolean {
  return stream === true || stream === false;
}

function Signal() {
  const [remoteStream, setRemote] = useState<MediaStream>();
  const [myRTC, setMyRTC] = useState<MyRTC>();
  const [mySocket, setMySocket] = useState<MySocket>();

  useEffect(() => {
    mediaDevices.getUserMedia({ video: false, audio: true }).then(stream => {
      if (!streamGuard(stream)) {
        const temp = new MyRTC(stream);
        setMySocket(new MySocket(temp));
        setMyRTC(temp);
      }
    });
  }, []);

  useEffect(() => {
    myRTC?.setRemoteFunc(setRemote);
  }, [myRTC, mySocket]);

  const onJoinClick = () => {
    if (!mySocket) return;

    mySocket.joinRoom('foo');
  };
  console.log(remoteStream);

  return (
    <View>
      {myRTC && (
        <>
          <Button title="join" onPress={onJoinClick} />
        </>
      )}
      {remoteStream && (
        <>
          <RtcView stream={remoteStream} />
        </>
      )}
    </View>
  );
}

export default Signal;
