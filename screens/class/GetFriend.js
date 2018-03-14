import React, {
    Component
} from 'react'

import {
    View
} from 'react-native'

import * as firebase from 'firebase';

import Expo, { SQLite } from 'expo';

require("firebase/firestore");

const db = SQLite.openDatabase('db.db');

let friendList = [],
    needReRender = false;

export default class FriendDiv extends Component {
    constructor(){
        super();
        this.deleteTable();
        this.initTable();
        this.insertFriendList();
    }

    // firestore 获取数据   之后全部从sqlite获取
    insertFriendList(){
        let db = firebase.firestore();
        let list = [];
        let user = firebase.auth().currentUser;
        let uid = user.providerData[0].uid;
        let docRef = db.collection("Users").doc(uid).collection("Friends_List");
        docRef.get().then((querySnapshot)=>{
            this.deleteTable();
            this.initTable();
            querySnapshot.forEach((doc)=>{
                if ('email' in doc.data()){
                    if (doc.data().username!==undefined){
                        let mapping = {
                            avatar:doc.data().photoURL,
                            key:doc.data().uid,
                            title:doc.data().username
                        };
                        list.push(mapping);
                        this.insertSql(mapping.key,mapping.avatar,mapping.title);
                        needReRender = true;
                    }
                }
            });
        });
    }

    deleteTable(){
        db.transaction(
            tx => {
                tx.executeSql('drop table friend_list');
            },
            null,
            this.update
        );
    }

    initTable(){
        db.transaction(
            tx => {
                tx.executeSql('create table if not exists friend_list (id integer primary key not null , userId int, avatarUrl text , username text);');
            },
            null,
            this.update
        );
    }

    insertSql(friendId,avatarUrl,friendName){
        db.transaction(
            tx => {
                tx.executeSql('insert into friend_list (userId,avatarUrl,username) values (?,?,?)',[friendId,avatarUrl,friendName]);
            },
            null,
            this.update
        );
    }


    render() {
        return (
            <View/>
        )
    }



}