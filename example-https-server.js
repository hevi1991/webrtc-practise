"use strict";

var https = require("https");
var fs = require("fs");

var options = {
  key: fs.readFileSync("./cert/example.com+6-key.pem"),
  cert: fs.readFileSync("./cert/example.com+6.pem"),
};

https
  .createServer(options, function (req, res) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello HTTPS");
  })
  .listen(443, "0.0.0.0");
