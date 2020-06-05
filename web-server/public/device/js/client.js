"use strict";

var audioInput = document.querySelector("select#audioInput");
var audioOutput = document.querySelector("select#audioOutput");
var videoInput = document.querySelector("select#videoInput");

// 判断是否兼容媒体
if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
  console.log("enumerateDevices is not supported");
} else {
  // 询问权限，否则label取不到名称
  /* navigator.mediaDevices
    .getUserMedia({ audio: true, video: true })
    .then((mediaStream) => {
      return;
    }); */

  // 查看浏览器的物理设备支持
  navigator.mediaDevices
    .enumerateDevices()
    .then((deviceInfos) => {
      deviceInfos.forEach((deviceInfo) => {
        console.log(deviceInfo);
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
    .catch((err) => {
      console.error(err);
    });
}
