import React, { Component } from 'react';
import {StyleSheet, Text, View, ImageBackground, Dimensions, TouchableWithoutFeedback, Alert} from 'react-native';
import { Input, Button } from 'react-native-elements';
import { MapView } from 'expo';
import Masonry from '../../modules/react-native-masonry';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;


const addData = [
    {
        data:{
            tags:[]
        },
        uri: 'https://i.pinimg.com/736x/48/ee/51/48ee519a1768245ce273363f5bf05f30--kaylaitsines-dipping-sauces.jpg'
    },
    {
        data:{
            tags:[]
        },
        uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGYfU5N8lsJepQyoAigiijX8bcdpahei_XqRWBzZLbxcsuqtiH'
    },
    {
        data:{
            tags:[]
        },
        uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPL2GTXDuOzwuX5X7Mgwc3Vc9ZIhiMmZUhp3s1wg0oHPzSP7qC'
    }
];

export default class DiscoverScreen extends Component {
    //static navigationOptions = {title: 'Discover', headerStyle:{ position: 'absolute', backgroundColor: 'transparent', zIndex: 100, top: 0, left: 0, right: 0, boarderBottomWidth: 0,shadowColor: 'transparent', elevation:0, shadowOpacity: 0 }};
    static  navigationOptions = {header:null};
    constructor(props) {
        super(props);
        //console.log(props)

    }



    render() {

        return (
            <View style = {styles.container}>
                <MapView
                    style={{ flex: 1 }}
                    initialRegion={{
                        latitude: 37.78825,
                        longitude: -122.4324,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                />
                <View style={{marginTop:600, position:'absolute'}}>
                    <Masonry
                        sorted // optional - Default: false
                        columns={2} // optional - Default: 2
                        bricks={addData}
                        // refreshControl={
                        //     <RefreshControl
                        //         refreshing={this.state.refreshing}
                        //         onRefresh={this._onRefresh.bind(this)}
                        //     />
                        // }
                    />
                </View>
            </View>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    bgImage: {
        flex: 1,
        top: 0,
        left: 0,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loginView: {
        marginTop: 0,
        backgroundColor: 'transparent',
        width: 250,
        height: 350,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loginTitle: {
        flex: 1,
    },
    travelText: {
        color: 'white',
        fontSize: 30,
        fontFamily: 'bold'
    },
    plusText: {
        color: 'white',
        fontSize: 30,
        fontFamily: 'regular'
    },
    loginInput: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loginButton: {
        flex: 1,
    },
    footerView: {
        marginTop: 20,
        flex: 0.5,
        justifyContent: 'center',
        alignItems: 'center',
    }
});