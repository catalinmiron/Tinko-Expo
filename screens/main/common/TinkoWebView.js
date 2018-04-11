import {Component} from "react";

export default class TinkoWebView extends Component {
    render() {
        return (
            <WebView
                source={{uri: 'https://github.com/facebook/react-native'}}
            />
        );
    }
}