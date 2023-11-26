import {CachedData} from "../../helper/CachedData";
import {UserRegistry} from "../../model/UserRegistry";

export function stop(sessionId: string) {
    if (!CachedData.pipelines[sessionId]) {
        return;
    }

    const pipeline = CachedData.pipelines[sessionId];
    delete CachedData.pipelines[sessionId];
    pipeline.release();
    const stopperUser = UserRegistry.getById(sessionId);
    const stoppedUser = UserRegistry.getByName(stopperUser.peer);
    stopperUser.peer = null;

    if (stoppedUser) {
        stoppedUser.peer = null;
        delete CachedData.pipelines[stoppedUser.id];
        const message = {
            id: 'stopCommunication',
            message: 'remote user hanged out'
        }
        stoppedUser.sendMessage(message)
    }

    CachedData.clearCandidatesQueue(sessionId);
}