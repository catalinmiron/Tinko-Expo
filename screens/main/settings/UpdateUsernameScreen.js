import React from 'react';
import {Alert, View, StyleSheet, Text, Keyboard} from "react-native";
import firebase from "firebase";
import {Avatar, Header, ListItem, Button, Input} from 'react-native-elements';
import {getFromAsyncStorage} from "../../../modules/CommonUtility";
import {ifIphoneX} from "react-native-iphone-x-helper";

export default class UpdateUsernameScreen extends React.Component {
    static navigationOptions = ({
        header:null,
    });

    constructor(props){
        super(props);
        let user = firebase.auth().currentUser;
        this.state={
            userUid:user.uid,
            username:props.navigation.state.params.username,
            oldUsername:props.navigation.state.params.username,
        };

    }

    onSubmitButtonPressed(){
        const {userUid, username} = this.state;
        let userRef = firebase.firestore().collection('Users').doc(userUid);
        userRef.update({username:username}).then(()=>{
            this.props.navigation.state.params.getThisUserData();
            this.props.navigation.state.params.setUsername(username);
            this.props.navigation.goBack();
        }).catch((error)=>{
            Alert.alert('Error', error);
        })
    }


    render() {
        const {username, oldUsername} = this.state;
        console.log(username);
        return (
            <View style={styles.container}>
                <Header
                    leftComponent={{ icon: 'chevron-left', color: '#fff', onPress:()=>this.props.navigation.goBack()}}
                    centerComponent={{ text: 'Username', style: { fontSize:18, fontFamily:'bold', color: '#fff' } }}
                    outerContainerStyles={ifIphoneX({height:78})}
                />

                <Input
                    inputContainerStyle={{flex:1, borderBottomColor:'transparent', borderBottomWidth:0, backgroundColor:'white'}}
                    clearTextOnFocus={true}
                    placeholder='Username'
                    containerStyle={{marginTop:30, width:'100%', backgroundColor:'white'}}
                    onChangeText ={username => {
                        console.log('onChangeText',username);
                        this.setState({username});
                    }}
                    value={username}
                    returnKeyType={'done'}
                    onSubmitEditing={() => Keyboard.dismiss()}
                    autoFocus={true}
                />

                {username !== oldUsername &&
                <Button
                    title='Submit'
                    onPress={() => this.onSubmitButtonPressed()}
                    containerStyle={{marginTop:30}}
                />
                }

            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        //backgroundColor: 'white',
    },
    // listStyle:{
    //     // borderTopWidth: 0,
    //     // borderBottomWidth:0,
    //     // borderBottomColor:'#F8F9F9',
    //     paddingLeft:0,
    //     paddingRight:0,
    // },
    titleStyle:{
        fontFamily:'regular',
        fontSize:20,
    }

});