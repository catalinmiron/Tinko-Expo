import SocketIOClient from "socket.io-client";
import {
    DeviceEventEmitter
} from 'react-native';

// module.exports = SocketIOClient('https://shuaiyixu.xyz');
let TinkoSocket = SocketIOClient('https://gotinko.com/'),
    byStanderListener;

export const initSocketModule = (uid) =>{
    TinkoSocket.on("connect" + uid,msg=>{
        console.log("收到：" + msg);
        DeviceEventEmitter.emit('SocketConnect',{
            msg:msg
        });
    });
    TinkoSocket.on("mySendBox" + uid,msg=>{
        DeviceEventEmitter.emit('mySendBox',{
            msg:msg
        });
    });
};

export const initByStanderChat = (MeetId) =>{
    if (!TinkoSocket.hasListeners("activity" + MeetId)){
        console.log("没有这个监听")
        TinkoSocket.on("activity" + MeetId,msg=>{
            console.log("get activity " + MeetId);
            DeviceEventEmitter.emit("activity" + MeetId,{
                msg:msg
            });
        });
    }else{
        console.log("这个活动的监听存在")
    }
};

export const removeByStanderChat = (MeetId) =>{
    console.log("关闭活动监听");
    TinkoSocket.off("activity" + MeetId);
    console.log(TinkoSocket.hasListeners("activity" + MeetId));
};

export const sendGroupChat = (params) =>{
    let uid = params.uid,MeetId = params.MeetId,text = params.text;
    TinkoSocket.emit("groupChat",uid,MeetId,text);
};

export const byStander = (params) =>{
    let uid = params.uid,MeetId = params.MeetId,text = params.text;
    TinkoSocket.emit("byStander",uid,MeetId,text);
};

export const sendPrivateChat = (params) =>{
    let uid = params.uid,pid = params.pid,text = params.text,insertId = params.insertId;
    TinkoSocket.emit("privateChat",uid,pid,text,insertId);
};


export const userLogin = (uid) =>{
    TinkoSocket.emit("userLogin",uid);
};


// 服务器配置需要这样
//
// proxy_set_header X-Real-IP $remote_addr;
// proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
// proxy_set_header X-NginX-Proxy true;
// proxy_pass http://localhost:3000/;
//     proxy_ssl_session_reuse off;
// proxy_set_header Host $http_host;
// proxy_cache_bypass $http_upgrade;
// proxy_redirect off;
