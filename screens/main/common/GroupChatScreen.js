import React, {
    Component
} from 'react';
import {
    AsyncStorage, View
} from 'react-native';
import {getUserDataFromDatabase} from "../../../modules/CommonUtility";
import {SQLite } from 'expo';
const db = SQLite.openDatabase('db.db');
import { GiftedChat, Actions, Bubble, SystemMessage } from 'react-native-gifted-chat';
import SocketIOClient from 'socket.io-client';
import {ifIphoneX} from "react-native-iphone-x-helper";
import {Header} from "react-native-elements";

let uid = "",
    MeetId = "",
    dbInfoList = [],
    limit = 15;

export default class PrivateChatScreen extends Component {

    static navigationOptions = {header:null};

    state = {
        messages: [],
        user: [],
        isLoadingEarlier:false,
        hasCache:false,
        viewLoading:true,
    };

    constructor(props){
        super(props);
        dbInfoList = [];
        let dataStore = this.props.navigation.state.params;
        uid = dataStore.myId;
        MeetId = dataStore.personId;
        // this.socket = SocketIOClient('https://shuaiyixu.xyz');
        this.socket = SocketIOClient('http://47.89.187.42:4000/');
        this.socket.on("connect" + uid,(msg)=>{
            let data = JSON.parse(msg);
            if (data.type === 2){
                if (MeetId === data.activityId){
                    data.fromId = data.from;
                    data.time = new Date();
                    data.msg = data.message;
                    if (data.fromId!==uid){
                        data.status = 0;
                    }
                    this.processMessageData([data]);
                }
            }
        });
        this.getFromDB(uid,MeetId);
    }

    //type === 1为历史 需要unshift
    async processMessageData(data,type){
        let messages = [];
        await data.reduce((p,e,i) => p.then(async ()=> {
            await getUserDataFromDatabase(e.fromId,
                (userData) => {
                    let message = {};
                    if (e.status === 0){
                        message = {
                            _id: Math.floor(Math.random()*10000),
                            text: e.msg,
                            user: {
                                _id: userData.uid,
                                name: userData.username,
                                avatar: userData.photoURL,
                            },
                            createdAt:(e.time)?e.time:this.utcTime(e.timeStamp),
                            sent: (e.status === 0)
                        };
                    }else{
                        if (e.type!==0){
                            message = {
                                _id: Math.round(Math.random() * 10000),
                                text: e.msg,
                                createdAt: (e.time)?e.time:this.utcTime(e.timeStamp),
                                user: {
                                    _id: 1,
                                    name: 'Developer',
                                }
                            };
                        }else{
                            message = {
                                _id: Math.round(Math.random() * 10000),
                                text: e.msg,
                                createdAt: (e.time)?e.time:this.utcTime(e.timeStamp),
                                system:true
                            };
                        }
                    }
                    messages.push(message);
                },
                (error) => {
                    Alert.alert('Error', error);
                });
        }),Promise.resolve());
        if (type === 1){
            messages = this.state.messages.concat(messages);
        }else{
            messages = messages.concat(this.state.messages);
        }
        this.setState({
            hasCache:(dbInfoList.length !== 0),
            messages:messages
        });
    }

    render() {
        return (
            <View style={{flex:1}}>
                <Header
                    centerComponent={{ text: 'Group Chat', style: { fontSize:18, fontFamily:'regular', color: '#fff' } }}
                    outerContainerStyles={ifIphoneX({height:88})}
                />
                <GiftedChat
                    messages={this.state.messages}
                    onSend={messages => this.onSend(messages)}
                    showAvatarForEveryMessage = {true}
                    user={{
                        _id: 1,
                    }}
                    loadEarlier={this.state.hasCache}
                    isLoadingEarlier={this.state.isLoadingEarlier}
                    onLoadEarlier={() => this.getGroupChatContents()}
                    bottomOffset={ifIphoneX(34)}
                    onLayout={() => {this.setState({ viewLoading:false })}}
                    textInputProps={{ multiline: !this.state.viewLoading}}
                />
                <View style={{...ifIphoneX({height:34, backgroundColor:'white'}, {})}}/>
            </View>
        )
    }

    getGroupChatContents(){

        this.setState({isLoadingEarlier:true});
        // console.log("dbInfoList",dbInfoList);
        if (dbInfoList.length>limit){
            let processIng = [];
            for (let i = 0;i<limit;i++){
                processIng.push(dbInfoList.shift());
            }
            this.processMessageData(processIng,1);
        }else{
            this.processMessageData(dbInfoList,1);

            dbInfoList = [];
        }

        this.setState({isLoadingEarlier:false});
    }

    getFromDB(uid,meetId){

        // ORDER BY id DESC limit 10
        db.transaction(
            tx => {
                tx.executeSql("SELECT * FROM db"+ uid + " WHERE meetingId = '"+meetId +"' ORDER BY id DESC", [], (_, {rows}) => {
                    let dataArr = rows['_array'];
                    console.log(dataArr);
                    if (dataArr.length>limit){
                        let processIng = [];
                        for (let i = 0;i<limit;i++){
                            processIng.push(dataArr.shift());
                        }
                        dbInfoList = dataArr;
                        this.processMessageData(processIng,1);
                    }else{
                        this.setState({
                            hasCache:false
                        });
                        this.processMessageData(dataArr,1);
                    }
                    this.setState({isLoadingEarlier:false});
                })
            },
            null,
            null,
        );
    }

    utcTime(time){
        //2018-04-17 2:19:51
        if (time !== undefined) {
            let timeArr = time.split(" "),
                year = timeArr[0].split("-"),
                hour = timeArr[1].split(":"),
                date = new Date(Date.UTC(parseInt(year[0]), parseInt(year[1])-1, parseInt(year[2]), hour[0], hour[1], hour[2]));
            return date.toUTCString();
        }
    }

    onSend(messages = []) {
        let text = messages[0].text;
        this.socket.emit("groupChat",uid,MeetId,text);
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages[0]),
        }))
    }

}