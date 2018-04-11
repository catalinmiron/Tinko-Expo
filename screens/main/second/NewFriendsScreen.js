import React, {Component} from "react";
import {View,Text} from 'react-native';
import {Header} from 'react-native-elements';

export default class NewFriendsScreen extends Component {
    static navigationOptions = ({
        header:null,
    });

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