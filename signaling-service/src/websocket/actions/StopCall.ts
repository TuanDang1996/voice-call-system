import {CachedData} from "../../helper/CachedData";
import {UserRegistry} from "../../model/UserRegistry";
import {Room} from "../../model/Room";
import {RoomManager} from "../../model/RoomManager";
import {UserSession} from "../../model/UserSession";

export function stop(sessionId: string, roomId: string) {
    const room:Room = RoomManager.getRoomById(roomId);
    const stopperUser:UserSession = UserRegistry.getById(sessionId);

    stopperUser.closeTheCall(roomId, onError);
    if(Object(room.roommates).values.length < 2){
        const user:UserSession = Object(room.roommates).values[0];
        if(user){
            user.closeTheCall(roomId, onError)
        }
        room.pipeline.release()
    }

    CachedData.clearCandidatesQueue(sessionId);
}

const onError = (user:UserSession, error:any) => {
    const message = {
        id: 'cannotStopTheCall',
        response: 'error',
        message: error
    };
    user.sendMessage(message);
}