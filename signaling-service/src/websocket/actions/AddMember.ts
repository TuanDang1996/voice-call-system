import {GroupMemberRepository} from "@/repository/GroupMember"
import {UserRegistry} from "@/model/UserRegistry";
import {UserSession} from "@/model/UserSession";
export async function addNewMember(groupId: string, members: any){
    const groupMemberRepository = new GroupMemberRepository();

    for(let i = 0; i < members.length; i++){
        const member = await groupMemberRepository.create({
            group_id: groupId,
            member_name: members[i],
            created_date: new Date()
        })

        const userSession:UserSession = UserRegistry.getByName(members[i]);
        if(userSession){
            userSession.sendMessage({
                id: "joinedGroup",
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