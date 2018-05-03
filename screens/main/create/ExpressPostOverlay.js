import React, {
    Component
} from 'react'
import {Text, Image, AsyncStorage, DeviceEventEmitter, Platform, Alert, TouchableOpacity} from 'react-native';
import {Button, Header, Avatar, Overlay, Input} from 'react-native-elements'
import {getMeetAvatarUri, getUserData} from "../../../modules/CommonUtility";
import {getLength,updateUnReadNum} from "../../../modules/ChatStack";
import {createMeet, sendFriendRequest} from "../../../modules/SocketClient";

import {
    View
} from 'react-native'
import firebase from "firebase";
import {Ionicons} from '@expo/vector-icons'
import {Constants, Location, Permissions, SQLite} from "expo";

const db = SQLite.openDatabase('db.db');

const allTagsList = ['#party', '#sports', '#food', '#shopping', '#movie', '#bar', '#travel', '#study', '#esports'];

export default class ExpressPostOverlay extends Component{

    static navigationOptions = {header:null};

    constructor(props){
        super(props);
        props.onRef(this);
        this.showExpressPostOverlay=this.showExpressPostOverlay.bind(this);
        this.state={
             isVisible:false,
            placeName:'',
            placeAddress:'',
            placeCoordinate:'',
            placeId:'',
            selectedFriendsList:[]
        };
        if (Platform.OS === 'android' && !Constants.isDevice) {
            // this.setState({
            //     errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
            // });
        } else {
            this.getLocationAsync();
        }
        this.getSql();
    }

    showExpressPostOverlay(){
        this.setState({isVisible:true})
    }

    getLocationAsync = async () => {
        let { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status !== 'granted') {
            Alert.alert('Error', 'Permission to access location was denied')
        }

        let location = await Location.getCurrentPositionAsync({});
        this.setState({ location });
        //console.log(this.state.location);
        //console.log(this.state.location.coords.latitude);
        fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.coords.latitude},${location.coords.longitude}&rankby=distance&key=AIzaSyCw_VwOF6hmY5yri8OpqOr9sCzTTT7JKiU`)
            .then((response) => response.json())
            .then((responseJson) => {
                //console.log(responseJson.results[0]);
                let myPlace = responseJson.results[0];
                this.setState({placeName: myPlace.name, placeAddress: myPlace.vicinity, placeCoordinate: myPlace.geometry.location, placeId: myPlace.place_id })
            }).catch((error) => {
            console.error(error);
        });
    };

    getSql(){
        const { userUid } = this.state;
        db.transaction(
            tx => {
                tx.executeSql('select * from friend_list'+userUid, [], (_, { rows }) => {
                    let dataArr =  rows['_array'],
                        rtnArr = [];
                    for (let i = 0; i <dataArr.length;i++){
                        rtnArr.push(dataArr[i].userId);
                    }
                    this.setState({ selectedFriendsList: rtnArr });
                });
            },
            null,
            this.update
        )
    }


    createExpressMeet(tagName){
        const{placeName, placeAddress, placeCoordinate, placeId, selectedFriendsList} = this.state;
        let userUid = firebase.auth().currentUser.uid;
        let tagsCategory={};
        tagsCategory[tagName]=true;

        let startTime = new Date();
        startTime.setTime((startTime.getTime()+10*60*1000));
        let durationTS = 3*60*60*1000;
        let endTime = new Date();
        endTime.setTime(startTime.getTime()+durationTS);

        let placeObj = {
            name: placeName,
            address: placeAddress,
            coordinate: placeCoordinate,
            placeId: placeId,
        };

        let statusTimeObj = {
            status: true,
            startTime: startTime,
            postTime: new Date(),
        };

        let participatingUsersListObj= {};
        participatingUsersListObj[userUid] = statusTimeObj;

        var selectedFriendsListObj = {};
        selectedFriendsListObj[userUid] = statusTimeObj;
        selectedFriendsList.map((l,i) => {
            selectedFriendsListObj[l] = statusTimeObj;
        });

        var docData = {
            title:'Right Here Right Now!',
            creator: userUid,
            tagsList:[tagName],
            tagsCategory: tagsCategory,
            startTime: startTime,
            postTime:new Date(),
            endTime: endTime,
            duration: durationTS,
            allFriends: true,
            allowPeopleNearby: true,
            allowParticipantsInvite: true,
            maxNo: 1,
            description: '',
            place: placeObj,
            participatingUsersList: participatingUsersListObj,
            participatingUsersArray:[userUid],
            selectedFriendsList: selectedFriendsListObj,
            status: true,
        };

        firebase.firestore().collection("Meets").add(docData)
            .then((meetRef) => {
                console.log("Document written with ID: ", meetRef.id);
                createMeet(userUid, meetRef.id);
                this.props.tinkoGetMeets();
            })
            .catch((error) => {
                console.log("Error adding document: ", error);
                Alert.alert('Error', error);
            });
        this.setState({isVisible:false});
    }

    render() {
        const {isVisible} = this.state;
        return (
            <Overlay
                height={400}
                borderRadius={25}
                isVisible={isVisible}
                overlayBackgroundColor='rgba(255, 255, 255, 0.9)'
            >

                <View>
                    {_.chunk(allTagsList, 3).map((chunk, chunkIndex) => (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 }} key={chunkIndex}>
                            {chunk.map(tagName => (
                                <TouchableOpacity
                                    onPress={() => this.createExpressMeet(tagName)}
                                    key={tagName}
                                    style = {{width:75}}>
                                    <Avatar
                                        large
                                        rounded
                                        source={{ uri: getMeetAvatarUri(tagName) }}
                                        title='TK'
                                    />
                                    <Text
                                        style={{marginTop:3,color:'#626567', textAlign: 'center'}}
                                    >{tagName}</Text>
                                </TouchableOpacity>

                            ))}
                        </View>
                    ))}
                    <Button
                        containerStyle={{marginTop:15}}
                        title='dismiss'
                        onPress={()=> this.setState({isVisible:false})}
                    />
                </View>
            </Overlay>
        )
    }
}
