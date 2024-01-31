import {WebSocket} from "ws";
import {UserRegistry} from "@/model/UserRegistry";
import * as config from "@/config";
import {KurentoClient} from "@/helper/KurentoClient";
import {UserSession} from "@/model/UserSession";

export const makeQueueCall = async (sdpOffer: any,
                                    sessionId: string) => {
    let userSession = UserRegistry.getById(sessionId)
    if (!userSession) {
        return;
    }
    const kurentoClient = await KurentoClient.getKurentoClient(config.KMS_URI)
    const mediaPipeline = await kurentoClient.create("MediaPipeline")
    userSession.pipeline = mediaPipeline;

    const opt = {uri : 'https://github.com/TuanDang1996/voice-call/blob/main/root.mp3?raw=true'}
    await userSession.buildWebRtcEndpoint(mediaPipeline, onError)
    await userSession.buildPlayerEndpoint(mediaPipeline, opt, onError)

    userSession.generateSdpAnswer(null, sdpOffer, (error: any, sdpAnswer: any) => {
        const message = {
            id: "startResponse",
            sdpAnswer: sdpAnswer,
        };
        userSession.sendMessage(message);
    });

    userSession.webRtcEndpoint.on('MediaStateChanged', function(event) {
        if (event.newState == "CONNECTED") {
            console.log("MediaState is CONNECTED ... printing stats...")
        }
    });
}

const onError = (user: UserSession, error: any) => {
    const message = {
        id: "cannotJoinCall",
        response: "error",
        message: error,
        userName: user.name,
    };
    user.sendMessage(message);
};

