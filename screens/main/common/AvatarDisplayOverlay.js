import React, {
    Component
} from 'react'
import { TouchableWithoutFeedback } from 'react-native';
import {Overlay} from 'react-native-elements'
import {Image as CacheImage} from "react-native-expo-image-cache";



export default class AvatarDisplayOverlay extends Component{


    static navigationOptions = {header:null}

    constructor(props){
        super(props);
        this.showAvatarDisplay = this.showAvatarDisplay.bind(this);
        props.onRef(this);
        this.state={
            isVisible:false,
            photoURL:null
        };
    }


    showAvatarDisplay(photoURL){
        this.setState({isVisible:true, photoURL:photoURL})
        console.log(photoURL);
    }

    render() {
        const {isVisible,photoURL} = this.state;
        return (
            <Overlay
                height={295}
                borderRadius={25}
                isVisible={isVisible}
                overlayStyle={{padding:0}}
                onBackdropPress={()=>this.setState({isVisible:false,photoURL:null})}
            >
                <TouchableWithoutFeedback
                    onPress={()=>this.setState({isVisible:false,photoURL:null})}
                >
                    <CacheImage
                        style={{height:295, width:295, borderRadius:25}}
                        uri={photoURL}
                    />
                </TouchableWithoutFeedback>
            </Overlay>
        )
    }
}
