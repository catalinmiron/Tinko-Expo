import React, { Component } from 'react';
import {StyleSheet , View , Text ,Image ,TouchableWithoutFeedback, Alert, Button, TextInput} from 'react-native';
//import { Container, Header, Content, Form, Item, Input, Label ,Button} from 'native-base';
import firebase from 'firebase'

export default class SignInScreen extends Component {
    static navigationOptions = { header: null,gesturesEnabled: false,animationEnabled: false };

    constructor(props) {
        super(props);
        this.state = {email: '', password: ''};

    }

    onSignInButtonPressed(){
        //console.log(this.state.email);
        //console.log(this.state.password);
        const { email, password } = this.state;
        firebase.auth().signInWithEmailAndPassword(email,password)
            .then((user)=>{
                console.log('SignIn: ', user);
                this.props.screenProps.handleUserLoggedIn();
            })
            .catch((error) => {
                console.log(error.code);
                console.log(error.message);
                Alert.alert("Error", error.message);
            });
    }


    render() {
        return (
            <View>
                <Text>hold</Text>
                <Text>hold</Text>
                <Text>hold</Text>
                <Text>hold</Text>
                <Text>hold</Text>
                <TouchableWithoutFeedback onPress={() => this.props.navigation.goBack()}>
                    <Text>return</Text>
                    {/*<Image style={styles.returnBtn}*/}
                           {/*source = {require('../../assests/icons/return.png')}*/}
                    {/*/>*/}
                </TouchableWithoutFeedback>
                <Text>hold</Text>
                <Text>hold</Text>
                <Text>hold</Text>
                <Text>hold</Text>
                <Text>hold</Text>
                <TextInput onChangeText={(email)=>this.setState({email})}/>
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
                <Button
                    onPress={() => this.onSignInButtonPressed()}
                    title="Login"
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
