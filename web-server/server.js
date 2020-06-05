"use strict";

const http = require("http");
const https = require("https");
const fs = require("fs");

const express = require("express");
const serveIndex = require("serve-index");
const socketIO = require("socket.io");
const log4js = require("log4js");

// log4js 配置
log4js.configure({
  appenders: {
    file: {
      type: "file",
      filename: "app.log",
      layout: {
        type: "pattern",
        pattern: "%r %p -%m",
      },
    },
  },
  categories: {default: {appenders: ["file"], level: "debug"}},
});
const logger = log4js.getLogger();

// server 信息
const HTTP_PORT = 10080;
const HTTPS_PORT = 10443;
const SERVER_HOST = "0.0.0.0";

const app = express();
// 发布目录
app.use(serveIndex("./public"));
app.use(express.static("./public"));

// http server
const httpServer = http.createServer(app);
httpServer.listen(HTTP_PORT, SERVER_HOST);
console.log(`Server listening at http://${SERVER_HOST}:${HTTP_PORT}`);

// https server
const options = {
  key: fs.readFileSync("./cert/example.com+6-key.pem"),
  cert: fs.readFileSync("./cert/example.com+6.pem"),
};
const httpsServer = https.createServer(options, app);
// binding socket io
const io = socketIO(httpsServer);
io.on("connection", (socket) => {
  console.log(socket.id);

  // 自定义socket事件，加入
  socket.on("join", (room) => {
    // room需要唯一
    socket.join(room);
    const myRoom = io.sockets.adapter.rooms[room];
    // 取得该房间人数
    const users = Object.keys(myRoom.sockets).length;
    logger.debug(`the number of user in room is ${users}`);

    // 回复该客户
    // socket.emit("joined", room, socket.id);
    // 回复除该客户以外的，在room里面的用户
    // socket.to(room).emit("joined", room, socket.id);
    // 回复该房间所有人(包含本用户)
    io.in(room).emit("joined", room, socket.id);
    // 给所有站点所有人回复（不包含本用户）
    // socket.broadcast.emit("joined", room, socket.id);
  });

  // 离开
  socket.on("leave", (room) => {
    const myRoom = io.sockets.adapter.rooms[room];
    let users = Object.keys(myRoom.sockets).length;
    logger.debug(`the number of user in room is ${users - 1}`);

    socket.leave(room);
    //socket.emit("left", room, socket.id);
    // socket.to(room).emit("left", room, socket.id);
    //io.in(room).emit("left", room, socket.id);
    // socket.broadcast.emit("left", room, socket.id);
  });

  // 接发消息
  socket.on("message", (room, data) => {
    console.log(`${socket.id} - ${room} - ${data}`);
    io.in(room).emit("message", room, data);
  });
});
httpsServer.listen(HTTPS_PORT, SERVER_HOST);
console.log(`Server listening at https://${SERVER_HOST}:${HTTPS_PORT}`);
