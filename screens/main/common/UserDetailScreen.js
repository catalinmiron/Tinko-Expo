import React, {
    Component
} from 'react'
import {Text, Image} from 'react-native';
import {Button, Header, Avatar} from 'react-native-elements'
import {getUserData} from "../../../modules/CommonUtility";

import {
    View
} from 'react-native'
import firebase from "firebase";
import {Ionicons} from '@expo/vector-icons'

export default class UserDetailScreen extends Component{

    // static navigationOptions = ({ navigation }) => {
    //     const params = navigation.state.params || {};
    //
    //     return {
    //         headerLeft:(<Ionicons.Button
    //             name="ios-arrow-back" size={20} color="black" style={{marginLeft:26}} backgroundColor="transparent"
    //             onPress={() => navigation.goBack()}/>),
    //
    //         headerStyle:{ backgroundColor: 'white',}
    //     };
    // };
    static navigationOptions = {header:null}

    constructor(props){
        super(props);
        let user = firebase.auth().currentUser;
        this.state={
            userUid:user.uid,
            userData:{},
        }
    }

    componentDidMount(){
        getUserData(this.props.navigation.state.params.uid).fork(
            (error) => {
                console.log(error);
            },
            (userObj) => {
                this.setState({userData:userObj});
            }
        );

        let firestoreDb = firebase.firestore();
        var userRef = firestoreDb.collection("Users").doc(this.props.navigation.state.params.uid);
        userRef.get().then((userDoc) => {
            if (userDoc.exists) {
                //console.log("Document data:", userDoc.data());
                let user = userDoc.data();
                this.setState({userData:user});
            } else {
                console.log("No such document!");
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
    }

    render() {
        //console.log(this.props);
        const { userData, userUid}  = this.state;
        console.log(userData);
        return (
            <View style={{flex:1, backgroundColor:'white'}}>
                <Header
                    backgroundColor={"#F8F9F9"}
                    leftComponent={{ icon: 'keyboard-arrow-left', color: '#626567', onPress:() => this.props.navigation.goBack() }}
                />
                <View
                    style={{width:'90%', marginLeft:'5%', marginTop:30, marginBottom:30, flexDirection:'row', justifyContent:'space-between'}}
                >
                    <View>
                        <Text style={{fontFamily:'bold', fontSize:26}}>{userData.username}</Text>
                        <Text style={{fontFamily:'regular', fontSize:23}}>{userData.location}</Text>

                    </View>
                    <Avatar
                        large
                        rounded
                        source={{uri: userData.photoURL}}
                        //onPress={() => console.log("Works!")}
                        activeOpacity={0.7}
                    />

                </View>
                <Button
                    title='Message'
                    onPress={() => {
                        this.props.navigation.navigate('PrivateChatPage', {
                            avatar: userData.photoURL,
                            name:userData.username,
                            personId:userData.uid,
                            myId:userUid
                        })
                }}
                />
            </View>
        )
    }
}
