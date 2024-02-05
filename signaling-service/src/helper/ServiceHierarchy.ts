import fs from "fs";
export const findNextAction = (preAction: any, chosenAction: any) => {
    let obj;
    let action = {};
    fs.readFile('/Users/tuandang/Documents/Source/Others/voice-call-system/signaling-service/src/helper/example.json', 'utf8', function (err, data) {
        if (err) throw err;
        obj = JSON.parse(data);
        action = obj.filter((ob:any) => {
            return ob.parent_id === preAction && ob.text_to_choose === chosenAction
        })
    });

    return action
}

export const findChildActions = (chosenAction: any) => {
    let obj;
    let action = {};
    fs.readFile('/Users/tuandang/Documents/Source/Others/voice-call-system/signaling-service/src/helper/example.json', 'utf8', function (err, data) {
        if (err) throw err;
        obj = JSON.parse(data);
        action = obj.filter((ob:any) => {
            return ob.parent_id === chosenAction
        })
    });

    return action
}

export const findProcessActions = () => {
    let obj;
    let action = {};
    fs.readFile('/Users/tuandang/Documents/Source/Others/voice-call-system/signaling-service/src/helper/example.json', 'utf8', function (err, data) {
        if (err) throw err;
        obj = JSON.parse(data);
        action = obj.filter((ob:any) => {
            return ob.type === 'process_call'
        })
    });

    return action
}

export const findBusyActions = () => {
    let obj;
    let action = {};
    fs.readFile('/Users/tuandang/Documents/Source/Others/voice-call-system/signaling-service/src/helper/example.json', 'utf8', function (err, data) {
        if (err) throw err;
        obj = JSON.parse(data);
        action = obj.filter((ob:any) => {
            return ob.type === 'busy_call'
        })
    });

    return action
}

