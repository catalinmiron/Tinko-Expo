import React from 'react';
import {StyleSheet,View,Text} from 'react-native';
import SubButton from './SettingSubButton';

export default class SettingMenu extends React.Component {
    render() {
        return (
            <View style={styles.outerDiv}>
                <View style={styles.settingOuter}>
                    <SubButton/>
                    <SubButton
                        ViewStyle={{borderLeftWidth:2,borderRightWidth:2,borderColor:"white",}}
                    />
                    <SubButton/>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    outerDiv:{
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingOuter: {
        width:"90%",
        marginTop:15,
        backgroundColor:"rgb(54,53,59)",
        height:55,
        borderRadius:10,
        flexDirection: 'row'
    }
});