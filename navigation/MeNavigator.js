import { Notifications } from 'expo';
import React from 'react';
import { StackNavigator } from 'react-navigation';
import MeScreen from '../screens/main/MeScreen';
import Setting from '../screens/main/second/SettingsScreen'


export default MeNavigator = StackNavigator(
    {
        Me: {
            screen: MeScreen,
            header: null,
            navigationOptions:({navigation}) => ({
                header: false
            }),
        },
        Setting: {
            screen:Setting,
            navigationOptions:{
                tabBarVisible: false
            }
        }
    },{
        initialRouteName: 'Me',
    }, {
        headerMode:'screen',
        navigationOptions: {
            headerVisible: false,
        }
    }, {
    }
);


