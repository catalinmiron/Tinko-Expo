import React, {
    Component
} from 'react'
import {Text} from 'react-native';
import {Button} from 'react-native-elements'
import {getUserData} from "../../../modules/CommonUtility";

import {
    View
} from 'react-native'
import firebase from "firebase";

export default class UserDetailScreen extends Component{

    static navigationOptions = {header:null};

    constructor(props){
        super(props);
        let user = firebase.auth().currentUser;
        this.state={
            userUid:user.uid,
            userData:{},
        }
    }

    componentDidMount(){
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
        //console.log(this.props);
        const { userData, userUid}  = this.state;
        return (
            <View>
                <Text style={{marginTop:100}}>{this.props.navigation.state.params.uid}</Text>
                <Button
                    title='Message'
                    onPress={() => {
                        this.props.navigation.navigate('PrivateChatPage', {
                            avatar: userData.photoURL,
                            name:userData.username,
                            personId:userData.uid,
                            myId:userUid
                        })
                }}
                />
            </View>
        )
    }
}
