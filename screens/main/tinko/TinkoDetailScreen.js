import React from 'react';
import {View ,Alert ,TouchableWithoutFeedback ,Image ,ScrollView, Text} from 'react-native';
import {NavigationActions} from 'react-navigation';


export default class TinkoDetailScreen extends React.Component {

    static navigationOptions = ({navigation}) => ({
            header:null,
    });

    constructor(props){
        super(props);
        console.log(props);
    }


    render() {
        //console.log(this.props);
        return (
            <Text>{this.props.navigation.state.params.meetId}</Text>
        );
    }
}