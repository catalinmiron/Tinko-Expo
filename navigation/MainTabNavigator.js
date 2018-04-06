import React from 'react';
import { Platform, View, Image, StyleSheet } from 'react-native';
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
import UserDetailScreen from '../screens/main/common/UserDetailOverlay';
import MeScreen from "../screens/main/MeScreen";
import PrivateChatScreen from '../screens/main/common/PrivateChatScreen';
import GroupChatScreen from '../screens/main/common/GroupChatScreen';



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
      lazy:false
  }
);


class Detail extends React.Component {
    static navigationOptions = {
        header:null,
    }
    render() {
        return (
            <View style={styles.container}>

                <Image
                    style={{height:100, width:100}}
                    source={{uri: 'https://s-media-cache-ak0.pinimg.com/736x/b1/21/df/b121df29b41b771d6610dba71834e512.jpg'}}
                />
                <Image
                    style={{height:100, width:100}}
                    source={{uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQpD8mz-2Wwix8hHbGgR-mCFQVFTF7TF7hU05BxwLVO1PS5j-rZA'}}
                />
                <Image
                    style={{height:100, width:100}}
                    source={{uri: 'https://s-media-cache-ak0.pinimg.com/736x/04/63/3f/04633fcc08f9d405064391bd80cb0828.jpg'}}
                />
                <Image
                    style={{height:100, width:100}}
                    source={{uri: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQRWkuUMpLyu3QnFu5Xsi_7SpbabzRtSis-_QhKas6Oyj3neJoeug'}}
                />
                <Image
                    style={{height:100, width:100}}
                    source={{uri: 'https://s-media-cache-ak0.pinimg.com/736x/a5/c9/43/a5c943e02b1c43b5cf7d5a4b1efdcabb.jpg'}}
                />

            </View>
        );
    }
}


const MainTabNavigatorWithDetailScreens = StackNavigator(
    {
        Main:{
            screen: MainTabNavigator,
        },
        TinkoDetail:{
            screen: TinkoDetailScreen,
        },
        // UserDetail:{
        //     screen:UserDetailScreen,
        // },
        PrivateChatPage: {
            screen: PrivateChatScreen,
        },
        GroupChatPage: {
            screen: GroupChatScreen,
        },
        testImageCache:{
            screen:Detail,
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});