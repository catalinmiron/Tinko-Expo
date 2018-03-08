import React, { Component } from 'react';
import {StyleSheet , View , Text ,Image ,TouchableWithoutFeedback, Alert, Button, TextInput} from 'react-native';
//import { Container, Header, Content, Form, Item, Input, Label ,Button} from 'native-base';
import firebase from 'firebase'

export default class RegisterScreen extends Component {
    static navigationOptions = { header: null,gesturesEnabled: false,animationEnabled: false };

    constructor(props) {
        super(props);
        this.state = {email: props.navigation.state.params.email, password: '', repeatPassword:''};
    }

    onRegisterButtonPressed(){
        //console.log(this.state.email);
        //console.log(this.state.password);
        const {email, password, repeatPassword} = this.state;
        if(password.localeCompare(repeatPassword)===0){
            //Alert.alert('Good', 'Password are same');
            let credential = firebase.auth.EmailAuthProvider.credential(email, password);
            firebase.auth().currentUser.linkWithCredential(credential)
                .then((user) => {
                    console.log("Account linking success", user);
                    this.props.screenProps.handleUserLoggedIn();
                }).catch((error) => {
                    Alert.alert("Email Linking Failed", error);
                });
        } else {
            Alert.alert('Error', 'Password are not same');
        }

    }


    render() {
        return (
            <View>
                <Text>hold</Text>
                <Text>hold</Text>
                <Text>hold</Text>
                <Text>hold</Text>
                <Text>hold</Text>
                <TouchableWithoutFeedback onPress={() => this.props.screenProps.handleUserLoggedIn()}>
                    <Text>Skip</Text>
                </TouchableWithoutFeedback>
                <Text>hold</Text>
                <Text>hold</Text>
                <Text>hold</Text>
                <Text>hold</Text>
                <Text>hold</Text>
                <TextInput
                    onChangeText={(email)=>this.setState({email})}
                    value={this.state.email}/>
                <Text>hold</Text>
                <Text>hold</Text>
                <Text>hold</Text>
                <Text>hold</Text>
                <Text>hold</Text>
                <TextInput onChangeText={(password)=>this.setState({password})}/>
                <Text>hold</Text>
                <Text>hold</Text>
                <Text>hold</Text>
                <Text>hold</Text>
                <Text>hold</Text>
                <TextInput onChangeText={(repeatPassword)=>this.setState({repeatPassword})}/>
                <Text>hold</Text>
                <Text>hold</Text>
                <Text>hold</Text>
                <Text>hold</Text>
                <Text>hold</Text>
                <Button
                    onPress={() => this.onRegisterButtonPressed()}
                    title="Register"
                    color="#841584"
                />
                {/*<Form style={styles.form}>*/}
                {/*<Item stackedLabel>*/}
                {/*<Label>Email</Label>*/}
                {/*<Input onChangeText={(email) => this.setState({email})}/>*/}
                {/*</Item>*/}
                {/*<Item stackedLabel last>*/}
                {/*<Label>Password</Label>*/}
                {/*<Input*/}
                {/*onChangeText={(password) => this.setState({password})}*/}
                {/*secureTextEntry={true}/>*/}
                {/*</Item>*/}
                {/*</Form>*/}
                {/*<Button*/}
                {/*block info style={styles.btn}*/}
                {/*onPress={() => this.onSignInButtonPressed()}>*/}
                {/*<Text style={{color:"white"}}>Login</Text>*/}
                {/*</Button>*/}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    returnBtn: {
        marginTop:30,
        marginLeft:5
    },
    form: {
        marginTop:10
    },
    btn: {
        marginTop:20
    }
});
