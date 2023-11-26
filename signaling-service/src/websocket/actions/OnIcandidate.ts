import {UserRegistry} from "../../model/UserRegistry";
import {CachedData} from "../../helper/CachedData";
import * as Kurento from 'kurento-client';

export function onIceCandidate(sessionId: string, _candidate: any) {
    const candidate = Kurento.getComplexType('IceCandidate')(_candidate);
    const user = UserRegistry.getById(sessionId);

    if (CachedData.pipelines[user.id] && CachedData.pipelines[user.id].webRtcEndpoint && CachedData.pipelines[user.id].webRtcEndpoint[user.id]) {
        const webRtcEndpoint = CachedData.pipelines[user.id].webRtcEndpoint[user.id];
        webRtcEndpoint.addIceCandidate(candidate);
    }
    else {
        if (!CachedData.candidatesQueue[user.id]) {
            CachedData.candidatesQueue[user.id] = [];
        }
        CachedData.candidatesQueue[sessionId].push(candidate);
    }
}