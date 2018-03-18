import React, { Component } from 'react';
import { View, Image, TouchableHighlight } from 'react-native';

export default function Brick (props) {
	// Avoid margins for first element
	const image = (props.onPress) ? _getTouchableUnit(props, props.gutter) : _getImageTag(props, props.gutter);
	const footer = (props.renderFooter) ? props.renderFooter(props.data) : null;
	const header = (props.renderHeader) ? props.renderHeader(props.data) : null;

	return (
		<View key={props.brickKey} >
		  {header}
		  {image}
		  {footer}
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

	switch(image.data.tags[0]){
		case "Party":
            return (
                <Image
                    key={image.uri}
                    resizeMethod={'auto'}
                    source={require('../../../assets/images/tagsTheme/StaindGlass.jpg')}
                    style={{ borderRadius:10, width: image.width, height: image.height, marginTop: gutter, ...image.imageContainerStyle }}
                />
            )
			break;
        case "Sport":
            return (
                <Image
                    key={image.uri}
                    resizeMethod={'auto'}
                    source={require('../../../assets/images/tagsTheme/lines.jpg')}
                    style={{ borderRadius:10, width: image.width, height: image.height, marginTop: gutter, ...image.imageContainerStyle }}
                />
            )
            break;
        case "Food":
            return (
                <Image
                    key={image.uri}
                    resizeMethod={'auto'}
                    source={require('../../../assets/images/tagsTheme/yumao.jpg')}
                    style={{ borderRadius:10, width: image.width, height: image.height, marginTop: gutter, ...image.imageContainerStyle }}
                />
            )
            break;
        case "Shop":
            return (
                <Image
                    key={image.uri}
                    resizeMethod={'auto'}
                    source={require('../../../assets/images/tagsTheme/city.png')}
                    style={{ borderRadius:10, width: image.width, height: image.height, marginTop: gutter, ...image.imageContainerStyle }}
                />
            )
            break;
        case "Movie":
            return (
                <Image
                    key={image.uri}
                    resizeMethod={'auto'}
                    source={require('../../../assets/images/tagsTheme/city.png')}
                    style={{ borderRadius:10, width: image.width, height: image.height, marginTop: gutter, ...image.imageContainerStyle }}
                />
            )
            break;
        case "KTV":
            return (
                <Image
                    key={image.uri}
                    resizeMethod={'auto'}
                    source={require('../../../assets/images/tagsTheme/leaves.jpg')}
                    style={{ borderRadius:10, width: image.width, height: image.height, marginTop: gutter, ...image.imageContainerStyle }}
                />
            )
            break;
        case "Travel":
            return (
                <Image
                    key={image.uri}
                    resizeMethod={'auto'}
                    source={require('../../../assets/images/tagsTheme/humian.jpg')}
                    style={{ borderRadius:10, width: image.width, height: image.height, marginTop: gutter, ...image.imageContainerStyle }}
                />
            )
            break;
        case "Study":
            return (
                <Image
                    key={image.uri}
                    resizeMethod={'auto'}
                    source={require('../../../assets/images/tagsTheme/cloud.jpg')}
                    style={{ borderRadius:10, width: image.width, height: image.height, marginTop: gutter, ...image.imageContainerStyle }}
                />
            )
            break;
        case "ESports":
            return (
                <Image
                    key={image.uri}
                    resizeMethod={'auto'}
                    source={require('../../../assets/images/tagsTheme/humian.jpg')}
                    style={{ borderRadius:10, width: image.width, height: image.height, marginTop: gutter, ...image.imageContainerStyle }}
                />
            )
            break;
		default:
            return (
                <Image
                    key={image.uri}
                    resizeMethod={'auto'}
                    source={require('../../../assets/images/tagsTheme/StaindGlass.jpg')}
                    style={{ borderRadius:10, width: image.width, height: image.height, marginTop: gutter, ...image.imageContainerStyle }}
                />
            )

	}

}

// _getTouchableUnit :: Image, Number -> TouchableTag
export function _getTouchableUnit (image, gutter = 0) {
	return (
		<TouchableHighlight
          key={image.uri}
          onPress={() => image.onPress(image.data)}>
          <View>
            { _getImageTag(image, gutter) }
          </View>
		</TouchableHighlight>
	);
}
