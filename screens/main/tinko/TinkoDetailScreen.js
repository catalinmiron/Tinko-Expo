import _ from 'lodash';
import React from 'react';
import {View, Alert, TouchableWithoutFeedback, Image, ScrollView, Text, StyleSheet, Dimensions, SafeAreaView, TouchableOpacity} from 'react-native';
import firebase from 'firebase';
import 'firebase/firestore';
import Swiper from 'react-native-swiper';
import { getStartTimeString,  getDurationString, getUserData, getImageSource } from "../../../modules/CommonUtility";
import { MapView } from 'expo';
import { Ionicons, MaterialIcons, Entypo, MaterialCommunityIcons, Feather  } from '@expo/vector-icons';
import { Avatar, Button, Header} from 'react-native-elements';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { getPostRequest } from "../../../modules/CommonUtility";
import { ActionSheetProvider, connectActionSheet } from '@expo/react-native-action-sheet';
import SocketIOClient from "socket.io-client";
import {createMeet} from "../../../modules/SocketClient";


const SCREEN_WIDTH = Dimensions.get('window').width;

@connectActionSheet
export default class TinkoDetailScreen extends React.Component {

    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        const { allowParticipantsInvite, identity, threeDots } = params;

        return {
            headerLeft:(<Ionicons.Button
                name="ios-arrow-back" size={20} color="white" style={{marginLeft:26}} backgroundColor="transparent"
                onPress={() => navigation.goBack(null)}/>),
            headerRight:(
                <View style={{flexDirection:'row'}}>

                    {/*{(allowParticipantsInvite || identity===1) &&*/}
                    {/*<Entypo.Button*/}
                        {/*name="share-alternative" size={20} color="white" backgroundColor="transparent"*/}
                        {/*onPress = {() => console.log('share')}/>*/}
                    {/*}*/}

                    {/*{identity===3 &&*/}
                    {/*<Entypo.Button*/}
                        {/*name="add-user" size={20} color="white" backgroundColor="transparent"*/}
                        {/*onPress = {() => console.log('invite')}/>*/}
                    {/*}*/}

                    <Entypo.Button
                        name="dots-three-vertical" size={20} color="white" style={{marginRight:26}} backgroundColor="transparent"
                        onPress = {threeDots}/>
                </View>
                ),
            headerStyle:{ position: 'absolute', backgroundColor: 'transparent', zIndex: 100, top: 0, left: 0, right: 0, borderBottomWidth: 0,borderBottomColor: 'transparent',}
        };
    };

    constructor(props){
        super(props);
        console.log(props);
        let user = firebase.auth().currentUser;
        this.onJoinButtonPressed = this.onJoinButtonPressed.bind(this);
        this.renderActivityBar = this.renderActivityBar.bind(this);
        this.state={
            meet:{},
            userUid:user.uid,
            meetId: this.props.navigation.state.params.meetId,
            allFriends: false,
            allowParticipantsInvite:false,
            allowPeopleNearby:false,
            creatorUid:'',
            description:'',
            duration:1,
            endTime:null,
            maxNo:0,
            participatingUsersList:[],
            placeAddress:'',
            placeName:'',
            placeCoordinate:{
                lat:0,
                lng:0,
            },
            placeId:'',
            postTime:null,
            selectedFriendsList:[],
            startTime:new Date(),
            status:false,
            tagsList:[],
            title:'',
            creatorUsername:'',
            creatorPhotoURL:'',
            placePhotos:[],
            participatingUsersData:[],
            creatorLoadingDone:false,
            placePhotosLoadingDone:false,
            usersDataLoadingDone:false,
            buttonShowLoading:false,
            unsubscribe:null,
            identity:1,
            //identity: 0: not joined
            //          1: creator
            //          2: joined cannot invite
            //          3: joined can invite
        }
    }

    setNavigationParams(){
        const{allowParticipantsInvite, identity} = this.state;
        this.props.navigation.setParams({allowParticipantsInvite:allowParticipantsInvite, identity:identity});
    }

    componentDidMount(){

        this.setMeetDataListener();
        this.props.navigation.setParams({threeDots:this.onOpenThreeDotsActionSheet.bind(this)});
        this.setNavigationParams();
    }


    componentWillUnmount(){
        const {unsubscribe} = this.state;
        unsubscribe();
    }

    setMeetDataListener(){
        const { meetId, userUid } = this.state;
        let firestoreDb = firebase.firestore();
        var meetRef = firestoreDb.collection("Meets").doc(meetId);
        var unsubscribe = meetRef.onSnapshot((meetDoc) => {
            if (meetDoc.exists) {
                //console.log("Document data:", meetDoc.data());
                let meet = meetDoc.data();
                meet['meetId'] = meetId;
                //console.log(meet);

                let allFriends = meet.allFriends,
                    allowParticipantsInvite = meet.allowParticipantsInvite,
                    allowPeopleNearby = meet.allowPeopleNearby,
                    creatorUid = meet.creator,
                    description = meet.description,
                    duration = meet.duration,
                    endTime = meet.endTime,
                    maxNo = meet.maxNo,
                    participatingUsersList = Object.keys(meet.participatingUsersList),
                    placeAddress = meet.place.address,
                    placeName = meet.place.name,
                    placeCoordinate = meet.place.coordinate,
                    placeId = meet.place.placeId,
                    postTime = meet.postTime,
                    selectedFriendsList = Object.keys(meet.selectedFriendsList),
                    startTime = meet.startTime,
                    status = meet.status,
                    title = meet.title;
                let tagsList;
                if(meet.tagsList){
                    tagsList=meet.tagsList;
                }else{
                    tagsList=[];
                }

                var identity;
                if(userUid === creatorUid){
                    identity=1;//创佳人
                } else {
                    let isJoined = _.includes(participatingUsersList, userUid);
                    if(isJoined){
                        if(allowParticipantsInvite){
                            identity=3;//参加，可邀请
                        }else{
                            identity=2;//参加，不可邀请
                        }
                    }else{
                        identity=0;//游客
                    }

                }

                this.getCreatorData(creatorUid);
                this.getPlacePhotos(placeId);
                this.updateParticipatingUsersData(participatingUsersList);

                this.setState({
                    meet,
                    allFriends,
                    allowParticipantsInvite,
                    allowPeopleNearby,
                    creatorUid,
                    description,
                    duration,
                    endTime,
                    maxNo,
                    participatingUsersList,
                    placeAddress,
                    placeName,
                    placeCoordinate,
                    placeId,
                    postTime,
                    selectedFriendsList,
                    startTime,
                    status,
                    tagsList,
                    title,
                    identity,
                    });
                this.setNavigationParams();
                //console.log(this.state);
                //this.marker.showCallout()
            } else {
                console.log("No such document!");
                Aler.alert('Sorry','This Tinko is not available anymore')
            }
        });
        this.setState({unsubscribe});
    }

    getCreatorData(creatorUid){
        getUserData(creatorUid).fork(
            (error) => {
                console.log(error);
            },
            (creatorObj) => {
                //console.log(creatorObj);
                let creatorUsername = creatorObj.username,
                    creatorPhotoURL = creatorObj.photoURL;
                this.setState({creatorUsername, creatorPhotoURL, creatorLoadingDone:true});
            }
        );

    }

    getPlacePhotos(placeId){
        try {
            fetch(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=AIzaSyCw_VwOF6hmY5yri8OpqOr9sCzTTT7JKiU`)
                .then((response) => response.json())
                .then((responseJson) => {
                    //console.log(responseJson);
                    let photos = responseJson.result.photos;
                    this.setState({placePhotos: photos, placePhotosLoadingDone: true});

                }).catch((error) => {
                console.error(error);
            });
        } catch (error) {
            console.error(error);

        }

    }

    updateParticipatingUsersData(participatingUsersList){
        this.setState({participatingUsersData:[]});
        participatingUsersList
            .map(userUid => getUserData(userUid))
            .map(getUserDataTask => getUserDataTask.fork(
                (error) => console.warn(error),
                (userObj) => {
                    this.setState(state => {
                        var usersData = state.participatingUsersData;
                        usersData.push(userObj);
                        return {
                            participatingUsersData: usersData,
                        };
                    });
                    //console.log(this.state.participatingUsersData);
                }
            ));

    }

    onJoinButtonPressed(){
        this.setState({buttonShowLoading:true});
        const { userUid, meetId } = this.state;
        let bodyData = {
            userid: userUid,
            meetId: meetId,
        };
        getPostRequest("participateMeet", bodyData,
            (response) => {
                console.log(response);
                this.setState({buttonShowLoading:false});
                createMeet(userUid, meetId);
            }, (error) => {
                Alert.alert("Error", error);
                this.setState({buttonShowLoading:false})
            });
    }

    onQuitMeetButtonPressed(){

        const { userUid, meetId } = this.state;
        let bodyData = {
            userUid: userUid,
            meetId: meetId,
        };
        getPostRequest("leaveMeet", bodyData,
            (response) => {
                console.log(response);
                this.props.navigation.goBack(null);
            }, (error) => {
                Alert.alert("Error", error);
            });
    }

    onOpenThreeDotsActionSheet = () => {
        const { identity } = this.state;
        var options;
        var destructiveButtonIndex;
        var cancelButtonIndex;
        switch (identity){
            case 0:
                options = ["Report", "Cancel"];
                //destructiveButtonIndex = 0;
                cancelButtonIndex = 1;
                break;
            case 1:
                options = ["Edit","Dismiss", "Cancel"];
                destructiveButtonIndex = 1;
                cancelButtonIndex = 2;
                break;
            case 2:
            case 3:
                options = ["Report", "Quit", "Cancel"];
                destructiveButtonIndex = 1;
                cancelButtonIndex = 2;
                break;
            default:
                options = ["Cancel"];
                //destructiveButtonIndex = 0;
                cancelButtonIndex = 0;
        }

        this.props.showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex,
                destructiveButtonIndex,
            },
            buttonIndex => {
                console.log(buttonIndex);
                if(options[buttonIndex] === 'Quit'){
                    //this.onQuitMeetButtonPressed();
                    Alert.alert("Alert", "Are you sure to Quit?",
                        [
                            {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                            {text: 'Yes', onPress: () => this.onQuitMeetButtonPressed(), style:"destructive"},
                        ]);
                } else if(options[buttonIndex] === 'Edit') {
                    this.props.navigation.navigate('Create',{meet:this.state.meet});
                }
            }
        );
    };

    render() {
        const { creatorLoadingDone, placePhotosLoadingDone, userUid, creatorUid, identity,
            creatorPhotoURL, creatorUsername, title, placePhotos, startTime, allowPeopleNearby, participatingUsersList,
            maxNo, description, duration, participatingUsersData, placeName, placeCoordinate, placeAddress, placeId, tagsList } = this.state;

        if(!(creatorLoadingDone && placePhotosLoadingDone)){
            return(
                <View/>
            );
        }

        let tagsString='';
        for(let i=0; i<tagsList.length; i++){
            tagsString += ' ' + tagsList[i];
        }

        return (
            <View style={styles.container}>
                <ScrollView>
                    <View style={{height:SCREEN_WIDTH/2}}>
                        <Swiper
                            loop
                            showsPagination = {false}
                        >


                            {_.size(placePhotos) > 0 ?
                                placePhotos.map((l, i) =>(
                                    <Image
                                        resizeMethod={'auto'}
                                        style={{width:SCREEN_WIDTH, height:SCREEN_WIDTH/2}}
                                        key = {l.photo_reference}
                                        source={{uri:`https://maps.googleapis.com/maps/api/place/photo?maxwidth=${SCREEN_WIDTH}&photoreference=${l.photo_reference}&key=AIzaSyCw_VwOF6hmY5yri8OpqOr9sCzTTT7JKiU`}}/>
                                ))
                                :
                                <Image
                                    resizeMethod={'auto'}
                                    style={{width:SCREEN_WIDTH, height:SCREEN_WIDTH/2}}
                                    key = {'placePhoto'}
                                    source={getImageSource(tagsList[0])}/>
                            }
                        </Swiper>
                    </View>

                    <View style={{flexDirection: 'row', alignItems:'center', position:'absolute', marginTop:SCREEN_WIDTH/2-60, right:0}}>
                        <Text
                            onPress={() => this.props.screenProps.showThisUser(creatorUid, this.props.navigation)}
                            style={{marginRight:30, color:'white', fontSize: 18, fontWeight:'bold'}}>{creatorUsername}</Text>
                        <TouchableWithoutFeedback
                            onPress={() => this.props.screenProps.showThisUser(creatorUid, this.props.navigation)}
                        >
                            <Image
                                onPress={() => this.props.screenProps.showThisUser(creatorUid, this.props.navigation)}
                                style={{width:80, height:80, marginRight:15, borderWidth:1.5, borderColor:'white'}}
                                key='creatorPhoto'
                                source={{uri: creatorPhotoURL}}
                            />
                        </TouchableWithoutFeedback>
                    </View>

                    <View style={{margin:26}}>
                        <Text style={{marginTop: 20, fontSize:25, fontFamily:'bold', color:'#1C2833'}}>{title}</Text>
                        <Text style={{marginTop:10, fontSize:20, fontFamily:'regular', color:'#2C3E50'}}>{placeName}</Text>

                        <View style={{marginTop:30, flexDirection:'row', justifyContent:'space-between'}}>
                            <View style={{flex:1, flexDirection:'row'}}>
                                <Entypo name="calendar" size={26} color="#1C2833" />
                                <Text style={{marginLeft: 5, fontSize:20, fontFamily:'regular', color:'#2C3E50'}}>{getStartTimeString(startTime)}</Text>
                            </View>

                            <View style={{flex:1, flexDirection:'row'}}>
                                <Entypo name="time-slot" size={26} color="#1C2833" />
                                <Text style={{marginLeft: 5, fontSize:20, fontFamily:'regular', color:'#2C3E50'}}>{getDurationString(duration)}</Text>
                            </View>

                        </View>
                        <View style={{flexDirection:'row', justifyContent:"space-between", marginTop:10}}>
                            <View style={{flex:1, flexDirection:'row'}}>
                                <Ionicons name="ios-heart" size={26} color="#1C2833" />
                                <Text style={{marginLeft: 5, fontSize:20, fontFamily:'regular', color:'#2C3E50'}}>{`Status: ${participatingUsersList.length} / ${maxNo===1 ? '∞' : maxNo}`}</Text>
                            </View>
                            <View style={{flex:1, flexDirection:'row'}}>
                                <MaterialIcons name="group" size={26} color="#1C2833" />
                                <Text style={{marginLeft: 5, fontSize:20, fontFamily:'regular', color:'#2C3E50'}}>{allowPeopleNearby? "Public" : "Private"}</Text>
                            </View>

                        </View>
                        <Text style={{marginTop:30, fontFamily:'regular', fontSize:17, color:'#212F3C'}}>{tagsString}</Text>
                        <Text style={{marginTop:15, fontSize:17, fontFamily:'regular', color:'#566573'}}>{description}</Text>
                        <View style={{marginTop:30}}>
                            {_.chunk(participatingUsersData, 3).map((chunk, chunkIndex) => (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 }} key={chunkIndex}>
                                    {chunk.map(userData => (
                                        <Avatar
                                            large
                                            rounded
                                            source={userData.photoURL ? { uri: userData.photoURL } : null}
                                            title='TK'
                                            key={userData.uid}
                                            onPress={() => this.props.screenProps.showThisUser(userData.uid, this.props.navigation)}
                                        />
                                    ))}
                                </View>
                            ))}
                        </View>
                        {/*<List style={{marginTop:30, borderBottomColor:'#F2F4F4'}}>*/}
                        {/**/}
                        {/*</List>*/}
                    </View>

                    <TouchableOpacity>
                        <MapView
                            rotateEnabled={false}
                            scrollEnabled={false}
                            style={{marginTop:30, width:SCREEN_WIDTH, height: SCREEN_WIDTH*2/3 }}
                            showsUserLocation
                            region={{
                                latitude: placeCoordinate.lat,
                                longitude: placeCoordinate.lng,
                                latitudeDelta: 0.0922,
                                longitudeDelta: 0.0421,
                            }}
                            onRegionChangeComplete={() => this.marker.showCallout()}
                        >

                            <MapView.Marker
                                coordinate={{
                                    latitude: placeCoordinate.lat,
                                    longitude: placeCoordinate.lng,
                                }}
                                title={placeName}
                                description={placeAddress}
                                key={placeId}
                                ref={ref => { this.marker = ref; }}
                            />
                            <MapView.Callout/>
                        </MapView>
                    </TouchableOpacity>


                </ScrollView>
                <this.renderActivityBar />


            </View>

        );
    }

    renderActivityBar(){
        const {buttonShowLoading, identity, allowParticipantsInvite, meetId} = this.state;

        return(
            <Header
            outerContainerStyles = {{backgroundColor: '#FFFCF6', borderBottomColor:'transparent', borderBottomWidth:0, paddingTop:0, ...ifIphoneX({height:78}, {height:50})}}
            innerContainerStyles = {{ alignItems: 'flex-start'}}
            leftComponent={
                <TouchableWithoutFeedback
                    onPress={()=>this.props.navigation.navigate('TinkoDetailChat')}
                    style={{flex:1}}>
                    <View style={{flexDirection:'row', height:50, alignItems:'center', }}>
                        <MaterialCommunityIcons name='pencil' size={20} color={'black'} backgroundColor={'transparent'}/>
                        <Text style={{marginLeft:10}}>Discuss..</Text>
                    </View>


                </TouchableWithoutFeedback>
            }
            rightComponent={
                <View style={{flexDirection:'row', height:50, alignItems:'center'}}>
                    {(allowParticipantsInvite || identity===1) &&
                    <Entypo.Button
                        name="share-alternative" size={20} color="black" backgroundColor="transparent"
                        onPress = {() => console.log('share')}/>
                    }

                    {identity===3 &&
                    <Feather.Button
                        name="user-plus" size={24} color="black" backgroundColor="transparent"
                        onPress = {() => this.props.navigation.navigate('ParticipantsInvite',{meetId:meetId})}/>
                    }
                    {identity === 0 &&
                    <Button
                        onPress={() => this.onJoinButtonPressed()}
                        loading={buttonShowLoading}
                        loadingProps={{size: 'small', color: 'white'}}
                        title={"Join"}
                        containerViewStyle={{ flex:1, marginRight:0}}
                        buttonStyle={{borderRadius:0, height:50, width:SCREEN_WIDTH*2/5}}/>
                    }

                </View>

            }
        />);
    }


}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    wrapper: {

    },
    title:{
        fontSize:25, fontFamily:'bold', color:'#1C2833'
    }

});