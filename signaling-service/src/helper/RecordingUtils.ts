import kurento from "kurento-client";
import { UserSession } from "@/model/UserSession";
import { CachedData } from "@/helper/CachedData";

export async function buildWebRTCEndpoint(
  mediaPipeline: kurento.MediaPipeline,
  session: UserSession
) {
  const webRtcEndpoint = await mediaPipeline.create("WebRtcEndpoint");

  if (CachedData.candidatesQueue[session.id]) {
    while (CachedData.candidatesQueue[session.id].length) {
      const candidate = CachedData.candidatesQueue[session.id].shift();
      await webRtcEndpoint.addIceCandidate(candidate);
    }
  }

  webRtcEndpoint.on("IceCandidateFound", (event) => {
    const candidate = kurento.getComplexType("IceCandidate")(event.candidate);
    session.ws.send(
      JSON.stringify({
        id: "iceCandidate",
        candidate: candidate,
        userName: session.name,
      })
    );
  });

  return webRtcEndpoint;
}
