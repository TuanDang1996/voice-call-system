import { UserRegistry } from "@/model/UserRegistry";
import { UserSession } from "@/model/UserSession";
import {CachedData} from "@/helper/CachedData";
import {joinRoom} from "@/websocket/actions/JoinRoom";
import {Room} from "@/model/Room";
import {RoomManager} from "@/model/RoomManager";

export function register(id: string, name: string, ws: any) {
  function onError(error: string) {
    ws.send(
      JSON.stringify({
        id: "registerResponse",
        response: "rejected",
        message: error,
      })
    );
  }

  if (!name) {
    return onError("empty user name");
  }
  const user = UserRegistry.getByName(name);
  if (user) {
    rejoinCall(user, id, ws)
  } else {
    UserRegistry.register(new UserSession(id, name, ws));
    try {
      ws.send(JSON.stringify({ id: "registerResponse", response: "accepted"}));
    } catch (exception) {
      onError(exception);
    }
  }
}


const rejoinCall = (user:UserSession, id: string, ws: any) => {
  if(!CachedData.candidatesQueue[id]){
    CachedData.candidatesQueue[id] = []
  }
  if(CachedData.candidatesQueue[user.id]){
    CachedData.candidatesQueue[id].push(...CachedData.candidatesQueue[user.id])
  }
  const temp = user.id
  user.id = id;
  user.ws = ws;
  UserRegistry.register(user)
  delete CachedData.candidatesQueue[user.id]

  ws.send(JSON.stringify({ id: "registerResponse", response: "accepted"}));

  // if(user.roomId){
  //   ws.send(JSON.stringify({id: "reJoinCallAction", roomId: user.roomId}));
  // } else {
  //   ws.send(JSON.stringify({ id: "registerResponse", response: "accepted"}));
  // }
}