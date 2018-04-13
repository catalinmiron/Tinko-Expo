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
    console.log('acceptFriendRequest');
    Socket.emit("NewFriendRequest",JSON.stringify({
        requester:requester,
        responser:responser,
        type:1,
        msg:''
    }));
};


export const createMeet = (uid, meetId) => {
    Socket.emit("createMeets",uid,meetId);
}