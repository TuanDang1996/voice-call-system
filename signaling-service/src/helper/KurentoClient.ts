import kurento from "kurento-client";
export class KurentoClient {
  private static client: any;
  static getKurentoClient(ws_uri: string): Promise<kurento.ClientInstance> {
    return new Promise((resolve: any, reject: any) => {
      if (KurentoClient.client) {
        return resolve(KurentoClient.client);
      }
      KurentoClient.client = kurento(ws_uri);
      resolve(KurentoClient.client);
    });
  }
}
