import React, { Component } from 'react';
import {StyleSheet, Text, View, ImageBackground, Dimensions, TouchableWithoutFeedback, Alert} from 'react-native';
import { Input, Button } from 'react-native-elements'

import {Facebook, Font} from 'expo';
import firebase from "firebase";
import { NavigationActions } from 'react-navigation';
//import Icon from 'react-native-vector-icons/FontAwesome';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const BG_IMAGE = require('../../assets/images/bg_screen1.jpg');

export default class SignInScreen extends Component {
    static navigationOptions = {headerStyle:{ position: 'absolute', backgroundColor: 'transparent', zIndex: 100, top: 0, left: 0, right: 0, borderBottomWidth: 0,borderBottomColor: 'transparent',shadowColor: 'transparent', elevation:0, shadowOpacity: 0 }};

    constructor(props) {
        super(props);
        console.log(props)
        this.state = {
            fontLoaded: false,
            email: '',
            email_valid: true,
            password: '',
            login_failed: false,
            showLoading: false
        };
    }

    async componentDidMount() {
        await Font.loadAsync({
            'georgia': require('../../assets/fonts/Georgia.ttf'),
            'regular': require('../../assets/fonts/Montserrat-Regular.ttf'),
            'light': require('../../assets/fonts/Montserrat-Light.ttf'),
            'bold': require('../../assets/fonts/Montserrat-Bold.ttf'),
        });

        this.setState({ fontLoaded: true });
    }


    submitLoginCredentials() {
        this.setState({ showLoading: true });
        const { email, password } = this.state;
        firebase.auth().signInWithEmailAndPassword(email,password)
            .then((user)=>{
                console.log('SignIn: ', user);
                this.props.screenProps.handleUserLoggedIn();
            })
            .catch((error) => {
                console.log(error.code);
                console.log(error.message);
                Alert.alert("Error", error.message);
                this.setState({ showLoading: false});
            });
    }


    resetNavigation(targetRoute, email) {
        const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: targetRoute, params: {email: email} }),
            ],
        });
        this.props.navigation.dispatch(resetAction);
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

        this.resetNavigation('Register', email);
        fetch('https://us-central1-tinko-64673.cloudfunctions.net/initializeNewUser', {
            method:'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dict),
        }).then ((response) => {
            console.log(response);

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
            //this.initializeNewUser(token, user.uid);
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
        const { email, password, email_valid, showLoading } = this.state;

        return (
            <View style={styles.container}>
                <ImageBackground
                    source={BG_IMAGE}
                    style={styles.bgImage}
                >
                    { this.state.fontLoaded ?
                        <View style={styles.loginView}>
                            <View style={styles.loginTitle}>
                                <Text style={styles.travelText}>TINKO</Text>
                            </View>
                            <View style={styles.loginInput}>
                                <View style={{marginVertical: 10}}>
                                    <Input
                                        width={230}
                                        // icon={
                                        //     <Icon
                                        //         name='user-o'
                                        //         color='rgba(171, 189, 219, 1)'
                                        //         size={25}
                                        //     />
                                        // }
                                        onChangeText={email => this.setState({email})}
                                        value={email}
                                        inputStyle={{marginLeft: 10, color: 'white'}}
                                        keyboardAppearance="light"
                                        placeholder="Email"
                                        autoFocus={false}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        keyboardType="email-address"
                                        returnKeyType="next"
                                        ref={ input => this.emailInput = input }
                                        onSubmitEditing={() => {
                                            this.passwordInput.focus();
                                        }}
                                        blurOnSubmit={false}
                                        placeholderTextColor="white"
                                        displayError={!email_valid}
                                        errorStyle={{textAlign: 'center', fontSize: 12}}
                                        errorMessage="Please enter a valid email address"
                                    />
                                </View>
                                <View style={{marginVertical: 10}}>
                                    <Input
                                        width={230}
                                        // icon={
                                        //     <Icon
                                        //         name='lock'
                                        //         color='rgba(171, 189, 219, 1)'
                                        //         size={25}
                                        //     />
                                        // }
                                        onChangeText={(password) => this.setState({password})}
                                        value={password}
                                        inputStyle={{marginLeft: 10, color: 'white'}}
                                        secureTextEntry={true}
                                        keyboardAppearance="light"
                                        placeholder="Password"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        keyboardType="default"
                                        returnKeyType="done"
                                        ref={ input => this.passwordInput = input}
                                        blurOnSubmit={true}
                                        placeholderTextColor="white"
                                        displayError={false}
                                        errorStyle={{textAlign: 'center', fontSize: 12}}
                                        errorMessage="The email and password you entered did not match out records. Please try again!"
                                    />
                                </View>
                            </View>
                            <View style={styles.loginButton}>
                                <Button
                                    text ='LOG IN'
                                    activeOpacity={1}
                                    underlayColor="transparent"
                                    onPress={this.submitLoginCredentials.bind(this)}
                                    loading={showLoading}
                                    loadingProps={{size: 'small', color: 'white'}}
                                    disabled={ !email_valid && password.length < 8}
                                    buttonStyle={{height: 50, width: 250, backgroundColor: 'transparent', borderWidth: 2, borderColor: 'white', borderRadius: 30}}
                                    containerStyle={{marginVertical: 10}}
                                    textStyle={{fontWeight: 'bold', color: 'white'}}
                                />
                            </View>
                            <View style={styles.footerView}>
                                <Text style={{color: 'grey'}}>
                                    New here?
                                </Text>
                                <Button
                                    text="Sign up with Facebook"
                                    clear
                                    activeOpacity={0.5}
                                    textStyle={{color: 'white', fontSize: 15}}
                                    containerStyle={{marginTop: -10}}
                                    onPress={() => this.logInFB()}
                                />
                            </View>
                        </View> :
                        <Text>Loading...</Text>
                    }
                </ImageBackground>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    bgImage: {
        flex: 1,
        top: 0,
        left: 0,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loginView: {
        marginTop: 0,
        backgroundColor: 'transparent',
        width: 250,
        height: 350,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loginTitle: {
        flex: 1,
    },
    travelText: {
        color: 'white',
        fontSize: 30,
        fontFamily: 'bold'
    },
    plusText: {
        color: 'white',
        fontSize: 30,
        fontFamily: 'regular'
    },
    loginInput: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loginButton: {
        flex: 1,
    },
    footerView: {
        marginTop: 20,
        flex: 0.5,
        justifyContent: 'center',
        alignItems: 'center',
    }
});