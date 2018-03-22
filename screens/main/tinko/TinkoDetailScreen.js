import _ from 'lodash';
import React from 'react';
import {View, Alert, TouchableWithoutFeedback, Image, ScrollView, Text, StyleSheet, Dimensions} from 'react-native';
import firebase from 'firebase';
import 'firebase/firestore';
import Swiper from 'react-native-swiper'

const SCREEN_WIDTH = Dimensions.get('window').width;

const data = [{
    uri: 'https://s-media-cache-ak0.pinimg.com/736x/b1/21/df/b121df29b41b771d6610dba71834e512.jpg',
},
    {
        uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQpD8mz-2Wwix8hHbGgR-mCFQVFTF7TF7hU05BxwLVO1PS5j-rZA',
    },
    {
        uri: 'https://s-media-cache-ak0.pinimg.com/736x/5a/15/0c/5a150cf9d5a825c8b5871eefbeda8d14.jpg'
    },
    {
        uri: 'https://s-media-cache-ak0.pinimg.com/736x/04/63/3f/04633fcc08f9d405064391bd80cb0828.jpg'
    },
    {
        uri: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQRWkuUMpLyu3QnFu5Xsi_7SpbabzRtSis-_QhKas6Oyj3neJoeug'
    }];

export default class TinkoDetailScreen extends React.Component {

    static navigationOptions = ({navigation}) => ({
            header:null,
    });

    constructor(props){
        super(props);
        //console.log(props);
        this.state={
            meetId: this.props.navigation.state.params.meetId,
            allFriends: false,
            allowParticipantsInvite:false,
            allowPeopleNearby:false,
            creatorUid:'',
            description:'',
            duration:'',
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
            startTime:null,
            status:false,
            tagList:[],
            title:'',
            creatorUsername:'',
            creatorPhotoURL:'',
            placePhotos:[],
        }
    }

    componentDidMount(){
        this.getMeetData();
    }

    getMeetData(){
        const { meetId } = this.state;
        let firestoreDb = firebase.firestore();
        var meetRef = firestoreDb.collection("Meets").doc(meetId);
        meetRef.get().then((meetDoc) => {
            if (meetDoc.exists) {
                //console.log("Document data:", meetDoc.data());
                let meet = meetDoc.data();
                this.getCreatorData(meet.creator);
                this.getPlacePhotos(meet.place.placeId);
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
                    tagList = Object.keys(meet.tagList),
                    title = meet.title;
                this.setState({allFriends,
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
                    tagList,
                    title});
                console.log(this.state);

            } else {
                console.log("No such document!");
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
    }

    getCreatorData(creatorUid){
        let firestoreDb = firebase.firestore();
        var userRef = firestoreDb.collection("Users").doc(creatorUid);
        userRef.get().then((userDoc) => {
            if (userDoc.exists) {
                //console.log("Document data:", userDoc.data());
                let user = userDoc.data();
                let creatorUsername = user.username,
                    creatorPhotoURL = user.photoURL;

                this.setState({creatorUsername, creatorPhotoURL});
            } else {
                console.log("No such document!");
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
    }

    getPlacePhotos(placeId){
        fetch(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=AIzaSyCw_VwOF6hmY5yri8OpqOr9sCzTTT7JKiU`)
            .then((response) => response.json())
            .then((responseJson) => {
                console.log(responseJson);
                let photos = responseJson.result.photos;
                this.setState({placePhotos:photos});

            }).catch((error) => {
            console.error(error);
        });
    }


    render() {
        const { creatorPhotoURL, creatorUsername, title, placePhotos } = this.state;

        return (
            <ScrollView style={styles.container}>
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
                                source={require('../../../assets/images/tagsTheme/StaindGlass.jpg')}/>
                            }
                    </Swiper>
                </View>

                <View style={{flexDirection: 'row', alignItems:'center', position:'absolute', marginTop:SCREEN_WIDTH/2-60, right:0}}>
                    <Text style={{marginRight:30, color:'white', fontSize: 18, fontWeight:'bold'}}>{creatorUsername}</Text>
                    <Image
                        style={{width:80, height:80, marginRight:15, borderWidth:1.5, borderColor:'white'}}
                        key='creatorPhoto'
                        source={{uri: creatorPhotoURL}}
                    />
                </View>

                <View style={{margin:26}}>
                    <Text style={{marginTop: 20, fontSize:25, fontFamily:'bold', color:'#1C2833'}}>{title}</Text>
                </View>


            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    wrapper: {

    },

});