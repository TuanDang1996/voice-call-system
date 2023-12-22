import * as Kurento from 'kurento-client';
export class KurentoClient {
    private static client:any;
    static getKurentoClient(ws_uri:string): Promise<any> {
        return new Promise((resolve:any, reject:any) => {
            if (KurentoClient.client) {
                return resolve(KurentoClient.client);
            }

            Kurento(ws_uri, (error: string, _kurentoClient: any) => {
                if (error) {
                    const message = 'Coult not find media server at address ' + ws_uri;
                    // @ts-ignore
                    return reject(message + ". Exiting with error " + error);
                }

                KurentoClient.client = _kurentoClient;
                resolve(KurentoClient.client);
            });
        })
    }
}

