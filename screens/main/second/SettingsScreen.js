import React from 'react';
import {Alert, View, StyleSheet, Text, Switch, ScrollView, Dimensions} from "react-native";
import firebase from "firebase";
import {Avatar, Header, ListItem, Button} from 'react-native-elements';
import {firestoreDB, getFromAsyncStorage} from "../../../modules/CommonUtility";
import {ifIphoneX} from "react-native-iphone-x-helper";
import {logoutFromNotification} from '../../../modules/CommonUtility';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default class SettingsScreen extends React.Component {
    static navigationOptions = ({
        header:null,
    });

    constructor(props){
        super(props);
        let user = firebase.auth().currentUser;
        this.state={
            userUid:user.uid,
            userData:{},
        };
        this.getThisUserDataForSetting();
    }

    getThisUserDataForSetting(){
        getFromAsyncStorage('ThisUser').then((userData) => {
            if(userData) {
                console.log(userData);
                this.setState({userData});
            }
        });
    }

    onLogoutButtonPressed(){
        Alert.alert("Alert", "Are you sure to logout?",
            [
                {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                {text: 'Yes', onPress: () => {
                        logoutFromNotification(this.state.userUid);
                        firebase.auth().signOut()
                            .then(console.log('after signout'))
                            .catch((error) => {
                                console.log(error);
                                Alert.alert("Error", error.message);
                            });
                    }, style:"destructive"},
            ]);

    }

    setPhotoURL(photoURL){
        this.setState((state) => {
            let userData = state.userData;
            userData.photoURL = photoURL;
            return {userData};
        })
    }

    setUsername(username){
        this.setState((state) => {
            let userData = state.userData;
            userData.username = username;
            return {userData};
        })
    }

    setLocation(location){
        this.setState((state) => {
            let userData = state.userData;
            userData.location = location;
            return {userData};
        })
    }

    onFBAutoAddSwitchChanged(fbAutoAdd){
        this.setState((state)=>{
            let userData = state.userData;
            userData.fbAutoAdd = fbAutoAdd;
            return {userData};
        })
        let userRef = firestoreDB().collection('Users').doc(this.state.userUid);
        userRef.update({fbAutoAdd:fbAutoAdd}).then(()=>{
            this.props.navigation.state.params.getThisUserData();
        }).catch((error)=>{
            Alert.alert('Error', error);
        })
    }
    //onPress={() => this.onLogoutButtonPressed()}

    render() {
        const {userData} = this.state;
        return (
            <View style={{flex:1}}>
                <Header
                    leftComponent={{ icon: 'chevron-left', color: '#fff', onPress:()=>this.props.navigation.goBack()}}
                    centerComponent={{ text: 'Settings', style: { fontSize:18, fontFamily:'regular', color: '#fff' } }}
                    outerContainerStyles={ifIphoneX({height:88})}
                />
                <ScrollView>
                    <ListItem
                        title='Avatar'
                        titleStyle={styles.titleStyle}
                        chevron
                        chevronColor={'black'}
                        rightElement={
                            <Avatar
                                size='medium'
                                source={{uri: userData.photoURL}}
                            />
                        }
                        onPress={()=> this.props.navigation.navigate('AvatarUpload',{
                            getThisUserData:this.props.navigation.state.params.getThisUserData,
                            setPhotoURL:this.setPhotoURL.bind(this)
                        })}
                    />
                    <ListItem
                        title='Username'
                        titleStyle={styles.titleStyle}
                        chevron
                        chevronColor={'black'}
                        rightElement={
                            <Text>{userData.username}</Text>
                        }
                        onPress={()=>this.props.navigation.navigate('UpdateUsername',{
                            getThisUserData:this.props.navigation.state.params.getThisUserData,
                            setUsername:this.setUsername.bind(this),
                            username:userData.username
                        })}
                    />
                    <ListItem
                        title='Location'
                        titleStyle={styles.titleStyle}
                        chevron
                        chevronColor={'black'}
                        rightElement={
                            <Text>{userData.location}</Text>
                        }
                        onPress={() => this.props.navigation.navigate('GooglePlacesAutocomplete', {
                            getThisUserData:this.props.navigation.state.params.getThisUserData,
                            setLocation: this.setLocation.bind(this),
                            citySearchMode:true
                        })}
                    />
                    <ListItem
                        title='Email'
                        titleStyle={styles.titleStyle}
                        rightElement={
                            <Text>{userData.email}</Text>
                        }
                    />
                    <ListItem
                        title='Auto add Facebook Friends'
                        titleStyle={{fontFamily:'regular', fontSize:17,}}
                        rightElement={
                            <Switch
                                value={userData.fbAutoAdd}
                                onValueChange={(fbAutoAdd) => this.onFBAutoAddSwitchChanged(fbAutoAdd)}
                            />
                        }
                    />
                    <View style={{width:SCREEN_WIDTH, justifyContent:'center', alignItems:'center'}}>
                        <Button
                            onPress={() => this.onLogoutButtonPressed()}
                            title="Logout"
                            titleStyle={{ fontWeight: "700" }}
                            buttonStyle={{
                                backgroundColor: "rgba(92, 99,216, 1)",
                                width: 300,
                                height: 45,
                                borderColor: "transparent",
                                borderWidth: 0,
                                borderRadius: 5
                            }}
                            containerStyle={{ marginTop: 20 }}
                        />
                    </View>
                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    // container: {
    //     flex: 1,
    //     backgroundColor: 'white',
    // },
    // listStyle:{
    //     // borderTopWidth: 0,
    //     // borderBottomWidth:0,
    //     // borderBottomColor:'#F8F9F9',
    //     paddingLeft:0,
    //     paddingRight:0,
    // },
    titleStyle:{
        fontFamily:'regular',
        fontSize:20,
    }

});