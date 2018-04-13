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
    KeyboardAvoidingView
} from 'react-native';
import {
    Input,
    Button,
    Text,
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
import { EvilIcons } from '@expo/vector-icons';
//import EvilIcons from '@expo/vector-icons/EvilIcons';
import {createMeet} from "../../modules/SocketClient";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import { ActionSheetProvider, connectActionSheet } from '@expo/react-native-action-sheet';
import {getStartTimeString} from "../../modules/CommonUtility";

const SCREEN_WIDTH = Dimensions.get('window').width;
const db = SQLite.openDatabase('db.db');

import SocketIOClient from 'socket.io-client';

@connectActionSheet
export default class CreateScreen extends React.Component {
    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};

        return {
            // Correct Header Button modifyzationn: https://reactnavigation.org/docs/header-buttons.html
            headerRight:(<Button title="POST"
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
        var startTime = new Date();
        let tenMins = 10 * 60 * 1000;
        startTime.setTime(startTime.getTime() + tenMins)
        let dateTime = startTime.getFullYear() + '-' + (startTime.getMonth()+1) + '-' + startTime.getDate() + ' ' + startTime.getHours() + ':' + startTime.getMinutes();

        let user = firebase.auth().currentUser;
        let userUid = user.uid;
        //console.log('userUid',userUid);
        this._scrollToInput = this._scrollToInput.bind(this);

        this.state={
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
            allowParticipantsInvite: true,
            selectedFriendsList: [],
            duration: 3,
            durationUnit:'Hours',
            maxNo: 8,
            tagList:[],
            location: null,
            //fontLoaded:false,
            descriptionHeight:35,
            tagInputString:'#',
            tagInputWidth:50,
        };
    }

    async componentDidMount() {
        this.props.navigation.setParams({post:this.onPostButtonPressed.bind(this), cancel:this.onCancelButtonPressed.bind(this)});
        if (Platform.OS === 'android' && !Constants.isDevice) {
            this.setState({
                errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
            });
        } else {
            this.getLocationAsync();
        }

        this.getSql();

        // await Font.loadAsync({
        //     'georgia': require('../../assets/fonts/Georgia.ttf'),
        //     'regular': require('../../assets/fonts/Montserrat-Regular.ttf'),
        //     'light': require('../../assets/fonts/Montserrat-Light.ttf'),
        //     'bold': require('../../assets/fonts/Montserrat-Bold.ttf'),
        // });
        //
        //
        // this.setState({ fontLoaded: true });
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
    }

    setInvitationRange = data => {
        console.log(data);
        this.setState(data);
        console.log('setInvitationRange: ', this.state.allFriends, this.state.allowPeopleNearby, this.state.allowParticipantsInvite, this.state.selectedFriendsList);
    }

    handleSizeChange = event => {
        console.log('_handleSizeChange ---->', event.nativeEvent.contentSize.height);

        this.setState({
            inputHeight: event.nativeEvent.contentSize.height
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
            description, allFriends, allowPeopleNearby, allowParticipantsInvite,
            selectedFriendsList, duration, maxNo, tagList, userPicked } = this.state;

        var tagListObj = {};
        tagList.map((l,i) => {
            tagListObj[l] = true;
        });

        let timeCodes = this.handleDateTimeParse();
        let startTimeDate = timeCodes.startTimeDate;
        let endTimeDate = timeCodes.endTimeDate;
        let durationTS = timeCodes.durationTS;
        let postTimeDate = new Date();

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
            tagList: tagListObj,
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
            participatingUsersList: participatingUsersListObj,
            selectedFriendsList: selectedFriendsListObj,
            status: true,
            tagsString:''
        }
        console.log(docData);

        firebase.firestore().collection("Meets").add(docData)
            .then((meetRef) => {
                console.log("Document written with ID: ", meetRef.id);
                //this.updateUserParticipatingMeets(meetRef.id, userUid);
                createMeet(userUid, meetRef.id);
            })
            .catch((error) => {
                console.log("Error adding document: ", error);
            });

        this.props.navigation.dispatch(NavigationActions.back())
        this.props.navigation.state.params.tinkoGetMeets();
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
        if(title==='#'){
            return;
        }
        const { tagList } = this.state;
        if(_.includes(tagList, title)){
            _.pull(tagList, title);
        } else {
            tagList.push(title);
        }
        let tagsString='';
        for(let i=0; i<tagList.length; i++){
            tagsString += ' ' + tagList[i];
        }
        this.setState({tagList,tagsString});
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
            selectedFriendsList, maxNo, descriptionHeight, tagsString, tagInputString, tagInputWidth, duration, durationUnit} = this.state;
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
                                //textAlign:'center',
                                color: 'black',
                                //fontWeight: 'bold',
                                fontFamily:'bold',
                                fontSize:30,
                                //height:titleHeight,
                            }}
                            inputContainerStyle={{borderBottomColor:'transparent', borderBottomWidth:0}}
                            containerStyle={{ width:'100%'}}
                            //multiline={true}
                            maxLength={35}
                            keyboardAppearance="light"
                            placeholder="Let's Tinko Up!"
                            autoFocus={true}
                            autoCapitalize={'words'}
                            autoCorrect={true}
                            returnKeyType="done"
                            onSubmitEditing={() => {Keyboard.dismiss()}}
                            blurOnSubmit={false}
                            placeholderTextColor="black"

                        />


                        <Text style={{marginTop:20, fontFamily:'regular', fontSize:17, color:'#212F3C'}}>{tagsString}</Text>

                    </View>

                        <ScrollView
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            style={{marginTop:20, marginLeft:SCREEN_WIDTH/20}}>
                            <CustomButton style={{flex:1}} title="#party" onPress={this.onTagButtonPressed.bind(this)}/>
                            <CustomButton style={{flex:1}} title="#sports" onPress={this.onTagButtonPressed.bind(this)}/>
                            <CustomButton style={{flex:1}} title="#food" onPress={this.onTagButtonPressed.bind(this)}/>
                            <CustomButton style={{flex:1}} title="#shopping" onPress={this.onTagButtonPressed.bind(this)}/>
                            <CustomButton style={{flex:1}} title="#movie" onPress={this.onTagButtonPressed.bind(this)}/>
                            <CustomButton style={{flex:1}} title="#bar" onPress={this.onTagButtonPressed.bind(this)}/>
                            <CustomButton style={{flex:1}} title="#travel" onPress={this.onTagButtonPressed.bind(this)}/>
                            <CustomButton style={{flex:1}} title="#study" onPress={this.onTagButtonPressed.bind(this)}/>
                            <CustomButton style={{flex:1}} title="#esports" onPress={this.onTagButtonPressed.bind(this)}/>
                        </ScrollView>

                    <View style={{width:'90%'}}>
                        <Input
                            // ref={ref => this.tagInputRef = ref}
                            onChangeText={(tagInputString) => this.setState({tagInputString})}
                            value={tagInputString}
                            placeholder="#..."
                            inputStyle={{color: '#212F3C', fontFamily:'regular', fontSize:17}}
                            returnKeyType={'next'}
                            onSubmitEditing={() => {
                                this.onTagButtonPressed(tagInputString);
                                this.setState({tagInputString:'#'});
                            }}
                            containerStyle={{ width: tagInputWidth+45}}
                            onContentSizeChange={(event) => {
                                this.setState({ tagInputWidth: event.nativeEvent.contentSize.width })
                            }}
                        />

                        {/*<View style={{flex: 1, flexDirection: 'column', height: 180, marginTop: 10}}>*/}
                        {/*<View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>*/}
                        {/**/}
                        {/*</View>*/}
                        {/*<View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>*/}
                        {/**/}
                        {/*</View>*/}
                        {/*<View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>*/}
                        {/**/}
                        {/*</View>*/}
                        {/*</View>*/}

                        <ListItem

                            containerStyle={styles.listStyle}
                            //contentContainerStyle={{justifyContent:'space-between'}}
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
                                <View style={{flexDirection:'row', justifyContent: 'center', alignItems: 'center'}}>
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
                                    <Button
                                        title={durationUnit}
                                        onPress={() => this.openDurationUnitActionSheet()}
                                    />
                                </View>
                            }
                        />
                        <ListItem
                            containerStyle={styles.listStyle}
                            title={placeName}
                            titleStyle={styles.titleStyle}
                            subtitle={area}
                            onPress={() => this.props.navigation.navigate('GooglePlacesAutocomplete', {setPlaceDetail: this.setPlaceDetail})}
                            chevron
                            chevronColor={'black'}
                        />
                        <ListItem
                            containerStyle={styles.listStyle}
                            title='Invitation Range'
                            titleStyle={styles.titleStyle}
                            onPress={() => this.props.navigation.navigate('InvitationRange', {
                                setInvitationRange: this.setInvitationRange,
                                allFriends: allFriends,
                                allowPeopleNearby: allowPeopleNearby,
                                allowParticipantsInvite: allowParticipantsInvite,
                                selectedFriendsList: selectedFriendsList,})}
                            chevron
                            chevronColor={'black'}
                        />
                        <ListItem
                            containerStyle={styles.listStyle}
                            title='Max Participants'
                            titleStyle={styles.titleStyle}
                            rightElement={
                                <View style={{flexDirection:'row', justifyContent: 'center', alignItems: 'center'}}>
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
                                    <Text style={{fontSize:17}}>{maxNo===0?'No Limit' : maxNo}</Text>
                                    <EvilIcons.Button
                                        name="plus" size={24} color="black" backgroundColor="transparent"
                                        onPress = {() => {
                                            console.log("plus pressed")
                                            this.setState((state) => {
                                                return {maxNo: state.maxNo +1};
                                            });
                                        }}
                                    />
                                </View>
                            }
                        />


                        <Input
                            // onFocus={(event) => {
                            //     // `bind` the function if you're using ES6 classes
                            //     this._scrollToInput()
                            // }}
                            multiline = {true}
                            onChangeText={(description) => this.setState({description})}
                            value={description}
                            keyboardAppearance="light"
                            placeholder="Description..."
                            autoFocus={false}
                            autoCapitalize={'sentences'}
                            //autoCorrect={true}
                            returnKeyType="done"
                            //ref={ input => this.description = input }
                            inputStyle={{
                                //textAlign:'center',
                                color: 'black',
                                //fontWeight: 'bold',
                                fontFamily:'regular',
                                fontSize:20,
                                height:descriptionHeight,
                            }}
                            // onSubmitEditing={() => {
                            //     Keyboard.dismiss()
                            // }}
                            blurOnSubmit={true}
                            onContentSizeChange={(event) => {
                                this.setState({ descriptionHeight: event.nativeEvent.contentSize.height })
                            }}
                        />

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
