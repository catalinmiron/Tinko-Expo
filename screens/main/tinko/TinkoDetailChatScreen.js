import React from "react";
import { View, Platform, SafeAreaView, Keyboard } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat'
import SlackMessage from '../../../components/SlackMessage'
import emojiUtils from 'emoji-utils';
import {getFromAsyncStorage, getUserData, writeInAsyncStorage} from "../../../modules/CommonUtility";
import firebase from "firebase/index";
import {Header} from "react-native-elements";
import { ifIphoneX } from 'react-native-iphone-x-helper';
import SocketIOClient from 'socket.io-client';
import {getUserDetail,getFriends} from "../../../modules/UserAPI";

let MeetId = "",
    uid = "",
    userInfo = {

    },
    friendList = [];

export default class TinkoDetailChatScreen extends React.Component {

    static navigationOptions = {header:null};

    constructor(props){
        super(props);
        let user = firebase.auth().currentUser;
        let userUid = user.uid;
        uid = user.uid;
        getFriends(uid).then(data => (console.log(data)));
        this.socket = SocketIOClient('http://47.89.187.42:4000/');
        MeetId = this.props.navigation.state.params.meetId;
        this.socket.on("activity" + MeetId,(msg)=>{
            let data = JSON.parse(msg);
            let user = data.userData;
            this.setState(previousState => ({
                messages: GiftedChat.append(previousState.messages,{
                    _id: Math.floor(Math.random()*10000),
                    text: data.msg,
                    user: {
                        _id: user.uid,
                        name: user.username,
                        avatar: user.photoURL,
                    },
                    sent: true,
                    received: true,
                }),
            }))
        });
        this.state = {
            meetId: this.props.navigation.state.params.meetId,
            messages: [],
            thisUser:{_id:-1},
            userUid:userUid,
            loadEarlier: true,
            isLoadingEarlier:false,
            lastMeetId:-1,
            limit:16,
            SafeAreaInsets:34,
        };
        getFromAsyncStorage('ThisUser').then((userData) => {
            if(userData) {
                let thisUser = {
                    _id:userData.uid,
                    name: userData.username,
                    avatar: userData.photoURL,
                    uid: userData.uid
                };
                this.setState({thisUser})
            } else {
                getUserData(userUid).fork(
                    (error) => {
                        console.log(error);
                    },
                    (userData) => {
                        let thisUser = {
                            _id:userData.uid,
                            name: userData.username,
                            avatar: userData.photoURL,
                            uid: userData.uid
                        };
                        this.setState({thisUser})
                    }
                );
            }
        });
    }

    componentDidMount(){
        this.getGroupChatContents();
        // this.keyboardDidShowListener = Keyboard.addListener('keyboardWillShow', this._keyboardDidShow());
        // this.keyboardDidHideListener = Keyboard.addListener('keyboardWillHide', this._keyboardDidHide());
    }


    componentWillUnmount () {
        //this.keyboardDidShowListener.remove();
        //this.keyboardDidHideListener.remove();
    }
    //
    // _keyboardDidShow () {
    //     alert('Keyboard Shown');
    //     //this.setState({SafeAreaInsets:0})
    // }
    //
    // _keyboardDidHide () {
    //     alert('Keyboard Hidden');
    //     //this.setState({SafeAreaInsets:34})
    // }


    getGroupChatContents() {
        this.setState({isLoadingEarlier:true});
        //console.log(this.state.lastMeedId);
        const {lastMeetId, limit} = this.state;
        let bodyData={
            // meetId: "1iuLxFd8aMZVuYHR97do",
            meetId:this.state.meetId,
            lastId: lastMeetId,
            limit:limit
        };
        try {
            fetch('http://47.89.187.42:4000/getChatHistory', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bodyData),
            }).then((response) => response.json())
                .then((responseJson) => {
                    let data = responseJson.data;
                    let messages=[];
                    data.forEach((messageData) => {
                        let fromId = data.fromId;
                        if (userInfo[fromId] === undefined){
                            //发现不存在这个数据，需要去数据库获取
                            getUserDetail(uid,fromId).then(data => (userInfo[fromId] = data));
                        }
                        let userData = JSON.parse(messageData.data);
                        let message = {
                            _id: messageData.id,
                            text: messageData.msg,
                            createdAt:messageData.time,
                            user:{
                                _id: Math.random()*100000,
                                uid:messageData.fromId,
                                name:userData.username,
                                avatar:userData.photoURL,
                            }
                        };
                        //console.log(message);
                        messages.push(message);
                    });

                    if(data.length<limit){
                        this.setState({loadEarlier:false, });
                    }
                    let lastId;
                    if(data.length!==0){
                        lastId=data[data.length-1].id;
                    }
                    console.log('lastId', lastId);
                    this.setState((state) => {
                        let a = state.messages.concat(messages);
                        return {messages:a};
                    });
                    this.setState({isLoadingEarlier:false, lastMeetId:lastId});
                })
                .catch((error) => {
                    console.error(error);
                });
        } catch (error) {
            console.error(error);

        }
    }

    componentWillMount() {
        //this.getGroupChatContents();
        // this.setState({
        //     messages: [
        //         {
        //             _id: 1,
        //             text: 'Hello developer',
        //             createdAt: new Date(),
        //             user: {
        //                 _id: Math.random()*100000,
        //                 name: 'React Native',
        //                 avatar: 'https://graph.facebook.com/111708632968603/picture?type=normal',
        //             },
        //         },
        //         {
        //             _id: 2,
        //             text: 'LOL will you come over tonight',
        //             createdAt: new Date(),
        //             user: {
        //                 _id: Math.random()*100000,
        //                 name: 'React Native',
        //                 avatar: 'https://graph.facebook.com/111708632968603/picture?type=normal',
        //             },
        //         },
        //     ],
        // })
    }


    renderMessage(props) {
        const { currentMessage: { text: currText } } = props;

        let messageTextStyle;

        // Make "pure emoji" messages much bigger than plain text.
        if (currText && emojiUtils.isPureEmojiString(currText)) {
            messageTextStyle = {
                fontSize: 28,
                // Emoji get clipped if lineHeight isn't increased; make it consistent across platforms.
                lineHeight: Platform.OS === 'android' ? 34 : 30,
            };
        }

        return (
            <SlackMessage {...props} messageTextStyle={messageTextStyle} />
        );
    }


    onSend(messages = []) {
        let text = messages[0].text;
        this.socket.emit("byStander",uid,MeetId,text);
        // this.setState(previousState => ({
        //     messages: GiftedChat.append(previousState.messages, messages),
        // }))
    }

    render() {
        const {thisUser, messages, loadEarlier, isLoadingEarlier, SafeAreaInsets} = this.state;
        return (
            <View style={{flex:1}}>
                <Header
                    centerComponent={{ text: 'Chat', style: { fontSize:18, fontFamily:'bold', color: '#fff' } }}
                    outerContainerStyles={ifIphoneX({height:78})}
                />
                <GiftedChat

                    showAvatarForEveryMessage={true}
                    messages={messages}
                    renderMessage={this.renderMessage}
                    onSend={messages => this.onSend(messages)}
                    user={thisUser}
                    listViewProps={{
                        style: {
                            backgroundColor: 'white',
                        }
                    }}

                    loadEarlier={loadEarlier}
                    onLoadEarlier={() => this.getGroupChatContents()}
                    isLoadingEarlier={isLoadingEarlier}
                    bottomOffset={ifIphoneX(SafeAreaInsets)}
                    //textInputProps={{height:54}}
                />


                <View style={{...ifIphoneX({height:SafeAreaInsets, backgroundColor:'white'}, {})}}/>
            </View>

        )
    }
}