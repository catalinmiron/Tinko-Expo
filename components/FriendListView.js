import React, {
    Component
} from 'react'

import {
    View,Text,StyleSheet
} from 'react-native'
import Expo, { SQLite } from 'expo';
import * as firebase from 'firebase';
import { ListItem } from 'react-native-elements';


require("firebase/firestore");

const db = SQLite.openDatabase('db.db');

let friendList = [];

export default class FriendListView extends Component {

    constructor(props){
        super(props);
        let user = firebase.auth().currentUser;
        let uid = user.uid;
        this.getSql = this.getSql.bind(this);
        props.onRef(this);
        this.state = {
            userUid:uid,
            sqlRows: [],
            rows: [],
            selectedUid:'',
            overlayIsVisible:false,
        };
    }

    componentDidMount(){
        this.getSql();
    }

    getSql(){
        const { userUid } = this.state;
        db.transaction(
            tx => {
                tx.executeSql(`select * from friend_list${userUid} WHERE isFriend = 1`, [], (_, { rows }) => {
                    let dataArr =  rows['_array'],
                        rtnArr = [];
                    console.log(dataArr);
                    for (let i = 0; i <dataArr.length;i++){
                        rtnArr.push({
                            photoURL:dataArr[i].avatarUrl,
                            uid:dataArr[i].userId,
                            username:dataArr[i].username
                        });
                        friendList.push(dataArr[i].userId)
                    }
                    this.setState({
                        sqlRows: rtnArr
                    });
                });
            },
            null,
            null
        )
    }


    goToDetailPage(uid){
        //console.log(key);
        //this.props.navigation.navigate('UserDetail', {uid:key});
        this.props.showThisUser(uid, this.props.navigation,this.updateUserDetail.bind(this));

    }


    updateUserDetail(){
        this.getSql();
    }

    render() {
        const{selectedUid, overlayIsVisible} = this.state;
        let friendList = [];
        for (let i = 0;i<this.state.sqlRows.length ; i++){
            console.log(this.state.sqlRows[i]);
            friendList.push(
                <ListItem
                    hideChevron
                    leftAvatar={{ rounded: true, size:40, source: { uri: this.state.sqlRows[i].photoURL } }}
                    key={this.state.sqlRows[i].uid}
                    title={this.state.sqlRows[i].username}
                    onPress={() => this.goToDetailPage(this.state.sqlRows[i].uid)}
                />
            )
        }
        return (
            <View>
                <View style={{width:"90%",marginTop:35,marginLeft:"5%"}}>
                    {friendList}
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