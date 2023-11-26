import {CachedData} from "../../helper/CachedData";
import {UserRegistry} from "../../model/UserRegistry";

export function call(callerId: any, to: string, from: any, sdpOffer: any) {
    CachedData.clearCandidatesQueue(callerId);

    const caller = UserRegistry.getById(callerId);
    let rejectCause = 'User ' + to + ' is not registered';
    if (UserRegistry.getByName(to)) {
        const callee = UserRegistry.getByName(to);
        caller.sdpOffer = sdpOffer
        callee.peer = from;
        caller.peer = to;
        const message = {
            id: 'incomingCall',
            from: from
        };
        try{
            return callee.sendMessage(message);
        } catch(exception) {
            rejectCause = "Error " + exception;
        }
    }
    const message  = {
        id: 'callResponse',
        response: 'rejected: ',
        message: rejectCause
    };
    caller.sendMessage(message);
}