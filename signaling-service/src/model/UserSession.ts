export class UserSession{
    private id:string;
    private name:string;
    private ws:any;
    private peer:any;
    private sdpOffer:any;

    constructor(id:string, name:string, ws:any, peer:any = null, sdpOffer:any = null) {
        this.id = id;
        this.name = name;
        this.ws = ws;
        this.peer = peer;
        this.sdpOffer = sdpOffer;
    }

    public sendMessage(message:any) {
        this.ws.send(JSON.stringify(message));
    }
}