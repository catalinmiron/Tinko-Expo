import React, {
    Component
} from 'react'
import {
    TouchableWithoutFeedback,Text,StyleSheet
} from 'react-native'
import {Content, List, ListItem, Left, Body, Right, Thumbnail } from 'native-base';
import Expo, { SQLite } from 'expo';
import * as firebase from "firebase";
import {GiftedChat} from "react-native-gifted-chat";

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
        let friendList = [];
        if (this.state.messages.length!==0&&this.state.friendInfo.length!==0){
            for (let i = 0;i<this.state.messages.length ; i++){
                let personalId = this.state.messages[i].fromId,
                    ImageURL = this.state.friendInfo[personalId][0],
                    PersonName = this.state.friendInfo[personalId][1];
                friendList.push(
                    <TouchableWithoutFeedback key={personalId}>
                        <ListItem>
                            <Thumbnail size={60} source={{ uri: ImageURL }} />
                            <Body style={{left:10}}>
                            <Text>{PersonName}</Text>
                            <Text note>{this.state.messages[i].msg}</Text>
                            </Body>
                            <Right>
                                <Text note>{this.state.messages[i].postTime}</Text>
                            </Right>
                        </ListItem>
                    </TouchableWithoutFeedback>
                );
            }
        }
        return (
            <Content>
                <List>
                    {friendList}
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