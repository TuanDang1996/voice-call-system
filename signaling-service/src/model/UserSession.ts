import {CachedData} from "../helper/CachedData";
import {UserRegistry} from "./UserRegistry";
import * as Kurento from 'kurento-client';
import {Room} from "./Room";
import {RoomManager} from "./RoomManager";

export class UserSession{
    private _id:string;
    private _name:string;
    private _ws:any;
    private _sdpOffer:any;
    private _webRtcEndpoint:any;
    private _roomId:string;
    private participantEndpoint:{}

    constructor(id:string, name:string, ws:any, sdpOffer:any = null) {
        this._id = id;
        this._name = name;
        this._ws = ws;
        this._sdpOffer = sdpOffer;
        this.participantEndpoint = {};
    }


    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get ws(): any {
        return this._ws;
    }

    set ws(value: any) {
        this._ws = value;
    }

    get sdpOffer(): any {
        return this._sdpOffer;
    }

    set sdpOffer(value: any) {
        this._sdpOffer = value;
    }

    get webRtcEndpoint(): any {
        return this._webRtcEndpoint;
    }

    set webRtcEndpoint(value: any) {
        this._webRtcEndpoint = value;
    }

    get roomId(): string {
        return this._roomId;
    }

    set roomId(value: string) {
        this._roomId = value;
    }

    public async buildWebRtcEndpoint(pipeline:any, callback:any){
        let self = this;
        return new Promise((resolve:any, reject:any) => {
            pipeline.create('WebRtcEndpoint', (error:any, webRtcEndpoint:any) => {
                if (error) {
                    return callback(error);
                }

                if (CachedData.candidatesQueue[self._id]) {
                    while(CachedData.candidatesQueue[self._id].length) {
                        const candidate = CachedData.candidatesQueue[self._id].shift();
                        webRtcEndpoint.addIceCandidate(candidate);
                    }
                }

                webRtcEndpoint.on('IceCandidateFound', function(event) {
                    const candidate = Kurento.getComplexType('IceCandidate')(event.candidate);
                    UserRegistry.getById(self._id)._ws.send(JSON.stringify({
                        id : 'iceCandidate',
                        candidate : candidate
                    }));
                });

                self._webRtcEndpoint = webRtcEndpoint;
                resolve()
            });
        })
    }


    public async acceptTheCall(roomId:string, callback:any){
        const self = this;
        const room:Room = RoomManager.getRoomById(roomId);
        await room.joinRoom(self);

        this.createEndpointAsync(Object.values(room.roommates), room.pipeline).then((selfSdpAnswer) => {
            const message = {
                id: 'startCommunication',
                sdpAnswer: selfSdpAnswer
            };
            self.sendMessage(message);
        }).catch((error) => {
            callback(self, error);
        })


    }

    public generateSdpAnswer(callback: any) {
        this.webRtcEndpoint.processOffer(this.sdpOffer, callback);
        this.webRtcEndpoint.gatherCandidates(function(error) {
            if (error) {
                return callback(error);
            }
        });
    }

    public closeTheCall(roomId:string, callback:any){
        try {
            const room: Room = RoomManager.getRoomById(roomId);
            Object.values(this.participantEndpoint).forEach((ed:any) => {
                ed.release();
            })
            delete this.participantEndpoint;

            this._webRtcEndpoint.release();
            delete this._webRtcEndpoint;

            const message = {
                id: 'stopCommunication',
                message: 'You have already leaved the chat!'
            }
            this.sendMessage(message)
        } catch (err){
            callback(this, err)
        }
    }

    public sendMessage(message:any) {
        this._ws.send(JSON.stringify(message));
    }

    private createEndpointAsync(roommates:any, pipeline:any):Promise<any>{
        const self = this;
        return new Promise((resolve:any, reject:any) => {
            for(const participant of roommates){

                if(participant.id === self.id)
                    continue;

                pipeline.create('WebRtcEndpoint', (error:any, webRtcEndpoint:any) => {
                    if (error) {
                        return reject(error);
                    }

                    if (CachedData.candidatesQueue[participant.id]) {
                        while(CachedData.candidatesQueue[participant.id].length) {
                            const candidate = CachedData.candidatesQueue[participant.id].shift();
                            webRtcEndpoint.addIceCandidate(candidate);
                        }
                    }

                    webRtcEndpoint.on('IceCandidateFound', function(event) {
                        const candidate = Kurento.getComplexType('IceCandidate')(event.candidate);
                        UserRegistry.getById(participant.id).ws.send(JSON.stringify({
                            id : 'iceCandidate',
                            candidate : candidate
                        }));
                    });

                    self.participantEndpoint[participant.id] = webRtcEndpoint;
                    webRtcEndpoint.connect(self.webRtcEndpoint, (error:any) => {
                        if(error){
                            return reject(error);
                        }

                        self.webRtcEndpoint.connect(webRtcEndpoint, (error:any) => {
                            if(error){
                                return reject(error);
                            }
                            participant.generateSdpAnswer((error:any, participantSdpAnswer) => {
                                if(error){
                                    return reject(error);
                                }
                                self.generateSdpAnswer((error:any, selfSdpAnswer) => {
                                    if(error){
                                        return reject(error);
                                    }

                                    const message = {
                                        id: 'callResponse',
                                        response : 'accepted',
                                        sdpAnswer: participantSdpAnswer
                                    };
                                    participant.sendMessage(message);
                                    resolve(selfSdpAnswer);
                                })
                            })
                        })
                    })
                })
            }
        })
    }
}