import React, {
    Component
} from 'react'
import {
    StyleSheet,View,WebView,ScrollView, Text
} from 'react-native'
import { ListItem, Header } from 'react-native-elements'
import Expo, { SQLite } from 'expo';
import * as firebase from "firebase";
const db = SQLite.openDatabase('db.db');
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

let friendList = [];
let uid = "";
let lastUpdateArr = [],
    personalInfo = {},
    alreadyInList = [];

let chatInfo = new Stack();

let getPrivateHistory = false,
    getMeetsHistory = false;


function Stack() {
    this.dataStore = [];
    this.appendData = function ([type,id,msg]) {
        let arr = [];
        for (let i = 0;i<this.dataStore.length;i++){
            arr.push(this.dataStore[i].id);
        }
        let indexOf = arr.indexOf(id);
        if (indexOf !== -1){
            this.dataStore[indexOf].msg = msg;
            let data = this.dataStore[indexOf];
            this.dataStore.splice(indexOf,1);
            this.dataStore.unshift(data);
        }else{
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
                    msg:msg,
                    imageURL:imageURL,
                    personName:personName
                }
            }else{
                //群聊
                rtnData = {
                    id:id,
                    type:2,
                    msg:msg,
                    imageURL:"http://larissayuan.com/home/img/prisma.png",
                    personName :id,
                }
            }
            this.dataStore.unshift(rtnData);
        }
        return this.dataStore;
    };
    this.updateUserInfo = function (data) {
        let uid = data.uid;
        for (element in this.dataStore){
            let ele = this.dataStore[element];
            if (ele.id === uid){
                ele.imageURL = data.photoURL;
                ele.personName = data.username
            }
        }
        console.log("update");
    };
    this.getData = function () {
        return this.dataStore;
    }
}

class ChatPage extends Component{
    static navigationOptions = ({navigation}) => ({
        title: `${navigation.state.params.name}`,
    });
    render() {
        const { params } = this.props.navigation.state;
        let avatar = params.avatar,
            personId = params.personId,
            myId = params.myId,
            name = params.name;
        return (
            <PrivateChatScreen avatar={avatar} personId={personId} myId = {myId} name={name}/>
        )
    }
}




export default class FriendChatListView extends Component {
    constructor(){
        super();
        let user = firebase.auth().currentUser;
        uid = user.uid;
        this.socket = SocketIOClient('http://47.89.187.42:4000/');
        this.getAvatar();
        this.getDBData();
        this.state = {
            messages: [],
            friendInfo:[]
        };
        this.socket.emit("userLogin",uid);
        // this.socket.emit("NewFriendRequest",JSON.stringify({
        //     requester:uid,
        //     responser:uid,
        //     type:1,
        //     msg:"???"
        // }));
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
                            chatInfo.appendData([type,dataArr.fromId,dataArr.msg]);
                            if (!personalInfo[dataArr.fromId]){
                                this.upDateAvatar(dataArr.fromId);
                            }
                        }
                    }

                    this.setState({
                        messages:chatInfo.getData()
                    });
                }
            }else if (type === 4 && !getMeetsHistory){
                getMeetsHistory = true;
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
                        chatInfo.appendData([type,dataArr.meetId,dataArr.msg]);
                    }
                    this.setState({
                        messages:chatInfo.getData()
                    });
                }
            }
            if (type !== 3 && type !== 4){
                this.insertChatSql(uid,data);
                if (parseInt(type) === 0){
                    //系统
                    chatInfo.appendData([type,data.activityId,data.message]);
                }else if (parseInt(type)===1){
                    //私聊
                    chatInfo.appendData([type,data.from,data.message]);
                }else{
                    chatInfo.appendData([type,data.activityId,data.message]);
                }
                this.setState({
                    messages:chatInfo.getData()
                });
            }
        });
        this.socket.on("mySendBox"+uid,msg=>{
            let data = JSON.parse(msg);
            console.log("mySendBox:",data);
            let type = data.type;
            if (parseInt(type) === 0){
                //系统
                chatInfo.appendData([type,data.activityId,data.message]);
            }else if (parseInt(type)===1){
                //私聊
                chatInfo.appendData([type,data.from,data.message]);
            }else if (parseInt(type) === 999){
                chatInfo.appendData([1,data.requester,data.msg]);
                this.upDateAvatar(data.requester);
            }else{
                chatInfo.appendData([type,data.activityId,data.message]);
            }
            this.setState({
                messages:chatInfo.getData()
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
                            height: 30, width: 30, alignItems: 'center',
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
                        <Text style={{color: '#FFFFFF'}}>{''}</Text>
                    }
                    IconBadgeStyle={
                        {width: 10, height: 10, backgroundColor: 'red'}
                    }
                    Hidden={true}
                />,


            // headerTitle: (<Text>Message</Text>),
            header:null
        }

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
            this.update
        );
    }

    insertChatSql(uid,data,isSend){
        let type = data["type"],
            message = data["message"],
            from = data["from"],
            meetingId = "",
            userData = "",
            status = (isSend === undefined)?0:1;
        if (status === 1){
            console.log("这里是发送啦");
        }
        if (data["meetId"]!==undefined){
            meetingId = data["meetId"];
        }else if (data["activityId"]!==undefined){
            meetingId = data["activityId"];
        }
        if (data["meetUserData"]!==undefined){
            userData = data["meetUserData"];
        }
        if (data["userData"]!==undefined){
            userData = JSON.stringify(data["userData"]);
        }
        db.transaction(
            tx => {
                tx.executeSql("INSERT INTO db"+uid+" (fromId,msg,status,type,meetingId,meetUserData) VALUES (?,?,?,?,?,?)",[from,message,status,type,meetingId,userData]);
            },
            null,
            null
        );
    }

    getDBData(){
        db.transaction(
            tx => {
                tx.executeSql('select * from db'+uid, [], (_, { rows }) => {
                    let dataArr =  rows['_array'];
                    console.log("???=====???",dataArr);
                    for (let i = 0;i < dataArr.length ;i++){
                        let type = dataArr[i].type;
                        if (type === 1){
                            chatInfo.appendData([type,dataArr[i].fromId,dataArr[i]['msg']]);
                        }else{
                            chatInfo.appendData([type,dataArr[i].meetingId,dataArr[i]['msg']]);
                        }
                    }
                    let chat = chatInfo.getData();
                    for (element in chat){
                        let ele = chat[element];
                        if (ele.imageURL === "http://larissayuan.com/home/img/prisma.png"&&(ele.type === 1||ele.type ===3)){
                            this.upDateAvatar(ele.id);
                        }
                    }
                    this.setState({
                        messages:chatInfo.getData()
                    });
                });
            },
            null,
            () => {
                console.log('聊天数据插入成功');
            }
        )
    }

    upDateAvatar(id){
        let docRef = firebase.firestore().collection("Users").doc(id);
        let getDoc = docRef.get().then(
            doc =>{
                if (!doc.exists){
                    console.log("no data");
                }else{
                    chatInfo.updateUserInfo(doc.data());
                    this.setState({
                        messages:chatInfo.getData()
                    });
                }
            }
        ).catch(err => {
            console.log("ERROR: ",err);
        })
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
                        subtitle={messages.msg}
                        onPress={() => {
                                 if (messages.type === 1){
                                     this.props.navigation.navigate('PrivateChatPage', {
                                         avatar:messages.imageURL,
                                         name:messages.personName,
                                         personId:messages.id,
                                         myId:uid
                                     })
                                 }else{
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
                    centerComponent={{ text: 'Message', style: { color: '#fff' } }}
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
