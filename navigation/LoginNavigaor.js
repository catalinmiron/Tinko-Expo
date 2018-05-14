import { Notifications } from 'expo';
import React from 'react';
import { StackNavigator } from 'react-navigation';
import SignInScreen from '../screens/login/SignInScreen';
import RegisterScreen from '../screens/login/RegisterScreen';

export default LoginStackNavigator = StackNavigator(
    {
        SignIn: {
            screen:SignInScreen,
        },
        Register:{
            screen:RegisterScreen,
            mode:'modal'
        }
    },{
        initialRouteName: 'SignIn',
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
