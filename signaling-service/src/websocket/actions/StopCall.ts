import {CachedData} from "../../helper/CachedData";
import {UserRegistry} from "../../model/UserRegistry";
import {Room} from "../../model/Room";
import {RoomManager} from "../../model/RoomManager";
import {UserSession} from "../../model/UserSession";

export function stop(sessionId: string) {
    const stopperUser:UserSession = UserRegistry.getById(sessionId);
    if(!stopperUser || !stopperUser.roomId)
        return;

    const room:Room = RoomManager.getRoomById(stopperUser.roomId);

    stopperUser.closeTheCall(onError);
    if(Object.values(room.roommates).length < 2){
        const user:UserSession = Object.values(room.roommates)[0];
        if(user){
            user.closeTheCall(onError)
        }
        stoppedUser.sendMessage(message)
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