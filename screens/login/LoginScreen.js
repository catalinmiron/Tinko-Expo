import React from 'react';
import {
    Button,
    View,
    Text,
    Image,
    Platform,
    Animated,
    StyleSheet,
    Navigator,
    Alert
} from 'react-native';
import FullButton from '../../components/FullButton';

export default class LoginScreen extends React.Component {
    static navigationOptions = {
        //header: null,
        title: 'login'
    };
    render() {
        return (
            <View style={styles.container}>
                <View style={styles.iconView}>
                    <Image
                        resizeMode="contain"
                        style={styles.tinkoIcon}
                        source={require('../../assets/images/Tinko.png')}/>
                </View>
                <View style={styles.btnView}>
                    <FullButton buttonStyle={{backgroundColor:"#f2e6ff"}} text='Instagram'/>
                    <FullButton
                        buttonStyle={{backgroundColor:"#cc99ff"}}
                        text='Facebook'
                        //onPress={() => this.onSignInWithFacebookButtonPressed()}
                    />
                    <FullButton
                        buttonStyle={{backgroundColor:"#9933ff"}}
                        //onPress={() => this.props.navigation.navigate('SignInWithTinko')}
                        text='Login with Tinko'/>
                </View>
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex:1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#b3d9ff',
    },
    iconView: {
        marginTop:"10%",
        flex:1
    },
    tinkoIcon: {
        width: 120,
    },
    btnView: {
        flex:4,
        width: "100%",
        flexDirection:"column-reverse"
    }
});