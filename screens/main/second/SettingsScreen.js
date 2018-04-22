import React from 'react';
import {Alert, View, Button, StyleSheet, Text} from "react-native";
import firebase from "firebase";
import {Avatar, Header, ListItem} from 'react-native-elements';
import {getFromAsyncStorage} from "../../../modules/CommonUtility";
import {ifIphoneX} from "react-native-iphone-x-helper";

export default class SettingsScreen extends React.Component {
    static navigationOptions = ({
        header:null,
    });

    constructor(props){
        super(props);
        let user = firebase.auth().currentUser;
        this.state={
            userUid:user.uid,
            userData:{},
        };
        this.getThisUserDataForSetting();
    }

    getThisUserDataForSetting(){
        getFromAsyncStorage('ThisUser', this.state.userUid).then((userData) => {
            if(userData) {
                console.log(userData);
                this.setState({userData});
            }
        });
    }

    onLogoutButtonPressed(){
        firebase.auth().signOut()
            .then(console.log('after signout'))
            .catch((error) => {
                console.log(error);
                Alert.alert("Error", error.message);
            });

    }

    //onPress={() => this.onLogoutButtonPressed()}

    render() {
        const {userData} = this.state;
        return (
            <View>
                <Header
                    leftComponent={{ icon: 'chevron-left', color: '#fff', onPress:()=>this.props.navigation.goBack()}}
                    centerComponent={{ text: 'Settings', style: { fontSize:18, fontFamily:'bold', color: '#fff' } }}
                    outerContainerStyles={ifIphoneX({height:78})}
                />
                <ListItem
                    title='Avatar'
                    titleStyle={styles.titleStyle}
                    chevron
                    chevronColor={'black'}
                    rightElement={
                        <Avatar
                            medium
                            source={{uri: userData.photoURL}}
                        />
                    }
                    onPress={()=> this.props.navigation.navigate('AvatarUpload',{
                        getThisUserData:this.props.navigation.state.params.getThisUserData,
                        getThisUserDataForSetting:this.getThisUserDataForSetting.bind(this)
                    })}
                />
                <ListItem
                    title='User Name'
                    titleStyle={styles.titleStyle}
                    chevron
                    chevronColor={'black'}
                    rightElement={
                        <Text>{userData.username}</Text>
                    }
                />
                <ListItem
                    title='Location'
                    titleStyle={styles.titleStyle}
                    chevron
                    chevronColor={'black'}
                    rightElement={
                        <Text>{userData.location}</Text>
                    }
                />
                <Button
                    onPress={() => this.onLogoutButtonPressed()}
                    title="Logout"
                    titleStyle={{ fontWeight: "700" }}
                    buttonStyle={{
                        backgroundColor: "rgba(92, 99,216, 1)",
                        width: 300,
                        height: 45,
                        borderColor: "transparent",
                        borderWidth: 0,
                        borderRadius: 5
                    }}
                    containerStyle={{ marginTop: 20 }}
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    // container: {
    //     flex: 1,
    //     backgroundColor: 'white',
    // },
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