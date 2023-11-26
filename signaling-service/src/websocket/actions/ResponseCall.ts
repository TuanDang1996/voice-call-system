import {CachedData} from "../../helper/CachedData";
import {UserRegistry} from "../../model/UserRegistry";
import {CallMediaPipeline} from "../../model/CallMediaPipeline";

export function incomingCallResponse(uri: string, calleeId: string, from: string, callResponse: string, calleeSdp: any, ws: any) {

    CachedData.clearCandidatesQueue(calleeId);

    function onError(pipeline, callerReason, calleeReason) {
        if (pipeline) pipeline.release();
        if (caller) {
            var callerMessage = {
                id: 'callResponse',
                response: 'rejected',
                message: undefined
            }
            if (callerReason) callerMessage.message = callerReason;
            caller.sendMessage(callerMessage);
        }

        var calleeMessage = {
            id: 'stopCommunication',
            message: undefined
        };
        if (calleeReason) calleeMessage.message = calleeReason;
        callee.sendMessage(calleeMessage);
    }

    const callee = UserRegistry.getById(calleeId);
    if (!from || !UserRegistry.getByName(from)) {
        return onError(null, null, 'unknown from = ' + from);
    }
    const caller = UserRegistry.getByName(from);

    if (callResponse === 'accept') {
        const pipeline = new CallMediaPipeline();
        CachedData.pipelines[caller.id] = pipeline;
        CachedData.pipelines[callee.id] = pipeline;

        pipeline.createPipeline(uri, caller.id, callee.id, ws, function(error) {
            if (error) {
                return onError(pipeline, error, error);
            }

            pipeline.generateSdpAnswer(caller.id, caller.sdpOffer, function(error, callerSdpAnswer) {
                if (error) {
                    return onError(pipeline, error, error);
                }

                pipeline.generateSdpAnswer(callee.id, calleeSdp, function(error, calleeSdpAnswer) {
                    if (error) {
                        return onError(pipeline, error, error);
                    }

                    const message1 = {
                        id: 'startCommunication',
                        sdpAnswer: calleeSdpAnswer
                    };
                    callee.sendMessage(message1);

                    const message2 = {
                        id: 'callResponse',
                        response : 'accepted',
                        sdpAnswer: callerSdpAnswer
                    };
                    caller.sendMessage(message2);
                });
            });
        });
    } else {
        const decline = {
            id: 'callResponse',
            response: 'rejected',
            message: 'user declined'
        };
        caller.sendMessage(decline);
    }
}