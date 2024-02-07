import fs from "fs";
export const findStaffByServiceId = (serviceId: any) => {
    let obj;
    let action = {};
    obj = JSON.parse(fs.readFileSync('/Users/tuandang/Documents/Source/Others/voice-call-system/signaling-service/src/helper/example2.json', 'utf8'));
    action = obj.filter((ob:any) => {
        return obj.services.indexOf(serviceId) >= 0
    })

    return action
}

