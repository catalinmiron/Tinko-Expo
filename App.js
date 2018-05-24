import React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import {AppLoading, Asset, Font, SQLite} from 'expo';
import { Ionicons } from '@expo/vector-icons';
import RootNavigation from './navigation/RootNavigation';
import firebase from "firebase";
import { ActionSheetProvider, connectActionSheet } from '@expo/react-native-action-sheet';
import { Root } from "native-base";

export default class App extends React.Component {
  state = {
    isLoadingComplete: false,
    loggedIn:false,
      firstTimeLoading:true

  };

  render() {
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    } else {
      return (

          <View style={styles.container}>
              {/*{Platform.OS === 'ios' && <StatusBar barStyle="default" />}*/}
              {/*{Platform.OS === 'android' && <View style={styles.statusBarUnderlay} />}*/}
              <Root>
                  <ActionSheetProvider>
                      <RootNavigation
                          loggedIn={this.state.loggedIn}
                          handleUserLoggedIn={this.handleUserLoggedIn.bind(this)}/>
                  </ActionSheetProvider>
              </Root>


          </View>
      );
    }
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([
        require('./assets/images/robot-dev.png'),
        require('./assets/images/robot-prod.png'),
          require('./assets/images/tagsTheme/city.png'),
          require('./assets/images/tagsTheme/cloud.jpg'),
          require('./assets/images/tagsTheme/humian.jpg'),
          require('./assets/images/tagsTheme/leaves.jpg'),
          require('./assets/images/tagsTheme/lines.jpg'),
          require('./assets/images/tagsTheme/sky.jpg'),
          require('./assets/images/tagsTheme/StaindGlass.jpg'),
          require('./assets/images/tagsTheme/yumao.jpg'),
          require('./assets/images/bg_screen1.jpg'),
          require('./assets/images/placeholder-big.jpg'),
          require('./assets/images/tagsTheme/esports.jpg'),
          require('./assets/images/tagsTheme/sports.jpg'),
          require('./assets/images/tagsTheme/food.png'),
          require('./assets/images/tagsTheme/shopping.jpg'),
          require('./assets/images/tagsTheme/cinema.jpg'),
          require('./assets/images/tagsTheme/bar.jpg'),
          require('./assets/images/tagsTheme/travel.jpg'),

      ]),
      Font.loadAsync({
        // This is the font that we are using for our tab bar
        ...Ionicons.font,
        // We include SpaceMono because we use it in . Feel free
        // to remove this if you are not using it in your app
          'georgia': require('./assets/fonts/Georgia.ttf'),
          'regular': require('./assets/fonts/Montserrat-Regular.ttf'),
          'light': require('./assets/fonts/Montserrat-Light.ttf'),
          'bold': require('./assets/fonts/Montserrat-Bold.ttf'),
      }),
    ]);
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
      let config = {
          apiKey: "AIzaSyCSDDrtqnaP6YkRHQqZZ3Bd8BSGvANDPDA",
          authDomain: "tinko-64673.firebaseapp.com",
          databaseURL: "https://tinko-64673.firebaseio.com",
          projectId: "tinko-64673",
          storageBucket: "tinko-64673.appspot.com",
          messagingSenderId: "793640773525"
      };
      firebase.initializeApp(config);
      firebase.auth().onAuthStateChanged((user) => {
        if(user){
            if(this.state.firstTimeLoading){
                this.setState({firstTimeLoading:false, isLoadingComplete: true, loggedIn:true});
            }
        } else {
            this.setState({firstTimeLoading:false, isLoadingComplete: true, loggedIn:false});
        }
      });
  };

  handleUserLoggedIn(){
      this.setState({loggedIn:true});
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  statusBarUnderlay: {
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});
