import { Notifications } from 'expo';
import React from 'react';
import { StackNavigator } from 'react-navigation';
import LoginScreen from '../screens/login/LoginScreen';
import SignInScreen from '../screens/login/SignInScreen';
import RegisterScreen from '../screens/login/RegisterScreen';
import DiscoverScreen from '../screens/main/DiscoverScreen';
import {Dimensions, StyleSheet, View } from "react-native";
import TinkoScreen from "../screens/main/TinkoScreen";

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;


const DiscoverStackNavigator = StackNavigator(
    {
        Tinko:{
            screen: DiscoverScreen
        }
    }
);


export default class DiscoverNavigator extends React.Component {
    static  navigationOptions = {header:null};
    render() {
        return (
            <View style={styles.container}>
                <DiscoverStackNavigator/>
            </View>
        )
    }

}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },

});
