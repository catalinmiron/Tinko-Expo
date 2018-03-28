import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TabNavigator, TabBarBottom, StackNavigator } from 'react-navigation';

import Colors from '../constants/Colors';

import LinksScreen from '../screens/main/LinksScreen';
import SettingsScreen from '../screens/main/second/SettingsScreen';
import MeNavigator from './MeNavigator';
import TinkoTabNavigator from './TinkoTabNavigator';
import CreateScreen from '../screens/main/CreateScreen';
import GooglePlacesInputScreen from '../screens/main/create/GooglePlacesInput';
import CreateNavigator from './CreateNavigator';
import TinkoDetailScreen from "../screens/main/tinko/TinkoDetailScreen";
import UserDetailScreen from '../screens/main/common/UserDetailScreen';
import MeScreen from "../screens/main/MeScreen";
import PrivateChatScreen from '../screens/main/common/PrivateChatScreen';



const MainTabNavigator = TabNavigator(
  {
    Home: {
      screen: TinkoTabNavigator,
    },
    Links: {
      screen: LinksScreen,
        header: null,
        navigationOptions:({navigation}) => ({
            header: false
        })
    },
    Settings: {
      screen: MeNavigator,
    },
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused }) => {
        const { routeName } = navigation.state;
        let iconName;
        switch (routeName) {
          case 'Home':
            iconName =
              Platform.OS === 'ios'
                ? `ios-information-circle${focused ? '' : '-outline'}`
                : 'md-information-circle';
            break;
          case 'Links':
            iconName = Platform.OS === 'ios' ? `ios-link${focused ? '' : '-outline'}` : 'md-link';
            break;
          case 'Settings':
            iconName =
              Platform.OS === 'ios' ? `ios-options${focused ? '' : '-outline'}` : 'md-options';
        }
        return (
          <Ionicons
            name={iconName}
            size={28}
            style={{ marginBottom: -3 }}
            color={focused ? Colors.tabIconSelected : Colors.tabIconDefault}
          />
        );
      },
    }),
      //tabBarOptions:{style:{height:0}, showLabel:false},
    tabBarComponent: TabBarBottom,
    tabBarPosition: 'bottom',
    animationEnabled: false,
    swipeEnabled: false,
    headerMode: 'none',
    headerVisible: false,
  }
);


const MainTabNavigatorWithDetailScreens = StackNavigator(
    {
        Main:{
            screen: MainTabNavigator,
        },
        TinkoDetail:{
            screen: TinkoDetailScreen,
        },
        UserDetail:{
            screen:UserDetailScreen,
        },
        PrivateChatPage: {
            screen: PrivateChatScreen,

        }
    }
);

export default StackNavigator(
    {
        MainWithDetails: {
            screen: MainTabNavigatorWithDetailScreens,
        },
        Create: {
            screen: CreateNavigator,
        },
        GooglePlacesAutocomplete: {
            screen: GooglePlacesInputScreen,
        }
    },
    {
        mode: 'modal',
        headerMode:'screen'
    }
);