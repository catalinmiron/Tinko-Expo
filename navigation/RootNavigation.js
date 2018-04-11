import { Notifications, SQLite } from 'expo';
const db = SQLite.openDatabase('db.db');

import React from 'react';
import { StyleSheet, SafeAreaView,View,Text } from 'react-native';
import { StackNavigator } from 'react-navigation';

import MainTabNavigator from './MainTabNavigator';
import LoginNavigator from './LoginNavigaor';
import registerForPushNotificationsAsync from '../api/registerForPushNotificationsAsync';
import * as firebase from "firebase";
import SocketIOClient from 'socket.io-client';
import 'firebase/firestore';
import UserDetailOverlay from '../screens/main/common/UserDetailOverlay'
import {initNewFriendsRequestTable, insertNewFriendsRequest} from "../modules/SqliteClient";

let getPrivateHistory = false,
    getMeetsHistory = false;


export default class RootNavigator extends React.Component {
    constructor(props){
        super(props);
        this.state={
            userUid:''
        }
        //console.log(props);
    }

    componentDidMount() {
    this._notificationSubscription = this._registerForPushNotifications();
        if(this.props.loggedIn){
            this.loggedInSetup();
        }
  }

  componentWillUnmount() {
    this._notificationSubscription && this._notificationSubscription.remove();
  }

  loggedInSetup(){
      let user = firebase.auth().currentUser;
      let uid = user.uid;
      this.setState({userUid:uid})
      // 测试时才用drop
      //this.dropChatTable(uid);
      this.initChatTable(uid);
      //this.dropFriendsTable(uid);
      this.initFriendsTable(uid);
      this.dropMeetingTable(uid);
      this.initMeetingTable(uid);
      initNewFriendsRequestTable(uid);

      this.socket = SocketIOClient('http://47.89.187.42:4000/');
      this.socket.emit("userLogin",uid);
      this.socket.on("connect" + uid,msg=>{
          let data = JSON.parse(msg),
              type = data.type;
          //3代表未读私聊
          if (type === 3 && !getPrivateHistory){
              getPrivateHistory = true;
          }else if (type === 4 && !getMeetsHistory){
              getMeetsHistory = true;
          }else{
              this.insertChatSql(uid,data);
          }
      });
      this.socket.on("mySendBox"+uid,msg=>{
          let data = JSON.parse(msg);
          this.insertChatSql(uid,data,0);
      });
      this.socket.on("systemListener"+uid,msg=>{
          this.getFriendRequestInfo(JSON.parse(msg))
      });



      let meetRef = firebase.firestore().collection("Meets").where(`participatingUsersList.${uid}.status`, "==", true);
      meetRef.get().then((querySnapshot)=>{
          for (let i = 0;i<querySnapshot.docs.length;i++){
              this.insertMeetingId(uid,querySnapshot.docs[i]);
          }
      }).catch((error) => {
          console.log("Error getting documents: ", error);
      });
  }

  render() {
        if(this.props.loggedIn){
            return (
                <View style={{flex:1}}>
                    <MainTabNavigator
                        screenProps={{
                            friendsListIsReady:this.friendsListIsReady.bind(this),
                            showThisUser:this.showThisUser.bind(this),
                            meRef:ref => this.meRef = ref,
                        }}/>
                    <UserDetailOverlay
                        onRef={ref => this.userDetailOverlay = ref}
                        isVisible={false}
                    />
                </View>)


        } else {
            return <LoginNavigator screenProps={this.props}/>
        }
      //return <RootStackNavigator/>;
  }

  showThisUser(uid, navigation){
        this.userDetailOverlay.showThisUser(uid, navigation);
  }


    dropChatTable(uid){
        db.transaction(
            tx => {
                tx.executeSql('drop table if exists db'+ uid);
            },
            (error) => console.log("db drop :" + error),
            () => {
                console.log('db complete');
            }
        );
    }

    dropFriendsTable(uid){
        db.transaction(
            tx => {
                tx.executeSql('drop table if exists friend_list'+ uid);
            },
            null,
            null
        );
    }


    initFriendsTable(uid){
        db.transaction(
            tx => {
                tx.executeSql('create table if not exists friend_list'+ uid +' (' +
                    'id integer primary key not null , ' +
                    'userId text UNIQUE, avatarUrl text , ' +
                    'username text, ' +
                    'location text,' +
                    'gender text);');
            },
            (error) => console.log("friendList :" + error),
            () => {
                console.log('friend_list complete');
            }
        );
    }



    dropMeetingTable(uid){
        db.transaction(
            tx => {
                tx.executeSql('drop table if exists meeting'+ uid);
            },
            (error) => console.log("meeting drop :" + error),
            () => {
                console.log('meeting complete');
            }
        );
    }

    initMeetingTable(uid){
        db.transaction(
            tx => {
                //tx.executeSql('create table if not exists friend_list'+uid+' (id integer primary key not null , userId text UNIQUE, avatarUrl text, username text, location text, gender text)');
                tx.executeSql('create table if not exists meeting'+ uid + "(" +
                    "id integer primary key not null ," +
                    "meetingId text UNIQUE, " +
                    "creator text, " +
                    "endTime text, " +
                    "address text, " +
                    "tagList text, " +
                    "description text, " +
                    "title text)");
            },
            (error) => console.log("meeting :" + error),
            () => {
                console.log('meeting complete');
            }
        );
    }

    insertMeetingId(uid,dataSource){
        let data = dataSource.data(),
            title = data.title,
            meetingId = dataSource.id,
            description = data.description,
            tag = JSON.stringify(data.tagList),
            place = data.place.name,
            endTime = data.endTime.toString(),
            creator = data.creator;
        db.transaction(
            tx => {
                tx.executeSql("INSERT INTO meeting"+uid+"(meetingId,creator,endTime,address,tagList,description,title) VALUES (?,?,?,?,?,?,?)",
                    [meetingId,creator,endTime,place,tag,description,title]);
            },
            (error) => console.log("meeting insert:" + error),
            null,
            () => {
                console.log('insert meeting complete');
            }
        );
    }

    //status -1带表自己发送的
    initChatTable(uid){
        db.transaction(
            tx => {
                tx.executeSql('create table if not exists db'+ uid +' (' +
                    'id integer primary key not null , ' +
                    'fromId text, msg text , ' +
                    'status int, ' +
                    'type int,' +
                    'meetingId text, '+
                    'meetUserData text,'+
                    'timeStamp DATETIME DEFAULT CURRENT_TIMESTAMP);');
            },
            (error) => console.log("db insert:" + error),
            () => {
                console.log('db insert complete');
            }
        );
    }

    //type 1 ="privateChat"
    //type 2 ="groupChat"
    //status 1 = "response"
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
        //console.log("INSERT INTO db"+uid+" (fromId,msg,status,type,meetingId,meetUserData) VALUES (?,?,?,?,?,?)",[from,message,status,type,meetingId,userData]);
        db.transaction(
            tx => {
                tx.executeSql("INSERT INTO db"+uid+" (fromId,msg,status,type,meetingId,meetUserData) VALUES (?,?,?,?,?,?)",[from,message,status,type,meetingId,userData]);
            },
            null,
            this.update
        );
    }

    //type 0 = "发送好友请求"
    //     2 = "facebook好友确认"
    //     1 = "普通的好友确认" 比如a给b发送了请求 b确认了 就发送这个
    //     -1 = "确认了这个请求" 比如a给b发送了请求 b拒绝了 就发送这个
    sendFriendRequest(requester,responser,type,msg){
        console.log('+++++++++++++++++++++++++++++++++++++++++++++sendFriendRequest');
        this.socket.emit("NewFriendRequest",JSON.stringify({
            requester:requester,
            responser:responser,
            type:type,
            msg:msg
        }));
    }

    getFriendRequestInfo(data){
        //data.msg 代表想说的话
        console.log("===================getFriendRequest",data);
        //console.log(this.meRef);
        if (data.type === 0){
            //data.requester 发送了好友请求
            insertNewFriendsRequest(this.state.userUid, data);
            this.meRef.showBadge();
        }else if (data.type === -1){
            //data.requester 拒绝了好友请求
        }else if (data.type === 1){
            //data.requester 接受了好友请求
        }else if (data.type === 2){
            //facebook自动确认了好友 好友id = data.requester
        }
    }

    friendsListIsReady(){
        console.log('Root Navigator: friendsListIsReady');
    }

  _registerForPushNotifications() {
    // Send our push token over to our backend so we can receive notifications
    // You can comment the following line out if you want to stop receiving
    // a notification every time you open the app. Check out the source
    // for this function in api/registerForPushNotificationsAsync.js
    registerForPushNotificationsAsync();

    // Watch for incoming notifications
    this._notificationSubscription = Notifications.addListener(this._handleNotification);
  }

  _handleNotification = ({ origin, data }) => {
    console.log(`Push notification ${origin} with data: ${JSON.stringify(data)}`);
  };
}