import { Notifications } from 'expo';
import React from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import { StackNavigator } from 'react-navigation';
import LoginScreen from '../screens/login/LoginScreen';
import SignInScreen from '../screens/login/SignInScreen';
import RegisterScreen from '../screens/login/RegisterScreen';
import TinkoScreen from '../screens/main/TinkoScreen';
import TinkoDetailScreen from '../screens/main/tinko/TinkoDetailScreen';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;


const TinkoStackNavigator = StackNavigator(
    {
        Tinko:{
            screen: TinkoScreen,
        },
        TinkoDetail:{
            screen: TinkoDetailScreen,
        }
    }
);

export default class TinkoNavigator extends React.Component {
    static  navigationOptions = {header:null};
    constructor(props){
        super(props);
        //console.log(props)
    }
    render() {
        return (
            <View style={styles.container}>
                <TinkoStackNavigator />
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