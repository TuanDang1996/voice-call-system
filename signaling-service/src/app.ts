import * as express from 'express';
import {WebSocket} from './websocket/websocket';
import * as http from "http";

const mediaHost =  process.env.MEDIA_SERVER_HOST || 'localhost';
const mediaPort =  process.env.MEDIA_SERVER_PORT || '8899';
const mediaUri= "ws://" + mediaHost + ":" + mediaPort + "/kurento"

const appHost =  process.env.APP_SERVER_HOST || 'localhost';
const appPort =  process.env.APP_SERVER_PORT || '8444';
const asUri= "http://" + appHost + ":" + appPort + "/"

const app:express.Express = express();
const server = http.createServer(app).listen(appPort, function() {
    console.log('Kurento Tutorial started');
    console.log(`Open app http://localhost:${appPort} with a WebRTC capable browser`);
});

//init websocket
new WebSocket(mediaUri, server)
