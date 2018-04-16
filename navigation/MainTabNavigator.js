import React from 'react';
import { Platform, View, Image, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TabNavigator, TabBarBottom, StackNavigator } from 'react-navigation';

import Colors from '../constants/Colors';

import LinksScreen from '../screens/main/LinksScreen';
import SettingsScreen from '../screens/main/second/SettingsScreen';
import TinkoTabNavigator from './TinkoTabNavigator';
import CreateScreen from '../screens/main/CreateScreen';
import GooglePlacesInputScreen from '../screens/main/create/GooglePlacesInput';
import CreateNavigator from './CreateNavigator';
import TinkoDetailScreen from "../screens/main/tinko/TinkoDetailScreen";
import UserDetailScreen from '../screens/main/common/UserDetailOverlay';
import MeScreen from "../screens/main/MeScreen";
import PrivateChatScreen from '../screens/main/common/PrivateChatScreen';
import GroupChatScreen from '../screens/main/common/GroupChatScreen';
import IconBadge from '../modules/react-native-icon-badge';
import Setting from '../screens/main/second/SettingsScreen';
import TinkoWebView from '../screens/main/common/TinkoWebView';
import NewFriendsScreen from '../screens/main/second/NewFriendsScreen';
import TinkoDetailTabNavigator from './TinkoDetailTabNavigator'

const MainTabNavigator = TabNavigator(
  {
    Home: {
      screen: TinkoTabNavigator,
    },
    Links: {
      screen: LinksScreen,
        header: null,
    },
    Settings: {
      screen: MeScreen,
    },
  },
  {
    // navigationOptions: ({ navigation }) => ({
    //   tabBarIcon: ({ focused }) => {
    //     const { routeName } = navigation.state;
    //     let iconName;
    //     switch (routeName) {
    //       case 'Home':
    //         iconName =
    //           Platform.OS === 'ios'
    //             ? `ios-information-circle${focused ? '' : '-outline'}`
    //             : 'md-information-circle';
    //         break;
    //       case 'Links':
    //         iconName = Platform.OS === 'ios' ? `ios-link${focused ? '' : '-outline'}` : 'md-link';
    //         break;
    //       case 'Settings':
    //         iconName =
    //           Platform.OS === 'ios' ? `ios-person${focused ? '' : '-outline'}` : 'md-person';
    //     }
    //     return (
    //         <View>
    //             {/*<Ionicons*/}
    //                 {/*name={iconName}*/}
    //                 {/*size={28}*/}
    //                 {/*style={{ marginBottom: -3 }}*/}
    //                 {/*color={focused ? Colors.tabIconSelected : Colors.tabIconDefault}*/}
    //             {/*/>*/}
    //             <IconBadge
    //                 MainElement={
    //                     <View style={{height:30, width:30, alignItems: 'center',
    //                         justifyContent: 'center',}}>
    //                         <Ionicons
    //                             name={iconName}
    //                             size={30}
    //                             style={{ marginBottom: -3 }}
    //                             color={focused ? Colors.tabIconSelected : Colors.tabIconDefault}
    //                         />
    //                     </View>
    //
    //                 }
    //                 BadgeElement={
    //                     <Text style={{color:'#FFFFFF'}}>{''}</Text>
    //                 }
    //                 IconBadgeStyle={
    //                     {width:10, height:10, backgroundColor: 'red'}
    //                 }
    //                 Hidden={false}
    //             />
    //         </View>
    //     );
    //   },
    // }),
    tabBarComponent: TabBarBottom,
    tabBarPosition: 'bottom',
    animationEnabled: false,
    swipeEnabled: false,
    headerMode: 'none',
    headerVisible: false,
      lazy:false
  }
);




const MainTabNavigatorWithDetailScreens = StackNavigator(
    {
        Main:{
            screen: MainTabNavigator,
        },
        TinkoDetail:{
            screen: TinkoDetailTabNavigator,
        },
        PrivateChatPage: {
            screen: PrivateChatScreen,
        },
        GroupChatPage: {
            screen: GroupChatScreen,
        },
        Setting: {
            screen:Setting,
        },
        TinkoWebView:{
            screen: TinkoWebView,
        },
        NewFriends:{
            screen:NewFriendsScreen
        }
    },
    { headerMode: 'none' }
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});