import React, { Component } from 'react';
import {StyleSheet, Text, View, ImageBackground, Dimensions, TouchableWithoutFeedback, Alert} from 'react-native';
import { Input, Button } from 'react-native-elements'

import {Facebook, Font} from 'expo';
import firebase from "firebase";
//import Icon from 'react-native-vector-icons/FontAwesome';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const BG_IMAGE = require('../../assets/images/bg_screen1.jpg');


export default class RegisterScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};

        return {
            //headerRight:(<Button title='SKIP' buttonStyle={{backgroundColor: 'transparent', borderWidth: 0,}} onPress={params.skip}/>),
            headerStyle:{ position: 'absolute', backgroundColor: 'transparent', zIndex: 100, top: 0, left: 0, right: 0, headerLeft:null, boaderBottomWidth: 0,borderBottomColor: 'transparent',}
        };
    };



    constructor(props) {
        super(props);
        console.log(props)
        this.state = {
            fontLoaded: false,
            email: props.navigation.state.params.email,
            password: '',
            login_failed: false,
            showLoading: false,
            repeatPassword: ''
        };
    }

    skipRegister(){
        this.props.screenProps.handleUserLoggedIn();
    }

    async componentDidMount() {
        this.props.navigation.setParams({skip:this.skipRegister.bind(this)});
        await Font.loadAsync({
            'georgia': require('../../assets/fonts/Georgia.ttf'),
            'regular': require('../../assets/fonts/Montserrat-Regular.ttf'),
            'light': require('../../assets/fonts/Montserrat-Light.ttf'),
            'bold': require('../../assets/fonts/Montserrat-Bold.ttf'),
        });

        this.setState({ fontLoaded: true });
    }



    onRegisterButtonPressed(){
        //console.log('onRegisterButtonPressed')
        this.setState({ showLoading: true });
        const {email, password, repeatPassword} = this.state;
        if(password.length<8){
            this.setState({ showLoading: false });
            Alert.alert('Error', 'Password should be at least 8 characters');
            return;
        }
        if(password.localeCompare(repeatPassword)!==0){
            this.setState({ showLoading: false });
            Alert.alert('Error', 'Password are not same');
            return;
        }
        let credential = firebase.auth.EmailAuthProvider.credential(email, password);
        firebase.auth().currentUser.linkWithCredential(credential)
            .then((user) => {
                console.log("Account linking success", user);
                this.props.screenProps.handleUserLoggedIn();
            }).catch((error) => {
            Alert.alert("Email Linking Failed", error);
        });

    }



    render() {
        const { email, password, showLoading, repeatPassword } = this.state;

        return (
            <View style={styles.container}>
                <ImageBackground
                    source={BG_IMAGE}
                    style={styles.bgImage}
                >
                    { this.state.fontLoaded ?
                        <View style={styles.loginView}>
                            <View style={styles.loginTitle}>
                                <Text style={styles.travelText}>REGISTRATION</Text>
                            </View>
                            <View style={styles.loginInput}>
                                <View style={{marginVertical: 10}}>
                                    <Input
                                        containerStyle={{width:250}}
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
                                    />
                                </View>
                                <View style={{marginVertical: 10}}>
                                    <Input
                                        containerStyle={{width:250}}
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
                                    />
                                </View>
                                <View style={{marginVertical: 10}}>
                                    <Input
                                        containerStyle={{width:250}}
                                        onChangeText={(repeatPassword) => this.setState({repeatPassword})}
                                        value={repeatPassword}
                                        inputStyle={{marginLeft: 10, color: 'white'}}
                                        secureTextEntry={true}
                                        keyboardAppearance="light"
                                        placeholder="Repeat Password"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        keyboardType="default"
                                        returnKeyType="done"
                                        ref={ input => this.passwordInput = input}
                                        blurOnSubmit={true}
                                        placeholderTextColor="white"
                                    />
                                </View>
                                <View style={{marginVertical: 10}}>
                                    <Button
                                        title ='REGISTER'
                                        activeOpacity={1}
                                        underlayColor="transparent"
                                        onPress={() => this.onRegisterButtonPressed()}
                                        loading={showLoading}
                                        loadingProps={{size: 'small', color: 'white'}}
                                        buttonStyle={{height: 50, width: 250, backgroundColor: 'transparent', borderWidth: 2, borderColor: 'white', borderRadius: 30}}
                                        containerStyle={{marginVertical: 10}}
                                        titleStyle={{fontWeight: 'bold', color: 'white'}}
                                    />
                                </View>
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