import Socket from "../modules/SocketModule";

export const sendFriendRequest = (requester,responser,type,msg) => {
    Socket.emit("NewFriendRequest",JSON.stringify({
        requester:requester,
        responser:responser,
        type:type,
        msg:msg
    }));
};

export const acceptFriendRequest = (requester, responser) => {
    Socket.emit("NewFriendRequest",JSON.stringify({
        requester:requester,
        responser:responser,
        type:1,
        msg:''
    }));
};


//    //type = 1 为创建
//     //type = 2 为加入
//     //type = -1 为退出
//     socket.on("Meets",function (uid,MeetId,type) {
//
//     });

// export const createMeet = (uid, meetId) => {
//     Socket.emit("createMeets",uid,meetId);
// };

export const createMeet = (uid,meetId) => {
    Socket.emit("Meets",uid,meetId,1);
};

//删除自己
export const quitMeet = (uid,meetId) => {
    Socket.emit("Meets",uid,meetId,-1);
};

//删除某人
export const RemoveFromMeet = (uid,meetId) => {
    Socket.emit("Meets",uid,meetId,-2);
};