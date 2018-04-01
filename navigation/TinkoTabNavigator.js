import React from 'react';
import {StyleSheet, View, ScrollView, Platform, SafeAreaView, Text} from 'react-native';
import {Header, StackNavigator, TabBarBottom, TabNavigator} from 'react-navigation';
import ActionButton from 'react-native-action-button';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Swiper from 'react-native-swiper';

import DiscoverScreen from '../screens/main/DiscoverScreen';
import TinkoScreen from '../screens/main/TinkoScreen'
import TinkoDetailScreen from "../screens/main/tinko/TinkoDetailScreen";
import MeNavigator from "./MeNavigator";
import LinksScreen from "../screens/main/LinksScreen";
import Colors from "../constants/Colors";

const TinkoTabNavigator = TabNavigator(
    {
        Tinko: {
            screen: TinkoScreen,
        },
        Discover: {
            screen: DiscoverScreen,
        },

    },
    {

        //tabBarOptions:{style:{height:0, bottom:-30}, showLabel:false, },
        tabBarComponent: () => null,
        //tabBarPosition: 'bottom',
        animationEnabled: false,
        swipeEnabled: true,
        headerMode: 'none',
        headerVisible: false,
        lazy:false
    }
);


export default class TinkoTabNavigatorScreen extends React.Component {

    constructor(props){
        super(props);
        //console.log(props);
        this.state = {
            headerTitlr:'Tinko',
            stateIndex:0,
        }
    }

    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        const { allowParticipantsInvite, identity, threeDots } = params;

        return {

            title: 'Tinko',
            headerTitle:params.tinkoHeaderTitle,
            headerRight:(params.stateIndex===0?
                <MaterialIcons.Button
                    name="sort" size={20} color="white" style={{marginRight:26}} backgroundColor="transparent"
                    onPress = {() => params.sortButton()}/>
                    :null
            ),
            //headerRight:params.tinkoHeaderTitle,

            headerStyle:{ position: 'absolute',
                backgroundColor: 'transparent',
                zIndex: 10, top: 0, left: 0, right: 0,
                borderBottomWidth: 0,
                borderBottomColor: 'transparent',
                shadowColor: 'transparent',
                elevation:0,
                shadowOpacity: 0 }
        };
    };

    //static navigationOptions = {title:'Tinko'};
    //static  navigationOptions = {header:null};
    componentDidMount(){
        this.props.navigation.setParams({tinkoHeaderTitle:this.tinkoHeaderTitle.bind(this), sortButton:this.onSortButtonPressed.bind(this), stateIndex:this.state.stateIndex});
    }


    // disableScroll(){
    //     this.setState({scrollEnabled: false})
    // }
    //
    // enableScroll(){
    //     this.setState({scrollEnabled: true})
    // }

    onSortButtonPressed(){
        // console.log("onSortButtonPressed")
        // console.log(this.tinkoRef);
        this.tinkoRef.onSortButtonPressed();
    }

    tinkoHeaderTitle(){
        const {stateIndex}= this.state;
        if(stateIndex===0){
            return (
                <View style={{flexDirection:'row'}}>
                    <Text style={{color:'white', fontSize:22, fontFamily:'bold'}}>  TINKO </Text>
                    <Text  style={{color:'white', fontSize:20, fontFamily:'bold'}}> | </Text>
                    <Text  style={{color:'white', fontSize:20, fontFamily:'regular'}}> Discover</Text>
                </View>
            );
        } else {
            return (
                <View style={{flexDirection:'row'}}>
                    <Text style={{color:'white', fontSize:22, fontFamily:'regular'}}>    TINKO </Text>
                    <Text  style={{color:'white', fontSize:20, fontFamily:'bold'}}> | </Text>
                    <Text  style={{color:'white', fontSize:22, fontFamily:'bold'}}> Discover</Text>
                </View>
            );
        }
    }

    onNavStateChnage(navState){
        let index = navState.index;
        this.setState({stateIndex: index}, () => {
            this.props.navigation.setParams({tinkoHeaderTitle:this.tinkoHeaderTitle.bind(this), stateIndex:this.state.stateIndex});
        });

    }

    getRef = ref => (this.tinkoRef = ref);

    render() {
        return (
            <View style={styles.container}>

                <TinkoTabNavigator
                    //onRef={ref => (this.tinkoNav = ref)}
                    onNavigationStateChange={(prevState, newState) => this.onNavStateChnage(newState)}
                    screenProps={{getRef:this.getRef,...this.props}}
                />
                {/*<Swiper*/}
                    {/*loop={false}*/}
                    {/*showsPagination = {false}*/}
                    {/*//scrollEnabled={this.state.scrollEnabled}*/}
                {/*>*/}
                    {/*<TinkoScreen screenProps={this.props}/>*/}
                    {/*<DiscoverScreen screenProps={this.props}/>*/}
                {/*</Swiper>*/}

                <ActionButton buttonColor="#3498db">
                    <ActionButton.Item buttonColor='#9b59b6' title="Express Post" onPress={() => console.log("notes tapped!")}>
                        <Ionicons name="md-done-all" style={styles.actionButtonIcon} />
                    </ActionButton.Item>
                    <ActionButton.Item buttonColor='#1abc9c' title="Create a Tinko" onPress={() => this.props.navigation.navigate('Create',{tinkoGetMeets:this.tinkoRef.getMeets})}>
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

