export class WaitingQueueCall{
    static queue:any = []

    public static pushToQueue(userName:string){
        const waiting = {
            name: userName,
            time: Date.now()
        }
        this.queue.push(waiting)
    }

    public static popFromQueue(){
        return this.queue.shift()
    }
}