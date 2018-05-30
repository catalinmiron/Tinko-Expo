import React, {
    Component
} from 'react';
import {
    View, DeviceEventEmitter, Platform, TouchableOpacity, StyleSheet
} from 'react-native';
import {getUserDataFromDatabase, getMeetInfo, getAvatarPlaceholder} from "../../../modules/CommonUtility";
import {Image as CacheImage} from "react-native-expo-image-cache";
import {SQLite } from 'expo';
const db = SQLite.openDatabase('db.db');
import {currentOnSelectUser, unReadNumNeedsUpdates, updateLastMessage} from "../../../modules/ChatStack";
import { GiftedChat, Actions, Bubble, SystemMessage } from 'react-native-gifted-chat';
import SocketIOClient from 'socket.io-client';
import {ifIphoneX} from "react-native-iphone-x-helper";
import {Header} from "react-native-elements";
import {MaterialIcons} from '@expo/vector-icons'
import KeyboardSpacer from "react-native-keyboard-spacer";

let uid = "",
    MeetId = "",
    dbInfoList = [],
    limit = 15;

export default class PrivateChatScreen extends Component {

    static navigationOptions = {header:null};

    componentWillUnmount(){
        currentOnSelectUser("");
        this.socket.removeListener("connect" + uid);
        //unReadNumNeedsUpdates(MeetId,1);
    }

    state = {
        messages: [],
        user: [],
        isLoadingEarlier:false,
        hasCache:false,
        thisUser:{_id: 1},
        meetTitle:'Group Chat'
    };

    constructor(props){
        super(props);
        dbInfoList = [];
        let dataStore = this.props.navigation.state.params;
        uid = dataStore.myId;
        MeetId = dataStore.personId;
        this.socket = SocketIOClient('https://shuaiyixu.xyz');
        // this.socket = SocketIOClient('http://47.89.187.42:4000/');
        this.socket.on("connect" + uid,(msg)=>{
            let data = JSON.parse(msg);
            if (data.type === 2){
                if (MeetId === data.activityId){
                    data.fromId = data.from;
                    data.time = new Date();
                    data.msg = data.message;
                    if (data.fromId!==uid){
                        data.status = 0;
                    }
                    this.processMessageData([data]);
                }
            }
        });
        this.getFromDB(uid,MeetId);
        this.getMeetTitle(MeetId);
    }

    //type === 1为历史 需要unshift
    async processMessageData(data,type){
        let messages = [];
        await data.reduce((p,e,i) => p.then(async ()=> {
            await getUserDataFromDatabase(e.fromId,
                (userData) => {
                    let message = {};
                    if (e.status === 0){
                        if (userData.uid!==uid){
                            message = {
                                _id: Math.floor(Math.random()*10000),
                                text: e.msg,
                                user: {
                                    _id: userData.uid,
                                    name: userData.username,
                                    avatar: userData.photoURL,
                                },
                                createdAt:(e.time)?e.time:this.utcTime(e.timeStamp),
                                sent: (e.status === 0)
                            };
                        }else{
                            message = {
                                _id: Math.round(Math.random() * 10000),
                                text: e.msg,
                                createdAt: (e.time)?e.time:this.utcTime(e.timeStamp),
                                user: {
                                    _id: 1,
                                    name: 'Developer',
                                }
                            };

                        }
                    }else{
                        if (e.type!==0){
                            message = {
                                _id: Math.round(Math.random() * 10000),
                                text: e.msg,
                                createdAt: (e.time)?e.time:this.utcTime(e.timeStamp),
                                user: {
                                    _id: 1,
                                    name: 'Developer',
                                }
                            };
                        }else{
                            message = {
                                _id: Math.round(Math.random() * 10000),
                                text: e.msg,
                                createdAt: (e.time)?e.time:this.utcTime(e.timeStamp),
                                system:true
                            };
                        }
                    }
                    messages.push(message);
                },
                (error) => {
                    Alert.alert('Error', error);
                });
        }),Promise.resolve());
        if (type === 1){
            messages = this.state.messages.concat(messages);
        }else{
            messages = messages.concat(this.state.messages);
        }
        this.setState({
            hasCache:(dbInfoList.length !== 0),
            messages:messages,
        });
    }


    renderAvatar(props){
        return(
            <TouchableOpacity
                onPress={() => props.onPressAvatar(props.currentMessage.user._id,this.props.navigation)}
            >
                <CacheImage
                    preview={getAvatarPlaceholder}
                    uri={props.currentMessage.user.avatar}
                    style={styles.avatar}
                />
            </TouchableOpacity>)
    }

    render() {
        return (
            <View
                style={{flex:1, backgroundColor:'white'}}>
                <Header
                    leftComponent={{ icon: 'chevron-left', color: '#fff', onPress:()=>this.props.navigation.goBack()}}
                    centerComponent={{ text: this.state.meetTitle, style: { fontSize:18, fontFamily:'regular', color: '#fff' } }}
                    rightComponent={<MaterialIcons name='details' size={26} color={'white'} backgroundColor={'transparent'}
                                                   onPress={()=>this.props.navigation.navigate('TheTinkoDetailScreen',{meetId:MeetId, comeFromMessaging:true})}
                    />}
                    outerContainerStyles={ifIphoneX({height:88})}
                />
                <GiftedChat
                    ref={(c) => this.giftedChatRef = c}
                    messages={this.state.messages}
                    onSend={messages => this.onSend(messages)}
                    renderAvatar={this.renderAvatar.bind(this)}
                    onPressAvatar={this.props.screenProps.showThisUser}
                    showAvatarForEveryMessage={true}
                    user={this.state.thisUser}
                    loadEarlier={this.state.hasCache}
                    isLoadingEarlier={this.state.isLoadingEarlier}
                    onLoadEarlier={() => this.getGroupChatContents()}
                    bottomOffset={ifIphoneX(34)}
                    onLayout={() => console.log('onLayout')}
                    textInputProps={{
                        // onSubmitEditing: () => {
                        //      let text = this.giftedChatRef.textInput._getText();
                        //      let messages = [{
                        //          createdAt: new Date(),
                        //          text: text,
                        //          user: this.state.thisUser,
                        //          _id: Math.floor(Math.random()*10000)
                        //      }];
                        //      this.giftedChatRef.onSend(messages);
                        //      this.giftedChatRef.onInputTextChanged('');
                        // },
                        // returnKeyType:'send',
                    }}
                    renderAvatarOnTop={true}
                />
                {Platform.OS === 'android' && <KeyboardSpacer/>}
                <View style={{...ifIphoneX({height:34, backgroundColor:'white'}, {})}}/>
            </View>
        )
    }

    async getMeetTitle(meetId){
        await getMeetInfo(meetId,
            (title)=>{
                this.setState({meetTitle:title});
            },
            (error)=>{
                console.log(error);
            })
    }

    getGroupChatContents(){

        this.setState({isLoadingEarlier:true});
        // console.log("dbInfoList",dbInfoList);
        if (dbInfoList.length>limit){
            let processIng = [];
            for (let i = 0;i<limit;i++){
                processIng.push(dbInfoList.shift());
            }
            this.processMessageData(processIng,1);
        }else{
            this.processMessageData(dbInfoList,1);

            dbInfoList = [];
        }

        this.setState({isLoadingEarlier:false});
    }

    getFromDB(uid,meetId){

        // ORDER BY id DESC limit 10
        db.transaction(
            tx => {
                tx.executeSql("SELECT * FROM db"+ uid + " WHERE meetingId = '"+meetId +"' ORDER BY id DESC", [], (_, {rows}) => {
                    let dataArr = rows['_array'];
                    console.log(dataArr);
                    if (dataArr.length>limit){
                        let processIng = [];
                        for (let i = 0;i<limit;i++){
                            processIng.push(dataArr.shift());
                        }
                        dbInfoList = dataArr;
                        this.processMessageData(processIng,1);
                    }else{
                        this.setState({
                            hasCache:false
                        });
                        this.processMessageData(dataArr,1);
                    }
                    this.setState({isLoadingEarlier:false});
                })
            },
            null,
            null,
        );
    }

    utcTime(time){
        //2018-04-17 2:19:51
        if (time !== undefined) {
            let timeArr = time.split(" "),
                year = timeArr[0].split("-"),
                hour = timeArr[1].split(":"),
                date = new Date(parseInt(year[0]), parseInt(year[1])-1, parseInt(year[2]), hour[0], hour[1], hour[2]);
            return date.toUTCString();
        }
    }

    onSend(messages = []) {
        let text = messages[0].text;
        updateLastMessage(MeetId,text);
        this.socket.emit("groupChat",uid,MeetId,text);
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages[0]),
        }))
    }


}

const styles = StyleSheet.create({
    avatar: {
        // The bottom should roughly line up with the first line of message text.
        height: 36,
        width: 36,
        borderRadius: 18,
    },
});