import React, {
    Component
} from 'react'

import {
    View
} from 'react-native'

import { List, ListItem } from 'react-native-elements';

import * as firebase from 'firebase';

import Expo, { SQLite } from 'expo';

require("firebase/firestore");

const db = SQLite.openDatabase('db.db');

let friendList = [],
    needReRender = false;

export default class FriendDiv extends Component {
    constructor(){
        super();
        this.state = {
            rows: [],
            sqlRows: [],
            loadCache:false
        };
        this.initTable();
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
            if (needReRender){
                this.setState({
                    rows: list
                });
            }
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

    getSql(){
        db.transaction(
            tx => {
                tx.executeSql('select * from friend_list', [], (_, { rows }) => {
                    let dataArr =  rows['_array'],
                        rtnArr = [];
                    for (let i = 0; i <dataArr.length;i++){
                        rtnArr.push({
                            avatar:dataArr[i].avatarUrl,
                            key:dataArr[i].userId,
                            title:dataArr[i].username
                        });
                        friendList.push(dataArr[i].userId)
                    }
                    this.setState({
                        sqlRows: rtnArr,
                        loadCache: true
                    });
                });
            },
            null,
            this.update
        )
    }

    componentDidMount(){
        this.insertFriendList();
    }

    render() {
        let friendList = [];
        if (this.state.rows.length === 0){
            if (this.state.sqlRows.length === 0){
                this.getSql();
            }else{
                for (let i = 0;i<this.state.sqlRows.length ; i++){
                    friendList.push(
                        <ListItem
                            roundAvatar
                            avatar={this.state.sqlRows[i].avatar}
                            key={this.state.sqlRows[i].key}
                            title={this.state.sqlRows[i].title}
                        />
                    )
                }
            }
        }else{
            for (let i = 0;i<this.state.rows.length ; i++){
                friendList.push(
                    <ListItem
                        roundAvatar
                        avatar={this.state.rows[i].avatar}
                        key={this.state.rows[i].key}
                        title={this.state.rows[i].title}
                    />
                )
            }
        }
        return (
            <View>
                <List containerStyle={{marginBottom: 20}}>
                    {friendList}
                </List>
            </View>
        )
    }



}