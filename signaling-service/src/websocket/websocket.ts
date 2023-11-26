import * as WSS from 'ws'
import {CachedData} from "../helper/CachedData";
import {UserRegistry} from "../model/UserRegistry";
import {call} from './actions/Call';
import {stop} from './actions/StopCall';
import {register} from './actions/RegisterCall';
import {incomingCallResponse} from './actions/ResponseCall';
import {onIceCandidate} from './actions/OnIcandidate';

export class WebSocket {
    constructor(uri:string, server: any) {
        const wss = new WSS.Server({
            server: server,
            path : '/signaling'
        });

        wss.on('connection', function(ws) {
            const sessionId = CachedData.nextUniqueId();
            console.log('Connection received with sessionId ' + sessionId);

            ws.on('error', function(error) {
                console.log('Connection ' + sessionId + ' error');
                stop(sessionId);
            });

            ws.on('close', function() {
                console.log('Connection ' + sessionId + ' closed');
                stop(sessionId);
                UserRegistry.unregister(sessionId);
            });

            ws.on('message', function(_message) {
                // @ts-ignore
                const message = JSON.parse(_message);
                console.log('Connection ' + sessionId + ' received message ', message);

                switch (message.id) {
                    case 'register':
                        register(sessionId, message.name, ws);
                        break;

                    case 'call':
                        call(sessionId, message.to, message.from, message.sdpOffer);
                        break;

                    case 'incomingCallResponse':
                        incomingCallResponse(uri, sessionId, message.from, message.callResponse, message.sdpOffer, ws);
                        break;

                    case 'stop':
                        stop(sessionId);
                        break;

                    case 'onIceCandidate':
                        onIceCandidate(sessionId, message.candidate);
                        break;

                    default:
                        ws.send(JSON.stringify({
                            id : 'error',
                            message : 'Invalid message ' + message
                        }));
                        break;
                }
            });
        });
    }
}