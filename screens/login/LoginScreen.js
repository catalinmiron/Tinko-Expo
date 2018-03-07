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

export default class LoginScreen extends React.Component {
    static navigationOptions = {
        //header: null,
        title: 'login'
    };

    async logInFB() {
        const { type, token } = await Facebook.logInWithReadPermissionsAsync('765640913609406', {
            permissions: ['public_profile', 'email', 'user_friends', 'user_location'],
        });
        if (type === 'success') {
            // Get the user's name using Facebook's Graph API
            const credential = firebase.auth.FacebookAuthProvider.credential(token);
            firebase.auth().signInWithCredential(credential).then((user) => {
                console.log("Login: ", user);
                const { a, b } = user.metadata;
                console.log(a, b); //a = creationTime, b = lastSignInTime
                //this.initializeNewUser(accessTokenData.accessToken, user.uid);
                if(a===b){ //first time login
                    //this.initializeNewUser(accessTokenData.accessToken);
                } else {
                    //this.props.navigation.navigate("MainScreen");
                }
            }).catch((error) => {
                console.log(error);
            })
            // const response = await fetch(
            //     `https://graph.facebook.com/me?access_token=${token}`);
            // Alert.alert(
            //     'Logged in!',
            //     `Hi ${(await response.json()).name}!`,
            // );
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
                        //onPress={() => this.props.navigation.navigate('SignInWithTinko')}
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