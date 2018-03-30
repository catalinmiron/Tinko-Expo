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

    static navigationOptions = {header:null};

    state = {
        messages: [],
        user: []
    };

    constructor(props){
        super(props); let dataStore = this.props.navigation.state.params;
        uid = dataStore.myId;
        this.getFromDB(uid,"1iuLxFd8aMZVuYHR97do");
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
                    console.log("这里获取到的数据");
                    let dataArr = rows['_array'];
                    for (let i = 0;i<dataArr.length;i++){
                        console.log(dataArr[i].status);
                        if (dataArr[i].status === 0){
                            this.appendMessageFromCache(dataArr[i]);
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

    appendMessageFromCache(data){
        let chatData = {
            _id: Math.floor(Math.random()*10),
            text: data.msg,
            user: {
                _id: Math.floor(Math.random()*10),
                name: data.fromId,
                avatar: "http://larissayuan.com/home/img/prisma.png",
            },
        };
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, chatData),
        }))
    }
}