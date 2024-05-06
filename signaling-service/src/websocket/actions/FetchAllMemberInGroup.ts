import {GroupMemberRepository} from "@/repository/GroupMember"
import {UserRegistry} from "@/model/UserRegistry";
import {UserSession} from "@/model/UserSession";
export async function getAllMembersByGroupId(sessionId:string, groupId:string){
    const groupMemberRepository = new GroupMemberRepository();
    const userSession:UserSession = UserRegistry.getById(sessionId);
    if(userSession){
        console.warn('Not found user by session id!!')
    }

    const members = await groupMemberRepository.findAllMemberInGroup(groupId)
    userSession.sendMessage({
        id: "allMemberInGroup",
        groupId: groupId,
        members: members
    })
}