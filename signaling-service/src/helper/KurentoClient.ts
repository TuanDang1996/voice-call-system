import * as Kurento from 'kurento-client';
export class KurentoClient {
    private static client:any;
    static getKurentoClient(ws_uri:string, callback:any) {
        if (KurentoClient.client) {
            return callback(null, KurentoClient.client);
        }

        Kurento(ws_uri, function(error: string, _kurentoClient: any) {
            if (error) {
                const message = 'Coult not find media server at address ' + ws_uri;
                // @ts-ignore
                return callback(message + ". Exiting with error " + error);
            }

            KurentoClient.client = _kurentoClient;
            callback(null, KurentoClient.client);
        });
    }
}