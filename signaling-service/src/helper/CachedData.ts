export class CachedData{
    static candidatesQueue:any = {};
    static pipelines:any = {};
    static idCounter:number = 0;

    public static clearCandidatesQueue(sessionId: string) {
        if (CachedData.candidatesQueue[sessionId]) {
            delete CachedData.candidatesQueue[sessionId];
        }
    }

    public static nextUniqueId() {
        CachedData.idCounter++;
        return CachedData.idCounter.toString();
    }
}