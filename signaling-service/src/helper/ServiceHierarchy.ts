import fs from "fs";
export const findNextAction = (preAction: any, chosenAction: any) => {
    let obj;
    let action = {};
    obj = JSON.parse(fs.readFileSync('/Users/tuandang/Documents/Source/Others/voice-call-system/signaling-service/src/helper/example.json', 'utf8'));
    action = obj.filter((ob:any) => {
        return ob.parent_id === preAction && ob.text_to_choose === chosenAction
    })

    return action[0]
}

export const findChildActions = (chosenAction: any) => {
    let obj;
    let action = {};
    obj = JSON.parse(fs.readFileSync('/Users/tuandang/Documents/Source/Others/voice-call-system/signaling-service/src/helper/example.json', 'utf8'));
    action = obj.filter((ob:any) => {
        return ob.parent_id === chosenAction
    })

    return action
}

export const findProcessActions = () => {
    let obj;
    let action = {};
    obj = JSON.parse(fs.readFileSync('/Users/tuandang/Documents/Source/Others/voice-call-system/signaling-service/src/helper/example.json', 'utf8'));
    action = obj.filter((ob:any) => {
        return ob.type === 'process_call'
    })

    return action[0]
}

export const findBusyActions = () => {
    let obj;
    let action = {};
    obj = JSON.parse(fs.readFileSync('/Users/tuandang/Documents/Source/Others/voice-call-system/signaling-service/src/helper/example.json', 'utf8'));
    action = obj.filter((ob:any) => {
        return ob.type === 'busy_call'
    })

    return action[0]
}

export const findRootAction = () => {
    let obj;
    let action = {};
    obj = JSON.parse(fs.readFileSync('/Users/tuandang/Documents/Source/Others/voice-call-system/signaling-service/src/helper/example.json', 'utf8'));
    action = obj.filter((ob:any) => {
        return ob.type === 'normal' && ob.parent_id === null
    })

    return action[0]
}
