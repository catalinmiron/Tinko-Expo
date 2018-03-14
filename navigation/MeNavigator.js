import { Notifications } from 'expo';
import React from 'react';
import { StackNavigator } from 'react-navigation';
import MeScreen from '../screens/main/MeScreen';

export default MeNavigator = StackNavigator(
    {
        Me: {
            screen: MeScreen,
            header: null,
            navigationOptions:({navigation}) => ({
                header: false
            }),
        },
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


