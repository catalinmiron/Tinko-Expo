import React from 'react';
import {View ,Alert ,TouchableWithoutFeedback ,Image ,ScrollView} from 'react-native';
import { List, ListItem,Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import Avatar from "../../components/AvatarBox";
import SettingBox from '../../components/SettingMenu';
import InfoMenu from '../../components/InfoMenu';
import CreateStoryButton from '../../components/CreateStoryButton';
import FriendsList from '../../components/FriendListView';
import firebase from 'firebase';
import {StackNavigator} from "react-navigation";
import {getUserData} from "../../modules/CommonUtility";


export default class Me extends React.Component {

    constructor(props){
        super(props);
        //console.log(props);
        let user = firebase.auth().currentUser;
        this.state={
            userUid:user.uid,
            userData:{},
        }
    }


    componentWillMount(){
        this.getThisUserData()
    }

    getThisUserData(){
        getUserData(this.state.userUid).fork(
            (error) => {
                console.log(error);
            },
            (userObj) => {
                this.setState({userData:userObj});
            }
        );
    }

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
                <Avatar userData={this.state.userData}/>
                <SettingBox />
                <InfoMenu icon={"user-plus"} />
                <CreateStoryButton/>
                <FriendsList navigation={this.props.navigation}/>
            </ScrollView>
        );
    }
}

