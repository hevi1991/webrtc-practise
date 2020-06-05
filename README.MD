# 关于WebRTC的一些Demo

## 搭建

由于`js`的`navigator.mediaDevices.getDisplayMedia`和`getUserMedia`需要`Https`协议下才能进行，然而在下也没去弄付费的`https`证书，所以证书方面我用了`mkcert`（开发用的证书配置办法，可以参考[链接](http://iceiceice.top/2019/01/21/make-certificate/)）

## 结构

```
.
├── assets 一些资源，可以无视
├── cert example-https-server.js 需要用到的证书（需要你重新生成）
│   ├── example.com+6-key.pem
│   └── example.com+6.pem
├── example-http-server.js nodejs原生http服务的helloworld
├── example-https-server.js nodejs原生https服务的helloworld
└── web-server 基于express的https静态资源服务，一个独立项目，你可以只看web-server这个文件夹
    ├── app.log 日志啥的
    ├── cert web-server证书
    │   ├── example.com+6-key.pem
    │   └── example.com+6.pem
    ├── package-lock.json
    ├── package.json
    ├── public
    │   ├── banwidth 选择带宽，服务端基于server-webrtc.js
    │   │   ├── css
    │   │   ├── index.html
    │   │   └── js
    │   │       └── main.js
    │   ├── chat-data-channel DataChannel通道，服务端基于server-webrtc.js
    │   │   ├── css
    │   │   ├── index.html
    │   │   └── js
    │   │       └── main.js
    │   ├── chatroom 聊天室，服务端基于server.js
    │   │   ├── css
    │   │   ├── index.html
    │   │   └── js
    │   │       └── main.js
    │   ├── device 查看浏览器端支持的外设
    │   │   ├── index.html
    │   │   └── js
    │   │       └── client.js
    │   ├── media-stream 本地浏览器捕捉音视频流，本地观察
    │   │   ├── css
    │   │   ├── index.html
    │   │   └── js
    │   │       └── client.js
    │   ├── media-stream2 一些滤镜，截图控制
    │   │   ├── css
    │   │   ├── index.html
    │   │   └── js
    │   │       └── client.js
    │   ├── media-stream3 切换外设流来源
    │   │   ├── css
    │   │   ├── index.html
    │   │   └── js
    │   │       └── client.js
    │   ├── media-stream4 使用getDisplayMedia
    │   │   ├── css
    │   │   ├── index.html
    │   │   └── js
    │   │       └── client.js
    │   ├── peer-connection 本地模拟两端互联，服务端基于server.js
    │   │   ├── index.html
    │   │   └── js
    │   │       └── main.js
    │   ├── peer-connection-p2p-media 两端互联，服务端基于server-webrtc.js
    │   │   ├── css
    │   │   ├── js
    │   │   │   └── main.js
    │   │   └── room.html
    │   ├── peer-connection-sdp 本地模拟两端互联，查看sdp信息，服务端基于server.js
    │   │   ├── index.html
    │   │   └── js
    │   │       └── main.js
    │   └── testCreateOffer 本地模拟两端互联，查看offer信息，服务端基于server.js
    │       ├── index.html
    │       └── js
    │           └── main.js
    ├── server-webrtc.js 服务端代码
    └── server.js 服务端代码

```
