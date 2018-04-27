import React, {
    Component
} from 'react';
import {
    AsyncStorage, View
} from 'react-native';
import {getUserDetail} from "../../../modules/UserAPI";
import {SQLite } from 'expo';
const db = SQLite.openDatabase('db.db');
import { GiftedChat } from 'react-native-gifted-chat';
import SocketIOClient from 'socket.io-client';
import {ifIphoneX} from "react-native-iphone-x-helper";
import {Header} from "react-native-elements";

let uid = "",
    pid = "",
    dbInfoList = [],
    limit = 15,
    messagesArr = [],
    userAvatar,userName;

export default class PrivateChatScreen extends Component {

    static navigationOptions = {header:null};

    state = {
        messages: [],
        isLoadingEarlier:false,
        hasCache:false,
        viewLoading:true,
    };

    constructor(props){
        super(props);
        let dataStore = this.props.navigation.state.params;
        uid = dataStore.myId;
        pid = dataStore.personId;
        userAvatar =  dataStore.avatar;
        userName = dataStore.name;
        this.getFromDB(uid,pid);
        // this.socket = SocketIOClient('https://shuaiyixu.xyz');
        this.socket = SocketIOClient('http://47.89.187.42:4000/');
        this.socket.on("connect" + uid,(msg)=>{
            let data = JSON.parse(msg),
                type = data.type;
            if (type === 1){
                if (data.from === pid){
                    this.appendFriendMessage(data.message,Date.parse(new Date()))
                }
            }
            
        });
    }

    getFromDB(uid,pid){
        // ORDER BY id DESC limit 10
        db.transaction(
            tx => {
                tx.executeSql("SELECT * from db" + uid + " WHERE fromId = '" + pid + "' and meetingId = ''", [], (_, {rows}) => {
                    let dataArr = rows['_array'];
                    if (dataArr.length>limit){
                        let processIng = [];
                        for (let i = 0;i<limit;i++){
                            processIng.push(dataArr.shift());
                        }
                        dbInfoList = dataArr;
                        this.processData(processIng);
                    }else{
                        this.setState({
                            hasCache:false
                        });
                        this.processData(dataArr);
                    }
                })
            },
            null,
            null
        );
    }

    processData(infoList,type){
        for (let i = 0;i<infoList.length;i++){
            if (infoList[i].isSystem === 1){
                this.appendSystemMessage(infoList[i].msg,infoList[i].timeStamp)
            }else{
                if (infoList[i].status === 0){
                    this.appendFriendMessage(infoList[i].msg,"cache"+infoList[i].id,infoList[i].timeStamp);
                }else{
                    //发出去的
                    this.appendMessage(infoList[i].msg,infoList[i].timeStamp);
                }
            }
        }
        if (type===undefined){
            this.setState({
                hasCache:(dbInfoList.length !== 0)
            });
        }else{
            this.setState({
                hasCache:false
            });
        }
    }

    getHistoryChatContents(){
        this.setState({isLoadingEarlier:true});
        // console.log("dbInfoList",dbInfoList);
        if (dbInfoList.length>limit){
            let processIng = [];
            for (let i = 0;i<limit;i++){
                processIng.push(dbInfoList.shift());
            }
            this.processData(processIng);
        }else{
            this.processData(dbInfoList,1);
        }

        this.setState({isLoadingEarlier:false});
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
    appendFriendMessage(msg,key,time){
        let chatData =  {};
        if (time === undefined){
            chatData = {
                _id: key,
                text: msg,
                createdAt: new Date(),
                user: {
                    _id: Math.random()*100000,
                    name: userName,
                    avatar: userAvatar,
                },
            }
        }else{
            chatData = {
                _id: key,
                text: msg,
                createdAt: time,
                user: {
                    _id: Math.random()*100000,
                    name: userName,
                    avatar: userAvatar,
                },
            };
        }
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
            <View style={{flex:1}}>
                <Header
                    centerComponent={{ text: 'Private Chat', style: { fontSize:18, fontFamily:'regular', color: '#fff' } }}
                    outerContainerStyles={ifIphoneX({height:88})}
                />
                <GiftedChat
                    messages={this.state.messages}
                    onSend={messages => this.onSend(messages)}
                    user={{
                        _id: 1,
                    }}
                    loadEarlier={this.state.hasCache}
                    isLoadingEarlier={this.state.isLoadingEarlier}
                    onLoadEarlier={() => this.getHistoryChatContents()}
                    bottomOffset={ifIphoneX(34)}
                />
                <View style={{...ifIphoneX({height:34, backgroundColor:'white'}, {})}}/>
            </View>
        )
    }
}