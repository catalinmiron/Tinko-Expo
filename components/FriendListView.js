import React, {
    Component
} from 'react'

import {
    View,Text,StyleSheet
} from 'react-native'
import FriendDiv from './FriendDiv';
import * as firebase from 'firebase';
import { List, ListItem } from 'react-native-elements'

require("firebase/firestore");

export default class FriendListView extends Component {

    constructor(){
        super();
        this.state = {
            rows: []
        };
    }

    componentDidMount(){
        this.insertFriendList();
    }

    insertFriendList(){
        let db = firebase.firestore();
        let list = [];
        let docRef = db.collection("Users").doc("107771053169905").collection("Friends_List");
        docRef.get().then((querySnapshot)=>{
            querySnapshot.forEach((doc)=>{
                if ('email' in doc.data()){
                    if (doc.data().username!==undefined){
                        let mapping = {
                            avatar:doc.data().photoURL,
                            key:doc.data().uid,
                            title:doc.data().username
                        };
                        list.push(mapping);
                    }
                }
            });
            this.setState({
                rows: list
            });
        });
    }

    render() {
        let friendList = [];
        for (let i = 0;i<this.state.rows.length ; i++){
            friendList.push(
                <ListItem
                    roundAvatar
                    avatar={this.state.rows[i].avatar}
                    key={this.state.rows[i].key}
                    title={this.state.rows[i].title}
                />
            )
        }
        return (
            <View>
                <View style={{width:"90%",marginTop:35,marginLeft:"5%"}}>
                    <List containerStyle={{marginBottom: 20}}>
                        {friendList}
                    </List>
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