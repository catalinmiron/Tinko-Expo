import React from 'react';
import {Alert, View, Button} from "react-native";
import firebase from "firebase";

export default class SettingsScreen extends React.Component {
    static navigationOptions = ({
        title:"Setting"
    });

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
        return (
            <View>
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

