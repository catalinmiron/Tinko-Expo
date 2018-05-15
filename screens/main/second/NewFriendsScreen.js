import React, {Component} from "react";
import {View, Text, ScrollView, Alert} from 'react-native';
import {Header, Input, ListItem, Button} from 'react-native-elements';
import {getNewFriendsRequest, updateNewFriendsRequestType} from "../../../modules/SqliteClient";
import firebase from "firebase";
import {Ionicons} from '@expo/vector-icons';
import {acceptFriendRequest} from "../../../modules/SocketClient";
import Socket from "../../../modules/SocketModule";
import SocketIOClient from "socket.io-client";
import {firestoreDB, getPostRequest} from "../../../modules/CommonUtility";
import {ifIphoneX} from "react-native-iphone-x-helper";

export default class NewFriendsScreen extends Component {
    static navigationOptions = ({
        header:null,
    });

    constructor(props){
        super(props);
        console.log(props);
        let user = firebase.auth().currentUser;
        let uid = user.uid;
        //console.log(uid);
        this.state={
            userUid:uid,
            requestsData:[],
            searchList:[],
            searchText:'',
            searched:false,
            buttonShowLoading:false,
        }
        this.renderRightElement = this.renderRightElement.bind(this);
    }

    componentDidMount(){
        this.updateNewFriendsRequestList()
    }

    updateNewFriendsRequestList(){
        getNewFriendsRequest(this.state.userUid).fork(
            (error) => {
                console.log(error);
            },
            (requestsData) => {
                this.setState({requestsData});
            }
        );
    }

    searchAccountButtonPressed(){
        this.setState({searchList:[],searched:true});
        this.searchFromFirestore('username');
        this.searchFromFirestore('email');
        this.searchFromFirestore('phoneNumber');
    }

    searchFromFirestore(code){
        const {searchText} = this.state;
        let firestoreDb = firestoreDB();
        let usersRef = firestoreDb.collection('Users');
        let query = usersRef.where(code, '==', searchText);
        query.get().then((querySnapshot) => {
            querySnapshot.forEach((userDoc) => {
                // doc.data() is never undefined for query doc snapshots
                //console.log(doc.id, " => ", doc.data());
                let userData = userDoc.data();
                this.setState((state) => {
                    let searchList = state.searchList;
                    searchList.push(userData);
                    return {searchList};
                })
            });
        }).catch((error) => {
            console.log(error);
        });
    }

    acceptRequestButtonPressed(request){
        console.log(request.requesterUid, this.state.userUid);
        this.setState({buttonShowLoading:true});
        let bodyData = {
            requester:request.requesterUid,
            responser:this.state.userUid,
            requesterFacebookId: this.props.navigation.state.params.facebookId
        };
        getPostRequest('initializeTwoWayFriendship', bodyData,
            (response) => {
                console.log(response);
                this.setState({buttonShowLoading:false});
                //acceptFriendRequest(request.requesterUid, this.state.userUid);
                updateNewFriendsRequestType(this.state.userUid, request.id).fork(
                    (error) => {
                        console.log(error);
                    },
                    () => {
                        this.updateNewFriendsRequestList();
                    }
                );
            }, (error) => {
                Alert.alert("Error", error);
                this.setState({buttonShowLoading:false})
            });
    }

    renderRightElement({request}){
        switch(request.type){
            case 0:
                return (
                    <Button
                        title='Accept'
                        loading={this.state.buttonShowLoading}
                        //loadingProps={{size: 'small', color: 'white'}}
                        onPress={() => this.acceptRequestButtonPressed(request)}
                    />
                );
            case 1:
                return (
                    <Text style={{color:'#979A9A'}}>Accepted</Text>
                );
            case 2:
                return (
                    <Text style={{color:'#979A9A'}}>Facebook</Text>
                );
            default:
                return null;
        }
    }

    renderSearchList({searchList}){
        //const {searchList} = this.state;
        console.log(searchList);
        if(searchList.length===0 || searchList===undefined){
            return (
                <ListItem
                    style={{marginTop:5}}
                    key={0}
                    title='No Such Account'
                />
            );
        } else {
            return (
                <View style={{marginTop:5}}>
                    {searchList.map((userData) => (
                        <ListItem
                            key={userData.uid}
                            title={userData.username}
                            leftAvatar={{ rounded: true, source: { uri: userData.photoURL} }}
                            onPress={() => this.props.screenProps.showThisUser(userData.uid, this.props.navigation)}
                        />
                    ))}
                </View>
            );
        }
    }

    render() {
        const {requestsData, searchList,searchText, searched} = this.state;
        return (
            <View style={{flex:1}}>
                <Header
                    leftComponent={{ icon: 'chevron-left', color: '#fff', onPress:()=>this.props.navigation.goBack()}}
                    centerComponent={{ text: 'New Friends', style: { fontSize:18, fontFamily:'regular', color: '#fff' } }}
                    outerContainerStyles={ifIphoneX({height:78})}
                />

                <ScrollView>

                    <Input
                        inputContainerStyle={{flex:1, borderBottomColor:'transparent', borderBottomWidth:0}}
                        clearButtonMode={'always'}
                        clearTextOnFocus={true}
                        placeholder='Tinko Name, Phone Number, or Email'
                        leftIcon={
                            <Ionicons
                                name='ios-search'
                                size={23}
                                color='#979A9A'
                            />
                        }
                        containerStyle={{marginTop:10, width:'100%', backgroundColor:'white'}}
                        onChangeText ={searchText => this.setState({searchText})}
                        value={searchText}
                        returnKeyType={'search'}
                        onSubmitEditing={() => this.searchAccountButtonPressed()}
                    />

                    {searched && <this.renderSearchList searchList={searchList}/>}
                    {/*{searched &&*/}
                    {/*<View style={{marginTop:5}}>*/}
                        {/*{searchList.map((userData) => (*/}
                            {/*<ListItem*/}
                                {/*key={userData.uid}*/}
                                {/*title={userData.username}*/}
                                {/*leftAvatar={{ rounded: true, source: { uri: userData.photoURL} }}*/}
                                {/*onPress={() => this.props.screenProps.showThisUser(userData.uid, this.props.navigation)}*/}
                            {/*/>*/}
                        {/*))}*/}
                    {/*</View>*/}
                    {/*}*/}


                    <View style={{marginTop:10}}>
                        {requestsData.map((request) => (
                            <ListItem
                                key={request.requesterUid}
                                title={request.username}
                                leftAvatar={{ rounded: true, size:40, source: { uri: request.photoURL } }}
                                subtitle={request.msg}
                                rightElement={
                                    <this.renderRightElement request={request}/>
                                }
                                onPress={() => this.props.screenProps.showThisUser(request.requesterUid, this.props.navigation)}
                            />
                        ))}
                    </View>
                </ScrollView>
            </View>

        );
    }
}