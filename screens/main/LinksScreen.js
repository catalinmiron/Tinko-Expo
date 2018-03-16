import React, {
    Component
} from 'react'
import {
    StyleSheet,View
} from 'react-native'
import { List, ListItem } from 'react-native-elements'
import Expo, { SQLite } from 'expo';
import * as firebase from "firebase";
const db = SQLite.openDatabase('db.db');

require("firebase/firestore");
import SocketIOClient from 'socket.io-client';
import {
    StackNavigator
} from 'react-navigation';
import PrivateChatScreen from './PrivateChatScreen';

let friendList = [];
let uid = "";
let lastUpdateArr = [],
    personalInfo = {},
    alreadyInList = [];

class ChatPage extends Component{
    static navigationOptions = ({navigation}) => ({
        title: `${navigation.state.params.name}`,
    });
    render() {
        const { params } = this.props.navigation.state;
        let avatar = params.avatar,
            personId = params.personId,
            myId = params.myId,
            name = params.name;
        return (
            <PrivateChatScreen avatar={avatar} personId={personId} myId = {myId} name={name}/>
        )
    }
}


class FriendChatListView extends Component {

    constructor(){
        super();
        let user = firebase.auth().currentUser;
        uid = user.uid;
        this.socket = SocketIOClient('http://47.89.187.42:3000/');
        this.getAvatar();
        this.getData();
        this.state = {
            messages: [],
            friendInfo:[]
        };
        this.socket.on("connect" + uid,msg=>{
            let data = JSON.parse(msg);
            if (alreadyInList.indexOf(data.from) === -1){
            }else{
                //  lastUpdateArr.push(dataArr[i]);
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
                    console.log(dataArr);
                    for (let i = 0;i<dataArr.length;i++){
                        personalInfo[dataArr[i].userId] = [dataArr[i].avatarUrl,dataArr[i].username];
                    }
                    console.log("personalInfo");
                    console.log(personalInfo);
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
                    console.log(dataArr);
                    for (let i = dataArr.length-1;i>=0;i--){
                        if (alreadyInList.indexOf(dataArr[i].fromId) === -1){
                            alreadyInList.push(dataArr[i].fromId);
                            let time = dataArr[i].timeStamp.split(" ")[1].split(":");
                            dataArr[i].postTime = time[0]+":"+time[1];
                            lastUpdateArr.push(dataArr[i]);
                        }
                    }
                    console.log("lastUpdateArr");
                    console.log(lastUpdateArr);
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
        console.log("this.state.messages");
        console.log(this.state.messages);
        console.log("this.state.friendInfo");
        console.log(this.state.friendInfo);
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
                        onPress={() => this.props.navigation.navigate('PrivateChatPage', {
                            avatar:ImageURL,
                            name:PersonName,
                            personId:personalId,
                            myId:uid
                        })}
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

export default StackNavigator({
    FriendChatListView: {
        screen: FriendChatListView
    },
    PrivateChatPage: {
        screen: ChatPage,

        navigationOptions: {
            tabBarVisible: false
        }
    }
},{
    initialRouteName: 'FriendChatListView',
});