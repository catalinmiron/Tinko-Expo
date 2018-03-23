import React from 'react';
import {View ,Alert ,TouchableWithoutFeedback ,Image ,ScrollView} from 'react-native';
import { List, ListItem,Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import Avatar from "../../components/AvatarBox";
import SettingBox from '../../components/SettingMenu';
import InfoMenu from '../../components/InfoMenu';
import CreateStoryButton from '../../components/CreateStoryButton';
import FriendDiv from '../../components/FriendListView';
import firebase from 'firebase';
import {StackNavigator} from "react-navigation";


class Me extends React.Component {

    render() {
        return (
            <ScrollView style={{backgroundColor: "white", height: "100%" ,width: "100%"}}>
                <View style={{height:60,width:"100%",marginTop:35}}>
                    {/*这是设置按钮*/}
                    <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('Setting')}>
                        <Image style={{alignSelf: 'flex-end', marginRight:20, width:30,height:30}}
                               source={require('../../assets/images/setting.png')}
                        />
                    </TouchableWithoutFeedback>
                </View>
                <Avatar />
                <SettingBox />
                <InfoMenu icon={"user-plus"} />
                <CreateStoryButton/>
                <FriendDiv/>
            </ScrollView>
        );
    }
}

class Setting extends React.Component {
    static navigationOptions = ({
        title:"Setting"
    });

    onLogoutButtonPressed(){
        firebase.auth().signOut()
            .then(console.log('after signout'))
            .catch((error) => {
                console.log(error);
                Alert.alert("Error", error.message);
            });

    }

    //onPress={() => this.onLogoutButtonPressed()}

    render() {
        return (
            <View>
                <Button
                    onPress={() => this.onLogoutButtonPressed()}
                    title="Logout"
                    titleStyle={{ fontWeight: "700" }}
                    buttonStyle={{
                        backgroundColor: "rgba(92, 99,216, 1)",
                        width: 300,
                        height: 45,
                        borderColor: "transparent",
                        borderWidth: 0,
                        borderRadius: 5
                    }}
                    containerStyle={{ marginTop: 20 }}
                />
            </View>
        )
    }
}

export default StackNavigator({
    MeView: {
        screen: Me,
        navigationOptions: {
            header:null
        }
    },
    Setting: {
        screen:Setting,
        navigationOptions:{
            tabBarVisible: false
        }
    }
    // TinkoWebView:{
    //     screen: TinkoWebView,
    //     navigationOptions: {
    //         tabBarVisible: false
    //     }
    // }
},{
    initialRouteName: 'MeView',
});