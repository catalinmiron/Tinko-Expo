import React from 'react';
import {
    View, Alert, TouchableWithoutFeedback, Image, ScrollView, SafeAreaView, StyleSheet, Text,
    AsyncStorage, TouchableOpacity, Dimensions
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
import Colors from "../../constants/Colors";
import IconBadge from '../../modules/react-native-icon-badge';
import {Ionicons} from '@expo/vector-icons';
import {writeInAsyncStorage, getFromAsyncStorage} from "../../modules/CommonUtility";
import {} from '../../modules/ChatStack';

const db = SQLite.openDatabase('db.db');
const SCREEN_WIDTH = Dimensions.get('window').width;

export default class Me extends React.Component {

    constructor(props){
        super(props);
        //console.log(props);
        this.props.navigation.setParams({badgeHidden:true});
        let user = firebase.auth().currentUser;
        this.state={
            userUid:user.uid,
            userData:{},
            badgeHidden:true,
        };
        getFromAsyncStorage('ThisUser').then((userData) => {
            if(userData) {
                this.setState({userData})
            }
        });
        getFromAsyncStorage('NewFriendsBadgeHidden').then((badgeHidden) => {
            if(badgeHidden){
                this.setState({badgeHidden});
                this.props.navigation.setParams({badgeHidden});
            }
        });
    }

    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return{
            title:'Me',
            tabBarIcon: ({ tintColor, focused }) =>
                <IconBadge
                    MainElement={
                        <View style={{height:30, width:30, alignItems: 'center',
                            justifyContent: 'center',}}>
                            <Ionicons
                                name={focused ? 'ios-person' : 'ios-person-outline'}
                                size={30}
                                style={{ marginBottom: -3 }}
                                color={focused ? Colors.tabIconSelected : Colors.tabIconDefault}
                            />
                        </View>

                    }
                    IconBadgeStyle={
                        {width:10, height:10, backgroundColor: 'red'}
                    }
                    Hidden={params.badgeHidden}
                />,
            header:null
        }
    };


    componentDidMount(){
        this.getThisUserData();
        //this.processFriendsList(this.state.userUid);
        this.initFriendsTableAndProcessFriendsList(this.state.userUid);
        this.props.screenProps.meRef(this);
    }




    showBadge(){
        this.setState({badgeHidden:false});
        this.props.navigation.setParams({badgeHidden:false});
        writeInAsyncStorage('NewFriendsBadgeHidden', false);
    }

    getThisUserData(){
        const {userUid} = this.state;
        let firestoreDb = firebase.firestore();
        let userRef = firestoreDb.collection("Users").doc(userUid);
        userRef.get().then((userDoc) => {
            if (userDoc.exists) {
                //console.log("Document data:", userDoc.data());
                let userData = userDoc.data();
                this.setState({userData});
                writeInAsyncStorage('ThisUser', userData);
            } else {
                console.log("No such document!");
                Alert.alert('Error', 'No Such Document');
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
            Alert.alert('Error', error);
        });
    }





    processFriendsList(uid){
        //好友信息
        let firebaseDb = firebase.firestore();
        let docRef = firebaseDb.collection("Users").doc(uid).collection("Friends_List");
        docRef.onSnapshot(async (snapshot) => {
            let usersData = [];
            await snapshot.docChanges.reduce((p,change,i) => p.then(async () => {
                if (change.type === "added") {
                    //console.log("New city: ", change.doc.data());
                    let userUid = change.doc.id;
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
                }
                if (change.type === "modified") {
                    //console.log("Modified city: ", change.doc.data());
                }
                if (change.type === "removed") {
                    //console.log("Removed city: ", change.doc.data());
                }
            }),Promise.resolve());
            //this.initFriendsTableAndInsertData(uid,usersData);
            this.insertFriendsSql(uid, usersData)
        });
    }

    initFriendsTableAndProcessFriendsList(uid){
        db.transaction(
            tx => {
                tx.executeSql('create table if not exists friend_list'+ uid +' (' +
                    'id integer primary key not null , ' +
                    'userId text UNIQUE, avatarUrl text , ' +
                    'username text, ' +
                    'location text,' +
                    'isFriend int DEFAULT 0,' +
                    'nickname text,' +
                    'isNicknameSet int DEFAULT 0,' +
                    'gender text);');
            },
            (error) => console.log("friendList :" + error),
            () => {
                console.log('friend_list complete');
                //this.insertFriendsSql(uid,usersData);
                this.processFriendsList(uid)
            }
        );
    }

    insertFriendsSql(uid, usersData){
        db.transaction(
            tx => {
                usersData.map((userData) => {
                    console.log("开始插入了");
                    console.log(userData);
                    tx.executeSql(
                        'insert or replace into friend_list'+uid+' (userId,avatarUrl,username, location, gender,isFriend) values (?,?,?,?,?,?)',
                        [userData.uid,userData.photoURL,userData.username,userData.location,userData.gender,1]);
                })
            }
            ,
            (error) => console.log("这里报错" + error),
            () => {
                console.log('insertCompleteFriendSql complete');
                //this.props.screenProps.friendsListIsReady();
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

    newFriendsButtonPressed(){
        this.setState({badgeHidden:true});
        this.props.navigation.setParams({badgeHidden:true});
        this.props.navigation.navigate('NewFriends');
        writeInAsyncStorage('NewFriendsBadgeHidden', true);
    }

    render() {
        const { userData ,badgeHidden} = this.state;
        return (
            <SafeAreaView style={{flex: 1, backgroundColor:'white'}}>
                <ScrollView style={{backgroundColor: "white", height: "100%" ,width: "100%"}}>
                    <Ionicons
                        onPress={() => this.props.navigation.navigate('Setting',{getThisUserData:this.getThisUserData.bind(this)})}
                        style={{position:'absolute',zIndex:100,top:20, right:SCREEN_WIDTH*0.05}}
                        name={'ios-settings'}
                        size={30}
                        color={'black'}
                        backgroundColor={'transparent'}
                    />
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
                            <TouchableOpacity
                                onPress={() => this.newFriendsButtonPressed()}
                                style={{flex:1, height:55,alignItems: 'center',justifyContent: 'center',}}>
                                <IconBadge
                                    MainElement={
                                        <View style={{height:35, width:35, alignItems: 'center',justifyContent: 'center',}}>
                                            <Ionicons
                                                name='md-person-add'
                                                size={26}
                                                color="#626567"
                                             />
                                        </View>

                                    }
                                    IconBadgeStyle={
                                        {width:10, height:10, backgroundColor: 'red'}
                                    }
                                    Hidden={badgeHidden}
                                />
                            </TouchableOpacity>
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