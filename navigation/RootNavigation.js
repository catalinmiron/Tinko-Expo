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

  },
  {
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
  componentDidMount() {
    this._notificationSubscription = this._registerForPushNotifications();
      let config = {
          apiKey: "AIzaSyCSDDrtqnaP6YkRHQqZZ3Bd8BSGvANDPDA",
          authDomain: "tinko-64673.firebaseapp.com",
          databaseURL: "https://tinko-64673.firebaseio.com",
          projectId: "tinko-64673",
          storageBucket: "tinko-64673.appspot.com",
          messagingSenderId: "793640773525"
      };
      firebase.initializeApp(config);

  }

  componentWillUnmount() {
    this._notificationSubscription && this._notificationSubscription.remove();
  }

  // renderOption(){
  //     const user = firebase.auth().currentUser
  //     if(user){
  //         return <RootStackNavigator/>;
  //     } else {
  //         return <LoginNav/>;
  //     }
  //     // firebase.auth().onAuthStateChanged((user) => {
  //     //     if(user){
  //     //         console.log('user is logged in');
  //     //     } else {
  //     //         console.log('user is not logged in');
  //     //     }
  //     // });
  // }

  render() {
      return <RootStackNavigator/>;
      // const user = firebase.auth().currentUser
      // if(user){
      //     return <RootStackNavigator/>;
      // } else {
      //     return <LoginNav/>;
      // }
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
