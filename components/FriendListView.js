import React, {
    Component
} from 'react'

import {
    View,Text,StyleSheet
} from 'react-native'
import FriendDiv from './FriendDiv';
import Expo, { SQLite } from 'expo';
import * as firebase from 'firebase';
import { List, ListItem } from 'react-native-elements';

require("firebase/firestore");

const db = SQLite.openDatabase('db.db');

export default class FriendListView extends Component {

    constructor(){
        super();
        this.state = {
            rows: []
        };
    }

    componentDidMount(){
    }



    render() {
        return (
            <View>
                <View style={{width:"90%",marginTop:35,marginLeft:"5%"}}>
                    <FriendDiv/>
                </View>
            </View>
        )
    }
}
const styles = StyleSheet.create(
    {
        separator:
            {
                height: 2,
                backgroundColor: 'rgba(0,0,0,0.5)',
                width: '100%'
            },

        text:
            {
                fontSize: 18,
                color: 'black',
                padding: 15
            }
    });