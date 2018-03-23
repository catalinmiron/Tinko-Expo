import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import {Header, StackNavigator} from 'react-navigation';
import ActionButton from 'react-native-action-button';
import { Ionicons } from '@expo/vector-icons';
import Swiper from 'react-native-swiper';

import DiscoverScreen from '../screens/main/DiscoverScreen';
import TinkoScreen from '../screens/main/TinkoScreen'
import TinkoDetailScreen from "../screens/main/tinko/TinkoDetailScreen";

export default class TinkoTabNavigator extends React.Component {

    constructor(props){
        super(props);
        //console.log(props);
        // this.state = {
        //     scrollEnabled:true,
        // }
    }

    static navigationOptions = {title: 'Tinko',
                                headerTitleStyle:{
                                    color: 'white',
                                    fontSize: 25,
                                },
                                headerStyle:{ position: 'absolute',
                                        backgroundColor: 'transparent',
                                                zIndex: 100, top: 0, left: 0, right: 0,
                                    borderBottomWidth: 0,
                                    borderBottomColor: 'transparent',
                                            shadowColor: 'transparent',
                                                elevation:0,
                                            shadowOpacity: 0 }};
    //static navigationOptions = {title:'Tinko'};
    //static  navigationOptions = {header:null};
    componentDidMount(){
    }

    // disableScroll(){
    //     this.setState({scrollEnabled: false})
    // }
    //
    // enableScroll(){
    //     this.setState({scrollEnabled: true})
    // }

    render() {
        return (
            <View style={styles.container}>
                <Swiper
                    loop={false}
                    showsPagination = {false}
                    //scrollEnabled={this.state.scrollEnabled}
                >
                    <TinkoScreen screenProps={this.props}/>
                    <DiscoverScreen screenProps={this.props}/>
                </Swiper>

                <ActionButton buttonColor="#3498db">
                    <ActionButton.Item buttonColor='#9b59b6' title="Express Post" onPress={() => console.log("notes tapped!")}>
                        <Ionicons name="md-done-all" style={styles.actionButtonIcon} />
                    </ActionButton.Item>
                    <ActionButton.Item buttonColor='#1abc9c' title="Create a Tinko" onPress={() => this.props.navigation.navigate('Create')}>
                        <Ionicons name="md-create" style={styles.actionButtonIcon} />
                    </ActionButton.Item>
                </ActionButton>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    actionButtonIcon: {
        fontSize: 20,
        height: 22,
        color: 'white',
    },
});

