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

export default class PrivateChatScreen extends Component {

    state = {
        messages: [],
    };

    constructor(props){
        super(props);
        let uid = this.props.myId,
            pid = this.props.personId,
            avatar = this.props.avatar,
            name = this.props.name;
        this.getFromDB(uid,pid,avatar,name);
        this.socket = SocketIOClient('http://127.0.0.1:3333');
        this.socket.on("connect" + uid,(msg)=>{
            let data = JSON.parse(msg);
            if (data.from === pid){
                this.appendMessage(name,avatar,data.message,Date.parse(new Date()),new Date())
            }
        });
    }

    getFromDB(uid,pid,avatar,name){
        db.transaction(
            tx => {
                tx.executeSql("SELECT msg,id,timeStamp from db" + uid + " WHERE fromId = '" + pid + "' ORDER BY id DESC limit 10", [], (_, {rows}) => {
                    let dataArr = rows['_array'].reverse();
                    console.log(dataArr);
                    for (let i = 0;i<dataArr.length;i++){
                        this.appendMessage(name,avatar,dataArr[i].msg,"cache"+dataArr[i].id,new Date(dataArr[i].timeStamp))
                    }
                })
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
                _id: Math.floor(Math.random()*10000),
                name: name,
                avatar: avatar,
            },
        };
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, chatData),
        }))
    }

    onSend(messages = []) {
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