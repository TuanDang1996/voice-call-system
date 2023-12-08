import {CachedData} from "../../helper/CachedData";
import {UserRegistry} from "../../model/UserRegistry";
import {RoomManager} from "../../model/RoomManager";
import {UserSession} from "../../model/UserSession";

export async function incomingCallResponse( calleeId: string, roomId: string, callResponse: string, sdpOffer: any) {
    CachedData.clearCandidatesQueue(calleeId);

    const callee:UserSession = UserRegistry.getById(calleeId);
    callee.sdpOffer = sdpOffer;
    if (!roomId || !RoomManager.isExist(roomId)) {
        return onError(callee, 'Error: unknown roomId = ' + roomId);
    }

    if (callResponse === 'accept') {
        await callee.acceptTheCall(roomId, onError)
    } else {
        const decline = {
            id: 'callResponse',
            response: 'rejected',
            message: 'user declined'
        };
        RoomManager.getRoomById(roomId).announceToAllRoommate(decline);
    }
}const onError = (user:UserSession, error:any) => {
    const message = {
        id: 'cannotJoinCall',
        response: 'error',
        message: error
    };
    user.sendMessage(message);
}