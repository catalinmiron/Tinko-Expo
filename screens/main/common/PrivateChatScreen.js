import React, {
    Component
} from 'react';
import {
    View
} from 'react-native';
import {SQLite } from 'expo';
const db = SQLite.openDatabase('db.db');
import { GiftedChat } from 'react-native-gifted-chat';
import SocketIOClient from 'socket.io-client';

let uid = "",
    pid = "";

export default class PrivateChatScreen extends Component {

    static navigationOptions = {header:null};

    state = {
        messages: [],
    };

    constructor(props){
        super(props);
        let dataStore = this.props.navigation.state.params;
        console.log(dataStore);
        uid = dataStore.myId;
        pid = dataStore.personId;
        const avatar = dataStore.avatar,
              name = dataStore.name;
        this.getFromDB(uid,pid,avatar,name);
        //this.socket = SocketIOClient('http://47.89.187.42:3000/');
        //this.socket = SocketIOClient('http://192.168.1.232:3000/');
        this.socket = SocketIOClient('http://127.0.0.1:3000/');
        this.socket.on("connect" + uid,(msg)=>{
            let data = JSON.parse(msg);
            if (data.from === pid){
                this.appendMessage(name,avatar,data.message,Date.parse(new Date()),new Date())
            }
        });
        this.socket.on("mySendBox"+uid,(msg)=>{
            console.log("hello 在这里");
            let data = JSON.parse(msg);
            console.log(data);
        });
    }

    getFromDB(uid,pid,avatar,name){
        // ORDER BY id DESC limit 10
        db.transaction(
            tx => {
                tx.executeSql("SELECT * from db" + uid + " WHERE fromId = '" + pid + "'", [], (_, {rows}) => {
                    console.log(rows['_array']);
                    console.log("这里获取到的数据");
                    let dataArr = rows['_array'];
                    console.log(dataArr);
                    for (let i = 0;i<dataArr.length;i++){
                        console.log(dataArr[i].status);
                        // console.log(new Date(dataArr[i].timeStamp));
                        if (dataArr[i].status === 0){
                            this.appendMessage(name,avatar,dataArr[i].msg,"cache"+dataArr[i].id,dataArr[i].timeStamp)
                        }else{
                            this.appendMessage(name,avatar,"我发送的"+dataArr[i].msg,"cache"+dataArr[i].id,dataArr[i].timeStamp)
                        }
                    }
                })
            },
            null,
            this.update
        );
    }

    insertChatSql(uid,fromId,msg){
        db.transaction(
            tx => {
                tx.executeSql("INSERT INTO db"+uid+"(fromId,msg,status) VALUES (?,?,?)",[fromId,msg,-1]);
            },
            null,
            this.update
        );
    }


    appendMessage(name,avatar,msg,key,time){
        let chatData = {
            _id: key,
            text: msg,
            createdAt: time,
            user: {
                _id: Math.floor(Math.random()*10),
                name: name,
                avatar: avatar,
            },
        };
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, chatData),
        }))
    }

    onSend(messages = []) {
        this.socket.emit("privateChat",uid,pid,messages[0].text);
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages),
        }))
    }

    render() {
        return (
            <GiftedChat
                messages={this.state.messages}
                onSend={messages => this.onSend(messages)}
                user={{
                    _id: 1,
                }}
            />
        )
    }
}