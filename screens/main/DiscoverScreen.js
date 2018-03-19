import React, { Component } from 'react';
import {StyleSheet, Text, View, ImageBackground, Dimensions, TouchableWithoutFeedback, Alert, Platform} from 'react-native';
import { Input, Button } from 'react-native-elements';
import { MapView, Constants, Location, Permissions  } from 'expo';
import Masonry from '../../modules/react-native-masonry';
import GeoFire from 'geofire';
import firebase from 'firebase';


const addData = [
    {
        data:{
            tags:[]
        },
        uri: 'https://i.pinimg.com/736x/48/ee/51/48ee519a1768245ce273363f5bf05f30--kaylaitsines-dipping-sauces.jpg'
    },
    {
        data:{
            tags:[]
        },
        uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGYfU5N8lsJepQyoAigiijX8bcdpahei_XqRWBzZLbxcsuqtiH'
    },
    {
        data:{
            tags:[]
        },
        uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPL2GTXDuOzwuX5X7Mgwc3Vc9ZIhiMmZUhp3s1wg0oHPzSP7qC'
    }
];
var geofireRef;

export default class DiscoverScreen extends Component {
    //static navigationOptions = {title: 'Discover', headerStyle:{ position: 'absolute', backgroundColor: 'transparent', zIndex: 100, top: 0, left: 0, right: 0, boarderBottomWidth: 0,shadowColor: 'transparent', elevation:0, shadowOpacity: 0 }};
    static  navigationOptions = {header:null};
    constructor(props) {
        super(props);
        //console.log(props)
        this.state = {
            location: {
                lat: 40.7589,
                lng: -73.9851,
            },
            markers: [],

        }

    }


    componentWillMount() {
        geofireRef = new GeoFire(firebase.database().ref("Meets"));
        if (Platform.OS === 'android' && !Constants.isDevice) {
            this.setState({
                errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
            });
        } else {
            this._getLocationAsync();
        }


    }

    _getLocationAsync = async () => {
        let { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status !== 'granted') {
            this.setState({
                errorMessage: 'Permission to access location was denied',
            });
        }

        let location = await Location.getCurrentPositionAsync({});
        console.log(location);
        this.setState({
            location: {
                lat:location.coords.latitude,
                lng: location.coords.longitude,
            }
        });

        this.getGeoFireMeets();


    };

    getGeoFireMeets(){
        const {location, markers} = this.state;
        var geoQuery = geofireRef.query({
            center: [location.lat, location.lng],
            radius: 100
        });

        var onKeyEnteredRegistration = geoQuery.on("key_entered", function(key, location, distance) {
            console.log(key + " entered query at " + location + " (" + distance + " km from center)");
            console.log(location);
            markers.push({
                LatLng: {
                    latitude: location[0],
                    longitude: location[1],
                }
            });
            this.setState({markers});
        }.bind(this));
    }

    render() {
        const { location, markers } = this.state;
        console.log(markers);
        return (
            <View style = {styles.container}>
                <MapView
                    style={{ flex: 1 }}
                    showsUserLocation
                    region={{
                        latitude: location.lat,
                        longitude: location.lng,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                >
                    {markers.map(marker => (
                        <MapView.Marker
                            coordinate={marker.LatLng}
                            title='A Good Title'
                            description="What a long description, so happy!"
                        />
                    ))}
                </MapView>
                <View style={{marginTop:600, position:'absolute'}}>
                    <Masonry
                        sorted // optional - Default: false
                        columns={2} // optional - Default: 2
                        bricks={addData}
                        // refreshControl={
                        //     <RefreshControl
                        //         refreshing={this.state.refreshing}
                        //         onRefresh={this._onRefresh.bind(this)}
                        //     />
                        // }
                    />
                </View>
            </View>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
});