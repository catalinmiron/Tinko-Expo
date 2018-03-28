import React, {
    Component
} from 'react'
import {
    StyleSheet,View,WebView
} from 'react-native'
import { List, ListItem } from 'react-native-elements'
import Expo, { SQLite } from 'expo';
import * as firebase from "firebase";
const db = SQLite.openDatabase('db.db');

require("firebase/firestore");
import SocketIOClient from 'socket.io-client';
import {
    StackNavigator
} from 'react-navigation';
import PrivateChatScreen from './common/PrivateChatScreen';

let friendList = [];
let uid = "";
let lastUpdateArr = [],
    personalInfo = {},
    alreadyInList = [];

let chatInfo = new Stack();

//personalInfo[dataArr[i].userId] = [dataArr[i].avatarUrl,dataArr[i].username];
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
            if (type === 1){
                //私聊
                let data = personalInfo[id];
                let imageURL =  (data[0]!==undefined)?data[0]:"http://larissayuan.com/home/img/prisma.png",
                    personName = (data[1]!==undefined)?data[1]:"Private Chat";
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
                    personName :"Group Chat",
                }
            }
            this.dataStore.unshift(rtnData);
        }
        return this.dataStore;
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


class TinkoWebView extends Component {
    render() {
        return (
            <WebView
                source={{uri: 'https://github.com/facebook/react-native'}}
            />
        );
    }
}

class FriendChatListView extends Component {
    constructor(){
        super();
        let user = firebase.auth().currentUser;
        uid = user.uid;
        // this.socket = SocketIOClient('http://47.89.187.42:3000/');
        this.socket = SocketIOClient('http://127.0.0.1:3000/');
        setTimeout(() => {
            this.socket.emit("joinANewMeet",4,uid);
        },3000);
        this.getAvatar();
        this.getDBData();
        this.state = {
            messages: [],
            friendInfo:[]
        };
        this.socket.on("connect" + uid,msg=>{
            let data = JSON.parse(msg);
            console.log(data);
            let type = data.type;
            if (parseInt(type) === 0){
                //系统

            }else if (parseInt(type)===1){
                //私聊         
                chatInfo.appendData([type,data.from,data.message]);
            }else{
                chatInfo.appendData([type,data.activityId,data.message]);
            }
            this.setState({
                messages:chatInfo.getData()
            });
        });
    }

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

    getDBData(){
        db.transaction(
            tx => {
                tx.executeSql('select * from db'+uid, [], (_, { rows }) => {
                    let dataArr =  rows['_array'];
                    for (let i = dataArr.length-1;i>0;i--){
                        let type = dataArr[i].type;
                        if (type === 1){
                            chatInfo.appendData([type,dataArr[i].fromId,dataArr[i]['msg']]);
                        }else{
                            chatInfo.appendData([type,dataArr[i].meetingId,dataArr[i]['msg']]);
                        }
                    }
                    this.setState({
                        messages:chatInfo.getData()
                    });
                });
            },
            null,
            this.update
        )
    }


    render() {
        let friendList = [];
        if (this.state.messages.length!==0){
            for (let i = 0;i<this.state.messages.length ; i++){
                let messages = this.state.messages[i];
                friendList.push(
                    <ListItem
                        roundAvatar
                        avatar={{uri:messages.imageURL}}
                        key={messages.id}
                        title={messages.personName}
                        subtitle={messages.msg}
                        onPress={() => this.props.navigation.navigate('PrivateChatPage', {
                            avatar:messages.imageURL,
                            name:messages.personName,
                            personId:messages.id,
                            myId:uid
                        })}
                    />
                )
            }

        }
        return (
            <View>
                <List>
                    {friendList}
                </List>
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

export default StackNavigator({
    FriendChatListView: {
        screen: FriendChatListView
    },
    TinkoWebView:{
        screen: TinkoWebView,
        navigationOptions: {
            tabBarVisible: false
        }
    }

},{
    initialRouteName: 'FriendChatListView',
});