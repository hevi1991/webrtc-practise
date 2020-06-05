"use strict";

const localvideoDOM = document.querySelector("#localvideo");
const remotevideoDOM = document.querySelector("#remotevideo");
const connserverDOM = document.querySelector("#connserver");
const leaveDOM = document.querySelector("#leave");
const mediaselectDOM = document.querySelector("#mediaselect");

let localStream;// 存储本地视频流，用于后面点对点传输
let pc1;// 本地RTCPeerConnection实例
let socket;
const ROOM_ID = "1";
let client = {
  state: "",// 客户端状态机
};
const STATE = {
  JOINED: "JOINED",
  JOINED_CONN: "JOINED_CONN",
  JOINED_UNBIND: "JOINED_UNBIND",
  LEFT: "LEFT"
};

client = new Proxy(client, {
  get: function (target, propKey, receiver) {
    return Reflect.get(target, propKey, receiver);
  },
  set: function (target, propKey, value, receiver) {
    console.log(`${propKey}: ${value}`);
    return Reflect.set(target, propKey, value, receiver);
  }
});

/**
 * 创建点对点连接
 */
function createPeerConnection() {
  console.log(`create RTCPeerConnection!`);
  if (!pc1) {
    const pcConfig = {
      "iceServers": [{
        /*
        * https://hub.docker.com/r/boldt/coturn
        * ice 服务器
        * urls ice服务地址
        * username 用户名
        * credential 密码
        * */
        "urls": "stun:192.168.1.106:3478",
        "username": "bbb",
        "credential": "1234"
      }]
    };

    pc1 = new RTCPeerConnection(pcConfig);
    pc1.onicecandidate = (e) => {
      if (e.candidate) {
        console.log("find an new candidate", e.candidate);
        sendMessage(ROOM_ID, {
          type: "candidate",
          label: e.candidate.sdpMLineIndex,
          id: e.candidate.sdpMid,
          candidate: e.candidate
        });
      }
    };
    pc1.ontrack = getRemoteStream;
  }

  if (localStream) {
    const myStream = new MediaStream();
    localStream.getTracks().forEach(track => {
      pc1.addTrack(track, myStream);
    });
  }
}

/**
 * 连接到socket服务器
 */
function conn() {
  socket = io();
  socket.on("joined", (room, id) => {
    console.log(`receive joined message: ` + room, id);
    client.state = STATE.JOINED;
    createPeerConnection();
    connserverDOM.disabled = true;
    leaveDOM.disabled = false;
  });
  socket.on("otherjoined", (room, id) => {
    console.log(`receive otherjoined message: ` + room, id);
    if (client.state === STATE.JOINED_UNBIND) {
      createPeerConnection();
    }
    client.state = STATE.JOINED_CONN;
    call();
  });
  socket.on("full", (room, id) => {
    console.log(`receive full message: ` + room, id);
    client.state = STATE.LEFT;
    socket.disconnect();
    alert(`the room is full`);
    connserverDOM.disabled = false;
    leaveDOM.disabled = true;
  });
  socket.on("leave", (room, id) => {
    console.log(`receive leave message: ` + room, id);
    client.state = STATE.LEFT;
    socket.disconnect();
    connserverDOM.disabled = false;
    leaveDOM.disabled = true;
  });
  socket.on("bye", (room, id) => {
    console.log(`receive bye message: ` + room, id);
    client.state = STATE.JOINED_UNBIND;
    closePeerConnection();
  });
  socket.on("message", (room, data) => {
    console.log(`receive client's message: `, room, data);
    // 媒体协商
    if (data) {
      if (data.type === "offer") {
        pc1.setRemoteDescription(new RTCSessionDescription(data));
        pc1.createAnswer()
          .then(getAnswer)
          .catch(console.error);
      } else if (data.type === "answer") {
        pc1.setRemoteDescription(new RTCSessionDescription(data));
      } else if (data.type === "candidate") {
        pc1.addIceCandidate(data.candidate);
      } else {
        console.error(`the message is invalid!`);
      }
    }
  });
  // 进入房间
  socket.emit("join", ROOM_ID);
}

/**
 * 处理媒体流
 * @type {Element}
 */
function getMediaStream(stream) {
  localStream = stream;
  localvideoDOM.srcObject = stream;
  // 连接
  conn();
}

/**
 * 取得媒体流
 * @param event
 */
function start(event) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.error(`the getUserMedia is not supported!`);
  } else {
    if (mediaselectDOM.value === "video") {
      let constraints = {
        video: {
          width: 480,
          height: 270
        },
        audio: false
      };
      navigator.mediaDevices.getUserMedia(constraints)
        .then(getMediaStream)
        .catch(console.error);
    } else if (mediaselectDOM.value === "screen") {
      let constraints = {
        video: {
          width: 480,
          height: 270
        }
      };
      navigator.mediaDevices.getDisplayMedia(constraints)
        .then(getMediaStream)
        .catch(console.error);
    }
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
 * 讲本地的 Description传输给对端
 * @param roomId
 * @param data
 */
function sendMessage(roomId, data) {
  console.log(`send p2p message`, roomId, data);
  if (socket) {
    socket.emit("message", roomId, data);
  }
}

/**
 * 取得本地描述信息后，配置给RTCPeerConnection
 * @param desc
 */
function getOffer(desc) {
  pc1.setLocalDescription(desc).catch(console.error);
  // send desc to signal server
  sendMessage(ROOM_ID, desc);
}

/**
 * 取得本地answer
 * @param desc
 */
function getAnswer(desc) {
  pc1.setLocalDescription(desc).catch(console.error);
  // 发送内容到对端
  sendMessage(ROOM_ID, desc);
}

/**
 * RTCPeerConnection 连接
 */
function call() {
  if (client.state === STATE.JOINED_CONN) {
    if (pc1) {
      const options = {
        offerToReceiveVideo: 1,
        offerToReceiveAudio: 0
      };
      pc1.createOffer(options)
        .then(getOffer);
    }

  }
}


/**
 * 连接信令服务器
 */
function connSignalServer() {
  start();
}

/**
 * 关闭peer connection
 */
function closePeerConnection() {
  console.log(`close RTCPeerConnection!`);
  if (pc1) {
    pc1.close();
    pc1 = null;
  }
}

/**
 * 关闭媒体资源
 */
function closeLocalMedia() {
  if (localStream && localStream.getTracks()) {
    localStream.getTracks().forEach(track => {
      track.stop();
    });
    localStream = null;
  }
}

/**
 * 离开
 */
function leave() {
  if (socket) {
    socket.emit("leave", ROOM_ID);
  }

  // 关闭连接
  closePeerConnection();
  // 释放资源
  closeLocalMedia();

  connserverDOM.disabled = false;
  leaveDOM.disabled = true;
}

// 绑定事件
connserverDOM.onclick = connSignalServer;
leaveDOM.onclick = leave;
mediaselectDOM.onchange = (e) => {
  // 暴力退出
  leave();
  start();
};
window.onbeforeunload = (e) => {
  leave();
};
