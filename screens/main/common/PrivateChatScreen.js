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
        uid = dataStore.myId;
        pid = dataStore.personId;
        const avatar = dataStore.avatar,
              name = dataStore.name;
        this.getFromDB(uid,pid,avatar,name);
        //this.socket = SocketIOClient('http://47.89.187.42:3000/');
        //this.socket = SocketIOClient('http://192.168.1.232:3000/');
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
                        if (dataArr[i].status === 0){
                            this.appendFriendMessage(name,avatar,dataArr[i].msg,"cache"+dataArr[i].id)
                        }else{
                            //发出去的
                            this.appendMessage(dataArr[i].msg);
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


    appendMessage(msg){
        let chatData = {
            _id: Math.round(Math.random() * 10000),
            text: msg,
            createdAt: new Date(),
            user: {
                _id: 1,
                name: 'Developer',
            }
        };
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, chatData),
        }))
    }
    appendFriendMessage(name,avatar,msg,key){
        let chatData = {
            _id: key,
            text: msg,
            createdAt: new Date(),
            user: {
                _id: 2,
                name: name,
                avatar: avatar,
            },
        };
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, chatData),
        }))
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