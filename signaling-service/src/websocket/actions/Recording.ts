import { KurentoClient } from "../../helper/KurentoClient";
import { register } from "./RegisterCall";
import { UserRegistry } from "../../model/UserRegistry";

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
  KmsWsUri: string,
  sessionId: string,
  pipeline: any,
  ws: any,
  onError: any
) {
  let user = UserRegistry.getById(sessionId);
  if (!user) {
    register(sessionId, "testUser", ws);
    user = UserRegistry.getById(sessionId);
  }

  if (!pipeline) {
    const kurentoClient = await KurentoClient.getKurentoClient(KmsWsUri);
    pipeline = await kurentoClient.create("MediaPipeline");
  }
  user.pipeline = pipeline;
  await user.buildRecorderEndpoint(pipeline, onError);
  await user.buildWebRtcEndpoint(pipeline, onError);
  await user.connectMediaElements(onError);

  const sdpAnswer = await user.webRtcEndpoint.processOffer(sdpOffer);
  await user.webRtcEndpoint.gatherCandidates();
  await user.recorderEndpoint.record();
  ws.send(JSON.stringify({ id: "startResponse", sdpAnswer }));
}
