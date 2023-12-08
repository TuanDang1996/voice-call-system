import {UserRegistry} from "../../model/UserRegistry";
import {CachedData} from "../../helper/CachedData";
import * as Kurento from 'kurento-client';
import {UserSession} from "../../model/UserSession";

export function onIceCandidate(sessionId: string, _candidate: any) {
    const candidate = Kurento.getComplexType('IceCandidate')(_candidate);
    const user:UserSession = UserRegistry.getById(sessionId);

    if (user && user.webRtcEndpoint) {
        user.webRtcEndpoint.addIceCandidate(candidate);
    }
    else {
        if (!CachedData.candidatesQueue[user.id]) {
            CachedData.candidatesQueue[user.id] = [];
        }
        CachedData.candidatesQueue[sessionId].push(candidate);
    }
}