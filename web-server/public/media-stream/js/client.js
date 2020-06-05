"use strict";

var audioInput = document.querySelector("select#audioinput");
var audioOutput = document.querySelector("select#audiooutput");
var videoInput = document.querySelector("select#videoinput");
var videoplayer = document.querySelector("video#player");
var filterSelect = document.querySelector("select#filter");
var snapshotButton = document.querySelector("button#snapshot");
var pictureCanvas = document.querySelector("canvas#picture");
pictureCanvas.width = 320;
pictureCanvas.height = 180;
// var audioplayer = document.querySelector("audio#audioplayer");

// 音视频约束
// https://developer.mozilla.org/zh-CN/docs/Web/API/MediaDevices/getUserMedia
// https://developer.mozilla.org/zh-CN/docs/Web/API/MediaStreamConstraints
var constraints = {
  video: {
    width: 320,
    height: 180,
  },
  audio: false,
};

if (!navigator.mediaDevices && !navigator.mediaDevices.getUserMedia) {
  console.log(`GetUserMedia is not supported!`);
} else {
  // 读取采集器约束，采集信息
  function loadUserMedia(constraints) {
    return navigator.mediaDevices
      .getUserMedia(constraints)
      .then((mediaStream) => {
        videoplayer.srcObject = mediaStream;
        // audioplayer.srcObject = mediaStream;
      });
  }

  loadUserMedia(constraints)
    .then(() => {
      // 查看浏览器的物理设备支持
      return navigator.mediaDevices.enumerateDevices();
    })
    .then((deviceInfos) => {
      deviceInfos.forEach((deviceInfo) => {
        // console.log(deviceInfo);
        var { kind, label, deviceId } = deviceInfo;
        var option = document.createElement("option");
        option.text = label;
        option.value = deviceId;
        if (kind === "audioinput") {
          audioInput.appendChild(option);
        } else if (kind === "audiooutput") {
          audioOutput.appendChild(option);
        } else if (kind === "videoinput") {
          videoInput.appendChild(option);
        }
      });
    })
    .catch((err) => console.error);

  // 重新加载来源
  function reloadDevices(event) {
    var target = event.target;
    if (target.id === "audioinput") {
      constraints.audio = {
        deviceId: target.value,
      };
    } else if (target.id === "videoinput") {
      constraints.video = Object.assign(constraints.video, {
        deviceId: target.value,
      });
    }
    loadUserMedia(constraints);
  }

  audioInput.addEventListener("change", reloadDevices);
  audioOutput.addEventListener("change", reloadDevices);
  videoInput.addEventListener("change", reloadDevices);

  // 滤镜
  filterSelect.addEventListener("change", (event) => {
    videoplayer.className = event.target.value;
  });

  // 截图
  snapshotButton.onclick = (event) => {
    pictureCanvas.className = filterSelect.value;
    pictureCanvas.getContext("2d").drawImage(
      videoplayer, // 源
      0, // 从哪个 x 坐标截
      0, // 从哪个 y 坐标截
      pictureCanvas.width, // 截多宽
      pictureCanvas.height // 截多高
    );
  };
}
