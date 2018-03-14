import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Header } from 'react-navigation';
import TinkoNav from './TinkoNavigator';
import DiscoverNav from './DiscoverNavigator';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Ionicons';

import DiscoverScreen from '../screens/main/LinksScreen';
import SignInScreen from '../screens/login/SignInScreen';
import RegisterScreen from '../screens/login/RegisterScreen';

//
// export default class TinkoTabNavigator extends React.Component{
//     render(){
//         return (
//             <Container>
//                 <Tabs>
//                     <TinkoNav />
//                     <DiscoverScreen />
//
//                 </Tabs>
//             </Container>
//         );
//     }
// }
//
// const styles = StyleSheet.create({
//     safeArea: {
//         flex: 1,
//         backgroundColor: '#ddd'
//     }
// });

export default class LoginTabNavigator extends React.Component {

    static navigationOptions = {title: 'Tinko',
                                headerTitleStyle:{
                                    color: 'white',
                                    fontSize: 25,
                                },
                                headerStyle:{ position: 'absolute',
                                        backgroundColor: 'transparent',
                                                zIndex: 100, top: 0, left: 0, right: 0,
                                    boarderBottomWidth: 0,
                                    borderBottomColor: 'transparent',
                                            shadowColor: 'transparent',
                                                elevation:0,
                                            shadowOpacity: 0 }};
    //static navigationOptions = {title:'Tinko'};
    //static  navigationOptions = {header:null};
    componentDidMount(){
        console.log(Header.HEIGHT);
    }

    render() {
        return (
            <View style={styles.container}>
                <ScrollView
                    horizontal
                    pagingEnabled
                    decelerationRate={0.993}
                    showsHorizontalScrollIndicator={false}
                >
                    <TinkoNav />
                    <DiscoverNav />
                </ScrollView>
                <ActionButton buttonColor="#3498db">
                    <ActionButton.Item buttonColor='#9b59b6' title="Express Post" onPress={() => console.log("notes tapped!")}>
                        <Icon name="md-done-all" style={styles.actionButtonIcon} />
                    </ActionButton.Item>
                    <ActionButton.Item buttonColor='#1abc9c' title="Create a Tinko" onPress={() => this.props.navigation.navigate('Create')}>
                        <Icon name="md-create" style={styles.actionButtonIcon} />
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