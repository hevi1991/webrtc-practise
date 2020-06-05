"use strict";

const createofferDOM = document.querySelector("#createoffer");

const pc = new RTCPeerConnection();
const pc2 = new RTCPeerConnection();

function getAnswer(desc) {
  console.log("answer:\n", desc.sdp);
  pc2.setLocalDescription(desc).catch(console.error);
  pc.setRemoteDescription(desc).catch(console.error);
}

function getOffer(desc) {
  console.log("offer:\n", desc.sdp);
  pc.setLocalDescription(desc).catch(console.error);
  pc2.setRemoteDescription(desc).catch(console.error);
  pc2.createAnswer().then(getAnswer).catch(console.error);
}

function getMediaStream(stream) {
  stream.getTracks().forEach(track => {
    pc.addTrack(track);
  });

  const options = {
    offerToReceiveAudio: 0,
    offerToReceiveVideo: 1,
    iceRestart: true
  };

  pc.createOffer(options).then(getOffer).catch(console.error);
}

function getStream() {
  const constraints = {
    audio: false,
    video: true
  };

  navigator.mediaDevices.getUserMedia(constraints).then(getMediaStream);
}

createofferDOM.onclick = (e) => {
  if (!pc) {
    console.error("pc is null");
  } else {
    getStream();
  }
};
