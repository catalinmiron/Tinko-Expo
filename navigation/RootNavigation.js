import { Notifications } from 'expo';
import React from 'react';
import { StackNavigator } from 'react-navigation';

import MainTabNavigator from './MainTabNavigator';
import LoginNavigator from './LoginNavigaor';
import registerForPushNotificationsAsync from '../api/registerForPushNotificationsAsync';
import firebase from 'firebase';

const RootStackNavigator = StackNavigator(
  {

      Main: {
          screen: MainTabNavigator,
      },
      // Login: {
      //     screen: LoginNavigator,
      // },

  },
  {
     // initialRouteName: 'Login',
    // navigationOptions: () => ({
    //   headerTitleStyle: {
    //     fontWeight: 'normal',
    //   },
    // }),
  }
);

const LoginNav = StackNavigator(
    {
        Login: {
            screen: LoginNavigator,
        },
    }
);

export default class RootNavigator extends React.Component {
    constructor(props){
        super(props);
        //console.log(props.loggedIn);
    }

  componentDidMount() {
    this._notificationSubscription = this._registerForPushNotifications();


  }

  componentWillUnmount() {
    this._notificationSubscription && this._notificationSubscription.remove();
  }


  render() {
        if(this.props.loggedIn){
            return <RootStackNavigator/>
        } else {
            return <LoginNav/>
        }
      //return <RootStackNavigator/>;
  }

  _registerForPushNotifications() {
    // Send our push token over to our backend so we can receive notifications
    // You can comment the following line out if you want to stop receiving
    // a notification every time you open the app. Check out the source
    // for this function in api/registerForPushNotificationsAsync.js
    registerForPushNotificationsAsync();

    // Watch for incoming notifications
    this._notificationSubscription = Notifications.addListener(this._handleNotification);
  }

  _handleNotification = ({ origin, data }) => {
    console.log(`Push notification ${origin} with data: ${JSON.stringify(data)}`);
  };
}
