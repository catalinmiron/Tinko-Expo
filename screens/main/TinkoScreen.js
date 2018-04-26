import _ from 'lodash';
import React, { Component } from 'react';
import {StyleSheet, Text, View, ImageBackground, Dimensions, TouchableWithoutFeedback, Alert, ScrollView, SafeAreaView, RefreshControl,TouchableOpacity, Image, FlatList, Platform, AsyncStorage} from 'react-native';
import { Input, Button } from 'react-native-elements'
import {Toast} from 'native-base';
import { Header } from 'react-navigation';
import Masonry from '../../modules/react-native-masonry';
import {Facebook, Font, SQLite} from 'expo';
import firebase from "firebase";
import 'firebase/firestore';
import { NavigationActions } from 'react-navigation';
import { MaterialIcons } from '@expo/vector-icons';
import { getStartTimeString, getPostTimeString, getPostRequest, getUserData,writeInAsyncStorage, getFromAsyncStorage, getUserDataFromDatabase } from "../../modules/CommonUtility";
const db = SQLite.openDatabase('db.db');

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;


export default class TinkoScreen extends Component {
    //static navigationOptions = {title: 'Tinko', headerStyle:{ position: 'absolute', backgroundColor: 'transparent', zIndex: 100, top: 0, left: 0, right: 0, boarderBottomWidth: 0,shadowColor: 'transparent', elevation:0, shadowOpacity: 0 }};
    static  navigationOptions = {
        header:null,
        };

    constructor(props){
        super(props);
        //console.log(props);
        let user = firebase.auth().currentUser;
        this.getMeets=this.getMeets.bind(this);
        this.state = {
            userUid:user.uid,
            meetsData: [],
            padding:5,
            loadingDone:false,
            refreshing:false,
            lastVisible:null,
            orderByPostTime:true,
        };
        getFromAsyncStorage('TinkoMeets').then((meetsData) => {
            if(meetsData){
                this.setState({meetsData})
            }
        })
    }

    componentDidMount(){
        //this.setState({meetsData:data});
        //console.log('componentDidMount');

        //this.getMeets();
        this.initFriendsTableAndGetMeets();
        this.props.screenProps.getRef(this);
    }

    componentWillUnmount(){
        console.log('tinko componentWillUnMount');
    }

    initFriendsTableAndGetMeets(){
        db.transaction(
            tx => {
                //tx.executeSql('drop table if exists meet'+ this.state.userUid);
                tx.executeSql('create table if not exists friend_list'+ this.state.userUid +' (' +
                    'id integer primary key not null , ' +
                    'userId text UNIQUE, avatarUrl text , ' +
                    'username text, ' +
                    'location text,' +
                    'isFriend int DEFAULT 0,' +
                    'nickname text,' +
                    'isNicknameSet int DEFAULT 0,' +
                    'gender text);');
                tx.executeSql('create table if not exists meet'+ this.state.userUid +' (' +
                    'meetId text UNIQUE primary key not null,' +
                    'meetData text, ' +
                    'creatorData text,' +
                    'placePhotoData text,' +
                    'participatingUsersData text);');
            },
            (error) => console.log("friendList :" + error),
            () => {
                console.log('friend_list complete');
                this.getMeets();
            }
        );
    }


    insertMeetData(meetId, meetData){
        let meetDataString = JSON.stringify(meetData);
        db.transaction(
            tx => {
                tx.executeSql(
                    `INSERT OR REPLACE INTO meet${this.state.userUid} (meetId, meetData,creatorData,placePhotoData, participatingUsersData) 
                        VALUES (?,?,
                                (SELECT creatorData FROM meet${this.state.userUid} WHERE meetId = '${meetId}'),
                                (SELECT placePhotoData FROM meet${this.state.userUid} WHERE meetId = '${meetId}'),
                                (SELECT participatingUsersData FROM meet${this.state.userUid} WHERE meetId = '${meetId}'))`,
                    [meetId,meetDataString]);
            }
            ,
            (error) => console.log("insertMeetData" + error),
            () => console.log('insertMeetData complete')
        );
    }

    onSortButtonPressed(){
        //console.log("greetings from Tinko Screen");
        this.setState((state) => {
            let orderByPostTime = !state.orderByPostTime;
            return {orderByPostTime};
        }, () => {
            Toast.show({
                text:this.state.orderByPostTime? "Sort by Post Time" : "Sort by Start Time",
                position:'bottom'
            });
            this.getMeets()
        });
    }

    async getMeets(){
        this.setState({refreshing:true});
        const { orderByPostTime } = this.state;
        //console.log(orderByPostTime);
        const firestoreDb = firebase.firestore();
        var query;
        if(orderByPostTime){
            query = firestoreDb.collection("Meets").orderBy(`selectedFriendsList.${this.state.userUid}.postTime`,'desc').limit(10);
        } else {
            query = firestoreDb.collection("Meets").orderBy(`selectedFriendsList.${this.state.userUid}.startTime`).limit(10);
        }

        query.get().then(async (querySnapshot) => {
            var meetsData = await this.processMeets(querySnapshot.docs);
            this.setState({meetsData});
            //console.log(meetsData);
            console.log("Done");
            var lastVisible = querySnapshot.docs[querySnapshot.docs.length-1];
            this.setState({refreshing:false, loadingDone:true, lastVisible:lastVisible});
            writeInAsyncStorage('TinkoMeets', meetsData);
            querySnapshot.forEach(doc => {
                //console.log(doc.id, '=>', doc.data());
                let meetId = doc.id;
                let meetData = doc.data();
                this.insertMeetData(meetId, meetData);
            });
        }).catch((error) => {
            console.log(error);
        });
    }

    async processMeets(queryDatas){
        var meetsData = [];
        await queryDatas.reduce((p,e,i) => p.then(async ()=> {
            //console.log(p, e.data(), i);
            let meet = e.data();
            let meetId = e.id;
            let userUid = meet.creator;

            await getUserDataFromDatabase(userUid,
                (userData) => {
                    //console.log(userData);
                    let brick = this.buildBrick(meet, meetId, userData);
                    meetsData.push(brick);
                },
                (error) => {
                    Alert.alert('Error', error);
                });

        }),Promise.resolve());

        return meetsData;
    }

    buildBrick(meet, meetId, user){
        let startTimeString = getStartTimeString(meet.startTime);
        let postTimeString = getPostTimeString(meet.postTime);
        return {
            data: {
                meetId: meetId,
                title: meet.title,
                startTime: startTimeString,
                postTime: postTimeString,
                placeName: meet.place.name,
                creator: {
                    username: user.username,
                    photoURL: user.photoURL,
                },
                tags: meet.tagsList,
            },
            uri: meetId,
        };
    }

    async handleOnEndReached(){
        //console.log('lastVisible');
        //console.log('lastVisible', this.state.lastVisible);
        const {orderByPostTime, lastVisible} = this.state;
        if(lastVisible){
            const firestoreDb = firebase.firestore();
            let query;
            if(orderByPostTime){
                query = firestoreDb.collection("Meets").orderBy(`selectedFriendsList.${this.state.userUid}.postTime`,'desc').startAfter(lastVisible).limit(10);
            } else {
                query = firestoreDb.collection("Meets").orderBy(`selectedFriendsList.${this.state.userUid}.startTime`).startAfter(lastVisible).limit(10);
            }

            query.get().then(async (querySnapshot) => {
                let addMeetsData = await this.processMeets(querySnapshot.docs);
                let lastVisible = querySnapshot.docs[querySnapshot.docs.length-1];
                //console.log(addMeetsData);
                this.setState((state) => {
                    let meetsData = _.concat(state.meetsData, addMeetsData);
                    return {meetsData, lastVisible};
                })
            }).catch((error)=>{
                console.log(error);
            });
        }
    }


    render() {


        return (
            <View style={styles.container}>
                {/*{Platform.OS === 'android' &&*/}
                {/*<Button*/}
                    {/*containerStyle ={styles.refreshButton}*/}
                    {/*onPress={() => this.setState({meetsData:addData})}*/}
                    {/*text='refresh'*/}
                {/*/>}*/}
                {/*<View style={{height: Header.HEIGHT + 30}}/>*/}

                <Masonry
                    sorted // optional - Default: false
                    columns={2} // optional - Default: 2
                    bricks={this.state.meetsData}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={() => this.getMeets()}
                        />
                    }
                    headerHeight={Header.HEIGHT}
                    onEndReached={() => {
                        //console.log('before handleonendreached');
                        this.handleOnEndReached();
                    }}
                    onEndReachedThreshold={500}
                    navigation={this.props.screenProps.navigation}
                    //renderFooter={()=>(<text>123</text>)}
                />


                {/*<View style={{position:'absolute', zIndex:100, height:Header.HEIGHT, justifyContent:'flex-end', alignItems:'center'}}>*/}
                    {/*<MaterialIcons.Button*/}
                        {/*name="sort" size={26} backgroundColor="transparent"*/}
                        {/*onPress={() => console.log("sort Pressed")}*/}
                    {/*/>*/}
                {/*</View>*/}



            </View>
        );
    }
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        backgroundColor:'#C4ECFF',
    },
    headerTop: {
        flexDirection: 'row',
        padding: 5,
        alignItems: 'center',
        backgroundColor: 'transparent',
        position: 'absolute',
        zIndex: 100,
    },
    userPic: {
        height: 45,
        width: 45,
        borderRadius: 22,
        marginRight: 10,
        marginTop:10,
    },
    userName: {
        fontSize: 20,
        color:'white',
        fontWeight: 'bold',
    },
    postTime:{
        color:'white',
    },
    footerTitle:{
        fontSize: 25,
        color:'white',
        fontWeight:'bold',
    },
    footerTime:{
        fontSize:18,
        color:'white',
        fontWeight:'bold',
    },
    footerPlaceName:{
        fontSize:18,
        color:'white',
        fontWeight:'bold',
    },
    footer:{
        flex:1,
        backgroundColor: 'transparent',
        padding: 5,
        paddingRight: 9,
        paddingLeft: 9,
        zIndex: 50,
        position: 'absolute',
        bottom: 0

    },
    refreshButton:{
        position:'absolute',
        top: 10,
        right: 10,
        zIndex:100
    }

});