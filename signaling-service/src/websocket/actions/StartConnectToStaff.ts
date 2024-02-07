import {UserSession} from "@/model/UserSession";
import {UserRegistry} from "@/model/UserRegistry";
import {Room} from "@/model/Room";
import {RoomManager} from "@/model/RoomManager";

export const startConnectToStaff = async (sessionId: string, serviceId: string, sdpOffer: any, uri: string) => {
    const caller: UserSession = UserRegistry.getById(sessionId);
    const room: Room = RoomManager.makeNewRoom(uri);
    await room.initPipeline(uri);
}