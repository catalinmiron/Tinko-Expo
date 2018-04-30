import Expo, { SQLite } from 'expo';
const db = SQLite.openDatabase('db.db');
import {
    DeviceEventEmitter
} from 'react-native';

let uid,
    dataStore = [],
    personalInfo = {};

export const setUid = (id) => {
    uid = id;
};

export const appendChatData = (type,id,msg,hasRead) =>{
        let arr = [];
        for (let i = 0;i<dataStore.length;i++){
            arr.push(dataStore[i].id);
        }
        let indexOf = arr.indexOf(id);
        if (indexOf !== -1){
            dataStore[indexOf].msg = msg;
            if (hasRead){
                dataStore[indexOf].length = dataStore[indexOf].length+1;
            }
            let data = dataStore[indexOf];
            dataStore.splice(indexOf,1);
            dataStore.unshift(data);
        }else{
            let rtnData = {};
            if (type === 1|| type === 3){
                //私聊
                let data = personalInfo[id];
                let imageURL =  "http://larissayuan.com/home/img/prisma.png",
                    personName = "Tinko好友";
                if (data !== undefined){
                    imageURL =  (data[0]!==undefined)?data[0]:"http://larissayuan.com/home/img/prisma.png";
                    personName = (data[1]!==undefined)?data[1]:"Tinko好友";
                }else{
                    console.log("找不到头像");
                }
                rtnData = {
                    id:id,
                    type:1,
                    length:(hasRead)?1:0,
                    msg:msg,
                    imageURL:imageURL,
                    personName:personName
                }
            }else{
                //群聊
                rtnData = {
                    id:id,
                    type:2,
                    length:(hasRead)?1:0,
                    msg:msg,
                    imageURL:"http://larissayuan.com/home/img/prisma.png",
                    personName :id,
                }
            }
            dataStore.unshift(rtnData);
        }
        return dataStore;
};

export const updateUserInfo = (data) => {
        let uid = data.uid;
        for (element in dataStore){
            let ele = dataStore[element];
            if (ele.id === uid){
                ele.imageURL = data.photoURL;
                ele.personName = data.username
            }
        }
};

export const updateMeets = (data) => {
        let meetId = data.id;
        for (element in dataStore){
            let ele = dataStore[element];
            if (ele.id === meetId){
                ele.personName = data.name
            }
        }
};

export const getLength = (id) => {
        for (element in dataStore){
            let ele = dataStore[element];
            if (ele.id === id){
                console.log("ele.length:",ele.length);
                let eleLength = ele.length;
                dataStore[element].length = 0;
                return eleLength;
            }
        }
        //假设是一个新的聊天
        return 0;
};

export const getTotalUnReadNum = () => {
    let number = 0;
    for (element in dataStore){
        let ele = dataStore[element];
        number += dataStore[element].length;
    }
    return number;
};

export const updateLastMessage = (id,message) => {
    for (element in dataStore){
        let ele = dataStore[element];
        if (ele.id === id){
            dataStore[element].msg = message;
        }
    }
};


export const getData = () => {
    return dataStore;
};


//type = 1为私聊
//type = 2群聊
export const updateUnReadNum = (type,targetId) => {
    let updateSql = "";
    if (type === 1){
        updateSql = "update db"+uid+" set hasRead = 0 where hasRead = 1 and fromId = '" + targetId + "'"
    }else{
        updateSql = "update db"+uid+" set hasRead = 0 where hasRead = 1 and meetingId = '" + targetId + "'"
    }
    db.transaction(
        tx => {
            tx.executeSql(updateSql,[]
            );
        },
        (error) => console.log("update chat error :" + error),
        () => function () {
            console.log("update Success");
        }
    );
};

export const unReadNumNeedsUpdates = (id) =>{
    DeviceEventEmitter.emit('updateUnReadNum',{
        id:id
    });
};