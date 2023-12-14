import {CachedData} from "../../helper/CachedData";
import {UserRegistry} from "../../model/UserRegistry";
import {RoomManager} from "../../model/RoomManager";
import {UserSession} from "../../model/UserSession";

export async function receiveMediaFrom( localId: string, remoteId: string, roomId: string, sdpOffer: any) {
    const local:UserSession = UserRegistry.getById(localId);
    if (!roomId || !RoomManager.isExist(roomId)) {
        return onError(local, 'Error: unknown roomId = ' + roomId);
    }

    const remote:UserSession = UserRegistry.getByName(remoteId);
    const sdpAnswer = await local.connectToOther(remote, sdpOffer);
    const message = {
        id: 'startCommunication',
        sdpAnswer: sdpAnswer,
        userName: remoteId
    };
    local.sendMessage(message);
}

const onError = (user:UserSession, error:any) => {
    const message = {
        id: 'cannotJoinCall',
        response: 'error',
        message: error,
        userName: user.name
    };
    user.sendMessage(message);
}
