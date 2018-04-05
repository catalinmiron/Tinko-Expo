import React, {
    Component
} from 'react'
import {Text, Image} from 'react-native';
import {Button, Header, Avatar, Overlay} from 'react-native-elements'
import {getUserData} from "../../../modules/CommonUtility";

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
        }
    }

    componentDidMount(){

        //this.getUserDataFromFirebase();
    }

    showThisUser(uid, navigation){
        this.getUserDataFromSql(uid);
        this.setState({isVisible:true, navigation:navigation});
    }

    getUserDataFromSql(uid){
        db.transaction(
            tx => {
                tx.executeSql(`SELECT * FROM friend_list${this.state.userUid} WHERE userId = '${uid}'` , [], (_, { rows }) => {
                    console.log(rows);
                    let length = rows.length;
                    if(length==0){
                        this.getUserDataFromFirebase(uid);
                    } else {
                        let data = rows._array;
                        console.log(userData);
                        let userData = {
                            uid:data[0].userId,
                            photoURL:data[0].avatarUrl,
                            username:data[0].username,
                            location:data[0].location,
                            gender:data[0].gender,
                        }
                        this.setState({userData:userData});
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

    getUserDataFromFirebase(uid){
        let firestoreDb = firebase.firestore();
        var userRef = firestoreDb.collection("Users").doc(uid);
        userRef.get().then((userDoc) => {
            if (userDoc.exists) {
                //console.log("Document data:", userDoc.data());
                let user = userDoc.data();
                this.setState({userData:user, isFriends:false});
            } else {
                console.log("No such document!");
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
    }

    render() {
        //console.log(this.props);
        const { userData, userUid, isFriends, isVisible}  = this.state;
        //console.log(userData);
        return (
            <Overlay
                height={300}
                borderRadius={25}
                isVisible={isVisible}>
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

                </View>

                {isFriends?
                    <Button
                        title='Message'
                        onPress={() => {
                            this.state.navigation.navigate('PrivateChatPage', {
                                avatar: userData.photoURL,
                                name:userData.username,
                                personId:userData.uid,
                                myId:userUid
                            })
                            this.setState({isVisible:false})
                        }}
                    />
                    :
                    <Button
                        title='Add Friend'
                    />
                }
                <Button
                    containerStyle={{marginTop:15}}
                    title='dismiss'
                    onPress={()=> this.setState({isVisible:false})}
                />
            </Overlay>
        )
    }
}
