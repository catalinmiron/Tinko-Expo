import React from 'react';
import {
    View, Alert, TouchableWithoutFeedback, Image, ScrollView, SafeAreaView, StyleSheet, Text,
    AsyncStorage
} from 'react-native';
import { List, ListItem,Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import Avatar from "../../components/AvatarBox";
import SettingBox from '../../components/SettingMenu';
import InfoMenu from '../../components/InfoMenu';
import CreateStoryButton from '../../components/CreateStoryButton';
import FriendsList from '../../components/FriendListView';
import firebase from 'firebase';
import {getUserData} from "../../modules/CommonUtility";
import SubButton from '../../components/SettingSubButton';
import {SQLite} from "expo";

const db = SQLite.openDatabase('db.db');

export default class Me extends React.Component {

    constructor(props){
        super(props);
        //console.log(props);
        let user = firebase.auth().currentUser;
        this.state={
            userUid:user.uid,
            userData:{},
        }
        this.getThisUserInDatabase();
    }


    componentDidMount(){
        this.getThisUserData();
        this.processFriendsList(this.state.userUid)
    }

    getThisUserData(){
        getUserData(this.state.userUid).fork(
            (error) => {
                console.log(error);
            },
            (userObj) => {
                this.setState({userData:userObj});
                this.writeThisUserInDatabase(userObj);
            }
        );
    }

    writeThisUserInDatabase(userData){
        let thisUserDataString = JSON.stringify(userData);
        try {
            AsyncStorage.setItem('ThisUser'+this.state.userUid, thisUserDataString);
        } catch (error) {
            // Error saving data
            console.log(error);
        }
    }

    async getThisUserInDatabase(){
        try {
            const value = await AsyncStorage.getItem('ThisUser'+this.state.userUid);
            if (value !== null){
                // We have data!!
                //console.log(value);
                let userData = JSON.parse(value);
                this.setState({userData});
            }
        } catch (error) {
            // Error retrieving data
            console.log(error);
        }
    }


    processFriendsList(uid){
        //好友信息
        let firebaseDb = firebase.firestore();
        let docRef = firebaseDb.collection("Users").doc(uid).collection("Friends_List");
        docRef.get().then(async (querySnapshot)=>{
            let usersData = [];
            await querySnapshot.docs.reduce((p,e,i) => p.then(async ()=> {
                //console.log(p, e.data(), i);
                let user = e.data();
                let userUid = e.id;
                let userRef = firebaseDb.collection("Users").doc(userUid);
                await userRef.get().then((userDoc) => {
                    if (userDoc.exists) {
                        //console.log("Document data:", userDoc.data());
                        let user = userDoc.data();
                        usersData.push(user);
                    } else {
                        console.log("No such document!");
                    }
                }).catch((error) => {
                    console.log("Error getting document:", error);
                });

            }),Promise.resolve());
            //console.log(usersData);
            this.insertFriendsSql(uid, usersData);
            this.seeTables(uid);

        }).catch((error) => {
            console.log("Error getting documents: ", error);
        });
    }


    insertFriendsSql(uid, usersData){
        db.transaction(
            tx => {
                usersData.map((userData) => {
                    console.log("开始插入了");
                    console.log(userData);
                    tx.executeSql(
                        'insert or replace into friend_list'+uid+' (userId,avatarUrl,username, location, gender) values (?,?,?,?,?)',
                        [userData.uid,userData.photoURL,userData.username,userData.location,userData.gender]);
                })
            }
            ,
            (error) => console.log("这里报错" + error),
            () => {
                console.log('insertCompleteFriendSql complete');
                this.friendsList.getSql();
            }
        );
    }

    seeTables(uid){
        db.transaction(
            tx => {
                tx.executeSql('select * from friend_list',[],(_,rows)=>{
                    console.log(rows);
                });
            },
            null,
            this.update
        );
    }

    render() {
        const { userData } = this.state;
        return (
            <SafeAreaView style={{backgroundColor:'white'}}>
                <ScrollView style={{backgroundColor: "white", height: "100%" ,width: "100%"}}>
                    <View style={{height:60,width:"100%",marginTop:35}}>
                    {/*这是设置按钮*/}
                    <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('Setting')}>
                    <Image style={{alignSelf: 'flex-end', marginRight:20, width:30,height:30}}
                    source={require('../../assets/images/setting.png')}
                    />
                    </TouchableWithoutFeedback>
                    </View>

                    <View style={styles.outerDiv}>
                        <Image
                            style={{width: 130,height: 130,marginTop:20,borderRadius: 25}}
                            source={{uri:userData.photoURL}}/>
                        <Text style={{marginTop:5,fontSize:22,color:"rgb(54,53,59)",fontWeight:"bold"}}>{userData.username}</Text>
                    </View>
                    <View style={{justifyContent: 'center', alignItems: 'center',}}>
                        <View style={{
                            width:"90%",
                            marginTop:25,
                            backgroundColor:"#F2F4F4",
                            height:55,
                            borderRadius:10,
                            flexDirection: 'row'
                        }}>
                            <SubButton
                                index={0}
                                onPress={() => console.log('first')}
                            />
                            <SubButton
                                index={1}
                                onPress={() => console.log('second')}
                                ViewStyle={{borderLeftWidth:2,borderRightWidth:2,borderColor:"white",}}
                            />
                            <SubButton
                                index={2}
                                onPress={() => console.log('third')}
                            />
                        </View>
                    </View>


                    <FriendsList
                        showThisUser={this.props.screenProps.showThisUser}
                        onRef={ref => this.friendsList = ref}
                        navigation={this.props.navigation}
                    />
                </ScrollView>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    outerDiv:{
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: 130,
        height: 130,
        marginTop:40,
        borderRadius: 25
    }
});