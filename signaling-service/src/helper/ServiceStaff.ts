import {UserRegistry} from "@/model/UserRegistry";
import {SessionStatus} from "@/helper/SessionStatus";
import {UserChosenServiceRepository} from "@/repository/UserChosenService"
export const findStaffByServiceId = async (serviceId: string) => {
    let action = {};
    const repo = new UserChosenServiceRepository();
    const obj = await repo.getUserByServiceId(serviceId)
    action = obj.filter((ob) => {
        const session = UserRegistry.getByName(ob.user_name)
        return ob.services.indexOf(serviceId) >= 0 && session && session.status === SessionStatus.READY
    })

    return action
}

