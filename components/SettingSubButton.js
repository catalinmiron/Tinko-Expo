import React from 'react';
import {StyleSheet,View} from 'react-native';

export default class SettingSubButton extends React.Component {
    render() {
        return (
            <View style={[styles.SettingBTN, this.props.ViewStyle]}>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    SettingBTN: {
        flex:1,height:55,
    }
});