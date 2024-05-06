import {GroupRepository} from "@/repository/Group"
import {GroupMemberRepository} from "@/repository/GroupMember"
import {UserRegistry} from "@/model/UserRegistry";
import {UserSession} from "@/model/UserSession";
export async function createGroup(groupName: string, members: any){
    const groupRepository = new GroupRepository();
    const groupMemberRepository = new GroupMemberRepository();

    const group:any = await groupRepository.create({
        name: groupName,
        is_active: true,
        created_date: new Date()
    })

    for(let i = 0; i < members.length; i++){
        const member = await groupMemberRepository.create({
            group_id: group.id,
            member_name: members[i],
            created_date: new Date()
        })

        const userSession:UserSession = UserRegistry.getByName(members[i]);
        if(userSession){
            userSession.sendMessage({
                id: "joinedGroup",
                groupId: group.id
            })
        }
    }

    const groupMembers = await groupMemberRepository.findAllMemberInGroup(group.id)
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