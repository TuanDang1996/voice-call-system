import * as express from "express";
import { WebSocket } from "./websocket/websocket";
import * as http from "http";
import path = require("path");

const mediaHost = process.env.MEDIA_SERVER_HOST || "10.0.0.13";
const mediaPort = process.env.MEDIA_SERVER_PORT || "8899";
const mediaUri = "ws://" + mediaHost + ":" + mediaPort + "/kurento";

const appHost = process.env.APP_SERVER_HOST || "0.0.0.0";
const appPort = process.env.APP_SERVER_PORT || "8444";
const asUri = "http://" + appHost + ":" + appPort + "/";

const app: express.Express = express();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "static")));
// app.get("/recording", (req, res) => {
//   res.sendFile(path.join(__dirname, "static", "index.html"));
// });
const server = http.createServer(app).listen(appPort, function () {
  console.log("Kurento Tutorial started");
  console.log(
    `Open app http://localhost:${appPort} with a WebRTC capable browser`
  );
});

//init websocket
new WebSocket(mediaUri, server);
