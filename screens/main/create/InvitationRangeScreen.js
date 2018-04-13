import _ from 'lodash';
import React from 'react';
import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    Keyboard,
    TextInput, Dimensions,
    Switch,
} from 'react-native';
import {
    Input,
    Button,
    Text,
    Card,
    ButtonGroup,
    Tile,
    Col,
    Row,
    Icon,
    Avatar, ListItem,
} from 'react-native-elements';
import Expo, { SQLite } from 'expo';


const db = SQLite.openDatabase('db.db');

import * as firebase from "firebase";

export default class InvitationRangeScreen extends React.Component{

    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};

        return {
            // Correct Header Button modifyzationn: https://reactnavigation.org/docs/header-buttons.html
            headerLeft:(<Button title="Back"
                                clear
                                onPress={params.back}
            />),
            headerStyle:{backgroundColor:'#EC7063'}
            //headerStyle:{ position: 'absolute', backgroundColor: 'transparent', zIndex: 100, top: 0, left: 0, right: 0, headerLeft:null, boarderBottomWidth: 0}
        };
    };

    constructor(props){
        super(props);
        let user = firebase.auth().currentUser;
        let uid = user.uid;
        const {allFriends, allowPeopleNearby, allowParticipantsInvite, selectedFriendsList} = props.navigation.state.params;
        this.state = {
            userUid:uid,
            sqlRows: [],
            allFriends: allFriends,
            allowPeopleNearby: allowPeopleNearby,
            allowParticipantsInvite: allowParticipantsInvite,
            selectedFriendsList: selectedFriendsList,
        };
    }

    componentDidMount(){
        this.props.navigation.setParams({back:this.onBackButtonPressed.bind(this)});
        this.getSql();
    }

    componentWillUnmount(){
        const {allFriends, allowPeopleNearby, allowParticipantsInvite, sqlRows} = this.state;
        console.log('componentWillUnmount:', allFriends, allowPeopleNearby, allowParticipantsInvite);
        var selectedFriendsList = [];
        sqlRows.map((l,i) => {
            if(l.selected){
                selectedFriendsList.push(l.key);
            }
        });
        this.props.navigation.state.params.setInvitationRange({
            allFriends:allFriends,
            allowPeopleNearby:allowPeopleNearby,
            allowParticipantsInvite:allowParticipantsInvite,
            selectedFriendsList:selectedFriendsList,
            userPicked: true,
        })
    }

    onBackButtonPressed(){
        this.props.navigation.goBack();
    }


    getSql(){
        const{ userUid, selectedFriendsList } = this.state;
        db.transaction(
            tx => {
                tx.executeSql('select * from friend_list'+userUid, [], (_, { rows }) => {
                    let dataArr =  rows['_array'],
                        rtnArr = [];
                    for (let i = 0; i <dataArr.length;i++){
                        let selected = selectedFriendsList.indexOf(dataArr[i].userId) !== -1;
                        rtnArr.push({
                            avatar:dataArr[i].avatarUrl,
                            key:dataArr[i].userId,
                            title:dataArr[i].username,
                            selected: selected,
                        });
                    }
                    this.setState({ sqlRows: rtnArr });
                });
            },
            null,
            this.update
        )

    }

    onAllFriendsToggled(allFriends){
        const {sqlRows} = this.state;
        this.setState({allFriends});
        sqlRows.map((l,i) => {
            l.selected = allFriends;
            sqlRows[i] = l;

        })
        this.setState({sqlRows});
    }


    render(){
        const { sqlRows, allFriends, allowPeopleNearby, allowParticipantsInvite } = this.state;
        console.log(sqlRows);
        // if(sqlRows===null || sqlRows.length ===0){
        //     return (<List>
        //         <ListItem
        //             title='All Friends'
        //             rightIcon={
        //                 <Switch
        //                     value={allFriends}
        //                     onValueChange={this.onAllFriendsToggled.bind(this)}
        //                 />
        //             }
        //         />
        //         <ListItem
        //             title='Allow People Nearby'
        //             rightIcon={
        //                 <Switch
        //                     value={allowPeopleNearby}
        //                     onValueChange={(allowPeopleNearby) => this.setState({allowPeopleNearby})}
        //                 />
        //             }
        //         />
        //         <ListItem
        //             title='Allow Participants Invite Friends'
        //             rightIcon={
        //                 <Switch
        //                     value={allowParticipantsInvite}
        //                     onValueChange={(allowParticipantsInvite) => this.setState({allowParticipantsInvite})}
        //                 />
        //             }
        //         />
        //     </List>);
        // }

        return(
            <ScrollView style={styles.container}>
                <ListItem
                    title='All Friends'
                    rightIcon={
                        <Switch
                            value={allFriends}
                            onValueChange={this.onAllFriendsToggled.bind(this)}
                        />
                    }
                />
                <ListItem
                    title='Allow People Nearby'
                    rightIcon={
                        <Switch
                            value={allowPeopleNearby}
                            onValueChange={(allowPeopleNearby) => this.setState({allowPeopleNearby})}
                        />
                    }
                />
                <ListItem
                    title='Allow Participants Invite Friends'
                    rightIcon={
                        <Switch
                            value={allowParticipantsInvite}
                            onValueChange={(allowParticipantsInvite) => this.setState({allowParticipantsInvite})}
                        />
                    }
                />
                {(sqlRows===null || sqlRows.length ===0) ?
                    null
                    :
                    (<View style={{marginTop:30}}>
                        {sqlRows.map((l, i) => (
                            <ListItem
                                key={l.key}
                                leftAvatar={{ rounded: true, source: { uri: l.avatar } }}
                                title={l.title}
                                rightIcon = {{name: l.selected ? 'done' : 'hideChevron'}}
                                onPress={() => {
                                    //console.log(l, i);
                                    l.selected = !l.selected;
                                    sqlRows[i] = l;
                                    this.setState({sqlRows});
                                }}
                            />
                        ))}
                    </View>)}

            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});