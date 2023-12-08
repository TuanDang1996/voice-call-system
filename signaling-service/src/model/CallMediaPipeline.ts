// import {UserRegistry} from "./UserRegistry";
// import * as Kurento from 'kurento-client';
// import {KurentoClient} from "../helper/KurentoClient";
// import {CachedData} from "../helper/CachedData";
// export class CallMediaPipeline{
//     private pipeline:any;
//     private webRtcEndpoint:any;
//
//     constructor() {
//         this.pipeline = null;
//         this.webRtcEndpoint = {};
//     }
//
//    public createPipeline(uri: string, callerId:string, calleeId:string, ws:any, callback:any) {
//         const self = this;
//        KurentoClient.getKurentoClient(uri,function(error, kurentoClient) {
//             if (error) {
//                 return callback(error);
//             }
//
//             kurentoClient.create('MediaPipeline', function(error, pipeline) {
//                 if (error) {
//                     return callback(error);
//                 }
//
//                 pipeline.create('WebRtcEndpoint', function(error, callerWebRtcEndpoint) {
//                     if (error) {
//                         pipeline.release();
//                         return callback(error);
//                     }
//
//                     if (CachedData.candidatesQueue[callerId]) {
//                         while(CachedData.candidatesQueue[callerId].length) {
//                             const candidate = CachedData.candidatesQueue[callerId].shift();
//                             callerWebRtcEndpoint.addIceCandidate(candidate);
//                         }
//                     }
//
//                     callerWebRtcEndpoint.on('IceCandidateFound', function(event) {
//                         const candidate = Kurento.getComplexType('IceCandidate')(event.candidate);
//                         UserRegistry.getById(callerId).ws.send(JSON.stringify({
//                             id : 'iceCandidate',
//                             candidate : candidate
//                         }));
//                     });
//
//                     pipeline.create('WebRtcEndpoint', function(error, calleeWebRtcEndpoint) {
//                         if (error) {
//                             pipeline.release();
//                             return callback(error);
//                         }
//
//                         if (CachedData.candidatesQueue[calleeId]) {
//                             while(CachedData.candidatesQueue[calleeId].length) {
//                                 const candidate = CachedData.candidatesQueue[calleeId].shift();
//                                 calleeWebRtcEndpoint.addIceCandidate(candidate);
//                             }
//                         }
//
//                         calleeWebRtcEndpoint.on('IceCandidateFound', function(event) {
//                             const candidate = Kurento.getComplexType('IceCandidate')(event.candidate);
//                             UserRegistry.getById(calleeId).ws.send(JSON.stringify({
//                                 id : 'iceCandidate',
//                                 candidate : candidate
//                             }));
//                         });
//
//                         callerWebRtcEndpoint.connect(calleeWebRtcEndpoint, function(error) {
//                             if (error) {
//                                 pipeline.release();
//                                 return callback(error);
//                             }
//
//                             calleeWebRtcEndpoint.connect(callerWebRtcEndpoint, function(error) {
//                                 if (error) {
//                                     pipeline.release();
//                                     return callback(error);
//                                 }
//                             });
//
//                             self.pipeline = pipeline;
//                             self.webRtcEndpoint[callerId] = callerWebRtcEndpoint;
//                             self.webRtcEndpoint[calleeId] = calleeWebRtcEndpoint;
//                             callback(null);
//                         });
//                     });
//                 });
//             });
//         })
//     }
//
//     public generateSdpAnswer(id: string, sdpOffer: any, callback: any) {
//         this.webRtcEndpoint[id].processOffer(sdpOffer, callback);
//         this.webRtcEndpoint[id].gatherCandidates(function(error) {
//             if (error) {
//                 return callback(error);
//             }
//         });
//     }
//
//     public release() {
//         if (this.pipeline) this.pipeline.release();
//         this.pipeline = null;
//     }
// }