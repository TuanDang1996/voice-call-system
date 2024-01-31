import * as WSS from "ws";
import { CachedData } from "@/helper/CachedData";
import { UserRegistry } from "@/model/UserRegistry";
import { call } from "@/websocket/actions/Call";
import { stop } from "@/websocket/actions/StopCall";
import { register } from "@/websocket/actions/RegisterCall";
import { incomingCallResponse } from "@/websocket/actions/ResponseCall";
import { onIceCandidate } from "@/websocket/actions/OnIcandidate";
import { receiveMediaFrom } from "@/websocket/actions/ReceiveMedia";
import { joinRoom } from "@/websocket/actions/JoinRoom";
import { startRecording, stopRecording } from "@/websocket/actions/RecordCall";
import {
  startRecordVoiceMail,
  stopRecordVoiceMail,
} from "@/websocket/actions/CreateVoiceMail";
import url from 'url';
import {makeQueueCall} from "./actions/MakeQueueCall"
export class WebSocket {
  constructor(uri: string, server: any) {
    const wss = new WSS.Server({
      server: server,
      path: "/signaling",
    });

    wss.on("connection", function (ws, req) {
      const sessionId = CachedData.nextUniqueId();
      const params:any = url.parse(req.url, true).query;

      console.log("Connection received with sessionId " + sessionId + ", params: " + JSON.stringify(params));

      if(params['name']){
        const name:string = params['name']
        register(sessionId, name, ws);
      }

      // ws.on("error", function (error) {
      //   console.log("Connection " + sessionId + " error");
      //   const user = UserRegistry.getById(sessionId);
      //   if (user && user.roomId) {
      //     stop(sessionId);
      //   }
      // });

      ws.on("close", function (data) {
        // console.log("Connection " + sessionId + " closed");
        // const user = UserRegistry.getById(sessionId);
        // stop(sessionId);
        // UserRegistry.unregister(sessionId);
      });

      ws.on("message", async function (_message) {
        try {
          // @ts-ignore
          const message = JSON.parse(_message);
          // console.log(
          //   "Connection " + sessionId + " received message ",
          //   message
          // );

          switch (message.id) {
            case "register":
              register(sessionId, message.name, ws);
              break;
            case "unregister":
              UserRegistry.unregister(sessionId);
              break;

            case "call":
              await call(
                uri,
                sessionId,
                message.to,
                message.from,
                message.sdpOffer
              );
              break;

            case "incomingCallResponse":
              await incomingCallResponse(
                sessionId,
                message.roomId,
                message.callResponse,
                message.sdpOffer
              );
              break;

            case "stop":
              stop(sessionId);
              break;

            case "receiveMediaFrom":
              await receiveMediaFrom(
                sessionId,
                message.remoteId,
                message.roomId,
                message.sdpOffer
              );
              break;

            case "joinRoom":
              await joinRoom(sessionId, message.roomId, message.sdpOffer);
              break;

            case "onIceCandidate":
              onIceCandidate(sessionId, message.candidate, message.name);
              break;

            case "startRecording":
              startRecording(message.sdpOffer, sessionId, ws);

              break;

            case "stopRecording":
              stopRecording(sessionId);

              break;

            case "startRecordVoiceMail":
              startRecordVoiceMail(
                message.sdpOffer, sessionId,
                ws,
                message.recipient
              );
              break;
            case "stopRecordVoiceMail":
              stopRecordVoiceMail(sessionId);
              break;
            case "makeCallQueue":
              await makeQueueCall(message.sdpOffer, sessionId);
              break;
            default:
              console.error(message);
              ws.send(
                JSON.stringify({
                  id: "error",
                  message: "Invalid message " + JSON.stringify(message),
                })
              );
              break;
          }
        } catch (e) {
          console.error(e);
          ws.send(
            JSON.stringify({
              id: "error",
              message: "Invalid message " + e.message,
            })
          );
        }
      });
    });
  }
}
