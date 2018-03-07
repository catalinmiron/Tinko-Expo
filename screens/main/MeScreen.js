import React from 'react';
import {View ,Alert ,TouchableWithoutFeedback ,Image} from 'react-native';
import Avatar from "../../components/AvatarBox";
import SettingBox from '../../components/SettingMenu';
import InfoMenu from '../../components/InfoMenu';
import CreateStoryButton from '../../components/CreateStoryButton';
import firebase from 'firebase';


export default class Me extends React.Component {
    onLogoutButtonPressed(){
        firebase.auth().signOut()
        //.then(this.props.navigation.navigate("LoginScreen"))
            .catch((error) => {
                console.log(error);
                Alert.alert("Error", error.message);
            });

    }

    render() {
        return (
            <View style={{backgroundColor: "white", height: "100%" ,width: "100%"}}>
                <View style={{height:60,width:"100%",marginTop:20}}>
                    {/*这是设置按钮*/}
                    <TouchableWithoutFeedback onPress={() => this.onLogoutButtonPressed()}>
                        <Image style={{alignSelf: 'flex-end', marginRight:20, width:30,height:30}}
                               source={require('../../assets/images/setting.png')}
                        />
                    </TouchableWithoutFeedback>
                </View>
                <Avatar />
                <SettingBox />
                <InfoMenu icon={"user-plus"} />
                <CreateStoryButton/>
            </View>
        );
    }
}