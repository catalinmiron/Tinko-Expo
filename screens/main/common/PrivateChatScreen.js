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
    pid = "",
    messagesArr = [];

export default class PrivateChatScreen extends Component {

    static navigationOptions = {header:null};

    state = {
        messages: [],
    };

    constructor(props){
        super(props);
        let dataStore = this.props.navigation.state.params;
        uid = dataStore.myId;
        pid = dataStore.personId;
        const avatar = dataStore.avatar,
              name = dataStore.name;
        this.getFromDB(uid,pid,avatar,name);
        // this.socket = SocketIOClient('https://shuaiyixu.xyz');
        this.socket = SocketIOClient('http://47.89.187.42:4000/');
        this.socket.on("connect" + uid,(msg)=>{
            let data = JSON.parse(msg),
                type = data.type;
            if (type === 1){
                if (data.from === pid){
                    this.appendFriendMessage(name,avatar,data.message,Date.parse(new Date()),new Date())
                }
            }
            
        });
    }

    getFromDB(uid,pid,avatar,name){
        // ORDER BY id DESC limit 10
        db.transaction(
            tx => {
                tx.executeSql("SELECT * from db" + uid + " WHERE fromId = '" + pid + "' and meetingId = ''", [], (_, {rows}) => {
                    let dataArr = rows['_array'];
                    for (let i = 0;i<dataArr.length;i++){
                        //收到的
                        if (dataArr[i].isSystem === 1){
                            this.appendSystemMessage(dataArr[i].msg,dataArr[i].timeStamp)
                        }else{
                            if (dataArr[i].status === 0){
                                this.appendFriendMessage(name,avatar,dataArr[i].msg,"cache"+dataArr[i].id,dataArr[i].timeStamp);
                            }else{
                                //发出去的
                                this.appendMessage(dataArr[i].msg,dataArr[i].timeStamp);
                            }
                        }
                    }
                })
            },
            null,
            null
        );
    }


    appendMessage(msg,time){
        let chatData = {
            _id: Math.round(Math.random() * 10000),
            text: msg,
            createdAt: this.utcTime(time),
            user: {
                _id: 1,
                name: 'Developer',
            }
        };
        messagesArr.push(chatData);
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, chatData),
        }))
    }
    appendSystemMessage(msg,time){
        let chatData = {
            _id: Math.round(Math.random() * 10000),
            text: msg,
            createdAt: this.utcTime(time),
            system:true
        };
        messagesArr.push(chatData);
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, chatData),
        }))
    }
    appendFriendMessage(name,avatar,msg,key,time){
        let chatData = {
            _id: key,
            text: msg,
            createdAt: this.utcTime(time),
            user: {
                _id: Math.random()*100000,
                name: name,
                avatar: avatar,
            },
        };
        messagesArr.push(chatData);
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, chatData),
        }))
    }

    utcTime(time){
        //2018-04-17 2:19:51
        if (time !== undefined) {
            let timeArr = time.split(" "),
                year = timeArr[0].split("-"),
                hour = timeArr[1].split(":");
            return new Date(Date.UTC(year[0], parseInt(year[1])-1, year[2], hour[0], hour[1], hour[2]))
        }
    }

    onSend(messages = []) {
        let text = messages[0].text;
        this.socket.emit("privateChat",uid,pid,text);
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages[0]),
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