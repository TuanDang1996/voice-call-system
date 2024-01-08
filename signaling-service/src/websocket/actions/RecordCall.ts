import { register } from "./RegisterCall";
import * as config from "../../config";
import * as _ from "lodash";
import { WebSocket } from "ws";
import { RecordingService } from "src/services/Recording";

import { UserRegistry } from "src/model/UserRegistry";
import { KurentoClient } from "src/helper/KurentoClient";
import { buildWebRTCEndpoint } from "src/helper/RecordingUtils";

export function stopRecording(sessionId: string) {
  const user = UserRegistry.getById(sessionId);
  if (user && user.pipeline) {
    console.info("Releasing pipeline");
    user.pipeline.release();
    user.pipeline = null;
  }
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
  const recorderUri = RecordingService.generateRecorderURI(userSession);
  const recorderEndpoint = await mediaPipeline.create("RecorderEndpoint", {
    uri: recorderUri,
    stopOnEndOfStream: true,
    mediaProfile: "WEBM",
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
