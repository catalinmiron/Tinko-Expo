import React, {
    Component
} from 'react'

import {
    View,Text,StyleSheet
} from 'react-native'
import SocketIOClient from 'socket.io-client';
import { GiftedChat } from 'react-native-gifted-chat'

// require("firebase/firestore");

export default class PrivateChat extends Component {

    constructor(){
        super();
        this.state = {
            messages: [],
        };
        this.socket = SocketIOClient('http://47.89.187.42:3000/?from=321&to=123');
        this.socket.on('privateChat321', (msg) => {
            let data = {
                _id: Date.parse( new Date()),
                text: msg,
                createdAt: new Date(),
                user: {
                    _id: 2,
                    name: 'React Web',
                    avatar: 'https://facebook.github.io/react/img/logo_og.png',
                },
            };
            this.setState(previousState => ({
                messages: GiftedChat.append(previousState.messages, data),
            }))
        });
    }

    onSend(messages = []) {
        this.socket.emit('privateChat',messages[0].text,321,123);
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages),
        }))
    }

    componentDidMount(){
    }

    render() {
        return (
            <GiftedChat
                messages={this.state.messages}
                onSend={messages => this.onSend(messages)}
                user={{
                    _id: 1,
                }}
            />
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