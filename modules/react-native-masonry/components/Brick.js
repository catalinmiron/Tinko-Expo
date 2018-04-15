import React, { Component } from 'react';
import {Text, View, Image, TouchableHighlight, TouchableOpacity, StyleSheet} from 'react-native';
import {getImageSource} from "../../CommonUtility";

export default function Brick (props) {
	// Avoid margins for first element
	const image =_getTouchableUnit(props, props.gutter);
	//const footer = (props.renderFooter) ? props.renderFooter(props.data) : null;
	//const header = (props.renderHeader) ? props.renderHeader(props.data) : null;
    //console.log(props);
    const data = props.data;
	return (
		<View key={props.brickKey} >
            <TouchableOpacity
                key='brick-footer'
                style={styles.headerTop}
                onPress={() => props.navigation.navigate('TinkoDetail', {meetId: data.meetId})}
            >
                <Image
                    source={{uri: data.creator.photoURL}}
                    style={styles.userPic}/>
                <View style={{marginTop: 5}}>
                    <Text style={styles.userName}>{data.creator.username}</Text>
                    <Text style={styles.postTime}>{data.postTime}</Text>
                </View>
                <View style={{width: 10, backgroundColor: 'white'}}/>
            </TouchableOpacity>
		  {image}
            <TouchableOpacity key='brick-header' style={styles.footer}
                              onPress={() => props.navigation.navigate('TinkoDetail', {meetId: data.meetId})}>
                <Text style={styles.footerTitle}>{data.title}</Text>
                <Text style={styles.footerTime}>{data.startTime}</Text>
                <Text style={styles.footerPlaceName}>{data.placeName}</Text>
            </TouchableOpacity>
		</View>
	);
}

// _getImageTag :: Image, Gutter -> ImageTag
export function _getImageTag (image, gutter = 0) {
	// const imageProps = {
	// 	key: props.uri,
	// 	source: {
	// 		uri: props.uri
	// 	},
	// 	resizeMethod: 'auto',
	// 	style: {
	// 		width: props.width,
	// 		height: props.height,
	// 		marginTop: gutter,
	// 		...props.imageContainerStyle,
	// 	}
	// };


	//console.log(image);
    let tag;
    if(image.data.tags){
        tag = image.data.tags[0];
    } else {
        tag='';
    }
    return (
        <Image
            key={image.data.meetId}
            resizeMethod={'auto'}
            source={getImageSource(tag)}
            style={{ borderRadius:10, width: image.width, height: image.height, marginTop: gutter, ...image.imageContainerStyle }}
        />
    )

}

// _getTouchableUnit :: Image, Number -> TouchableTag
export function _getTouchableUnit (props, gutter = 0) {
    //console.log(image);
	return (
		<TouchableHighlight
          key={props.uri}
          onPress={() => props.navigation.navigate('TinkoDetail', {meetId: props.data.meetId})}>
          <View>
            { _getImageTag(props, gutter) }
          </View>
		</TouchableHighlight>
	);
}

const styles = StyleSheet.create({
    headerTop: {
        flexDirection: 'row',
        padding: 5,
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
    footerTitle:{
        fontSize: 25,
        color:'white',
        fontWeight:'bold',
    },
    footerTime:{
        fontSize:18,
        color:'white',
        fontWeight:'bold',
    },
    footerPlaceName:{
        fontSize:18,
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

    }

});