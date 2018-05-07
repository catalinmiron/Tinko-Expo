import _ from 'lodash';
import React from 'react';
import ReactNative, {
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    Keyboard,
    TextInput,
    Dimensions,
    Switch,
    SafeAreaView,
    Text
} from 'react-native';
import {
    Input,
    Button,
    Card,
    ButtonGroup,
    Tile,
    Col,
    Row,
    Icon,
    Avatar, ListItem,
} from 'react-native-elements';
import CustomButton from '../../components/CustomButton';
import  DatePicker from 'react-native-datepicker';
import { NavigationActions } from 'react-navigation';
import { SQLite, Constants, Location, Permissions } from 'expo';
import firebase from 'firebase';
import { EvilIcons, Ionicons } from '@expo/vector-icons';
//import EvilIcons from '@expo/vector-icons/EvilIcons';
import {createMeet} from "../../modules/SocketClient";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import { ActionSheetProvider, connectActionSheet } from '@expo/react-native-action-sheet';
import {getStartTimeString, getDurationString, getPostRequest, firestoreDB} from "../../modules/CommonUtility";

const SCREEN_WIDTH = Dimensions.get('window').width;
const db = SQLite.openDatabase('db.db');
const allTagsList = ['#party', '#sports', '#food', '#shopping', '#movie', '#bar', '#travel', '#study', '#esports'];

import SocketIOClient from 'socket.io-client';

@connectActionSheet
export default class CreateScreen extends React.Component {


    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};

        return {
            // Correct Header Button modifyzationn: https://reactnavigation.org/docs/header-buttons.html
            headerRight:(<Button title={params.editingMode?'UPDATE': 'POST'}
                                 clear
                                 onPress={params.post}/>),
            headerLeft:(<Button title="Cancel"
                                clear

                                //color='#CCD1D1'
                                onPress={params.cancel}
                        />),
            headerStyle:{backgroundColor:'#EC7063'}
            //headerStyle:{ position: 'absolute', backgroundColor: 'transparent', zIndex: 100, top: 0, left: 0, right: 0, headerLeft:null, boarderBottomWidth: 0}
        };
    };

    constructor(props){
        super(props);
        console.log(props);
        let meet = props.navigation.state.params.meet;
        let editingMode;
        if(meet){
            editingMode=true;
        } else {
            editingMode=false;
        }
        console.log(editingMode);
        var startTime = new Date();
        let tenMins = 10 * 60 * 1000;
        startTime.setTime(startTime.getTime() + tenMins);
        let dateTime = startTime.getFullYear() + '-' + (startTime.getMonth()+1) + '-' + startTime.getDate() + ' ' + startTime.getHours() + ':' + startTime.getMinutes();

        let user = firebase.auth().currentUser;
        let userUid = user.uid;
        //console.log('userUid',userUid);
        this._scrollToInput = this._scrollToInput.bind(this);

        this.tagsButtonRefs = [];
        this.state={
            meet:props.navigation.state.params.meet,
            meetId:'',
            editingMode:editingMode,
            title:'',
            userUid: userUid,
            startTime: dateTime,
            placeName:'',
            placeCoordinate:{},
            placeAddress:'',
            placeId:'',
            description:'',
            inputHeight: 22,
            allFriends: true,
            allowPeopleNearby: true,
            oldAllowPeopleNearby:null,
            allowParticipantsInvite: true,
            selectedFriendsList: [],
            duration: 3,
            durationUnit:'Hours',
            maxNo: 8,
            tagsList:[],
            tagsString:'',
            location: null,
            titleHeight:39,
            descriptionHeight:35,
            tagInputString:'#',
            tagInputWidth:50,
            postTime:null,
        };
    }

    async componentDidMount() {
        if(this.state.editingMode){
            let meet = this.props.navigation.state.params.meet;
            let startTime = meet.startTime;
            let dateTime =  startTime.getFullYear() + '-' + (startTime.getMonth()+1) + '-' + startTime.getDate() + ' ' + startTime.getHours() + ':' + startTime.getMinutes();
            let durationString = getDurationString(meet.duration);
            let temp = durationString.split(' ');
            let duration = Number(temp[0]);
            let durationUnitString = temp[1];
            let durationUnit;
            switch(durationUnitString.charAt(0)){
                case 'h':
                    durationUnit = 'Hours';
                    break;
                case 'd':
                    durationUnit = 'Days';
                    break;
                case 'm':
                    durationUnit = 'Mins';
                    break;
                default:
                    durationUnit = 'Hours';
                    break;
            }
            let tagsList;
            if(meet.tagsList){
                tagsList=meet.tagsList;
            }else{
                tagsList=[];
            }
            let tagsString='';
            for(let i=0; i < tagsList.length; i++){
                tagsString += tagsList[i] + ' ';
            }

            let selectedList;
            if(meet.status){
                selectedList = Object.keys(meet.selectedFriendsList);
            } else {
                selectedList = Object.keys(meet.selectedFriendsList);
            }



            this.setState({
                meetId:meet.meetId,
                title:meet.title,
                startTime:dateTime,
                placeName:meet.place.name,
                placeCoordinate:meet.place.coordinate,
                placeAddress:meet.place.address,
                placeId:meet.place.placeId,
                description:meet.description,
                allFriends:meet.allFriends,
                allowPeopleNearby:meet.allowPeopleNearby,
                oldAllowPeopleNearby:meet.allowPeopleNearby,
                allowParticipantsInvite:meet.allowParticipantsInvite,
                selectedFriendsList:selectedList,
                duration:duration,
                durationUnit:durationUnit,
                maxNo:meet.maxNo,
                tagsList:tagsList,
                tagsString:tagsString,
                postTime:meet.postTime,
            });
            this.tagsButtonRefs.forEach((tag) => {
                //console.log('tags',tag.state.title);
                let title = tag.state.title;
                let tagged = _.includes(tagsList,title);
                tag.setState({selected:tagged});
            });

        }

        if(!this.state.editingMode){

            if (Platform.OS === 'android' && !Constants.isDevice) {
                this.setState({
                    errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
                });
            } else {
                this.getLocationAsync();
            }

            this.getSql();
        }


        this.props.navigation.setParams({post:this.onPostButtonPressed.bind(this), cancel:this.onCancelButtonPressed.bind(this), editingMode:this.state.editingMode});
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


    setPlaceDetail = data => {
        this.setState(data);
    };

    setInvitationRange = data => {
        console.log(data);
        this.setState(data,
            ()=>{
                console.log('setInvitationRange: ', this.state.allFriends, this.state.allowPeopleNearby, this.state.allowParticipantsInvite, this.state.selectedFriendsList);
                });
    };

    handleDateTimeParse(){
        const {startTime, duration, durationUnit} = this.state;

        var dateTimeParts = startTime.split(' '),
            timeParts = dateTimeParts[1].split(':'),
            dateParts = dateTimeParts[0].split('-'),
            startTimeDate,
            endTimeDate,
            durationTS;

        startTimeDate = new Date(dateParts[0], dateParts[1]-1 , dateParts[2], timeParts[0], timeParts[1]);
        if(durationUnit==='Hours'){
            durationTS=duration * 60 * 60 * 1000;
        }else if(durationUnit==='Mins'){
            durationTS=duration * 60 * 1000;
        } else {
            durationTS=duration * 24 * 60 * 60 * 1000;
        }
        endTimeDate = new Date();
        endTimeDate.setTime(startTimeDate.getTime() + durationTS);


        return {
            startTimeDate: startTimeDate,
            endTimeDate: endTimeDate,
            durationTS: durationTS,
        };
    }

    onPostButtonPressed(){
        const { title, userUid, startTime, placeName, placeAddress, placeCoordinate, placeId,
            description, allFriends, allowPeopleNearby, oldAllowPeopleNearby, allowParticipantsInvite, postTime,
            selectedFriendsList, duration, maxNo, tagsList, userPicked, editingMode, meetId } = this.state;

        var tagsListObj = {};
        tagsList.map((l,i) => {
            tagsListObj[l] = true;
        });

        let timeCodes = this.handleDateTimeParse();
        let startTimeDate = timeCodes.startTimeDate;
        let endTimeDate = timeCodes.endTimeDate;
        let durationTS = timeCodes.durationTS;
        let postTimeDate;
        if(postTime){
            postTimeDate=postTime;
        }else{
            postTimeDate= new Date();
        }

        let placeObj = {
            name: placeName,
            address: placeAddress,
            coordinate: placeCoordinate,
            placeId: placeId,
        }

        let theSelectedFriendsList = selectedFriendsList;
        let statusTimeObj = {
            status: true,
            startTime: startTimeDate,
            postTime: postTimeDate,
        };

        var participatingUsersListObj= {};
        participatingUsersListObj[userUid] = statusTimeObj;

        var selectedFriendsListObj = {};
        selectedFriendsListObj[userUid] = statusTimeObj;
        theSelectedFriendsList.map((l,i) => {
            selectedFriendsListObj[l] = statusTimeObj;
        });



        var docData = {
            title: title==='' ? 'Let\'s Tinko up' : title,
            creator: userUid,
            tagsList:tagsList,
            tagsCategory: tagsListObj,
            startTime: startTimeDate,
            postTime:postTimeDate,
            endTime: endTimeDate,
            duration: durationTS,
            allFriends: allFriends,
            allowPeopleNearby: allowPeopleNearby,
            allowParticipantsInvite: allowParticipantsInvite,
            maxNo: maxNo,
            description: description,
            place: placeObj,
            //participatingUsersList: participatingUsersListObj,
            //selectedFriendsList: selectedFriendsListObj,
            //status: true,
        };
        //console.log(docData);



        if(editingMode){
            let isPrivacyStateChanged;
            if(oldAllowPeopleNearby === allowPeopleNearby){
                isPrivacyStateChanged=false;
            }else{
                isPrivacyStateChanged=true;
            }


            let meet = this.state.meet;
            let oldSelectedFriendsList;
            if(meet.status){
                oldSelectedFriendsList = Object.keys(meet.selectedFriendsList);
            } else {
                oldSelectedFriendsList = Object.keys(meet.selectedFriendsList);
            }

            let deletedList = _.difference(oldSelectedFriendsList, selectedFriendsList);
            let newAddedList = _.difference(selectedFriendsList, oldSelectedFriendsList);

            // console.log('2old', oldSelectedFriendsList);
            // console.log('2new', selectedFriendsList);
            //
            // console.log('deleted', deletedList, 'newAdded', newAddedList);
            let bodyData = {
                meetId:meetId,
                isPrivacyStateChanged:isPrivacyStateChanged,
                deletedList:deletedList,
                newAddedList:newAddedList,
            };

            let docRef = firestoreDB().collection("Meets").doc(meetId);
            docRef.update(docData).then(() => {
                getPostRequest('checkMeetStatus', bodyData,
                    () => {

                    },
                    (error) => {
                        console.log(error);
                        Alert.alert('error', error);
                    })

            });
        } else {

            docData.participatingUsersList=participatingUsersListObj;
            docData.participatingUsersArray=[userUid];
            docData.selectedFriendsList=selectedFriendsListObj;
            docData.status = true;

            firestoreDB().collection("Meets").add(docData)
                .then((meetRef) => {
                    console.log("Document written with ID: ", meetRef.id);
                    //this.updateUserParticipatingMeets(meetRef.id, userUid);
                    createMeet(userUid, meetRef.id);
                    this.props.navigation.state.params.tinkoGetMeets();
                })
                .catch((error) => {
                    console.log("Error adding document: ", error);
                });


        }
        this.props.navigation.dispatch(NavigationActions.back());
    }

    // updateUserParticipatingMeets(meetId, userUid){
    //     firebase.firestore().collection("Users").doc(userUid).collection("ParticipatingMeets").doc(meetId).set({
    //         meetId: meetId,
    //     }).then(() => {
    //             console.log("Document successfully written!");
    //         })
    //         .catch((error) => {
    //             console.error("Error writing document: ", error);
    //         });
    // }

    onCancelButtonPressed(){
        this.props.navigation.dispatch(NavigationActions.back())
    }

    onTagButtonPressed(title){
        const { tagsList } = this.state;
        if(_.includes(tagsList, title)){
            _.pull(tagsList, title);
        } else {
            tagsList.push(title);
        }
        let tagsString='';
        for(let i=0; i<tagsList.length; i++){
            tagsString += ' ' + tagsList[i];
        }
        this.setState({tagsList,tagsString});
    }

    onTagStringSubmitted(title){

        let titleSegments = title.split(' ');
        let titleString = titleSegments[0];
        if(titleString.charAt(0) !== '#'){
            titleString = '#' + titleString;
        }
        if(titleString==='#'){
            return;
        }
        const { tagsList } = this.state;
        tagsList.push(titleString);
        let tagsString='';
        for(let i=0; i<tagsList.length; i++){
            tagsString += ' ' + tagsList[i];
        }
        this.setState({tagsList,tagsString});
    }

    _scrollToInput () {
        // Add a 'scroll' ref to your ScrollView
        console.log(this.scroll);
        this.scroll.scrollToEnd(true);
    }

    openDurationUnitActionSheet(){
        let options = ['Hours', 'Mins', 'Days', 'Cancel'];
        let cancelButtonIndex = 3;
        this.props.showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex,
            },
            buttonIndex => {
                if(buttonIndex!==3){
                    this.setState({durationUnit:options[buttonIndex]});
                }
            }
        );
    }

    render() {
        const {title, startTime, placeName, placeAddress, description, inputHeight, allFriends, allowParticipantsInvite, allowPeopleNearby,
            selectedFriendsList, maxNo, descriptionHeight, tagsString, tagInputString, tagInputWidth, duration, durationUnit,titleHeight,
            tagsList, editingMode, meetId} = this.state;
        let temp = placeAddress.split(',');
        let area = temp[temp.length-1];
        var dateTimeParts = startTime.split(' '),
            timeParts = dateTimeParts[1].split(':'),
            dateParts = dateTimeParts[0].split('-'),
            startTimeDate;
        startTimeDate = new Date(dateParts[0], dateParts[1]-1 , dateParts[2], timeParts[0], timeParts[1]);
        let startTimeString = getStartTimeString(startTimeDate);
        return (
            <KeyboardAwareScrollView
                innerRef={ref => this.scroll = ref}
                style={styles.container}>
                <View style={{flex:1,justifyContent: 'center', alignItems: 'center'}}>

                    <View style={{width:'90%'}}>
                        <Input
                            onChangeText={(title) => this.setState({title})}
                            value={title}
                            inputStyle={{
                                color: 'black',
                                fontFamily:'bold',
                                fontSize:30,
                                height:titleHeight,
                                marginTop:10,
                            }}
                            inputContainerStyle={{borderBottomColor:'transparent', borderBottomWidth:0}}
                            containerStyle={{ width:'100%'}}
                            multiline={true}
                            maxLength={50}
                            keyboardAppearance="light"
                            placeholder="Let's Tinko Up!"
                            autoFocus={!editingMode}
                            autoCapitalize={'words'}
                            autoCorrect={true}
                            returnKeyType="done"
                            onSubmitEditing={() => {Keyboard.dismiss()}}
                            blurOnSubmit={true}
                            placeholderTextColor="black"
                            onContentSizeChange={(event) => {
                                this.setState({ titleHeight: event.nativeEvent.contentSize.height });

                            }}

                        />


                        <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                            <Text style={{marginTop:20, fontFamily:'regular', fontSize:17, color:'#212F3C'}}>{tagsString}</Text>
                            {tagsList.length!==0 &&
                            <Ionicons.Button
                                name="ios-close-circle-outline" size={24} color="#BDC3C7" backgroundColor="transparent"
                                onPress = {() => {
                                    this.setState({tagsList:[],tagsString:''});
                                    this.tagsButtonRefs.forEach((tag) => {
                                        tag.setSelectedFalse();
                                    });
                                }}
                            />
                            }
                        </View>

                    </View>

                        <ScrollView
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            style={{marginTop:20}}>
                            <View style={{width:SCREEN_WIDTH/20}}/>
                            {allTagsList.map((tagTitle) => (
                                <CustomButton
                                    onRef={ref => this.tagsButtonRefs.push(ref)}
                                    key={tagTitle}
                                    style={{flex:1}}
                                    title={tagTitle}
                                    onPress={this.onTagButtonPressed.bind(this)}/>
                            ))}

                        </ScrollView>

                    <View style={{width:'90%'}}>
                        <Input
                            onChangeText={(tagInputString) => this.setState({tagInputString})}
                            value={tagInputString}
                            placeholder="#..."
                            inputStyle={{color: '#212F3C', fontFamily:'regular', fontSize:17}}
                            returnKeyType={'next'}
                            onSubmitEditing={() => {
                                this.onTagStringSubmitted(tagInputString);
                                this.setState({tagInputString:'#'});
                            }}
                            containerStyle={{ width: tagInputWidth+45}}
                            onContentSizeChange={(event) => {
                                this.setState({ tagInputWidth: event.nativeEvent.contentSize.width })
                            }}
                        />



                        <ListItem
                            containerStyle={[styles.listStyle, {marginTop:30}]}
                            rightContentContainerStyle={{flex:2}}
                            title='Starts:'
                            titleStyle={styles.titleStyle}
                            rightTitle={startTimeString}
                            rightTitleStyle={{color:'#2471A3'}}
                            onPress={() => this.myDatePicker && this.myDatePicker.onPressDate()}
                        />
                        <DatePicker
                            key={'datepicker'}
                            ref={(datepicker) => this.myDatePicker = datepicker}
                            style={{width: 0, height: 0}}
                            hideText={true}
                            showIcon={false}

                            date={startTime}
                            mode="datetime"
                            format="YYYY-MM-DD HH:mm"
                            confirmBtnText="Confirm"
                            cancelBtnText="Cancel"

                            minuteInterval={10}
                            onDateChange={(startTime) => {this.setState({startTime});}}
                        />
                        <ListItem
                            containerStyle={styles.listStyle}
                            rightContentContainerStyle={{flex:2}}
                            title='Duration:'
                            titleStyle={styles.titleStyle}
                            rightElement={
                                <View style={{flexDirection:'row', justifyContent: 'flex-end', alignItems: 'center'}}>
                                    <Button
                                        title={durationUnit}
                                        onPress={() => this.openDurationUnitActionSheet()}
                                    />
                                    <EvilIcons.Button
                                        name="minus" size={24} color="black" backgroundColor="transparent"
                                        onPress = {() => {
                                            this.setState((state) => {
                                                if(state.duration > 1){
                                                    return {duration: state.duration -1};
                                                }
                                            });
                                        }}
                                    />
                                    <Text style={{fontSize:17}}>{duration}</Text>
                                    <EvilIcons.Button
                                        name="plus" size={24} color="black" backgroundColor="transparent"
                                        onPress = {() => {
                                            console.log("plus pressed")
                                            this.setState((state) => {
                                                return {duration: state.duration +1};
                                            });
                                        }}
                                    />
                                </View>
                            }
                        />
                        <ListItem
                            containerStyle={styles.listStyle}
                            title='Max Participants:'
                            titleStyle={styles.titleStyle}
                            rightElement={
                                <View style={{flexDirection:'row', justifyContent: 'flex-end', alignItems: 'center'}}>
                                    <EvilIcons.Button
                                        name="minus" size={24} color="black" backgroundColor="transparent"
                                        onPress = {() => {
                                            this.setState((state) => {
                                                if(state.maxNo > 1){
                                                    return {maxNo: state.maxNo -1};
                                                }
                                            });
                                        }}
                                    />
                                    <Text style={{fontSize:17}}>{maxNo===1?'No Limit' : maxNo}</Text>
                                    <EvilIcons.Button
                                        name="plus" size={24} color="black" backgroundColor="transparent"
                                        onPress = {() => {
                                            console.log("plus pressed");
                                            this.setState((state) => {
                                                return {maxNo: state.maxNo +1};
                                            });
                                        }}
                                    />
                                </View>
                            }
                        />


                        <ListItem
                            containerStyle={[styles.listStyle, {marginTop:30}]}
                            title={placeName ? placeName : ' '}
                            titleStyle={styles.titleStyle}
                            subtitle={area ? area : ' '}
                            onPress={() => this.props.navigation.navigate('GooglePlacesAutocomplete', {setPlaceDetail: this.setPlaceDetail})}
                            chevron
                            chevronColor={'black'}
                        />


                        <ListItem
                            containerStyle={styles.listStyle}
                            title='Invitation Range:'
                            titleStyle={styles.titleStyle}
                            onPress={() => {
                                this.props.navigation.navigate('InvitationRange', {
                                    editingMode:editingMode,
                                    setInvitationRange: this.setInvitationRange,
                                    allFriends: allFriends,
                                    allowPeopleNearby: allowPeopleNearby,
                                    allowParticipantsInvite: allowParticipantsInvite,
                                    selectedFriendsList: selectedFriendsList,})
                            }}
                            chevron
                            chevronColor={'black'}
                        />

                        {editingMode &&
                        <ListItem
                            containerStyle={styles.listStyle}
                            titleStyle={styles.titleStyle}
                            title='Manage Participants'
                            chevron
                            chevronColor={'black'}
                            onPress={()=>this.props.navigation.navigate('ParticipantsManagement',{
                                meetId:meetId,
                                participatingUsersList:this.props.navigation.state.params.getParticipatingUsersList})}
                        />
                        }



                        <Input
                            multiline = {true}
                            onChangeText={(description) => this.setState({description})}
                            value={description}
                            keyboardAppearance="light"
                            placeholder="Description..."
                            autoFocus={false}
                            autoCapitalize={'sentences'}
                            autoCorrect={true}
                            returnKeyType="done"
                            inputStyle={{
                                color: 'black',
                                fontFamily:'regular',
                                fontSize:20,
                                height:descriptionHeight,
                                marginTop:30,
                            }}
                            blurOnSubmit={true}
                            onContentSizeChange={(event) => {
                                this.setState({ descriptionHeight: event.nativeEvent.contentSize.height })
                            }}
                        />

                        <View style={{height:20}}/>


                    </View>
                </View>
            </KeyboardAwareScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    listStyle:{
        // borderTopWidth: 0,
        // borderBottomWidth:0,
        // borderBottomColor:'#F8F9F9',
        paddingLeft:0,
        paddingRight:0,
    },
    titleStyle:{
        fontFamily:'regular',
        fontSize:20,
    },
    inputStyling: {
        backgroundColor: 'white',
        width: SCREEN_WIDTH * 3 / 4,
        padding: 8,
        fontSize: 18
    },

});
