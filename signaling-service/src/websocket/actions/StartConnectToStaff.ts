import {UserSession} from "@/model/UserSession";
import {UserRegistry} from "@/model/UserRegistry";
import {Room} from "@/model/Room";
import {RoomManager} from "@/model/RoomManager";
import * as serviceStaff from "@/helper/ServiceStaff";
import {WaitingQueueCall} from "@/helper/WaitingQueueCall";
import {SessionStatus} from "@/helper/SessionStatus";
import {call} from "@/websocket/actions/Call";

export const startConnectToStaff = async (sessionId: string, serviceId: string, uri: string, localSdpOffer: any) => {
    const caller: UserSession = UserRegistry.getById(sessionId);

    const chosenStaff:any = await serviceStaff.findStaffByServiceId(serviceId.toString())
    if(!chosenStaff || chosenStaff.length === 0){
        WaitingQueueCall.pushToQueue(caller.name)
        const message = {
            id: "waitingForStaff"
        };
        caller.sendMessage(message)
        return;
    }
    caller.clear()
    await call(uri, sessionId, [chosenStaff[0].user_name], caller.name, localSdpOffer, null)
}