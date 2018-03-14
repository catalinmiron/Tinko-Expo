import React, { Component } from 'react';
import {StyleSheet, Text, View, ImageBackground, Dimensions, TouchableWithoutFeedback, Alert, ScrollView, SafeAreaView} from 'react-native';
import { Input, Button } from 'react-native-elements'

import { Header } from 'react-navigation';
import {Facebook, Font} from 'expo';
import firebase from "firebase";
import { NavigationActions } from 'react-navigation';
//import Icon from 'react-native-vector-icons/FontAwesome';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const BG_IMAGE = require('../../assets/images/bg_screen1.jpg');

export default class TinkoScreen extends Component {
    //static navigationOptions = {title: 'Tinko', headerStyle:{ position: 'absolute', backgroundColor: 'transparent', zIndex: 100, top: 0, left: 0, right: 0, boarderBottomWidth: 0,shadowColor: 'transparent', elevation:0, shadowOpacity: 0 }};
    static  navigationOptions = {header:null};


    render() {

        return (
            <View style={styles.container}>
                <ScrollView
                    showsVerticalScrollIndicator={false}>
                    <View style={{height: Header.HEIGHT}}/>
                    <Text style={{fontSize:96}}>Scroll me plz</Text>
                    <Text style={{fontSize:96}}>If you like</Text>
                    <Text style={{fontSize:96}}>Scrolling down</Text>
                    <Text style={{fontSize:96}}>What's the best</Text>
                    <Text style={{fontSize:96}}>Framework around?</Text>
                    <Text style={{fontSize:80}}>React Native</Text>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:'#C4ECFF'
    },
    topText:{
        position:'absolute',
    },
    headerView: {
        height:64
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