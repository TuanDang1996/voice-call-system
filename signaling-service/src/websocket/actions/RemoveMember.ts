import {GroupMemberRepository} from "@/repository/GroupMember"
import {UserRegistry} from "@/model/UserRegistry";
import {UserSession} from "@/model/UserSession";
export async function removeMember(groupId: string, members: any){
    const groupMemberRepository = new GroupMemberRepository();

    for(let i = 0; i < members.length; i++){
        const member = await groupMemberRepository.leaveGroup(members[i], groupId)

        const userSession:UserSession = UserRegistry.getByName(members[i]);
        if(userSession){
            userSession.sendMessage({
                id: "leavedGroup",
                groupId: groupId
            })
        }
    }

    const groupMembers = await groupMemberRepository.findAllMemberInGroup(groupId)
    groupMembers.forEach(mem => {
        const userSession:UserSession = UserRegistry.getByName(mem.member_name);
        if(userSession){
            userSession.sendMessage({
                id: "updateGroupMember",
                groupMember: groupMembers
            })
        }
    })
}