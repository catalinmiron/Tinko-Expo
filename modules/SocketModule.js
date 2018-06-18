import SocketIOClient from "socket.io-client";
import {
    DeviceEventEmitter
} from 'react-native';

// module.exports = SocketIOClient('https://shuaiyixu.xyz');
let TinkoSocket,
    byStanderListener;

export const initSocketModule = (uid) =>{
    TinkoSocket = SocketIOClient('https://gotinko.com/');
    TinkoSocket.on("connect" + uid,msg=>{
        console.log("收到：" + msg);
        let data = JSON.parse(msg);
        if (data.type === 3){
            //未读消息
            console.log("这里是为读消息",data.message);
            for (let i = 0;i<data.message.length;i++){
                let thisData = data.message[i];
                console.log(thisData);
                DeviceEventEmitter.emit('PrivateUnRead',{
                    data:JSON.stringify({
                        fromId:thisData.fromId,
                        msg:thisData.msg,
                        time:thisData.time
                    })
                });
            }
        }else if (data.type === 4){
            //群聊未读
            //{"type":4,"from":"pbc6cqcW80XHRbBJptIcqEVZpjY2",
            // "message":[{"id":1005,"fromId":"bIpCsH2lZBRL4KM1jPvwC3aczkR2","meetId":"lGcbpmUMrEaBPNFalenF","msg":"哥哥哥哥","status":0,"time":"2018-06-17T23:59:28.000Z"}],"time":"2018-06-18T07:59:30+08:00"}
            for (let i = 0;i<data.message.length;i++){
                let thisData = data.message[i];
                DeviceEventEmitter.emit('MeetUnRead',{
                    data:JSON.stringify({
                        fromId:thisData.fromId,
                        meetId:thisData.meetId,
                        msg:thisData.msg,
                        timeStamp:thisData.time,
                        status:0
                    })
                });
            }
        }
        DeviceEventEmitter.emit('SocketConnect',{
            msg:msg
        });
    });
    TinkoSocket.on("mySendBox" + uid,msg=>{
        console.log("get msg from mySendBox",msg);
        DeviceEventEmitter.emit('mySendBox',{
            msg:msg
        });
    });
};

export const initByStanderChat = (MeetId) =>{
    if (!TinkoSocket.hasListeners("activity" + MeetId)){
        console.log("没有这个监听");
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

export const Hang = () => {
    TinkoSocket.emit("hang");
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
    DeviceEventEmitter.emit('localMsgSendBox',{
        data:JSON.stringify({
            msg:text,
            toId:pid,
            type:1
        })
    });
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
