import { IncomingMessage } from "http";
import request from "Request";
import * as WSS from "ws";


export function authenticateWebSocketWithKeycloak( ws: WSS.WebSocket, req: IncomingMessage, next: () => void) {

    try {
      // const token = req.headers['authorization']?.replace('Bearer ', '');
      console.log("checktoken")
    
      const token = req.headers['authorization']
      const options = {
        method: 'GET',
        url: `http://localhost:8080/realms/keycloak-express/protocol/openid-connect/userinfo`,
        headers: {
          // add the token you received to the userinfo request, sent to keycloak
          Authorization: token,
        },
      };
  
      // send a request to the userinfo endpoint on keycloak
      request(options, (error, response ) => {
        if (error) throw new Error(error);
  
        // if the request status isn't "OK", the token is invalid
        if (response.statusCode !== 200) {
          ws.send(response.statusCode)
          ws.close();
        }
        // the token is valid pass request onto your next function
        else {
          next();
        }
      })
    } catch (error) {
      console.error('Error while processing token:', error);
      ws.close();
    }
  }