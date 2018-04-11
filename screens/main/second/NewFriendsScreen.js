import React, {Component} from "react";
import {View,Text} from 'react-native';
import {Header} from 'react-native-elements';
import {getNewFriendsRequest} from "../../../modules/SqliteClient";
import * as firebase from "firebase/index";

export default class NewFriendsScreen extends Component {
    static navigationOptions = ({
        header:null,
    });

    constructor(props){
        super(props);
        let user = firebase.auth().currentUser;
        let uid = user.uid;
        this.state={
            userUid:uid,
        }
    }

    componentDidMount(){
        getNewFriendsRequest(this.state.userUid).fork(
            (error) => {
                console.log(error);
            },
            (requestsData) => {
                console.log(requestsData);
            }
        );
    }

    render() {
        return (
            <View style={{flex:1}}>
                <Header
                    centerComponent={{ text: 'New Friends', style: { color: '#fff' } }}
                />
                <Text>New Friends Request</Text>
            </View>

        );
    }
}