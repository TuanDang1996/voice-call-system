import { UserRegistry } from "../../model/UserRegistry";
import { CachedData } from "../../helper/CachedData";
import kurento from "kurento-client";
import { UserSession } from "../../model/UserSession";

export function onIceCandidate(sessionId: string, _candidate: any, name: any) {
  const candidate = kurento.getComplexType("IceCandidate")(_candidate);
  const user: UserSession = UserRegistry.getById(sessionId);

  if (user && user.webRtcEndpoint) {
    user.addIceCandidate(candidate, name);
  } else {
    if (!CachedData.candidatesQueue[user.id]) {
      CachedData.candidatesQueue[user.id] = [];
    }
    CachedData.candidatesQueue[sessionId].push(candidate);
  }
}
