import { Notifications } from 'expo';
import React from 'react';
import { StackNavigator } from 'react-navigation';
import LoginScreen from '../screens/login/LoginScreen';
import SignInScreen from '../screens/login/SignInScreen';
import RegisterScreen from '../screens/login/RegisterScreen';

export default LoginStackNavigator = StackNavigator(
    {
        Login: {
            screen: LoginScreen,
            header: null,
            navigationOptions:({navigation}) => ({
                header: false
            }),
        },
        SignIn: {
            screen:SignInScreen,
        },
        Register:{
            screen:RegisterScreen,
            mode:'modal'
        }
    },{
        initialRouteName: 'Login',
        transitionConfig : () => ({
            transitionSpec: {
                duration: 0,
            },
        }),
    }, {
        headerMode:'screen',
        navigationOptions: {
            headerVisible: false,
        }
    }, {
    }
);

// export default class LoginNavigator extends React.Component {
//     constructor(props){
//         super(props);
//         console.log(props);
//     }
//     render() {
//         return <LoginStackNavigator />;
//     }
//
// }
