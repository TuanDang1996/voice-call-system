import { KurentoClient } from "../../helper/KurentoClient";
import { register } from "./RegisterCall";
import { UserRegistry } from "../../model/UserRegistry";
import * as config from "../../config";
import * as _ from "lodash";
import { CachedData } from "../../helper/CachedData";
import kurento from "kurento-client";
import { UserSession } from "../../model/UserSession";
import { WebSocket } from "ws";
import services from "src/api/services";

export function stopRecording(sessionId: string) {
  const user = UserRegistry.getById(sessionId);
  if (user && user.pipeline) {
    console.info("Releasing pipeline");
    user.pipeline.release();
    user.pipeline = null;
  }
}

async function buildWebRTCEndpoint(
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

export async function startRecording(
  sdpOffer: any,
  sessionId: string,
  ws: WebSocket
) {
  let userSession = UserRegistry.getById(sessionId);
  if (!userSession && config.IS_DEBUG) {
    register(sessionId, "testUser", ws);
    userSession = UserRegistry.getById(sessionId);
  }
  if (!userSession) {
    return;
  }
  const kurentoClient = await KurentoClient.getKurentoClient(config.KMS_URI);
  const mediaPipeline = await kurentoClient.create("MediaPipeline");
  userSession.pipeline = mediaPipeline;
  const recorderUri = services.recording.generateRecorderURI(userSession);
  const recorderEndpoint = await mediaPipeline.create("RecorderEndpoint", {
    uri: recorderUri,
    stopOnEndOfStream: true,
  });
  console.log("Start recording on uri: ", recorderUri);
  const webRtcEndpoint = await buildWebRTCEndpoint(mediaPipeline, userSession);
  await webRtcEndpoint.connect(recorderEndpoint);
  await webRtcEndpoint.connect(webRtcEndpoint);
  const sdpAnswer = await webRtcEndpoint.processOffer(sdpOffer);
  await webRtcEndpoint.gatherCandidates();
  await recorderEndpoint.record();
  ws.send(JSON.stringify({ id: "startResponse", sdpAnswer }));
}