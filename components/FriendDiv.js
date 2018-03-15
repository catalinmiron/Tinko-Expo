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
        let user = firebase.auth().currentUser;
        let uid = user.providerData[0].uid;
        this.getSql(uid);
        this.state = {
            sqlRows: []
        };
    }
    getSql(uid){
        db.transaction(
            tx => {
                tx.executeSql('select * from friend_list'+uid, [], (_, { rows }) => {
                    let dataArr =  rows['_array'],
                        rtnArr = [];
                    console.log(dataArr);
                    for (let i = 0; i <dataArr.length;i++){
                        rtnArr.push({
                            avatar:dataArr[i].avatarUrl,
                            key:dataArr[i].userId,
                            title:dataArr[i].username
                        });
                        friendList.push(dataArr[i].userId)
                    }
                    this.setState({
                        sqlRows: rtnArr
                    });
                });
            },
            null,
            this.update
        )
    }

    render() {
        let friendList = [];
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
        return (
            <View>
                <List containerStyle={{marginBottom: 20}}>
                    {friendList}
                </List>
            </View>
        )
    }



}