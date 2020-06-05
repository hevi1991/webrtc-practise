"use strict";

// DOM
const usernameDOM = document.querySelector("#username");
const roomDOM = document.querySelector("#room");
const connectDOM = document.querySelector("#connect");
const outputDOM = document.querySelector("#output");
const inputDOM = document.querySelector("#input");
const sendDOM = document.querySelector("#send");

let room;
let socket;

// 连接socket按钮
connectDOM.onclick = (event) => {
  // connect
  socket = io();

  // recieve message
  socket.on("joined", (room, id) => {
    console.log(`joined: ${room} - ${id}`);

    connectDOM.disabled = true;
    roomDOM.disabled = true;
    usernameDOM.disabled = true;
    inputDOM.disabled = false;
    sendDOM.disabled = false;
  });
  socket.on("left", (room, id) => {
    connectDOM.disabled = false;
    roomDOM.disabled = false;
    usernameDOM.disabled = false;
    inputDOM.disabled = true;
    sendDOM.disabled = true;
  });
  socket.on("message", (room, data) => {
    console.log(`message: ${room} - ${data}`);
    outputDOM.scrollTop = outputDOM.scrollHeight; //窗口总是显示最后的内容
    outputDOM.value = outputDOM.value + data + "\r";
  });
  // send message
  room = roomDOM.value;
  socket.emit("join", room);
};

// 发送消息到聊天室
sendDOM.onclick = (event) => {
  let data = inputDOM.value;
  data = usernameDOM.value + ":" + data;
  socket.emit("message", roomDOM.value, data);
  inputDOM.value = "";
};
