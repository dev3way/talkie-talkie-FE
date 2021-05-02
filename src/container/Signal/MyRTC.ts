import {
  EventOnAddStream,
  EventOnCandidate,
  RTCPeerConnection,
  RTCSessionDescriptionType,
  RTCSessionDescription,
  MediaStream,
  RTCIceCandidate,
} from 'react-native-webrtc';

const configuration = {
  iceServers: [
    {
      urls: ['stun:stun.l.google.com:19302'],
    },
  ],
};

export type ThandlerIcecandidateMessage = {
  type: string;
  label: number;
  id: string;
  candidate: string;
};

class MyRTC {
  pc: null | RTCPeerConnection;
  localStream: MediaStream;
  remoteStream: null | MediaStream;
  isOffer: boolean;
  isReady: boolean;
  isStarted: boolean;
  emitMeesage: null | Function;

  constructor(stream: MediaStream) {
    this.localStream = stream;
    this.isOffer = false;
    this.isReady = false;
    this.isStarted = false;
    this.pc = null;
    this.emitMeesage = null;
    this.remoteStream = null;
  }

  setEmitMessage(func: Function) {
    this.emitMeesage = func;
  }

  setIsOffer(offer: boolean) {
    this.isOffer = offer;
  }

  setIsReady(ready: boolean) {
    this.isReady = ready;
  }

  createConnection() {
    this.pc = new RTCPeerConnection(configuration);
    this.pc.onicecandidate = this.handlerIcecandidate.bind(this);
    this.pc.onaddstream = this.handlerAddRemoteStream.bind(this);
  }

  handlerIcecandidate(event: EventOnCandidate) {
    if (!event.candidate || !this.emitMeesage) return;

    const CANDIDATE_TYPE = 'candidate';
    const { sdpMLineIndex, sdpMid } = event.candidate;

    const message = {
      type: CANDIDATE_TYPE,
      label: sdpMLineIndex,
      id: sdpMid,
      candidate: event.candidate,
    };

    this.emitMeesage(message);
  }

  handlerAddRemoteStream(e: EventOnAddStream) {
    const { stream } = e;

    if (stream) this.remoteStream = stream;
  }

  doCall() {
    if (!this.pc) return;

    this.pc.createOffer().then(this.setLocalDescription.bind(this));
  }

  doAnswer() {
    if (!this.pc) return;

    this.pc.createAnswer().then(this.setLocalDescription.bind(this));
  }

  setLocalDescription(description: RTCSessionDescriptionType) {
    if (!this.pc || !this.emitMeesage) return;

    this.pc.setLocalDescription(description);
    this.emitMeesage(description);
  }

  startConnection() {
    if (this.isStarted || !this.isReady) return;

    this.createConnection();
    if (!this.pc) return;

    this.pc.addStream(this.localStream);
    this.isStarted = true;

    if (this.isOffer) this.doCall();
  }

  setRemoteDescription(sessionDescriptionInfo: RTCSessionDescriptionType) {
    const sessionDescription = new RTCSessionDescription(
      sessionDescriptionInfo,
    );

    return this.pc?.setRemoteDescription(sessionDescription);
  }

  addIceCandidate(candidateInfo: ThandlerIcecandidateMessage) {
    const candidate = new RTCIceCandidate({
      sdpMLineIndex: candidateInfo.label,
      sdpMid: candidateInfo.id,
      candidate: candidateInfo.candidate,
    });

    this.pc?.addIceCandidate(candidate);
  }
}

export default MyRTC;
