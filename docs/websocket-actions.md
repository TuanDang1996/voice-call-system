# Websocket actions

|      Action      |                            Input                            | 
|:----------------:|:-----------------------------------------------------------:|
| register |                    {"name": "accepted"}                     |
|   unregister   |                             {}                              |
|   call   |       {"to": "abc", "from": "abc", "sdpOffer": "abc"}       |
|   incomingCallResponse   | {"roomId": "abc", "callResponse": "abc", "sdpOffer": "abc"} |
|   incomingCallResponsestop   |                             {}                              |
|   receiveMediaFrom   |   {"remoteId": "abc", "roomId": "abc", "sdpOffer": "abc"}   |
|   joinRoom   |            {"roomId": "abc", "sdpOffer": "abc"}             |
|   onIceCandidate   |   {"candidate": "abc", "name": "abc", "isPlaying": True}    |
|   startRecording   |                     {"sdpOffer": "abc"}                     |
|   startRecordVoiceMail   |           {"sdpOffer": "abc", "recipient": "abc"}           |
|   stopRecordVoiceMail   |                             {}                              |
|   makeCallQueue   |   {"sdpOffer": "abc", "preAction": "abc", "chosenAction"}   |
|   startConnectToStaff   |           {"serviceId": "abc", "sdpOffer": "abc"}           |
|   clearSession   |           {}           |


** Note: for more details and the way to integrate these actions with client side, pls help to check these demo:
- Call/Group call: https://github.com/TuanDang1996/voice-call/blob/main/kurento-examples/nodejs/kurento-one2one-call/static/js/index.js
- Call Queue:
    1. Client: https://github.com/TuanDang1996/voice-call/blob/main/kurento-examples/nodejs/kurento-hello-world/static/js/index.js
    2. Staff:  https://github.com/TuanDang1996/voice-call/blob/main/kurento-examples/nodejs/kurento-staff/static/js/index.js