import fs from "fs";
import {UserRegistry} from "@/model/UserRegistry";
import {SessionStatus} from "@/helper/SessionStatus";
export const findStaffByServiceId = (serviceId: string) => {
    let obj;
    let action = {};
    obj = JSON.parse(fs.readFileSync('/Users/tuandang/Documents/Source/Others/voice-call-system/signaling-service/src/helper/example2.json', 'utf8'));
    action = obj.filter((ob:any) => {
        const session = UserRegistry.getByName(ob.user_name)
        return ob.services.indexOf(serviceId) >= 0 && session && session.status === SessionStatus.READY
    })

    return action
}

