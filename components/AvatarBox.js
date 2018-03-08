import React from 'react';
import {StyleSheet,View,Image,Text} from 'react-native';

export default class AvatarBox extends React.Component {
    render() {
        return (
            <View style={styles.outerDiv}>
                <Image
                    style={styles.image}
                    source={require('../assets/images/snapchat.jpg')}/>
                <Text style={{marginTop:5,fontSize:22,color:"rgb(54,53,59)",fontWeight:"bold"}}>Danielvs</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    outerDiv:{
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: 130,
        height: 130,
        marginTop:40,
        borderRadius: 25
    }
});