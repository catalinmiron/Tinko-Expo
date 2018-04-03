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
    MeetId = "";

export default class PrivateChatScreen extends Component {

    static navigationOptions = {header:null};

    state = {
        messages: [],
        user: []
    };

    constructor(props){
        super(props);
        let dataStore = this.props.navigation.state.params;
        uid = dataStore.myId;
        MeetId = dataStore.personId;
        this.socket = SocketIOClient('http://47.89.187.42:4000/');
        this.socket.on("connect" + uid,(msg)=>{
            let data = JSON.parse(msg);
            console.log(data);
            this.setState(previousState => ({
                messages: GiftedChat.append(previousState.messages,{
                    _id: Math.floor(Math.random()*10000),
                    text: data.message,
                    user: {
                        _id: data.userData.uid,
                        name: data.userData.username,
                        avatar: data.userData.photoURL,
                    },
                    sent: true,
                    received: true,
                }),
            }))
        });
        this.getFromDB(uid,MeetId);
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

    getFromDB(uid,meetId){
        // ORDER BY id DESC limit 10
        db.transaction(
            tx => {
                tx.executeSql("SELECT * FROM db"+ uid + " WHERE meetingId = '"+meetId +"'", [], (_, {rows}) => {
                    let dataArr = rows['_array'];
                    for (let i = 0;i<dataArr.length;i++){
                        if (dataArr[i].status === 0){
                            let userData =  JSON.parse(dataArr[i].meetUserData);
                            this.appendMessageFromCache(dataArr[i].msg,userData.uid,userData.username,userData.photoURL);
                        }else{
                            if (dataArr[i] === 0 ){
                                this.appendMessage(dataArr[i].msg,0);
                            }else{
                                this.appendMessage(dataArr[i].msg);
                            }
                        }
                    }
                })
            },
            null,
            this.update
        );
    }

    appendMessage(msg,type){
        let chatData = {};
        if (type === 0){
            chatData = {
                _id: Math.round(Math.random() * 10000),
                text: msg,
                createdAt: new Date(),
                user: {
                    _id: 1,
                    name: 'Developer',
                }
            };
        } else{
            chatData = {
                _id: Math.round(Math.random() * 10000),
                text: msg,
                createdAt: new Date(),
                system:true
            };
        }
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, chatData),
        }))
    }

    onSend(messages = []) {
        let text = messages[0].text;
        this.socket.emit("groupChat",uid,MeetId,text);
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages[0]),
        }))
    }

    appendMessageFromCache(msg,userId,userName,userAvatar){
        let chatData = {
            _id: Math.floor(Math.random()*10000),
            text: msg,
            user: {
                _id: userId,
                name: userName,
                avatar: userAvatar,
            },
            sent: true,
            received: true,
        };
        this.setState((previousState) => ({
            messages: GiftedChat.append(previousState.messages, chatData),
        }));
    }

}