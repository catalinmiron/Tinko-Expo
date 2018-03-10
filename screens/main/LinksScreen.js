import React, {
    Component
} from 'react'
import {
    View,Text,StyleSheet
} from 'react-native'
import { Container, Header, Content, List, ListItem, Left, Body, Right, Thumbnail } from 'native-base';
import SocketIOClient from 'socket.io-client';
import Expo, { SQLite } from 'expo';

const db = SQLite.openDatabase('db.db');

require("firebase/firestore");

let friendList = [];

export default class FriendListView extends Component {

    constructor(){
        super();
        this.state = {
            messages: [],
            sqlRows:[]
        };
    }

    getSql(){
        db.transaction(
            tx => {
                tx.executeSql('select * from friend_list', [], (_, { rows }) => {
                    let dataArr =  rows['_array'],
                        rtnArr = [];
                    for (let i = 0; i <dataArr.length;i++){
                        rtnArr.push({
                            avatar:dataArr[i].avatarUrl,
                            key:dataArr[i].userId,
                            title:dataArr[i].username
                        });
                        friendList.push(dataArr[i].userId)
                    }
                    this.setState({
                        sqlRows: rtnArr,
                        loadCache: true
                    });
                });
            },
            null,
            this.update
        )
    }

    render() {
        // let friendList = [];
        // if (this.state.sqlRows.length === 0){
        //     this.getSql();
        // }else{
        //     for (let i = 0;i<this.state.sqlRows.length ; i++){
        //         friendList.push(
        //             <ListItem
        //                 roundAvatar
        //                 avatar={this.state.sqlRows[i].avatar}
        //                 key={this.state.sqlRows[i].key}
        //                 title={this.state.sqlRows[i].title}
        //                 subtitle={"https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg"}
        //             />
        //         )
        //     }
        // }
        return (
            <Content style={{marginTop:60}}>
                <List>
                    <ListItem avatar>
                        <Left>
                            <Thumbnail source={{ uri: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg' }} />
                        </Left>
                        <Body>
                        <Text>Kumar Pratik</Text>
                        <Text note>Doing what you like will always keep you happy . .</Text>
                        </Body>
                        <Right>
                            <Text note>3:43 pm</Text>
                        </Right>
                    </ListItem>
                </List>
            </Content>
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