import { CachedData } from "@/helper/CachedData";
import { UserRegistry } from "@/model/UserRegistry";
import kurento from "kurento-client";
import { Room } from "@/model/Room";
import { RoomManager } from "@/model/RoomManager";
import * as console from "console";
export class UserSession {
  private _id: string;
  private _name: string;
  private _ws: any;
  private _sdpOffer: any;
  private _webRtcEndpoint: any;
  private _pipeline: any;
  private _roomId: string;
  private _participantEndpoints: {};
  private candidateQueue: {};

  constructor(id: string, name: string, ws: any, sdpOffer: any = null) {
    this._id = id;
    this._name = name;
    this._ws = ws;
    this._sdpOffer = sdpOffer;
    this._participantEndpoints = {};
    this.candidateQueue = {};
  }


  get participantEndpoints(): {} {
    return this._participantEndpoints;
  }

  set participantEndpoints(value: {}) {
    this._participantEndpoints = value;
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

  get pipeline(): any {
    return this._pipeline;
  }

  set pipeline(value: any) {
    this._pipeline = value;
  }

  public async buildWebRtcEndpoint(pipeline: any, callback: any) {
    let self = this;
    return new Promise((resolve: any, reject: any) => {
      pipeline.create("WebRtcEndpoint", (error: any, webRtcEndpoint: any) => {
        try{
          if (error) {
            return callback(error);
          }

          if (CachedData.candidatesQueue[self._id]) {
            while (CachedData.candidatesQueue[self._id].length) {
              const candidate = CachedData.candidatesQueue[self._id].shift();
              webRtcEndpoint.addIceCandidate(candidate);
            }
          }

          webRtcEndpoint.on("IceCandidateFound", function (event) {
            const candidate = kurento.getComplexType("IceCandidate")(
                event.candidate
            );
            UserRegistry.getById(self._id).ws.send(
                JSON.stringify({
                  id: "iceCandidate",
                  candidate: candidate,
                  userName: self.name,
                })
            );
          });

          self._webRtcEndpoint = webRtcEndpoint;
          resolve();
        } catch(err){
          console.error(`There is an issue when try to create endpointL ${err.message}`)
        }
      });
    });
  }

  public async acceptTheCall(roomId: string, callback: any) {
    const self = this;
    const room: Room = RoomManager.getRoomById(roomId);
    this._participantEndpoints = []

    const accept = {
      id: "callResponse",
      response: "accept",
      roomId,
      userName: this.name,
    };
    RoomManager.getRoomById(roomId).announceToAllRoommate(accept);
    await room.joinRoom(self);
  }

  public generateSdpAnswer(
    externalEndpoint: any = null,
    externalSdpOffer: any = null,
    callback: any
  ) {
    const sdpOffer = externalSdpOffer ? externalSdpOffer : this.sdpOffer;
    const endpoint = externalEndpoint ? externalEndpoint : this.webRtcEndpoint;
    endpoint.processOffer(sdpOffer, callback);
    endpoint.gatherCandidates(function (error) {
      if (error) {
        return callback(error);
      }
    });
  }

  public closeTheCall(callback: any) {
    try {
      const room: Room = RoomManager.getRoomById(this.roomId);
      delete room.roommates[this.id];

      this._webRtcEndpoint.release();
      delete this._webRtcEndpoint;
      this._webRtcEndpoint = null;
      delete CachedData.candidatesQueue[this.id]
      this._participantEndpoints = []

      const message = {
        id: "stopCommunication",
        message: "You have already leaved the chat!",
      };
      this.sendMessage(message);
    } catch (err) {
      callback(this, err);
    }
  }

  public sendMessage(message: any) {
    this._ws.send(JSON.stringify(message));
  }

  public async connectToOther(user: UserSession, sdpOffer: any): Promise<any> {
    const self = this;
    return new Promise((resolve: any, reject: any) => {
      const pipeline: any = RoomManager.getRoomById(self.roomId).pipeline;
      pipeline.create("WebRtcEndpoint", (error: any, webRtcEndpoint: any) => {
        if (error) {
          return reject(error);
        }

        if (self.candidateQueue[user.name]) {
          while (self.candidateQueue[user.name].length) {
            const candidate = self.candidateQueue[user.name].shift();
            webRtcEndpoint.addIceCandidate(candidate);
          }
        }

        webRtcEndpoint.on("IceCandidateFound", function (event) {
          const candidate = kurento.getComplexType("IceCandidate")(
              event.candidate
          );
          self.ws.send(
              JSON.stringify({
                id: "iceCandidate",
                candidate: candidate,
                userName: user.name,
              })
          );
        });
        self._participantEndpoints[user.name] = webRtcEndpoint;
        user.webRtcEndpoint.connect(webRtcEndpoint, (error: any) => {
          if (error) {
            return reject(error);
          }
          user.generateSdpAnswer(
              webRtcEndpoint,
              sdpOffer,
              (error: any, sdpAnswer: any) => {
                if (error) {
                  return reject(error);
                }
                return resolve(sdpAnswer);
              }
          );
        });
      });
    });
  }

  public addIceCandidate(candidate: any, name: string) {
    if (this.name === name) {
      this.webRtcEndpoint.addIceCandidate(candidate);
    } else {
      if (this._participantEndpoints[name]) {
        this._participantEndpoints[name].addIceCandidate(candidate);
      } else {
        if (!this.candidateQueue[name]) {
          this.candidateQueue[name] = [];
        }
        this.candidateQueue[name].push(candidate);
      }
    }
  }
}
