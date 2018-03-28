import { Notifications, SQLite } from 'expo';
const db = SQLite.openDatabase('db.db');

import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { StackNavigator } from 'react-navigation';

import MainTabNavigator from './MainTabNavigator';
import LoginNavigator from './LoginNavigaor';
import registerForPushNotificationsAsync from '../api/registerForPushNotificationsAsync';
import * as firebase from "firebase";
import SocketIOClient from 'socket.io-client';
import 'firebase/firestore';
import { Font } from 'expo'


export default class RootNavigator extends React.Component {
    constructor(props){
        super(props);
        //console.log(props);
    }

    componentDidMount() {
    this._notificationSubscription = this._registerForPushNotifications();
  }

  componentWillUnmount() {
    this._notificationSubscription && this._notificationSubscription.remove();
  }


  render() {
        if(this.props.loggedIn){
            let user = firebase.auth().currentUser;
            let uid = user.uid;
            // 测试时才用drop
            //this.dropChatTable(uid);
            //this.dropMeetingTable(uid);
            this.initMeetingTable(uid);
            this.initChatTable(uid);
            this.socket = SocketIOClient('http://47.89.187.42:3000/');
            // this.socket = SocketIOClient('http://127.0.0.1:3000/');
            this.socket.emit("userLogin",uid);
            this.socket.emit("attendActivity",uid,[1,2,3]);
            this.socket.on("connect" + uid,msg=>{
                let data = JSON.parse(msg);
                this.insertChatSql(uid,data);
            });
            this.socket.on("system",function (msg) {
            });
            let firebaseDb = firebase.firestore();
            let docRef = firebaseDb.collection("Users").doc(uid).collection("Friends_List");
            docRef.get().then((querySnapshot)=>{
                this.dropFriendTable(uid);
                this.initFriendTable(uid);
                querySnapshot.forEach((doc)=>{
                    let friendUid = doc.data().uid;
                    //console.log(friendUid);
                    firebaseDb.collection("Users").doc(friendUid).get()
                        .then((doc) => {
                            let mapping = {
                                avatar:doc.data().photoURL,
                                key:doc.data().uid,
                                title:doc.data().username
                            };
                            this.insertFriendSql(uid,mapping.key,mapping.avatar,mapping.title);
                        }).catch((error) => {
                            console.log("Error getting document: ", error);
                    })
                });
            }).catch((error) => {
                console.log("Error getting documents: ", error);
            });

            let meetRef = firebaseDb.collection("Meets").where(`participatingUsersList.${uid}.status`, "==", true);
            meetRef.get().then((querySnapshot)=>{
                for (let i = 0;i<querySnapshot.docs.length;i++){
                    this.insertMeetingId(uid,querySnapshot.docs[i]);
                }
            }).catch((error) => {
                console.log("Error getting documents: ", error);
            });

            return <MainTabNavigator/>
        } else {
            return <LoginNavigator screenProps={this.props}/>
        }
      //return <RootStackNavigator/>;
  }

    dropChatTable(uid){
        db.transaction(
            tx => {
                tx.executeSql('drop table db'+ uid);
            },
            null,
            this.update
        );
    }


    dropMeetingTable(uid){
        db.transaction(
            tx => {
                tx.executeSql('drop table meeting'+ uid);
            },
            null,
            this.update
        );
    }

    initMeetingTable(uid){
        db.transaction(
            tx => {
                tx.executeSql('create table if not exists meeting'+ uid + "(id integer primary key not null ,meetingId text UNIQUE, creator text, endTime text, address text, tagList text, description text, title text)");
            },
            null,
            this.update
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
        console.log("INSERT INTO meeting"+uid+"(meetingId,creator,endTime,address,tagList,description,title) VALUES ("+meetingId+","+creator+","+endTime+","+place+","+tag+","+description+","+title+")");
        db.transaction(
            tx => {
                tx.executeSql("INSERT INTO meeting"+uid+"(meetingId,creator,endTime,address,tagList,description,title) VALUES (?,?,?,?,?,?,?)",
                    [meetingId,creator,endTime,place,tag,description,title]);
            },
            null,
            this.update
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
                    'meetingId text'+
                    'timeStamp DATETIME DEFAULT CURRENT_TIMESTAMP);');
            },
            null,
            this.update
        );
    }

    //type 1 ="privateChat"
    //type 2 ="groupChat"
    //status 1 = "response"
    insertChatSql(uid,data){
        let type = data["type"],
            message = data["message"],
            from = data["from"],
            meetingId = "";
        if (data["activityId"]!==undefined){
            meetingId = data["activityId"];
        }
        db.transaction(
            tx => {
                tx.executeSql("INSERT INTO db"+uid+"(fromId,msg,status,type,meetingId) VALUES (?,?,?,?,?)",[from,message,0,type,meetingId]);
            },
            null,
            this.update
        );
    }

    dropFriendTable(uid){
        db.transaction(
            tx => {
                tx.executeSql('drop table friend_list'+uid);
            },
            null,
            this.update
        );
    }

    initFriendTable(uid){
        db.transaction(
            tx => {
                tx.executeSql('create table if not exists friend_list'+uid+' (id integer primary key not null , userId text UNIQUE, avatarUrl text , username text);');
            },
            null,
            this.update
        );
    }

    insertFriendSql(uid,friendId,avatarUrl,friendName){
        db.transaction(
            tx => {
                tx.executeSql('insert into friend_list'+uid+' (userId,avatarUrl,username) values (?,?,?)',[friendId,avatarUrl,friendName]);
            },
            null,
            this.update
        );
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

