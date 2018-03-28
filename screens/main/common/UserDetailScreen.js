import React, {
    Component
} from 'react'
import {Text} from 'react-native';
import {Button} from 'react-native-elements'

import {
    View
} from 'react-native'

export default class FriendDetailPage extends Component{

    static navigationOptions = {header:null};


    render() {
        console.log(this.props);
        return (
            <View>
                <Text style={{marginTop:100}}>{this.props.navigation.state.params.uid}</Text>
                <Button
                    title='Message'
                />
            </View>
        )
    }
}
