import {WebSocket} from "ws";
import {UserRegistry} from "@/model/UserRegistry";
import * as config from "@/config";
import {KurentoClient} from "@/helper/KurentoClient";
import {UserSession} from "@/model/UserSession";
import * as serviceHierarchy from "@/helper/ServiceHierarchy";
import {CachedData} from "@/helper/CachedData";

export const makeQueueCall = async (sdpOffer: any,
                                    sessionId: string,
                                    preAction: any,
                                    chosenAction: any) => {
    // const opt = {uri : 'https://github.com/TuanDang1996/voice-call/blob/main/root.mp3?raw=true'}
    let userSession = UserRegistry.getById(sessionId)
    let opt= {};
    let isStartingCall = false
    if (!userSession) {
        return;
    }
    const kurentoClient = await KurentoClient.getKurentoClient(config.KMS_URI)
    const mediaPipeline = await kurentoClient.create("MediaPipeline")
    if(userSession.pipeline){
        userSession.player.stop();
        userSession.pipeline.release();
        userSession.webRtcEndpoint.release();
        delete userSession.player;
        delete userSession.pipeline;
        delete userSession.webRtcEndpoint;
    }
    userSession.pipeline = mediaPipeline;
    await userSession.buildWebRtcEndpoint(mediaPipeline, onError)

    const chosenAct:any = preAction !== null && preAction !== undefined ? serviceHierarchy.findNextAction(preAction, chosenAction) : serviceHierarchy.findRootAction();
    const childAct:any = serviceHierarchy.findChildActions(chosenAct['id']);

    if(childAct.length !== 0 || preAction === null || preAction === undefined){
        opt = {uri : chosenAct.audio_url}
    } else {
        const processAct:any = serviceHierarchy.findProcessActions();
        opt = {uri : processAct.audio_url}
        isStartingCall = true
    }

    await userSession.buildPlayerEndpoint(mediaPipeline, opt, onError)

    userSession.generateSdpAnswer(null, sdpOffer, (error: any, sdpAnswer: any) => {
        const message = {
            id: "startResponse",
            sdpAnswer: sdpAnswer,
            chosenActId: chosenAct.id,
            isStartingCall
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

