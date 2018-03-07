import { Notifications } from 'expo';
import React from 'react';
import { StackNavigator } from 'react-navigation';

import MainTabNavigator from './MainTabNavigator';
import LoginScreen from '../screens/login/LoginScreen';

const LoginStackNavigator = StackNavigator(
    {
        Login: {
            screen: LoginScreen,
            header: null,
            navigationOptions:({navigation}) => ({
                header: false
            }),
        },
    },{
        initialRouteName: 'Login',
    }, {
        headerMode:'screen',
        navigationOptions: {
            headerVisible: false,
        }
    }, {
    }
);

export default class LoginNavigator extends React.Component {

    render() {
        return <LoginStackNavigator />;
    }

}
