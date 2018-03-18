import React from 'react';
import {View ,Alert ,TouchableWithoutFeedback ,Image ,ScrollView, Text} from 'react-native';



export default class TinkoDetailScreen extends React.Component {

    render() {
        //console.log(this.props);
        return (
            <Text>{this.props.navigation.state.params.meetId}</Text>
        );
    }
}