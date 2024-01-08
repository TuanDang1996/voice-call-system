import express from "express";
import { WebSocket } from "./websocket/websocket";
import http from "http";
import * as config from "./config";
import routes from "./api/routes";
import swaggerRoute from "./api/routes/swagger";

import "./database/mongodb";
const app: express.Express = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(config.STATIC_PATH));
app.use(config.API_PREFIX, routes);
app.use("/swagger", swaggerRoute);

const server = http.createServer(app).listen(config.APP_PORT, function () {
  console.log("Kurento Tutorial started");
  console.log(
    `Open app http://localhost:${config.APP_PORT} with a WebRTC capable browser`
  );
});

//init websocket
new WebSocket(config.KMS_URI, server);
