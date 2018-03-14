import React, {
    Component
} from 'react'
import {
    View,Text,StyleSheet
} from 'react-native'
import { Container, Header, Content, List, ListItem, Left, Body, Right, Thumbnail, Item, Input, Icon, Button} from 'native-base';
import SocketIOClient from 'socket.io-client';
import Expo, { SQLite } from 'expo';
import FriendListView from '../../components/FriendListView';
import * as firebase from "firebase";

const db = SQLite.openDatabase('db.db');

require("firebase/firestore");

let friendList = [];
let uid = "";
let lastUpdateArr = [];

export default class FriendChatListView extends Component {

    constructor(){
        super();
        let user = firebase.auth().currentUser;
        uid = user.providerData[0].uid;
        // this.dropTable();
        this.initTable();
        // this.insertSql("123321","你好1");
        // this.insertSql("123321","你好2");
        // this.insertSql("123321","你好3");
        // this.insertSql("123333","你好1");
        // this.insertSql("123333","你好2");
        // this.insertSql("12331","你好3");
        this.getData();
        this.state = {
            messages: [],
            sqlRows:[]
        };
    }

    dropTable(){
        db.transaction(
            tx => {
                tx.executeSql('drop table db'+ uid);
            },
            null,
            this.update
        );
    }

    initTable(){
        db.transaction(
            tx => {
                tx.executeSql('create table if not exists db'+ uid +' (id integer primary key not null , fromId int, msg text , status int);');
            },
            null,
            this.update
        );
    }

    insertSql(fromId,msg){
        db.transaction(
            tx => {
                tx.executeSql("INSERT INTO db"+uid+"(fromId,msg,status) VALUES (?,?,?)",[fromId,msg,0]);
            },
            null,
            this.update
        );
    }

    getData(){
        db.transaction(
            tx => {
                tx.executeSql("SELECT id,msg,toId,fromId From db"+uid+"  where id = ANY(SELECT MAX(id) FROM db"+uid+" GROUP BY fromId)", [], (_, { rows }) => {
                    console.log(rows['_array']);
                    lastUpdateArr = rows['_array'];
                });
            },
            null,
            this.update
        )
    }

    render() {
        return (
            <Content>
                <List>
                    <ListItem avatar>
                        <Left>
                            <Thumbnail source={{ uri: 'Image URL' }} />
                        </Left>
                        <Body>
                        <Text>Kumar Pratik</Text>
                        <Text note>Doing what you like will always keep you happy . .</Text>
                        </Body>
                        <Right>
                            <Text note>3:43 pm</Text>
                        </Right>
                    </ListItem>
                </List>
            </Content>
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