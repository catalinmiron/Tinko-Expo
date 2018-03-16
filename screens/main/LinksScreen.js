import React, {
    Component
} from 'react'
import {
    View,Text,StyleSheet,Image
} from 'react-native'
import { List, ListItem } from 'react-native-elements'
import Expo, { SQLite } from 'expo';
import * as firebase from "firebase";
const db = SQLite.openDatabase('db.db');

require("firebase/firestore");
import SocketIOClient from 'socket.io-client';

let friendList = [];
let uid = "";
let lastUpdateArr = [],
    personalInfo = {},
    alreadyInList = [];


export default class FriendChatListView extends Component {

    constructor(){
        super();
        let user = firebase.auth().currentUser;
        uid = user.providerData[0].uid;
        this.socket = SocketIOClient('http://127.0.0.1:3333');
        this.getAvatar();
        this.getData();
        this.state = {
            messages: [],
            friendInfo:[]
        };
        this.socket.on("connect" + uid,msg=>{
            let data = JSON.parse(msg);
            if (alreadyInList.indexOf(data.from) === -1){
                console.log("not yet");
            }else{
              //  lastUpdateArr.push(dataArr[i]);
                console.log("already has");
                lastUpdateArr[0].msg = data.message;
            }
            this.setState({
                messages:lastUpdateArr
            });
        });
    }

    getAvatar(){
        db.transaction(
            tx => {
                tx.executeSql('select * from friend_list', [], (_, { rows }) => {
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

    getData(){
        db.transaction(
            tx => {
                tx.executeSql('select * from db'+uid, [], (_, { rows }) => {
                    let dataArr =  rows['_array'];
                    for (let i = dataArr.length-1;i>0;i--){
                        if (alreadyInList.indexOf(dataArr[i].fromId) === -1){
                            alreadyInList.push(dataArr[i].fromId);
                            let time = dataArr[i].timeStamp.split(" ")[1].split(":");
                            dataArr[i].postTime = time[0]+":"+time[1];
                            lastUpdateArr.push(dataArr[i]);
                        }
                    }
                    this.setState({
                        messages:lastUpdateArr
                    });
                });
            },
            null,
            this.update
        )
    }

    render() {
        // const { navigate } = this.props.navigation;
        let friendList = [];
        if (this.state.messages.length!==0&&this.state.friendInfo.length!==0){
            for (let i = 0;i<this.state.messages.length ; i++){
                let personalId = this.state.messages[i].fromId,
                    message = this.state.messages[i].msg,
                    ImageURL = this.state.friendInfo[personalId][0],
                    PersonName = this.state.friendInfo[personalId][1];
                friendList.push(
                    <ListItem
                        roundAvatar
                        avatar={{uri:ImageURL}}
                        key={personalId}
                        title={PersonName}
                        subtitle={message}
                        badge={{ value: 3, textStyle: { color: 'orange' }, containerStyle: { marginTop: -20 } }}
                    />
                );
            }
        }
        return (
            <List>
                {friendList}
            </List>
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