import React, {
    Component
} from 'react'
import {
    StyleSheet,View,WebView,ScrollView, Text,DeviceEventEmitter
} from 'react-native'
import { ListItem, Header } from 'react-native-elements'
import Expo, { SQLite } from 'expo';
const db = SQLite.openDatabase('db.db');
import * as firebase from "firebase";
import IconBadge from '../../modules/react-native-icon-badge'
import {Ionicons} from '@expo/vector-icons'

require("firebase/firestore");
import SocketIOClient from 'socket.io-client';
import {
    StackNavigator
} from 'react-navigation';
import PrivateChatScreen from './common/PrivateChatScreen';
import GroupChatScreen from './common/GroupChatScreen';
import Colors from "../../constants/Colors";
import TinkoScreen from "./TinkoScreen";
import {getMeetTitle, getUserDataFromDatabase} from "../../modules/CommonUtility";
import {appendChatData,updateUserInfo,updateMeets,getLength,getData,updateUnReadNum,setUid,getTotalUnReadNum} from "../../modules/ChatStack";


import {quitMeet} from "../../modules/SocketClient";
import {ifIphoneX} from "react-native-iphone-x-helper";

let friendList = [],
    uid = "",
    lastUpdateArr = [],
    personalInfo = {},
    alreadyInList = [],
    currentOnSelectId = "",
    totalUnReadMessageNum = 0,
    getPrivateHistory = false,
    getMeetsHistory = false;

export default class FriendChatListView extends Component {

    constructor(){
        super();
        let user = firebase.auth().currentUser;
        uid = user.uid;
        setUid(uid);
        this.socket = SocketIOClient('http://47.89.187.42:4000/');
        this.getAvatar();
        this.getDBData();
        this.state = {
            messages: [],
            friendInfo:[],
            totalUnReadMessageNum:0
        };
        this.initSocket();
        this.listener =DeviceEventEmitter.addListener('updateUnReadNum',(param)=>{
            getLength(param.id);
            currentOnSelectId = "";
            totalUnReadMessageNum = getTotalUnReadNum();
            this.totalUnreadMessageNumChanged(getTotalUnReadNum());
        });
        this.selectListener =DeviceEventEmitter.addListener('updateCurrentOnSelectUser',(param)=>{
            currentOnSelectId = param.id;
        });
    }

    componentWillUnmount(){
        this.listener.remove();
        this.selectListener.remove();
    }

    initSocket(){
        this.socket.emit("userLogin",uid);
        this.socket.on("connect" + uid,msg=>{
            let data = JSON.parse(msg),
                type = data.type;
            if (type === 3 && !getPrivateHistory){
                getPrivateHistory = true;
                if (data.message){
                    let unReadDataArr = data.message;
                    for (let i in unReadDataArr){
                        let dataArr =  unReadDataArr[i],
                            sqlObj = {
                                type :1,
                                from : dataArr.fromId,
                                message : dataArr.msg,
                                time : dataArr.time
                            };
                        if (dataArr!==""){
                            this.insertChatSql(uid,sqlObj);
                            appendChatData(type,dataArr.fromId,dataArr.msg,true);
                            if (!personalInfo[dataArr.fromId]){
                                this.upDateAvatar(dataArr.fromId);
                            }
                        }
                    }

                    this.setState({
                        messages:getData()
                    });
                }
            }else if (type === 4 && !getMeetsHistory){
                getMeetsHistory = true;
                if (data.message.length){
                    if (data.message.length!==0){
                        let unReadDataArr = data.message;
                        for (let i in unReadDataArr){
                            let dataArr =  unReadDataArr[i],
                                sqlObj = {
                                    type :2,
                                    from : dataArr.fromId,
                                    message : dataArr.msg,
                                    time : dataArr.time,
                                    meetId:dataArr.meetId,
                                    meetUserData:dataArr.data
                                };
                            this.insertChatSql(uid,sqlObj);
                            appendChatData(type,dataArr.meetId,dataArr.msg,true);
                        }
                        this.setState({
                            messages:getData()
                        });
                    }
                }
            }else{
                console.log(data.message);
            }
            if (type !== 3 && type !== 4){
                this.insertChatSql(uid,data);
                if (parseInt(type) === 0){
                    //系统
                    appendChatData(type,data.activityId,data.message,true);
                }else if (parseInt(type)===1){
                    //私聊
                    appendChatData(type,data.from,data.message,true);
                }else{
                    appendChatData(type,data.activityId,data.message,true);
                }
                this.setState({
                    messages:getData()
                });
            }
            this.totalUnreadMessageNumChanged(totalUnReadMessageNum);
        });
        this.socket.on("mySendBox"+uid,msg=>{
            let data = JSON.parse(msg);
            let type = data.type;
            if (parseInt(type) === 0){
                //系统
                appendChatData(type,data.activityId,data.message);
            }else if (parseInt(type)===1){
                //私聊
                appendChatData(type,data.toId,data.msg);
            }else if (parseInt(type) === 999){
                appendChatData(1,data.requester,data.msg);
            }else{
                appendChatData(type,data.activityId,data.message);
            }
            this.setState({
                messages:getData()
            });
        })
    }


    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {

            title: 'Message',

            tabBarIcon: ({tintColor, focused}) =>
                <IconBadge
                    MainElement={
                        <View style={{
                            height: 36, width: 36, alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Ionicons
                                name={focused ? 'ios-chatbubbles' : 'ios-chatbubbles-outline'}
                                size={30}
                                style={{marginBottom: -3}}
                                color={focused ? Colors.tabIconSelected : Colors.tabIconDefault}
                            />
                        </View>

                    }
                    BadgeElement={
                        <Text style={{color: '#FFFFFF'}}>{params.totalUnReadMessageNum}</Text>
                    }
                    IconBadgeStyle={
                        {width: 20, height: 20, backgroundColor: 'red'}
                    }
                    Hidden={!params.totalUnReadMessageNum>0}
                />,


            // headerTitle: (<Text>Message</Text>),
            header:null
        }

    };

    totalUnreadMessageNumChanged(num){
        // this.setState({
        //     totalUnReadMessageNum:num
        // });
        this.props.navigation.setParams({totalUnReadMessageNum:num});
    }


    //处理时间
    unixTime(timeStamp) {
        let date = new Date(timeStamp);
        Y = date.getFullYear() + '-';
        M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
        D = date.getDate() + ' ';
        h = date.getHours() + ':';
        m = date.getMinutes() + ':';
        s = date.getSeconds();
        return (Y+M+D+h+m+s);
    };

    getAvatar(){
        db.transaction(
            tx => {
                tx.executeSql('select * from friend_list'+uid, [], (_, { rows }) => {
                    let dataArr =  rows['_array'];
                    for (let i = 0;i<dataArr.length;i++){
                        personalInfo[dataArr[i].userId] = [dataArr[i].avatarUrl,dataArr[i].username];
                    }
                    this.setState({
                        friendInfo:personalInfo
                    });
                });
            },
            null,
            null
        );
    }

    insertChatSql(uid,data){
        let type = data["type"],
            message = data["message"],
            from = data["from"],
            meetingId = "",
            userData = "",
            time = "",
            status = 0,
            readStatus = (currentOnSelectId === from)?0:1;
        if (data["time"]){
            time = this.unixTime(data["time"]);
        }
        if (data["meetId"]!==undefined){
            meetingId = data["meetId"];
            readStatus = (currentOnSelectId === meetingId)?0:1;
        }else if (data["activityId"]!==undefined){
            meetingId = data["activityId"];
        }
        if (data["meetUserData"]!==undefined){
            userData = data["meetUserData"];
        }
        if (data["userData"]!==undefined){
            userData = JSON.stringify(data["userData"]);
        }
        if (readStatus === 1){
            totalUnReadMessageNum ++;
            this.totalUnreadMessageNumChanged(totalUnReadMessageNum);
        }
        let sqlStr = "",
            sqlParams = [];
        if (time === ""){
            sqlStr = "INSERT INTO db"+uid+" (fromId,msg,status,type,meetingId,meetUserData,hasRead) VALUES (?,?,?,?,?,?,?)";
            sqlParams =[from,message,status,type,meetingId,userData,readStatus];
        }else{
            sqlStr = "INSERT INTO db"+uid+" (fromId,msg,status,type,meetingId,meetUserData,timeStamp,hasRead) VALUES (?,?,?,?,?,?,?,?)";
            sqlParams =[from,message,status,type,meetingId,userData,time,readStatus];
        }
        db.transaction(
            tx => {
                tx.executeSql(sqlStr,sqlParams);
            },
            (error) => console.log("db insert chat error :" + error),
            null
        );
    }

    getDBData(){
        db.transaction(
            tx => {
                tx.executeSql('select * from db'+uid, [], (_, { rows }) => {
                    let dataArr =  rows['_array'];
                    for (let i = 0;i < dataArr.length ;i++){
                        let type = dataArr[i].type;
                        if (dataArr[i].hasRead === 1){
                            totalUnReadMessageNum ++;
                        }
                        let hasRead = (dataArr[i].hasRead === 1);
                        if (type === 1){
                            if (hasRead){
                                appendChatData(type,dataArr[i].fromId,dataArr[i]['msg'],hasRead);
                            }else{
                                appendChatData(type,dataArr[i].fromId,dataArr[i]['msg']);
                            }
                        }else{
                            if (hasRead){
                                appendChatData(type,dataArr[i].meetingId,dataArr[i]['msg'],hasRead);
                            }else{
                                appendChatData(type,dataArr[i].meetingId,dataArr[i]['msg']);
                            }
                        }
                    }
                    this.totalUnreadMessageNumChanged(totalUnReadMessageNum);
                    let chat = getData();
                    for (element in chat){
                        let ele = chat[element];
                        if (ele.imageURL === "http://larissayuan.com/home/img/prisma.png"&&(ele.type === 1||ele.type ===3)){
                            this.upDateAvatar(ele.id);
                        }else if (ele.imageURL === "http://larissayuan.com/home/img/prisma.png"&&(ele.type === 2||ele.type ===4)){
                            this.getMeetsName(ele.id);
                        }
                    }
                    this.setState({
                        messages:getData()
                    });
                });
            },
            (error) => console.log("聊天获取 :" + error),
            () => {
                console.log('聊天数据获取成功');
            }
        )
    }

    async upDateAvatar(id){
        await getUserDataFromDatabase(id,
            (userData) => {
                updateUserInfo(userData);
                this.setState({
                    messages:getData()
                });

            },
            (error) => {
                console.log(error);
            });
    }

    async getMeetsName(id){
        await getMeetTitle(id,
            (title)=>{
                updateMeets({
                    name:title,
                    id:id
                });
                this.setState({
                    messages:getData()
                });
            },
            (error) => {
                console.log(error);
            });
    }

    render() {
        let friendList = [];
        if (this.state.messages.length!==0){
            for (let i = 0;i<this.state.messages.length ; i++){
                let messages = this.state.messages[i];
                friendList.push(
                    <ListItem
                        leftAvatar={{ rounded: true, source: { uri: messages.imageURL } }}
                        key={messages.id}
                        title={messages.personName}
                        titleProps={{numberOfLines:1}}
                        subtitle={messages.msg}
                        subtitleProps={{numberOfLines:1}}
                        badge={
                            { value: messages.length, textStyle: { color: 'orange' }, containerStyle: { marginTop: -20 } }
                        }
                        onPress={() => {
                            currentOnSelectId = messages.id;
                                 if (messages.type === 1){
                                     updateUnReadNum(1,messages.id);
                                     // totalUnReadMessageNum = totalUnReadMessageNum - getLength(messages.id);
                                     // this.totalUnreadMessageNumChanged(totalUnReadMessageNum);
                                     this.props.navigation.navigate('PrivateChatPage', {
                                         avatar:messages.imageURL,
                                         name:messages.personName,
                                         personId:messages.id,
                                         myId:uid
                                     });
                                 }else{
                                     updateUnReadNum(2,messages.id);
                                     // totalUnReadMessageNum = totalUnReadMessageNum - getLength(messages.id);
                                     // this.totalUnreadMessageNumChanged(totalUnReadMessageNum);
                                     this.props.navigation.navigate('GroupChatPage', {
                                         avatar:messages.imageURL,
                                         name:messages.personName,
                                         personId:messages.id,
                                         myId:uid
                                     })
                                 }
                            }
                        }
                    />
                )
            }

        }
        return (
            <View style={{flex:1}}>
                <Header
                    centerComponent={{ text: 'Message', style: { fontSize:18, fontFamily:'regular', color: '#fff' } }}
                    outerContainerStyles={ifIphoneX({height:88})}
                />
                <ScrollView>
                    {friendList}
                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create(
    {
        separator:
            {
                height: 2,
                backgroundColor: 'rgba(0,0,0,0.5)',
                width: '100%'
            },

        text:
            {
                fontSize: 18,
                color: 'black',
                padding: 15
            },
        subtitleView: {
            flexDirection: 'row',
            paddingLeft: 10,
            paddingTop: 5
        },
        ratingImage: {
            height: 19.21,
            width: 100
        },
        ratingText: {
            paddingLeft: 10,
            color: 'grey'
        }
    });
