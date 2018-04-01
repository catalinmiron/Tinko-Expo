import React, { Component } from 'react';
import {StyleSheet, Text, View, ImageBackground, Dimensions, Alert, Platform , FlatList, TouchableWithoutFeedback, Image, Animated, TouchableOpacity, PanResponder} from 'react-native';
import { Input, Button, Card } from 'react-native-elements';
import { MapView, Constants, Location, Permissions, GestureHandler  } from 'expo';
import GeoFire from 'geofire';
import firebase from 'firebase';
import 'firebase/firestore';
import {getStartTimeString, getPostTimeString} from "../../modules/CommonUtility";

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

const {ScrollView, PanGestureHandler} = GestureHandler;
// import {
//     PanGestureHandler,
//     TapGestureHandler,
//     PinchGestureHandler,
//     ScrollView,
//     State,
//     FlatList
// } from 'react-native-gesture-handler';

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
            meets: [],
            containerHeight: SCREEN_HEIGHT,
            yOriginal:0,
            yOffset:0,
            yOldOffset:0,
            flatListHeight:0,
            yOnScrollOffset:0,
            listHeight: 130,
            marginBottomValue:5,
            //flatListScrollEnabled:false,

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
        //console.log(location);
        this.setState({
            location: {
                lat:location.coords.latitude,
                lng: location.coords.longitude,
            },
        });

        this.getGeoFireMeets();


    };

    getGeoFireMeets(){
        const {location, meets} = this.state;
        var geoQuery = geofireRef.query({
            center: [location.lat, location.lng],
            radius: 100
        });

        var onKeyEnteredRegistration = geoQuery.on("key_entered", function(key, location, distance) {
            //console.log(key + " entered query at " + location + " (" + distance + " km from center)");
            let firestoreDb  = firebase.firestore();
            let meetRef = firestoreDb.collection("Meets").doc(key);
            meetRef.get().then((meetDoc) => {
                if (meetDoc.exists) {
                    //console.log("Document data:", meetDoc.data());
                    let meet = meetDoc.data();
                    let creatorUid = meet.creator;
                    let userRef = firestoreDb.collection("Users").doc(creatorUid);
                    userRef.get().then((userDoc) => {
                        if (userDoc.exists) {
                            //console.log("Document data:", userDoc.data());
                            let creator = userDoc.data();

                            meets.push({
                                LatLng: {
                                    latitude: location[0],
                                    longitude: location[1],
                                },
                                title: meet.title,
                                startTime: getStartTimeString(meet.startTime),
                                postTime: getPostTimeString(meet.postTime),
                                placeName: meet.place.name,
                                creator: {
                                    name: creator.username,
                                    photoURL: creator.photoURL,
                                },
                                tags:Object.keys(meet.tagList),
                                key: meetDoc.id,
                            });
                            this.setState({meets});

                        } else {
                            console.log("No such document!");
                        }
                    }).catch((error) => {
                        console.log("Error getting document:", error);
                    });

                } else {
                    console.log("No such document!");
                }
            }).catch((error) => {
                console.log("Error getting document:", error);
            });
        }.bind(this));
    }



    render() {
        const { location, meets, containerHeight, yOffset, yOriginal, yOnGoing, yOldOffset, yOnScrollOffset,flatListHeight, listHeight, marginBottomValue } = this.state;
        let flatListMarginTopHeight = containerHeight-listHeight-marginBottomValue-yOffset-yOldOffset;
        //console.log(flatListMarginTopHeight);
        return (
            <View
                style = {styles.container}
                onLayout={(event) => { this.find_dimesions(event.nativeEvent.layout) }}
            >
                <PanResponderExample />
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
                    {meets.map(meet => (
                        <MapView.Marker
                            coordinate={meet.LatLng}
                            title={meet.title}
                            description={meet.startTime}
                            key={meet.key}
                        />
                    ))}
                </MapView>
                {/*<View style = {{position:'absolute',marginTop: flatListMarginTopHeight, zIndex:100, backgroundColor:'red'}} >*/}
                    {/*<ScrollView*/}
                        {/*onPanResponderMove={(event, gestureState) => {*/}
                            {/*console.log(event.nativeEvent, gestureState);*/}
                        {/*}}*/}
                        {/*style={{flex:1}}*/}
                        {/*scrollEnabled={false}*/}
                        {/*onTouchStart = {(event) => (this.setState({yOriginal: event.nativeEvent.pageY, yOldOffset: yOffset+yOldOffset, yOffset: 0}))}*/}
                        {/*onTouchMove = {(event) => (this.handleFlatListOnTouchMove(event.nativeEvent))}*/}
                    {/*>*/}

                        {/*{meets.map((meet) => (*/}
                            {/*<TouchableOpacity*/}
                                {/*style={{flex:1, width: SCREEN_WIDTH, height:listHeight, justifyContent: 'center', alignItems: 'center',}}*/}
                                {/*onPress={() => (this.props.screenProps.navigation.navigate('TinkoDetail', {meetId:meet.key}))}*/}
                                {/*// onShowUnderlay={separators.highlight}*/}
                                {/*// onHideUnderlay={separators.unhighlight}*/}
                                {/*>*/}

                                {/*<View*/}
                                    {/*//shouldRasterizeIOS={true}*/}
                                    {/*//renderToHardwareTextureAndroid*/}
                                {/*>*/}
                                    {/*<Image*/}
                                        {/*resizeMethod={'auto'}*/}
                                        {/*source={require('../../assets/images/tagsTheme/StaindGlass.jpg')}*/}
                                        {/*style={{ borderRadius:10, width: SCREEN_WIDTH-10, height: listHeight, marginBottom: marginBottomValue }}*/}
                                    {/*/>*/}
                                    {/*/!*<View*!/*/}
                                        {/*/!*style={styles.headerTop}*!/*/}
                                    {/*/!*>*!/*/}
                                        {/*/!*<Image*!/*/}
                                            {/*/!*source={{ uri: item.creator.photoURL }}*!/*/}
                                            {/*/!*style={styles.userPic}/>*!/*/}
                                        {/*/!*<View style={{marginTop:10}}>*!/*/}
                                            {/*/!*<Text style={styles.meetTitle}>{item.title}</Text>*!/*/}
                                            {/*/!*<Text style={styles.userName}>{item.creator.name}</Text>*!/*/}
                                            {/*/!*<Text style={styles.startTime}>{item.startTime}</Text>*!/*/}
                                            {/*/!*<Text style={styles.meetPlaceName}>{item.placeName}</Text>*!/*/}
                                            {/*/!*<Text style={styles.postTime}>{item.postTime}</Text>*!/*/}
                                        {/*/!*</View>*!/*/}
                                    {/*/!*</View>*!/*/}
                                {/*</View>*/}
                            {/*</TouchableOpacity>*/}
                        {/*))}*/}
                    {/*</ScrollView>*/}

                {/*</View>*/}
            </View>

        );
    }


    handleFlatListOnTouchMove(nativeEvent){
        console.log(nativeEvent);
        let yOnGoing = nativeEvent.pageY;
        const {yOriginal, yOffset, containerHeight, yOldOffset, flatListHeight, listHeight,marginBottomValue} = this.state;
        let yOffsetTemp = yOriginal - yOnGoing;
        let flatListMarginTopHeight = containerHeight-listHeight-marginBottomValue-yOffsetTemp-yOldOffset;
        this.setState({
            yOffset:yOffsetTemp,
            //flatListScrollEnabled:false
        });
        // if((containerHeight-listHeight-marginBottomValue>flatListMarginTopHeight) && (flatListMarginTopHeight>containerHeight-flatListHeight)){
        //     //这是合法范围内
        //     this.setState({
        //         yOffset:yOffsetTemp,
        //         //flatListScrollEnabled:false
        //     });
        // } else {
        //     //this.setState({flatListScrollEnabled:true});
        // }

    }

    find_dimesions(layout){
        const { height } = layout;
        //console.log(height);
        this.setState({containerHeight: height});
    }

}

class PanResponderExample extends Component {
    _panResponder = {};
    _previousLeft = 0;
    _previousTop = 0;
    _circleStyles = {};

    componentWillMount() {
        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder,
            onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder,
            onPanResponderGrant: this._handlePanResponderGrant,
            onPanResponderMove: this._handlePanResponderMove,
            onPanResponderRelease: this._handlePanResponderEnd,
            onPanResponderTerminate: this._handlePanResponderEnd,
        });
        this._previousLeft = 20;
        this._previousTop = 84;
        this._circleStyles = {
            style: {
                left: this._previousLeft,
                top: this._previousTop,
                backgroundColor: 'green',
            },
        };
    }

    componentDidMount() {
        this._updateNativeStyles();
    }

    render() {
        return (
            <View
                ref={circle => {
                    this.circle = circle;
                }}
                style={styles.circle}
                {...this._panResponder.panHandlers}
            />
        );
    }

    _highlight = () => {
        this._circleStyles.style.backgroundColor = 'blue';
        this._updateNativeStyles();
    };

    _unHighlight = () => {
        this._circleStyles.style.backgroundColor = 'green';
        this._updateNativeStyles();
    };

    _updateNativeStyles = () => {
        this.circle && this.circle.setNativeProps(this._circleStyles);
    };

    _handleStartShouldSetPanResponder = (e, gestureState) => {
        // Should we become active when the user presses down on the circle?
        return true;
    };

    _handleMoveShouldSetPanResponder = (e, gestureState) => {
        // Should we become active when the user moves a touch over the circle?
        return true;
    };

    _handlePanResponderGrant = (e, gestureState) => {
        this._highlight();
    };

    _handlePanResponderMove = (e, gestureState) => {
        console.log(e, gestureState);
        this._circleStyles.style.left = this._previousLeft + gestureState.dx;
        this._circleStyles.style.top = this._previousTop + gestureState.dy;
        this._updateNativeStyles();
    };

    _handlePanResponderEnd = (e, gestureState) => {
        this._unHighlight();
        this._previousLeft += gestureState.dx;
        this._previousTop += gestureState.dy;
    };
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    itemList:{

    },
    headerTop: {
        flexDirection: 'row',
        //padding: 5,
        marginLeft:10,
        alignItems: 'center',
        backgroundColor: 'transparent',
        position: 'absolute',
        zIndex: 100,
    },
    userPic: {
        height: 45,
        width: 45,
        borderRadius: 22,
        marginRight: 10,
        marginTop:10,
    },
    userName: {
        fontSize: 20,
        color:'white',
        fontWeight: 'bold',
    },
    postTime:{
        color:'white',
    },
    meetTitle:{
        fontSize: 25,
        color:'white',
        fontWeight:'bold',
    },
    startTime:{
        fontSize:18,
        color:'white',
        fontWeight:'bold',
    },
    meetPlaceName:{
        fontSize:16,
        color:'white',
        fontWeight:'bold',
    },
    footer:{
        flex:1,
        backgroundColor: 'transparent',
        padding: 5,
        paddingRight: 9,
        paddingLeft: 9,
        zIndex: 50,
        position: 'absolute',
        bottom: 0

    },
    circle: {
        width: 80,
        height: 80,
        borderRadius: 80 / 2,
        zIndex: 100,

    },
});

// function getImage (image, listHeight, marginBottomValue) {
//
//
//     console.log(image, listHeight, marginBottomValue);
//
//     var imageSource;
//
//     switch(image.data.tags[0]){
//         case "Party":
//             imageSource = '../../assets/images/tagsTheme/StaindGlass.jpg';
//             break;
//         case "Sport":
//             imageSource = '../../assets/images/tagsTheme/lines.jpg';
//             break;
//         case "Food":
//             imageSource = '../../assets/images/tagsTheme/yumao.jpg';
//             break;
//         case "Shop":
//             imageSource = '../../assets/images/tagsTheme/city.png';
//             break;
//         case "Movie":
//             imageSource = '../../assets/images/tagsTheme/city.png';
//             break;
//         case "KTV":
//             imageSource = '../../assets/images/tagsTheme/leaves.jpg';
//             break;
//         case "Travel":
//             imageSource = '../../assets/images/tagsTheme/humian.jpg';
//             break;
//         case "Study":
//             imageSource = '../../assets/images/tagsTheme/cloud.jpg';
//             break;
//         case "ESports":
//             imageSource = '../../assets/images/tagsTheme/humian.jpg';
//             break;
//         default:
//             imageSource = '../../assets/images/tagsTheme/StaindGlass.jpg';
//     }
//
//     return (
//         <Image
//             resizeMethod={'auto'}
//             source={require(imageSource)}
//             style={{ borderRadius:10, width: SCREEN_WIDTH-10, height: listHeight, marginBottom: marginBottomValue }}
//         />
//     )
//     return (
//         <Text>123</Text>
//     )
//
// }