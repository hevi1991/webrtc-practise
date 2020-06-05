"use strict";

const localvideoDOM = document.querySelector("#localvideo");
const remotevideoDOM = document.querySelector("#remotevideo");
const startDOM = document.querySelector("#start");
const callDOM = document.querySelector("#call");
const hangupDOM = document.querySelector("#hangup");

let localStream;// 存储本地视频流，用于后面点对点传输
let pc1;// 本地RTCPeerConnection实例
let pc2;// 远程RTCPeerConnection实例

/**
 * 处理媒体流
 * @type {Element}
 */
function getMediaStream(stream) {
  localStream = stream;
  localvideoDOM.srcObject = stream;
}

/**
 * 处理错误
 * @param err
 */
function handleError(err) {
  console.error(err);
}

/**
 * 取得媒体流
 * @param event
 */
function start(event) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.error(`the getUserMedia is not supported!`);
  } else {
    callDOM.disabled = false;
    let constraints = {
      video: {
        width: 160,
        height: 90
      },
      audio: false
    };
    navigator.mediaDevices.getUserMedia(constraints)
      .then(getMediaStream)
      .catch(handleError);
  }
}

/**
 * 取得远程视频流
 * @param streams
 */
function getRemoteStream({streams}) {
  remotevideoDOM.srcObject = streams && streams[0];
}

/**
 * 取得本地描述信息后，配置给RTCPeerConnection
 * @param desc
 */
function getLocalOffer(desc) {
  pc1.setLocalDescription(desc);
  // send desc to signal server
  // receive desc from signal
  pc2.setRemoteDescription(desc);
  pc2.createAnswer()
    .then(getRemoteAnswer)
    .catch(handleAnswerError);
}

/**
 * 取得远端回应
 */
function getRemoteAnswer(desc) {
  pc2.setLocalDescription(desc);
  // send desc to signal
  // receive desc from signal
  pc1.setRemoteDescription(desc);
}

/**
 * 处理Offer错误
 * @param err
 */
function handleOfferError(err) {
  console.error(err);
}

/**
 * 处理Answer错误
 * @param err
 */
function handleAnswerError(err) {
  console.error(err);
}

/**
 * RTCPeerConnection 连接
 * @param event
 */
function call(event) {
  hangupDOM.disabled = false;

  pc1 = new RTCPeerConnection();
  pc2 = new RTCPeerConnection();

  // 假设经过了信令服务器，取得了候选列表
  pc1.onicecandidate = ({candidate}) => {
    return pc2.addIceCandidate(candidate);
  };
  pc2.onicecandidate = ({candidate}) => {
    return pc1.addIceCandidate(candidate);
  };

  // 当pc2取得流的时候，处理流
  pc2.ontrack = getRemoteStream;

  // 1.添加数据
  localStream.getTracks().forEach(track => {
    pc1.addTrack(track, localStream);
  });

  // 2.做媒体协商
  let offerOptions = {
    offerToReceiveAudio: 0,
    offerToReceiveVideo: 1
  };
  pc1.createOffer(offerOptions)
    .then(getLocalOffer)
    .catch(handleOfferError);
}

function hangUp(event) {
  pc1.close();
  pc2.close();
  pc1 = null;
  pc2 = null;
  hangupDOM.disabled = true;
}

// 绑定事件
startDOM.onclick = start;
callDOM.onclick = call;
hangupDOM.onclick = hangUp;
