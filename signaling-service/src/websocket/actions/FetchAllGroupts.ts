import {GroupMemberRepository} from "@/repository/GroupMember"
import {UserRegistry} from "@/model/UserRegistry";
import {UserSession} from "@/model/UserSession";
export async function getAllGroup(sessionId:string){
    const groupMemberRepository = new GroupMemberRepository();
    const userSession:UserSession = UserRegistry.getById(sessionId);
    if(userSession){
        console.warn('Not found user by session id!!')
    }

    const groups = await groupMemberRepository.findAllGroups(userSession.name)
    userSession.sendMessage({
        id: "fetchedAllGroup",
        groups: groups
    })
}