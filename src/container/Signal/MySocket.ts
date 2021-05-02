import io, { Socket } from 'socket.io-client';
import { RTCSessionDescriptionType } from 'react-native-webrtc';
import { BACKEND_URL } from '../../../env.json';
import MyRTC, { ThandlerIcecandidateMessage } from './MyRTC';

type TMessage =
  | 'start'
  | RTCSessionDescriptionType
  | ThandlerIcecandidateMessage;

const MESSAGE_EVENT_NAME = 'message';

class MySocket {
  socket: Socket;
  isOffer: boolean;
  isReady: boolean;
  myRTC: MyRTC;

  constructor(myRTC: MyRTC) {
    this.socket = io(BACKEND_URL);
    this.isOffer = false;
    this.isReady = false;
    this.myRTC = myRTC;
    this.myRTC.setEmitMessage(this.emitMessage);
  }

  joinRoom(roomName: string) {
    this.socket.emit('join', roomName);
  }

  emitMessage(message: TMessage) {
    this.socket.emit(MESSAGE_EVENT_NAME, message);
  }

  setEvent() {
    this.socket.on('master', () => {
      this.isOffer = true;
    });

    this.socket.on('joined', () => {
      this.isReady = true;
    });

    this.socket.on('message', (message: TMessage) => {
      if (message === 'start') {
        this.myRTC.startConnection();
        return;
      }

      this.messageTypeDecoder(message);
    });
  }

  messageTypeDecoder(message: TMessage) {
    if (message === 'start') return;

    switch (message.type) {
      case 'offer': {
        this.handlerOffer(message as RTCSessionDescriptionType);
        break;
      }

      case 'answer': {
        this.handlerAnswer(message as RTCSessionDescriptionType);
        break;
      }

      case 'candidate': {
        this.handlerCandidate(message as ThandlerIcecandidateMessage);
        break;
      }
    }
  }

  handlerOffer(message: RTCSessionDescriptionType) {
    const { isOffer, isStarted } = this.myRTC;
    if (!isOffer && !isStarted) this.myRTC.startConnection();

    this.myRTC.setRemoteDescription(message)?.then(() => this.myRTC.doAnswer());
  }

  handlerAnswer(message: RTCSessionDescriptionType) {
    const { isStarted } = this.myRTC;

    if (!isStarted) return;

    this.myRTC.setRemoteDescription(message);
  }

  handlerCandidate(message: ThandlerIcecandidateMessage) {
    this.myRTC.addIceCandidate(message);
  }
}

export default MySocket;