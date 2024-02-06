import { UserRegistry } from "@/model/UserRegistry";
import { UserSession } from "@/model/UserSession";

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
    user.id = id;
    user.ws = ws;
  } else {
    UserRegistry.register(new UserSession(id, name, ws));
  }

  try {
    ws.send(JSON.stringify({ id: "registerResponse", response: "accepted"}));
  } catch (exception) {
    onError(exception);
  }
}
