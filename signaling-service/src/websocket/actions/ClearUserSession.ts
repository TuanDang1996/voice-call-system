import {UserRegistry} from "@/model/UserRegistry";

export function clearUserSession(sessionId){
    const user = UserRegistry.getById(sessionId);
    user.clear()
    const message = {
        id: "readyToConnectToStaff"
    };
    user.sendMessage(message);
}