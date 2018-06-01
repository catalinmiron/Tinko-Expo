import React, {
    Component
} from 'react'
import {Text, Image, AsyncStorage, DeviceEventEmitter, Alert} from 'react-native';
import {Button, Header, Avatar, Overlay, Input} from 'react-native-elements'
import {firestoreDB, getAvatarPlaceholder, getFromAsyncStorage} from "../../../modules/CommonUtility";
import {getLength,updateUnReadNum} from "../../../modules/ChatStack";
import {sendFriendRequest} from "../../../modules/SocketClient";
import {CacheManager, Image as CacheImage} from "react-native-expo-image-cache";

import {
    View
} from 'react-native'
import firebase from "firebase";
import {Ionicons} from '@expo/vector-icons'
import {SQLite} from "expo";

const db = SQLite.openDatabase('db.db');

export default class AvatarDisplayOverlay extends Component{


    static navigationOptions = {header:null}

    constructor(props){
        super(props);
        this.showAvatarDisplay = this.showAvatarDisplay.bind(this);
        props.onRef(this);
        this.state={
            isVisible:false,
            photoURL:null
        };
    }


    showAvatarDisplay(){
        this.setState({isVisible:true})
    }

    render() {
        const {isVisible} = this.state;
        return (
            <Overlay
                height={295}
                borderRadius={25}
                isVisible={isVisible}
                onBackdropPress={()=>this.setState({isVisible:false})}
            >

            </Overlay>
        )
    }
}
