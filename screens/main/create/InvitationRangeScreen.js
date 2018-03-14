import React from 'react';
import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    Keyboard,
    TextInput, Dimensions
} from 'react-native';
import {
    Input,
    Button,
    Text,
    Card,
    ButtonGroup,
    Tile,
    Col,
    Row,
    Icon,
    Avatar,
    List, ListItem,
} from 'react-native-elements';
import FriendListView from '../../../components/FriendListView';

export default class InvitationRangeScreen extends React.Component{
    render(){
        return(
            <ScrollView style={styles.container}>
                <FriendListView/>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});