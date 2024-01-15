import { CachedData } from "@/helper/CachedData";
import { UserRegistry } from "@/model/UserRegistry";
import { Room } from "@/model/Room";
import { RoomManager } from "@/model/RoomManager";
import { UserSession } from "@/model/UserSession";

export async function call(
  uri: string,
  callerId: any,
  to: string[],
  from: any,
  sdpOffer: any
) {
  CachedData.clearCandidatesQueue(callerId);

  const caller: UserSession = UserRegistry.getById(callerId);
  const room: Room = RoomManager.makeNewRoom(uri);
  await room.initPipeline(uri);

  caller.sdpOffer = sdpOffer;
  await room.joinRoom(caller);

  to.forEach((name: string) => {
    let rejectCause = "User " + to + " is not registered";
    if (UserRegistry.getByName(name)) {
      const callee = UserRegistry.getByName(name);
      const message = {
        id: "incomingCall",
        from: from,
        roomId: room.id,
      };
      try {
        return callee.sendMessage(message);
      } catch (exception) {
        rejectCause = "Error " + exception;
      }
    }

    const message = {
      id: "callResponse",
      response: "rejected",
      message: rejectCause,
    };
    return caller.sendMessage(message);
  });

  caller.generateSdpAnswer(null, null, (error: any, sdpAnswer: any) => {
    const message = {
      id: "beginSendMedia",
      sdpAnswer: sdpAnswer,
    };
    caller.sendMessage(message);
  });
}
