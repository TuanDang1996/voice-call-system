import {WebSocket} from "ws";
import {UserRegistry} from "@/model/UserRegistry";
import * as config from "@/config";
import {KurentoClient} from "@/helper/KurentoClient";
import {UserSession} from "@/model/UserSession";
import * as serviceHierarchy from "@/helper/ServiceHierarchy";

export const makeQueueCall = async (sdpOffer: any,
                                    sessionId: string,
                                    preAction: any,
                                    chosenAction: any) => {
    let userSession = UserRegistry.getById(sessionId)
    if (!userSession) {
        return;
    }
    const kurentoClient = await KurentoClient.getKurentoClient(config.KMS_URI)
    const mediaPipeline = await kurentoClient.create("MediaPipeline")
    userSession.pipeline = mediaPipeline;

    // const opt = {uri : 'https://github.com/TuanDang1996/voice-call/blob/main/root.mp3?raw=true'}
    const nextAction = findNextAction(preAction, chosenAction);

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
        console.log(`MediaState is CONNECTED ... printing stats... ${event.newState}`)
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

