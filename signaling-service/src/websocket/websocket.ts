import * as WSS from 'ws';
import { CachedData } from "../helper/CachedData";
import { authenticateSocketWithKeycloak, authenticateWithJWTKeycloak } from '../middeware/authen';
import { UserRegistry } from "../model/UserRegistry";
import { call } from './actions/Call';
import { joinRoom } from "./actions/JoinRoom";
import { onIceCandidate } from './actions/OnIcandidate';
import { receiveMediaFrom } from "./actions/ReceiveMedia";
import { register } from './actions/RegisterCall';
import { incomingCallResponse } from './actions/ResponseCall';
import { stop } from './actions/StopCall';


export class WebSocket {
   
    constructor(uri:string, server: any) {
        const wss = new WSS.Server({
            server: server,
            path : '/signaling',
            // verifyClient: (info, done)=> {
            //     console.log(info.req ,  done )
            // }
           
        });


        
        wss.on('connection',  function(ws , req ) {
            console.log("key")
            console.log(process.env.PUBLIC_KEY_H) 
            authenticateWithJWTKeycloak(req, ws);

            authenticateSocketWithKeycloak(ws , req , () => {
                // Your WebSocket connection logic here
                // Access the authenticated user using ws.user
              });
            const sessionId = CachedData.nextUniqueId();
            console.log('Connection received with sessionId ' + sessionId);
          
            ws.on('error', function(error) {
                console.log('Connection ' + sessionId + ' error');
                const user = UserRegistry.getById(sessionId);
                if(user && user.roomId){
                    stop(sessionId);
                }
            });

            ws.on('close', function(data) {
                console.log('Connection ' + sessionId + ' closed');
                const user = UserRegistry.getById(sessionId);
                stop(sessionId);
                UserRegistry.unregister(sessionId);
            });

            ws.on('message', async function(_message) {
                try {
                    // @ts-ignore
                    const message = JSON.parse(_message);
                    console.log('Connection ' + sessionId + ' received message ', message);

                    switch (message.id) {
                        case 'register':
                            register(sessionId, message.name, ws);
                            break;

                        case 'call':
                            await call(uri, sessionId, message.to, message.from, message.sdpOffer);
                            break;

                        case 'incomingCallResponse':
                            await incomingCallResponse(sessionId, message.roomId, message.callResponse, message.sdpOffer);
                            break;

                        case 'stop':
                            stop(sessionId);
                            break;

                        case 'receiveMediaFrom':
                            await receiveMediaFrom(sessionId, message.remoteId, message.roomId, message.sdpOffer);
                            break;

                        case 'joinRoom':
                            await joinRoom(sessionId, message.roomId, message.sdpOffer);
                            break;

                        case 'onIceCandidate':
                            onIceCandidate(sessionId, message.candidate, message.name);
                            break;

                        default:
                            ws.send(JSON.stringify({
                                id: 'error',
                                message: 'Invalid message ' + JSON.stringify(message)
                            }));
                            break;
                    }
                } catch (e){
                    ws.send(JSON.stringify({
                        id: 'error',
                        message: 'Invalid message ' + e.message
                    }));
                }
            });
        });
    }
}