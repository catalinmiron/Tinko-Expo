import _ from 'lodash';
import React, { Component } from 'react';
import {StyleSheet, Text, View, ImageBackground, Dimensions, TouchableWithoutFeedback, Alert, ScrollView, SafeAreaView, RefreshControl,TouchableOpacity, Image, FlatList, Platform} from 'react-native';
import { Input, Button } from 'react-native-elements'

import { Header } from 'react-navigation';
import Masonry from '../../modules/react-native-masonry';
import {Facebook, Font} from 'expo';
import firebase from "firebase";
import 'firebase/firestore';
import { NavigationActions } from 'react-navigation';
//import Icon from 'react-native-vector-icons/FontAwesome';
import { getStartTimeString, getPostTimeString, getPostRequest } from "../../modules/CommonUtility";


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
        this.state = {
            userUid:user.uid,
            meetsData: [],
            padding:5,
            refreshing:false,
        }
    }

    componentDidMount(){
        //this.setState({meetsData:data});
        //console.log('componentDidMount');
        this.getMeets();
    }

    componentWillUnmount(){
        console.log('tinko componentWillUnMount');
    }

    getMeets(){
        const firestoreDb = firebase.firestore();
        //firestoreDb.collection("Meets").where(`selectedFriendsList.${this.state.userUid}.status`, "==", true).where("status", "==", true)
        firestoreDb.collection("Meets").where(`selectedFriendsList.${this.state.userUid}.postTime`, "==", true).orderBy("postTime")
            .onSnapshot((querySnapshot) => {
                const {meetsData} = this.state;
                //console.log('before querysnapshot for loop');
                querySnapshot.docChanges.forEach((change) => {
                    //console.log(meetDoc.id, " => ", meetDoc.data());
                    if(change.type === "added"){
                        let meetDoc = change.doc;
                        let meet = change.doc.data();
                        let creatorId = meet.creator;
                        let userRef = firestoreDb.collection("Users").doc(creatorId);
                        userRef.get().then((userDoc) => {
                            if (userDoc.exists) {
                                //console.log("Document data:", userDoc.data());
                                let creator = userDoc.data();
                                let startTimeString = getStartTimeString(meet.startTime);
                                let postTimeString = getPostTimeString(meet.postTime);
                                let brick = {
                                    onPress: () => this.props.screenProps.navigation.navigate('TinkoDetail', {meetId:meetDoc.id}),
                                    data:{
                                        title: meet.title,
                                        startTime: startTimeString,
                                        postTime: postTimeString,
                                        placeName: meet.place.name,
                                        creator: {
                                            name: creator.username,
                                            photoURL: creator.photoURL,
                                        },
                                        tags: Object.keys(meet.tagList),
                                    },
                                    renderHeader: (data) => {
                                        return (
                                            <TouchableOpacity
                                                key='brick-footer'
                                                style={styles.headerTop}
                                                onPress={() => this.props.screenProps.navigation.navigate('TinkoDetail', {meetId:meetDoc.id})}
                                            >
                                                <Image
                                                    source={{ uri: data.creator.photoURL }}
                                                    style={styles.userPic}/>
                                                <View style={{marginTop:5}}>
                                                    <Text style={styles.userName}>{data.creator.name}</Text>
                                                    <Text style={styles.postTime}>{data.postTime}</Text>
                                                </View>
                                                <View style={{width:10, backgroundColor:'white'}}/>
                                            </TouchableOpacity>
                                        )
                                    },
                                    renderFooter: (data) => {
                                        return (
                                            <TouchableOpacity key='brick-header' style={styles.footer} onPress={() => this.props.screenProps.navigation.navigate('TinkoDetail', {meetId:meetDoc.id})}>
                                                <Text style={styles.footerTitle}>{data.title}</Text>
                                                <Text style={styles.footerTime}>{data.startTime}</Text>
                                                <Text style={styles.footerPlaceName}>{data.placeName}</Text>
                                            </TouchableOpacity>
                                        )
                                    },
                                    uri: meetDoc.id,
                                };
                                meetsData.push(brick);
                                this.setState({meetsData});
                            } else {
                                console.log("No such document!");
                            }
                        }).catch((error) => {
                            console.log("Error getting document:", error);
                        })
                    }

                    if(change.type === "removed"){
                        const { meetsData } = this.state;
                        _.remove(meetsData, function(brick) {
                            return brick.uri === change.doc.id;
                        });
                        this.setState({meetsData});
                    }


                });

            });
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

                <ScrollView
                    // refreshControl={
                    //     <RefreshControl
                    //         refreshing={this.state.refreshing}
                    //         onRefresh={this._onRefresh.bind(this)}
                    //     />
                    // }
                     >
                    <View style={{height: Header.HEIGHT + 30}}/>
                    <Masonry
                        sorted // optional - Default: false
                        columns={2} // optional - Default: 2
                        bricks={this.state.meetsData}
                        // refreshControl={
                        //     <RefreshControl
                        //         refreshing={this.state.refreshing}
                        //         onRefresh={this._onRefresh.bind(this)}
                        //     />
                        // }
                    />
                </ScrollView>


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