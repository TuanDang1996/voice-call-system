import {Room} from "./Room";
import { v4 as uuid } from 'uuid';

export class RoomManager{
    public static rooms:{} = {};

    public static makeNewRoom(uri:string):Room{
        const id:string = uuid();
        const newRoom:Room = new Room(id, uri);
        RoomManager.rooms[id] = newRoom;
        return newRoom;
    }

    public static getRoomById(id:string):Room{
        if(!RoomManager.isExist(id))
            throw new Error(`There is no room with id ${id}`)
        return RoomManager.rooms[id];
    }

    public static isExist(id:string):Boolean{
        return RoomManager.rooms[id] !== null;
    }
}