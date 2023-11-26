import * as express from 'express';
import * as minimist from 'minimist';
import * as url from 'url';
import * as fs from 'fs';
import * as https from 'https';
import {WebSocket} from './websocket/websocket';

const argv = minimist(process.argv.slice(2), {
    default: {
        as_uri: "https://localhost:8444/",
        ws_uri: "ws://localhost:8888/kurento"
    }
});

const options =
    {
        key:  fs.readFileSync('./keys/server.key'),
        cert: fs.readFileSync('./keys/server.crt')
    };

const app:express.Express = express();
const asUrl = url.parse(argv.as_uri);
const port = asUrl.port;
const server = https.createServer(options, app).listen(port, function() {
    console.log('Kurento Tutorial started');
    console.log('Open ' + url.format(asUrl) + ' with a WebRTC capable browser');
});

//init websocket
new WebSocket(argv.ws_uri, server)
