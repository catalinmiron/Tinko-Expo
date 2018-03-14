import React from 'react';
import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    Keyboard,
    TextInput, Dimensions
} from 'react-native';
import {
    Input,
    Button,
    Text,
    Card,
    ButtonGroup,
    Tile,
    Col,
    Row,
    Icon,
    Avatar,
    List, ListItem,
} from 'react-native-elements';
import Expo, { SQLite } from 'expo';


const db = SQLite.openDatabase('db.db');

import FriendListView from '../../../components/FriendListView';

export default class InvitationRangeScreen extends React.Component{

    constructor(){
        super();
        this.state = {
            rows: [],
            sqlRows: [],
            loadCache:false
        };
        this.initTable();
    }


    initTable(){
        db.transaction(
            tx => {
                tx.executeSql('create table if not exists friend_list (id integer primary key not null, userId int, avatarUrl text , username text);');
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


    render(){
        return(
            <ScrollView style={styles.container}>
                <FriendListView/>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});