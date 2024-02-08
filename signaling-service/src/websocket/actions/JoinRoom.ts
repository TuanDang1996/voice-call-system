import { CachedData } from "@/helper/CachedData";
import { UserRegistry } from "@/model/UserRegistry";
import { RoomManager } from "@/model/RoomManager";
import { UserSession } from "@/model/UserSession";

export async function joinRoom(
  calleeId: string,
  roomId: string,
  sdpOffer: any
) {
  CachedData.clearCandidatesQueue(calleeId);

  const callee: UserSession = UserRegistry.getById(calleeId);
  callee.sdpOffer = sdpOffer;
  if (!roomId || !RoomManager.isExist(roomId)) {
    return onError(callee, "Error: unknown roomId = " + roomId);
  }

  await callee.acceptTheCall(roomId, onError);
  callee.generateSdpAnswer(null, null, async (error: any, sdpAnswer: any) => {
    if (error) return onError(callee, error);

    const participants =
      RoomManager.getRoomById(roomId).getAllParticipantInRoom();
    const message = {
      id: "receiveMediasFrom",
      participants,
      roomId,
      sdpAnswer: sdpAnswer,
    };
    callee.sendMessage(message);
  });
}

const onError = (user: UserSession, error: any) => {
  const message = {
    id: "cannotJoinCall",
    response: "error",
    message: error.message,
    userName: user.name,
  };
  user.sendMessage(message);
};
