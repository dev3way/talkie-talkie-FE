import React, { useRef, useState } from 'react';
import { Button, TextInput, View } from 'react-native';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs-websocket';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  EventOnCandidate,
  mediaDevices,
  RTCView,
  RTCSessionDescriptionType,
} from 'react-native-webrtc';

type TStompInfos = {
  isOffer: boolean;
  isReady: boolean;
  localStream: any;
  myName: string;
  isStarted: boolean;
  pc: RTCPeerConnection | null;
  roomId: string;
};

const pcConfig = {
  iceServers: [
    {
      urls: ['stun:stun.l.google.com:19302'],
    },
  ],
};

export default function HashInput() {
  const stompClient = useRef<Stomp.Client>();
  const stompInfos = useRef<TStompInfos>({
    isOffer: false,
    isReady: false,
    localStream: null,
    myName: '',
    isStarted: false,
    pc: null,
    roomId: '',
  });
  const [hash, setHash] = useState<string>('');
  const [remoteStream, setRemoteStream] = useState<any>();
  const onSubmit = () => {
    getNavigator();
    // stompClient.current.send(`/app/hash/${hash}/join`);
  };

  const getNavigator = () => {
    mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .then(stream => {
        stompInfos.current.localStream = stream;
        return onConnect();
      })
      .then(() => {
        if (!stompClient.current) return;
        stompClient.current.send(`/app/hash/${hash}/join`);
      });
  };

  const onConnect = (): Promise<any> => {
    return new Promise<any>(resolve => {
      const socket = new SockJS('http://localhost:8080/ws');
      stompClient.current = Stomp.over(socket);
      const { current: stompCur } = stompClient;

      stompCur.connect({}, onConnected, onError);
      function onConnected() {
        stompCur.subscribe('/user/topic/rooms/join', ondirectMessage);
        resolve('hh');
      }

      function ondirectMessage(message: Stomp.Message) {
        const { type, roomId: roomURL, sender } = JSON.parse(message.body);
        stompInfos.current.isOffer = type === 'master';

        stompInfos.current.myName = sender;
        stompInfos.current.roomId = roomURL;

        stompCur.subscribe(`/topic/rooms/${stompInfos.current.roomId}`, onRTC);

        const message2 = {
          type: 'start',
          sender,
        };

        startConnect();
        if (stompInfos.current.isOffer) {
          stompCur.send(
            `/app/rooms/${stompInfos.current.roomId}`,
            {},
            JSON.stringify(message2),
          );
        }
      }

      function onError(e: String) {
        console.error(e);
      }

      function startConnect() {
        if (stompInfos.current.isStarted) return;

        createConnection();
        stompInfos.current.pc!.addStream(stompInfos.current.localStream);
        stompInfos.current.isStarted = true;
        if (stompInfos.current.isOffer) {
          doCall();
        }
      }

      function createConnection() {
        stompInfos.current.pc = new RTCPeerConnection(pcConfig);

        stompInfos.current.pc.onicecandidate = icecandidateHandler;
        stompInfos.current.pc.onaddstream = onremoteStream;
      }

      function onremoteStream(e: any) {
        setRemoteStream(e.stream);
      }
      function onRTC(message: Stomp.Message) {
        const description = JSON.parse(message.body);
        const { type, sender } = description;

        if (sender && sender === stompInfos.current.myName) return;
        console.log(type);
        switch (type) {
          case 'start': {
            startConnect();
            break;
          }
          case 'offer': {
            if (!stompInfos.current.isOffer) {
              startConnect();
            }
            stompInfos.current
              .pc!.setRemoteDescription(new RTCSessionDescription(description))
              .then(() => doAnswer());
            break;
          }
          case 'answer': {
            if (stompInfos.current.isStarted) {
              stompInfos.current.pc!.setRemoteDescription(
                new RTCSessionDescription(description),
              );
            }
            break;
          }

          case 'candidate': {
            if (!stompInfos.current.isStarted) break;

            const candidate = new RTCIceCandidate({
              sdpMid: description.id,
              sdpMLineIndex: description.label,
              candidate: description.candidate,
            });

            stompInfos.current.pc!.addIceCandidate(candidate);
            break;
          }
        }
      }

      function setLocalAndSendMessage(description: RTCSessionDescriptionType) {
        stompInfos.current.pc!.setLocalDescription(description);

        const data = {
          ...RTCSessionDescriptionType,
          sender: stompInfos.current.myName!,
        };

        emitSignerEvent(data);
      }

      async function doCall() {
        stompInfos.current.pc!.createOffer().then(setLocalAndSendMessage);
      }

      function doAnswer() {
        stompInfos.current.pc!.createAnswer().then(setLocalAndSendMessage);
      }

      function icecandidateHandler(message: EventOnCandidate) {
        const { sdpMLineIndex, sdpMid } = message.candidate;

        const message2 = {
          type: 'candidate',
          label: sdpMLineIndex,
          id: sdpMid,
          candidate: message.candidate,
          sender: stompInfos.current.myName,
        };

        emitSignerEvent(message2);
      }

      function emitSignerEvent(data: any) {
        const { roomId } = stompInfos.current;
        if (!stompClient.current) return;

        if (data.type === 'offer' || data.type === 'answer') {
          stompClient.current.send(
            `/app/rooms/${roomId}`,
            {},
            JSON.stringify({
              sender: data.sender,
              type: data.type,
              sdp: data.sdp,
            }),
          );
        } else {
          stompClient.current.send(
            `/app/rooms/${roomId}`,
            {},
            JSON.stringify(data),
          );
        }
      }
    });
  };

  return (
    <View>
      <TextInput value={hash} onChangeText={setHash} />
      <Button title="입력" onPress={onSubmit} />
      {remoteStream && (
        <>
          {' '}
          <RTCView streamURL={remoteStream.toURL()} />
          hi
        </>
      )}
    </View>
  );
}

// /**
//  * todo
//  * 1. 해쉬 값 입력받기 (완)
//  * 2. sockJS, stompjs 로 서버에 연결하기
//  * 3. 해쉬 서버에 전달해서 방 가입 emit()
//  * 4. webRTC candidate 로직 생성
//  */
