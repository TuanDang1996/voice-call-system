import { KurentoClient } from "@/helper/KurentoClient";
import { UserSession } from "@/model/UserSession";

export class Room {
  private _pipeline: any;
  private _roommates: object;
  private _id: string;

  constructor(id: string, uri: string) {
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

  public async initPipeline(uri: string): Promise<void> {
    const self = this;
    return new Promise(async (resolve: any, reject: any) => {
      await KurentoClient.getKurentoClient(uri)
        .then((kurentoClient) => {
          // @ts-ignore
          kurentoClient.create("MediaPipeline", (error, pipeline) => {
            if (error) {
              return self.onError(error);
            }
            self._pipeline = pipeline;
            resolve();
          });
        })
        .catch((error: any) => {
          self.onError(error);
        });
    });
  }

  public async joinRoom(user: UserSession) {
    await user.buildWebRtcEndpoint(this._pipeline, this.onError);
    this._roommates[user.id] = user;
    user.roomId = this._id;
  }

  public announceToAllRoommate(message: any): void {
    Object.values(this._roommates).forEach((roommate: UserSession) => {
      roommate.sendMessage(message);
    });
  }

  public removeUser(userId: string): void {
    delete this.roommates[userId];
  }

  private onError(message: any): void {
    console.error(`There is an issue: ${message}`)
  }

  public getAllParticipantInRoom(): any {
    return Object.values(this.roommates).map((participant: UserSession) => {
      return {
        id: participant.id,
        name: participant.name,
      };
    });
  }
}
