import {UserSession} from "./UserSession";

export class UserRegistry{
    private static usersById:any = {};
    private static usersByName:any = {};

    constructor() {}

    public static register(user:UserSession){
        UserRegistry.usersById[user.id] = user;
        UserRegistry.usersByName[user.name] = user;
    }

    public static unregister(id:string){
        const user:UserSession = UserRegistry.getById(id);
        if (user) delete UserRegistry.usersById[id]
        if (user && UserRegistry.getByName(user.name)) delete UserRegistry.usersByName[user.name];
    }

    public static getById(id:string):UserSession{
        return UserRegistry.usersById[id];
    }

    public static getByName(name:string):UserSession {
        return UserRegistry.usersByName[name];
    }

    public static removeById(id:string) {
        const userSession = UserRegistry.usersById[id];
        if (!userSession) return;
        delete UserRegistry.usersById[id];
        delete UserRegistry.usersByName[userSession.name];
    }
}