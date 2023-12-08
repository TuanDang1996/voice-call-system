import * as express from 'express';
import * as url from 'url';
import * as fs from 'fs';
import * as https from 'https';
import {WebSocket} from './websocket/websocket';

const mediaHost =  process.env.MEDIA_SERVER_HOST || 'localhost';
const mediaPort =  process.env.MEDIA_SERVER_PORT || '8899';
const mediaUri= "ws://" + mediaHost + ":" + mediaPort + "/kurento"

const appHost =  process.env.APP_SERVER_HOST || 'localhost';
const appPort =  process.env.APP_SERVER_PORT || '8444';
const asUri= "https://" + appHost + ":" + appPort + "/"

const options =
    {
        key:  fs.readFileSync('./keys/server.key'),
        cert: fs.readFileSync('./keys/server.crt')
    };

const app:express.Express = express();
const asUrl = url.parse(asUri);
const port = asUrl.port;
const server = https.createServer(options, app).listen(port, function() {
    console.log('Kurento Tutorial started');
    console.log('Open ' + url.format(asUrl) + ' with a WebRTC capable browser');
});

//init websocket
new WebSocket(mediaUri, server)
