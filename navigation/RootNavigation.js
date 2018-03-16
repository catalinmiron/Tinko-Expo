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
require("firebase/firestore");


export default class RootNavigator extends React.Component {
    constructor(props){
        super(props);
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
            let uid = user.providerData[0].uid;
            // 测试时才用drop
            //this.dropChatTable(uid);
            this.initChatTable(uid);
            this.socket = SocketIOClient('http://47.89.187.42:3000/');
            this.socket.emit("userLogin",uid);
            this.socket.emit("attendActivity",uid,[1,2,3]);
            this.socket.on("connect" + uid,msg=>{
                let data = JSON.parse(msg);
                this.insertChatSql(uid,data.from,data.message);
            });
            this.socket.on("system",function (msg) {
            });
            let docRef = firebase.firestore().collection("Users").doc(uid).collection("Friends_List");
            docRef.get().then((querySnapshot)=>{
                this.dropFriendTable(uid);
                this.initFriendTable(uid);
                querySnapshot.forEach((doc)=>{
                    if ('email' in doc.data()){
                        if (doc.data().username!==undefined){
                            let mapping = {
                                avatar:doc.data().photoURL,
                                key:doc.data().uid,
                                title:doc.data().username
                            };
                            this.insertFriendSql(uid,mapping.key,mapping.avatar,mapping.title);
                        }
                    }
                });
            });

            return <MainTabNavigator/>
            // return (
            //     <SafeAreaView style={styles.safeArea}>
            //         <MainTabNavigator/>
            //     </SafeAreaView>)
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

    initChatTable(uid){
        db.transaction(
            tx => {
                tx.executeSql('create table if not exists db'+ uid +' (id integer primary key not null , fromId text, msg text , status int, timeStamp DATETIME DEFAULT CURRENT_TIMESTAMP);');
            },
            null,
            this.update
        );
    }

    insertChatSql(uid,fromId,msg){
        db.transaction(
            tx => {
                console.log("msg from :" + fromId + " , he/she said :" + msg);
                tx.executeSql("INSERT INTO db"+uid+"(fromId,msg,status) VALUES (?,?,?)",[fromId,msg,0]);
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
                tx.executeSql('create table if not exists friend_list'+uid+' (id integer primary key not null , userId int, avatarUrl text , username text);');
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

