import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TabNavigator, TabBarBottom, StackNavigator } from 'react-navigation';

import Colors from '../constants/Colors';

import HomeScreen from '../screens/main/HomeScreen';
import LinksScreen from '../screens/main/LinksScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import MeNavigator from './MeNavigator';
import TinkoTabNavigator from './TinkoTabNavigator';
import CreateScreen from '../screens/main/CreateScreen';
import GooglePlacesInputScreen from '../screens/main/create/GooglePlacesInput';
import CreateNavigator from './CreateNavigator';

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
    tabBarComponent: TabBarBottom,
    tabBarPosition: 'bottom',
    animationEnabled: false,
    swipeEnabled: false,
    headerMode: 'none',
    headerVisible: false,
  }
);

export default StackNavigator(
    {
        Main: {
            screen: MainTabNavigator,
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