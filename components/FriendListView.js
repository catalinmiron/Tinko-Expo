import React, {
    Component
} from 'react'

import {
    View,Text,StyleSheet
} from 'react-native'
import Expo, { SQLite } from 'expo';
import * as firebase from 'firebase';
import { List, ListItem } from 'react-native-elements';

require("firebase/firestore");

const db = SQLite.openDatabase('db.db');

let friendList = [];

export default class FriendListView extends Component {

    constructor(){
        super();
        let user = firebase.auth().currentUser;
        let uid = user.uid;
        this.getSql(uid);
        this.state = {
            sqlRows: [],
            rows: []
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


    goToDetailPage(key){
        console.log(key);
        this.props.navigation.navigate('UserDetail', {uid:key});

    }



    render() {
        let friendList = [];
        for (let i = 0;i<this.state.sqlRows.length ; i++){
            console.log(this.state.sqlRows[i]);
            friendList.push(
                <ListItem
                    roundAvatar
                    avatar={this.state.sqlRows[i].avatar}
                    key={this.state.sqlRows[i].key}
                    title={this.state.sqlRows[i].title}
                    onPress={() => this.goToDetailPage(this.state.sqlRows[i].key)}
                />
            )
        }
        return (
            <View>
                <View style={{width:"90%",marginTop:35,marginLeft:"5%"}}>
                    <List containerStyle={{marginBottom: 20}}>
                        {friendList}
                    </List>
                </View>
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
            }
    });