import React, { Component } from 'react';
import {
    StyleSheet, Text, View, Image, ScrollView, Dimensions, TouchableOpacity, StatusBar
} from 'react-native';
import { Button } from 'react-native-elements'
import { Font } from 'expo';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const IMAGE_SIZE = SCREEN_WIDTH - 80;

export default class CustomButton extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selected: false
        };
    }

    componentDidMount() {
        const { selected } = this.props;

        this.setState({
            selected
        });
    }

    render() {
        const { title } = this.props;
        const { selected } = this.state;

        return (
            <Button
                text={title}
                textStyle={selected ? {fontSize: 15, color: 'white', fontFamily: 'regular' } : {fontSize: 15, color: 'rgba(213, 100, 140, 1)', fontFamily: 'regular' }}
                buttonStyle={selected ? { backgroundColor: 'rgba(213, 100, 140, 1)', borderRadius: 100, width: 80, elevation:0 } : { borderWidth: 1, borderColor: 'rgba(213, 100, 140, 1)', borderRadius: 30, width: 80, backgroundColor: 'transparent',elevation:0 }}
                containerStyle={{ marginRight: 10 }}
                onPress={() => {
                    this.setState({selected: !selected});
                    this.props.onPress(this.props.title);
                }}
            />
        );
    }
}