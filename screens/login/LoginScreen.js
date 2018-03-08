import React from 'react';
import {
    Button,
    View,
    Text,
    Image,
    Platform,
    Animated,
    StyleSheet,
    Navigator,
    Alert
} from 'react-native';
import FullButton from '../../components/FullButton';
import { Facebook } from 'expo';
import firebase from 'firebase'
import MainTabNavigator from '../../navigation/MainTabNavigator';

export default class LoginScreen extends React.Component {
    static navigationOptions = {
        //header: null,
        title: 'login'
    };

    constructor(props){
        super(props);
    }

    initializeNewUser = async (token, uid) => {
        const response = await fetch(
            `https://graph.facebook.com/me?access_token=${token}&fields=id,name,email,friends,location,gender`
        );
        //const responseJSON = JSON.stringify(await response.json());
        //console.log(await response.json());
        var dict = await response.json();
        dict.uid = uid;
        console.log(dict);
        const {email} = dict;
        console.log(email);

        fetch('https://us-central1-tinko-64673.cloudfunctions.net/initializeNewUser', {
            method:'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dict),
        }).then ((response) => {
            console.log(response);
            this.props.navigation.navigate('Register', {email:email});
        }).catch((error) => {
            console.log(error);
            Alert.alert('Error ' + error);
        });
    };

    async logInFirebase(token){
        const credential = firebase.auth.FacebookAuthProvider.credential(token);
        firebase.auth().signInWithCredential(credential).then((user) => {
            console.log("Login: ", user);
            const { a, b } = user.metadata;
            console.log(a, b); //a = creationTime, b = lastSignInTime
            if(a===b){ //first time login
                this.initializeNewUser(token, user.uid);
            } else {
                console.log('goingToMain');
                this.props.screenProps.handleUserLoggedIn();
            }
        }).catch((error) => {
            console.log(error);
        })
    }

    async logInFB() {
        const { type, token } = await Facebook.logInWithReadPermissionsAsync('765640913609406', {
            permissions: ['public_profile', 'email', 'user_friends', 'user_location'],
        });
        if (type === 'success') {
            this.logInFirebase(token);
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.iconView}>
                    <Image
                        resizeMode="contain"
                        style={styles.tinkoIcon}
                        source={require('../../assets/images/Tinko.png')}/>
                </View>
                <View style={styles.btnView}>
                    <FullButton
                        buttonStyle={{backgroundColor:"#cc99ff"}}
                        text='Facebook'
                        onPress={() => this.logInFB()}
                    />
                    <FullButton
                        buttonStyle={{backgroundColor:"#9933ff"}}
                        onPress={() => this.props.navigation.navigate('SignIn')}
                        text='Login with Tinko'/>
                </View>
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex:1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#b3d9ff',
    },
    iconView: {
        marginTop:"10%",
        flex:1
    },
    tinkoIcon: {
        width: 120,
    },
    btnView: {
        flex:4,
        width: "100%",
        flexDirection:"column-reverse"
    }
});