import React from 'react';
import {Alert, View, Button, StyleSheet, Text, FlatList, Dimensions, Image, TouchableOpacity} from "react-native";
import firebase from "firebase";
import {Avatar, Header, ListItem} from 'react-native-elements';
import {
    firestoreDB,
    getFromAsyncStorage, getImageSource, getPostTimeString, getStartTimeString,
    getUserDataFromDatabase,
    writeInAsyncStorage
} from "../../../modules/CommonUtility";
import {ifIphoneX} from "react-native-iphone-x-helper";
import {logoutFromNotification} from '../../../modules/CommonUtility';

const SCREEN_WIDTH = Dimensions.get('window').width;


export default class MyTinkosScreen extends React.Component {
    static navigationOptions = ({
        header:null,
    });

    constructor(props){
        super(props);
        let user = firebase.auth().currentUser;
        this.state={
            userUid:user.uid,
        };
    }

    componentDidMount(){
        this.getMeets();
    }


    getMeets(){
        const firestoreDb = firestoreDB();
        var query = firestoreDb.collection("Meets").orderBy(`participatingUsersList.${this.state.userUid}.startTime`);

        query.get().then(async (querySnapshot) => {
            var meetsData = await this.processMeets(querySnapshot.docs);
            this.setState({meetsData});
            //console.log(meetsData);
            console.log("Done");
            // var lastVisible = querySnapshot.docs[querySnapshot.docs.length-1];
            // this.setState({refreshing:false, loadingDone:true, lastVisible:lastVisible});
            // writeInAsyncStorage('TinkoMeets', meetsData);
            // querySnapshot.forEach(doc => {
            //     //console.log(doc.id, '=>', doc.data());
            //     let meetId = doc.id;
            //     let meetData = doc.data();
            //     this.insertMeetData(meetId, meetData);
            // });
        }).catch((error) => {
            console.log(error);
        });
    }

    async processMeets(queryDatas){
        var meetsData = [];
        await queryDatas.reduce((p,e,i) => p.then(async ()=> {
            //console.log(p, e.data(), i);
            let meet = e.data();
            let meetId = e.id;
            let userUid = meet.creator;

            await getUserDataFromDatabase(userUid,
                (userData) => {
                    //console.log(userData);
                    let brick = this.buildBrick(meet, meetId, userData);
                    meetsData.push(brick);
                },
                (error) => {
                    Alert.alert('Error', error);
                });

        }),Promise.resolve());

        return meetsData;
    }


    buildBrick(meet, meetId, user){
        let startTimeString = getStartTimeString(meet.startTime.toDate());
        let postTimeString = getPostTimeString(meet.postTime.toDate());
        return {
            meetId: meetId,
            title: meet.title,
            startTime: startTimeString,
            postTime: postTimeString,
            placeName: meet.place.name,
            creator: {
                username: user.username,
                photoURL: user.photoURL,
            },
            tags: meet.tagsList,
            dismissed:meet.dismissed,
        };
    }

    _keyExtractor = (item, index) => item.meetId;

    _renderItem = ({item}) =>{
        let tagName;
        if(item.tags){
            tagName = item.tags[0];
        } else{
            tagName = 'default'
        }
        return(
            <TouchableOpacity
                key = {item.meetId}
                onPress={() => (this.props.navigation.navigate('TinkoDetail', {meetId:item.meetId}))}
            >

                <View
                    style={{flex:1, width: SCREEN_WIDTH, height:135, justifyContent: 'flex-start', alignItems: 'center',}}
                >
                    <Image
                        resizeMethod={'auto'}
                        source={getImageSource(tagName)}
                        style={{ borderRadius:10, width: SCREEN_WIDTH-10, height: 130 }}
                    />
                    <View
                        style={styles.headerTop}
                    >
                        <Text style={styles.meetTitle} numberOfLines={1}>{item.title}</Text>
                        <View style={{flexDirection:'row'}}>
                            <Image
                                source={{ uri: item.creator.photoURL }}
                                style={styles.userPic}/>
                            <View style={{marginTop:10}}>

                                <Text style={styles.userName}>{item.creator.username}</Text>
                                <Text style={styles.startTime}>{item.startTime}</Text>
                                <Text style={styles.meetPlaceName}>{item.placeName}</Text>
                                <View style = {{flexDirection:'row'}}>
                                    <Text style={styles.postTime}>{item.postTime}</Text>
                                    {item.dismissed &&
                                    <Text style={{fontFamily:'bold', color:'red'}}>HISTORY</Text>
                                    }
                                </View>

                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    render() {
        return (
            <View style={styles.container}>
                <Header
                    leftComponent={{ icon: 'chevron-left', color: '#fff', onPress:()=>this.props.navigation.goBack()}}
                    centerComponent={{ text: 'Settings', style: { fontSize:18, fontFamily:'regular', color: '#fff' } }}
                    outerContainerStyles={ifIphoneX({height:88})}
                />
                <FlatList
                    data={this.state.meetsData}
                    keyExtractor={this._keyExtractor}
                    renderItem={this._renderItem}
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    headerTop: {
        //flexDirection: 'row',
        //padding: 5,
        marginLeft:10,
        alignItems: 'center',
        backgroundColor: 'transparent',
        position: 'absolute',
        zIndex: 100,
    },
    userPic: {
        height: 45,
        width: 45,
        borderRadius: 22,
        marginRight: 10,
        marginTop:10,
    },
    userName: {
        fontSize: 20,
        color:'white',
        fontWeight: 'bold',
    },
    postTime:{
        color:'white',
    },
    meetTitle:{
        fontSize: 25,
        color:'white',
        fontWeight:'bold',
    },
    startTime:{
        fontSize:18,
        color:'white',
        fontWeight:'bold',
    },
    meetPlaceName:{
        fontSize:16,
        color:'white',
        fontWeight:'bold',
    },
});