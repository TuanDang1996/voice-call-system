import {KurentoClient} from "../helper/KurentoClient";
import {UserSession} from "./UserSession";
import {pipeline} from "node:stream";
import {response} from "express";

export class Room{
    private _pipeline:any;
    private _roommates:object;
    private _id:string;

    constructor(id:string, uri:string) {
        this._id = id;
        this._roommates = {};
    }


    get pipeline(): any {
        return this._pipeline;
    }

    set pipeline(value: any) {
        this._pipeline = value;
    }

    get roommates(): object {
        return this._roommates;
    }

    set roommates(value: object) {
        this._roommates = value;
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    public async initPipeline(uri: string):Promise<void>{
        const self = this;
        return new Promise(async (resolve:any, reject:any) => {
            await KurentoClient.getKurentoClient(uri).then((kurentoClient) => {
                kurentoClient.create('MediaPipeline', (error, pipeline) => {
                    if (error) {
                        return self.onError(error);
                    }
                    self._pipeline = pipeline;
                    resolve();
                });
            }).catch((error:any) => {
                self.onError(error);
            })
        })
    }

    public async joinRoom(user:UserSession){
        await user.buildWebRtcEndpoint(this._pipeline, this.onError);
        this._roommates[user.id] = user;
        user.roomId = this._id;
    }

    public announceToAllRoommate(message:any):void{
        Object.values(this._roommates).forEach((roommate:UserSession) => {
            roommate.sendMessage(message)
        })
    }

    public removeUser(userId:string):void {
        delete this.roommates[userId];
    }

    private onError(message:string):void {
        if (this._pipeline) this._pipeline.release();
        Object.values(this._roommates).forEach((user:UserSession) => {
            const response = {
                id: 'callResponse',
                response: 'rejected',
                message: message
            }
            user.sendMessage(response);
        })
    }

    public getAllParticipantInRoom():any{
        return Object.values(this.roommates).map((participant:UserSession) => {
            return {
                id: participant.id,
                name: participant.name
            }
        })
    }
}