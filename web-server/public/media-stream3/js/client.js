"use strict";

// 输入输出源控制
var audioInput = document.querySelector("select#audioinput");
var audioOutput = document.querySelector("select#audiooutput");
var videoInput = document.querySelector("select#videoinput");
var videoplayer = document.querySelector("video#player");
// 滤镜
var filterSelect = document.querySelector("select#filter");
// 截图
var snapshotButton = document.querySelector("button#snapshot");
var pictureCanvas = document.querySelector("canvas#picture");
pictureCanvas.width = 320;
pictureCanvas.height = 180;
// 音频
// var audioplayer = document.querySelector("audio#audioplayer");
// 视频约束信息
var preContraints = document.querySelector("pre#constraints");
// 录制
var recplayer = document.querySelector("video#recplayer");
var recordBtn = document.querySelector("button#record");
var recplayBtn = document.querySelector("button#recplay");
var downloadBtn = document.querySelector("button#download");

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
        window._stream = mediaStream;

        // track
        var videoTrack = mediaStream.getVideoTracks()[0];
        var videoConstraints = videoTrack.getSettings();
        var constraintsJSON = JSON.stringify(videoConstraints, null, 2);
        preContraints.textContent = constraintsJSON;
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

  // 录制
  var mediaRecorder;
  var chunk; // 存储录制信息的变量
  // 存储media数据
  function handleMediaAvailable(e) {
    if (e && e.data && e.data.size > 0) {
      chunk.push(e.data);
    }
  }
  // 开始录制
  function startRecord() {
    chunk = [];
    var options = {
      mimeType: "video/webm;codecs=vp8",
    };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.error(`MIME Type: ${options.mimeType} is not supported.`);
    }
    try {
      mediaRecorder = new MediaRecorder(window._stream, options);
    } catch (error) {
      console.error(error);
    }

    mediaRecorder.ondataavailable = handleMediaAvailable;
    mediaRecorder.start(10);
  }
  // 停止录制
  function stopRecord() {
    mediaRecorder.stop();
  }

  // 控制录制
  recordBtn.onclick = (event) => {
    if (recordBtn.textContent === "Start Record") {
      // 开始录制
      startRecord();
      recordBtn.textContent = "Stop Record";
      recplayBtn.disabled = true;
      downloadBtn.disabled = true;
    } else {
      // 停止录制
      stopRecord();
      recordBtn.textContent = "Start Record";
      recplayBtn.disabled = false;
      downloadBtn.disabled = false;
    }
  };

  // 播放已录制视频
  recplayBtn.onclick = (event) => {
    var blob = new Blob(chunk, { type: "video/webm" });
    recplayer.src = window.URL.createObjectURL(blob);
    recplayer.srcObject = null;
    recplayer.controls = true;
    recplayer.play();
  };

  // 下载
  downloadBtn.onclick = (event) => {
    var blob = new Blob(chunk, { type: "video/webm" });
    var a = document.createElement("a");
    a.href = window.URL.createObjectURL(blob);
    a.download = Date.now().toString() + ".webm";
    a.click();
  };
}
