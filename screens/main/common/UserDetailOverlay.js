import React, {
    Component
} from 'react'
import {Text, Image, AsyncStorage, DeviceEventEmitter} from 'react-native';
import {Button, Header, Avatar, Overlay, Input} from 'react-native-elements'
import {firestoreDB} from "../../../modules/CommonUtility";
import {getLength,updateUnReadNum} from "../../../modules/ChatStack";
import {sendFriendRequest} from "../../../modules/SocketClient";

import {
    View
} from 'react-native'
import firebase from "firebase";
import {Ionicons} from '@expo/vector-icons'
import {SQLite} from "expo";

const db = SQLite.openDatabase('db.db');

export default class UserDetailScreen extends Component{

    // static navigationOptions = ({ navigation }) => {
    //     const params = navigation.state.params || {};
    //
    //     return {
    //         headerLeft:(<Ionicons.Button
    //             name="ios-arrow-back" size={20} color="black" style={{marginLeft:26}} backgroundColor="transparent"
    //             onPress={() => navigation.goBack()}/>),
    //
    //         headerStyle:{ backgroundColor: 'white',}
    //     };
    // };
    static navigationOptions = {header:null}

    constructor(props){
        super(props);
        let user = firebase.auth().currentUser;
        this.showThisUser=this.showThisUser.bind(this);
        props.onRef(this);
        this.state={
            userUid:user.uid,
            userData:{},
            isFriends:true,
            isVisible:props.isVisible,
            navigation:null,
            updateMethod:null,
            requestMessage:'',
            loading:true,
        }
    }

    componentDidMount(){

        //this.getUserDataFromFirebase();
    }

    showThisUser(uid, navigation, updateMethod){
        if(uid===this.state.userUid){
            this.getThisUserFromAsyncStorage();
        } else {
            this.getUserDataFromSql(uid);
        }
        this.setState({isVisible:true, navigation:navigation, updateMethod:updateMethod});
    }

    async getThisUserFromAsyncStorage(){
        try {
            const value = await AsyncStorage.getItem('ThisUser'+this.state.userUid);
            if (value !== null){
                // We have data!!
                //console.log(value);
                let userData = JSON.parse(value);
                this.setState({userData, isFriends:true, loading:false});
            }
        } catch (error) {
            // Error retrieving data
            console.log(error);
        }
    }

    getUserDataFromSql(uid){
        db.transaction(
            tx => {
                tx.executeSql(`SELECT * FROM friend_list${this.state.userUid} WHERE userId = '${uid}'` , [], (_, { rows }) => {
                    console.log(rows);
                    let length = rows.length;
                    if(length===0){
                        this.getUserDataFromFirebase(uid);
                    } else {
                        let data = rows._array;
                        let userData = {
                            uid:data[0].userId,
                            photoURL:data[0].avatarUrl,
                            username:data[0].username,
                            location:data[0].location,
                            gender:data[0].gender,
                        };
                        let isFriends = data[0].isFriend === 1;
                        this.setState({
                            userData:userData,
                            requestMessage:`I am ${data[0].username}`,
                            isFriends:isFriends,
                            loading:false,
                        });
                        this.getUserDataFromFirebase(uid, isFriends);
                    }
                });
            },
            (error) => {
                console.log(error);
                this.getUserDataFromFirebase(uid);
            },
            () => console.log('getUserDataFromSql')
        )
    }

    getUserDataFromFirebase(uid, isFriends=false){
        let firestoreDb = firestoreDB();
        var userRef = firestoreDb.collection("Users").doc(uid);
        userRef.get().then((userDoc) => {
            if (userDoc.exists) {
                //console.log("Document data:", userDoc.data());
                let user = userDoc.data();
                let userData = this.state.userData;
                if(userData.username===user.username && userData.photoURL === user.photoURL && userData.location === user.location && userData.gender === user.gender){

                } else {
                    this.setState({
                        userData:user,
                        requestMessage:`I am ${user.username}`,
                        isFriends:isFriends,
                        loading:false,
                    });
                    let callUpdateMethod = userData !== {};
                    this.updateFriendSql(this.state.userUid, user, isFriends, callUpdateMethod);
                }

            } else {
                console.log("No such document!");
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
    }

    updateFriendSql(uid, userData, isFriends, callUpdateMethod){
        let isFriend = isFriends ? 1 : 0;
        db.transaction(
            tx => {
                tx.executeSql(
                    'insert or replace into friend_list'+uid+' (userId,avatarUrl,username, location, gender, isFriend) values (?,?,?,?,?, ?)',
                    [userData.uid,userData.photoURL,userData.username,userData.location,userData.gender, isFriend]);
            }
            ,
            (error) => console.log("这里报错" + error),
            () => {
                console.log('updateFriendSql complete');
                if(callUpdateMethod){
                    //console.log(this.state.updateMethod);
                    this.state.updateMethod();
                }
            }
        );
    }

    render() {
        //console.log(this.props);
        const { userData, userUid, isFriends, isVisible, requestMessage, loading}  = this.state;
        //console.log(userData);
        return (
            <Overlay
                height={300}
                borderRadius={25}
                isVisible={isVisible}>
                {loading ?
                    <View/>
                    :
                    <View>
                        <View
                            style={{width:'90%', marginLeft:'5%', marginTop:30, marginBottom:30, flexDirection:'row', justifyContent:'space-between'}}
                        >
                            <View>
                                <Text style={{fontFamily:'bold', fontSize:26}}>{userData.username}</Text>
                                <Text style={{fontFamily:'regular', fontSize:20}}>{userData.location}</Text>

                            </View>
                            <Avatar
                                large
                                rounded
                                source={{uri: userData.photoURL}}
                                //onPress={() => console.log("Works!")}
                                activeOpacity={0.7}
                            />

                            {/*<Image*/}
                            {/*style={{height:75, width:75}}*/}
                            {/*source={{uri:userData.photoURL}}*/}
                            {/*//source={{uri:'https://s-media-cache-ak0.pinimg.com/736x/b1/21/df/b121df29b41b771d6610dba71834e512.jpg'}}*/}
                            {/*/>*/}

                        </View>

                        {isFriends?
                            <Button
                                title='Message'
                                onPress={() => {
                                    getLength(this.state.userData.uid);
                                    DeviceEventEmitter.emit('updateCurrentOnSelectUser',{
                                        id:this.state.userData.uid
                                    });
                                    updateUnReadNum(1,this.state.userData.uid);
                                    this.state.navigation.navigate('PrivateChatPage', {
                                        avatar: userData.photoURL,
                                        name:userData.username,
                                        personId:userData.uid,
                                        myId:userUid
                                    });
                                    this.setState({isVisible:false})
                                }}
                            />
                            :
                            <View>
                                <Input
                                    placeholder={`I am ${userData.username}`}
                                    onChangeText={(requestMessage) => this.setState({requestMessage})}
                                    value={requestMessage}
                                />
                                <Button
                                    containerStyle={{marginTop:10}}
                                    title='Add Friend'
                                    onPress={() => {
                                        sendFriendRequest(userUid, userData.uid, 0, requestMessage);
                                        this.setState({isVisible:false});
                                    }}
                                />
                            </View>
                        }
                        <Button
                            containerStyle={{marginTop:15}}
                            title='dismiss'
                            onPress={()=> this.setState({isVisible:false})}
                        />
                    </View>
                }
            </Overlay>
        )
    }
}
