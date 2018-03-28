import _ from 'lodash';
import React from 'react';
import {
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
    Avatar,
    List, ListItem,
} from 'react-native-elements';
import CustomButton from '../../components/CustomButton';
import  DatePicker from 'react-native-datepicker';
import { NavigationActions } from 'react-navigation';
import { SQLite, Constants, Location, Permissions } from 'expo';
import firebase from 'firebase';

const SCREEN_WIDTH = Dimensions.get('window').width;
const db = SQLite.openDatabase('db.db');

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
        var startTime = new Date();
        let tenMins = 10 * 60 * 1000;
        startTime.setTime(startTime.getTime() + tenMins)
        let dateTime = startTime.getFullYear() + '-' + (startTime.getMonth()+1) + '-' + startTime.getDate() + ' ' + startTime.getHours() + ':' + startTime.getMinutes();

        let user = firebase.auth().currentUser;
        let userUid = user.uid;
        console.log('userUid',userUid);

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
            allowPeopleNearby: false,
            allowParticipantsInvite: false,
            selectedFriendsList: [],
            duration: '1 Hour',
            maxNo: 8,
            tagList:[],
            location: null,
            //fontLoaded:false,
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
                console.log(responseJson.results[0]);
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
        const {startTime} = this.state;

        var dateTimeParts = startTime.split(' '),
            timeParts = dateTimeParts[1].split(':'),
            dateParts = dateTimeParts[0].split('-'),
            startTimeDate,
            endTimeDate,
            durationTS;

        startTimeDate = new Date(dateParts[0], dateParts[1]-1 , dateParts[2], timeParts[0], timeParts[1]);
        durationTS = 1 * 60 * 60 * 1000;
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
        }
        console.log(docData);

        firebase.firestore().collection("Meets").add(docData)
            .then((meetRef) => {
                console.log("Document written with ID: ", meetRef.id);
                //this.updateUserParticipatingMeets(meetRef.id, userUid);
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
            });

        this.props.navigation.dispatch(NavigationActions.back())
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
        const { tagList } = this.state;
        if(_.includes(tagList, title)){
            _.pull(tagList, title);
        } else {
            tagList.push(title);
        }
        this.setState({tagList});
    }

    render() {
        const {title, startTime, placeName, description, inputHeight, allFriends, allowParticipantsInvite, allowPeopleNearby, selectedFriendsList} = this.state;
        return (
            <ScrollView style={styles.container}>
                <Card>
                    <View style={{flex:1, justifyContent: 'center', alignItems: 'center',}}>

                        <Input
                            width={230}
                            onChangeText={(title) => this.setState({title})}
                            value={title}
                            inputStyle={{
                                textAlign:'center',
                                color: 'black',
                                //fontWeight: 'bold',
                                fontFamily:'bold',
                            }}
                            keyboardAppearance="light"
                            placeholder="A Tinko Title"
                            autoFocus={false}
                            autoCapitalize
                            autoCorrect={true}
                            returnKeyType="next"
                            ref={ input => this.title = input }
                            onSubmitEditing={() => {
                                Keyboard.dismiss()
                            }}
                            blurOnSubmit={false}
                            placeholderTextColor="black"
                        />

                    </View>


                    <View style={{flex: 1, flexDirection: 'column', height: 180, marginTop: 10}}>
                        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
                            <CustomButton style={{flex:1}} title="Party" onPress={this.onTagButtonPressed.bind(this)}/>
                            <CustomButton style={{flex:1}} title="Sport" onPress={this.onTagButtonPressed.bind(this)}/>
                            <CustomButton style={{flex:1}} title="Food" onPress={this.onTagButtonPressed.bind(this)}/>
                        </View>
                        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                            <CustomButton style={{flex:1}} title="Shop" onPress={this.onTagButtonPressed.bind(this)}/>
                            <CustomButton style={{flex:1}} title="Movie" onPress={this.onTagButtonPressed.bind(this)}/>
                            <CustomButton style={{flex:1}} title="KTV" onPress={this.onTagButtonPressed.bind(this)}/>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                            <CustomButton style={{flex:1}} title="Travel" onPress={this.onTagButtonPressed.bind(this)}/>
                            <CustomButton style={{flex:1}} title="Study" onPress={this.onTagButtonPressed.bind(this)}/>
                            <CustomButton style={{flex:1}} title="ESports" onPress={this.onTagButtonPressed.bind(this)}/>
                        </View>
                    </View>

                    <List containerStyle={styles.listStyle}>
                        <ListItem
                            hideChevron
                            containerStyle={styles.listStyle}
                            title='Starts:'
                            rightTitle={startTime}
                            rightTitleStyle={{color:'blue'}}
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
                            hideChevron
                            containerStyle={styles.listStyle}
                            title='Duration:'
                            rightTitle='1 Hour'
                            rightTitleStyle={{color:'blue'}}
                        />
                        <ListItem
                            containerStyle={styles.listStyle}
                            title='Place:'
                            rightTitle={placeName}
                            rightTitleStyle={{color:'black'}}
                            onPress={() => this.props.navigation.navigate('GooglePlacesAutocomplete', {setPlaceDetail: this.setPlaceDetail})}
                        />
                    </List>
                    <List containerStyle={styles.listStyle}>
                        <ListItem
                            containerStyle={styles.listStyle}
                            title='Invitation Range'
                            onPress={() => this.props.navigation.navigate('InvitationRange', {
                                setInvitationRange: this.setInvitationRange,
                                allFriends: allFriends,
                                allowPeopleNearby: allowPeopleNearby,
                                allowParticipantsInvite: allowParticipantsInvite,
                                selectedFriendsList: selectedFriendsList,})}
                        />
                        <ListItem
                            containerStyle={styles.listStyle}
                            title='Max Participants'
                        />
                    </List>

                    <List containerStyle={styles.listStyle}>
                        <ListItem
                            hideChevron
                            title={
                                <TextInput
                                    multiline = {true}
                                    onContentSizeChange={(event) => this.handleSizeChange(event)}
                                    onChangeText={(description) => this.setState({description})}
                                    style={[ styles.inputStyling, {height: inputHeight} ]}
                                    value={description}
                                    keyboardAppearance="light"
                                    placeholder="Description..."
                                    autoFocus={false}
                                    autoCapitalize
                                    autoCorrect={true}
                                    returnKeyType="Done"
                                    //ref={ input => this.description = input }
                                    onSubmitEditing={() => {
                                        Keyboard.dismiss()
                                    }}
                                    blurOnSubmit={false}
                                    placeholderTextColor="black"
                                />
                            }
                        />
                    </List>

                </Card>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1948A',
    },
    listStyle:{
        borderTopWidth: 0,
        borderBottomWidth:0,
        borderBottomColor:'transparent'
    },
    inputStyling: {
        backgroundColor: 'white',
        width: SCREEN_WIDTH * 3 / 4,
        padding: 8,
        fontSize: 18
    },

});
