import Expo, { SQLite } from 'expo';
const db = SQLite.openDatabase('db.db');
import {
    DeviceEventEmitter
} from 'react-native';

let uid,
    currentOnSelect,
    dataStore = [],
    personalInfo = {};

export const setUid = (id) => {
    uid = id;
};

export const currentOnSelectUser = (id) => {
    currentOnSelect = id
};

export const removeChat = (id) => {
        let arr = [];
        for (let i = 0;i<dataStore.length;i++){
            arr.push(dataStore[i].id);
        }
    let indexOf = arr.indexOf(id);
    if (indexOf !== -1){
        dataStore.splice(indexOf,1);
        updateTotalUnReadNum();
    }
    return dataStore;
};

export const appendChatData = (time,type,id,msg,hasRead) =>{
        let arr = [];
        for (let i = 0;i<dataStore.length;i++){
            arr.push(dataStore[i].id);
        }
        let indexOf = arr.indexOf(id);
        if (indexOf !== -1){
            let d = dataStore[indexOf];
            d.msg = msg;
            if (hasRead){
                d.length = d.length+1;
            }
            if (currentOnSelect === id){
                d.length = 0;
            }
            d.time = time;
            let data = d;
            dataStore.splice(indexOf,1);
            dataStore.unshift(data);
        }else{
            //这里是新建
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
                    time:time,
                    imageURL:imageURL,
                    personName:personName
                };
                unReadNumNeedsUpdates(id,0);
            }else{
                //群聊
                rtnData = {
                    id:id,
                    type:2,
                    length:(hasRead)?1:0,
                    msg:msg,
                    time:time,
                    imageURL:"http://larissayuan.com/home/img/prisma.png",
                    personName :id,
                };
                unReadNumNeedsUpdates(id,1);
            }
            dataStore.unshift(rtnData);
        }
        updateTotalUnReadNum();
        return dataStore;
};

export const updateTotalUnReadNum = () => {
    DeviceEventEmitter.emit('updateBadge',{
        num:getTotalUnReadNum()
    });
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
                ele.personName = data.name;
                ele.imageURL = data.photoURL;
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

//1 group 0 private
export const unReadNumNeedsUpdates = (id,type) =>{
    DeviceEventEmitter.emit('updateUnReadNum',{
        id:id
    });
    DeviceEventEmitter.emit('avatarUpdate',{
        id:id,
        type:type
    });
    updateTotalUnReadNum();
};