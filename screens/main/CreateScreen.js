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
import  DatePicker from 'react-native-datepicker';
import {Font} from "expo";

const SCREEN_WIDTH = Dimensions.get('window').width;

export default class CreateScreen extends React.Component {
    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};

        return {
            // Correct Header Button modifyzationn: https://reactnavigation.org/docs/header-buttons.html
            headerRight:(<Button text="POST"
                                 clear
                                 onPress={params.post}/>),
            headerLeft:(<Button text="Cancel"
                                clear

                                //color='#CCD1D1'
                                onPress={params.cancel}
                        />),
            headerStyle:{backgroundColor:'#EC7063'}
            //headerStyle:{ position: 'absolute', backgroundColor: 'transparent', zIndex: 100, top: 0, left: 0, right: 0, headerLeft:null, boarderBottomWidth: 0}
        };
    };

    constructor(props){
        super(props);
        let currentDate = new Date();
        let dateTime = currentDate.getFullYear() + '-' + (currentDate.getMonth()+1) + '-' + currentDate.getDate() + ' ' + currentDate.getHours() + ':' + currentDate.getMinutes();

        this.state={
            title:'',
            //fontLoaded: false,
            startTime: dateTime,
            placeDetail:'',
            placeName:'',
            description:'',
            inputHeight: 22,
        };
    }

    async componentDidMount() {
        await Font.loadAsync({
            'georgia': require('../../assets/fonts/Georgia.ttf'),
            'regular': require('../../assets/fonts/Montserrat-Regular.ttf'),
            'light': require('../../assets/fonts/Montserrat-Light.ttf'),
            'bold': require('../../assets/fonts/Montserrat-Bold.ttf'),
        });

        //this.setState({ fontLoaded: true });
    }

    setPlaceDetail = data => {
        this.setState(data);
        console.log('placeDetail: ', this.state.placeDetail);
    }

    handleSizeChange = event => {
        console.log('_handleSizeChange ---->', event.nativeEvent.contentSize.height);

        this.setState({
            inputHeight: event.nativeEvent.contentSize.height
        });
    };

    onPostButtonPressed(){
        this.props.navigation.goBack();
    }

    onCancelButtonPressed(){
        this.props.navigation.goBack();
    }

    componentDidMount(){
        this.props.navigation.setParams({post:this.onPostButtonPressed.bind(this), cancel:this.onCancelButtonPressed.bind(this)});
    }

    render() {
        const {title, startTime, placeName, description, inputHeight} = this.state;
        return (
            <ScrollView style={styles.container}>
                <Card>
                    <Input
                        onChangeText={(title) => this.setState({title})}
                        value={title}
                        inputStyle={{textAlign:'center', color: 'black', fontFamily:'bold'}}
                        keyboardAppearance="light"
                        placeholder="A Tinko Title"
                        autoFocus={false}
                        autoCapitalize
                        autoCorrect={true}
                        returnKeyType="next"
                        ref={ input => this.title = input }
                        onSubmitEditing={() => {
                            Keyboard.dismiss()
                        }}
                        blurOnSubmit={false}
                        placeholderTextColor="black"
                    />
                    <List containerStyle={styles.listStyle}>
                        <ListItem
                            hideChevron
                            containerStyle={styles.listStyle}
                            title='Starts:'
                            rightTitle={startTime}
                            rightTitleStyle={{color:'blue'}}
                            onPress={() => this.myDatePicker && this.myDatePicker.onPressDate()}
                        />
                        <DatePicker
                            key={'datepicker'}
                            ref={(datepicker) => this.myDatePicker = datepicker}
                            style={{width: 0, height: 0}}
                            hideText={true}
                            showIcon={false}

                            date={startTime}
                            mode="datetime"
                            format="YYYY-MM-DD HH:mm"
                            confirmBtnText="Confirm"
                            cancelBtnText="Cancel"

                            minuteInterval={10}
                            onDateChange={(startTime) => {this.setState({startTime});}}
                        />
                        <ListItem
                            hideChevron
                            containerStyle={styles.listStyle}
                            title='Duration:'
                            rightTitle='1 Hour'
                            rightTitleStyle={{color:'blue'}}
                        />
                        <ListItem
                            containerStyle={styles.listStyle}
                            title='Place:'
                            rightTitle={placeName}
                            rightTitleStyle={{color:'black'}}
                            onPress={() => this.props.navigation.navigate('GooglePlacesAutocomplete', {setPlaceDetail: this.setPlaceDetail})}
                        />
                    </List>
                    <List containerStyle={styles.listStyle}>
                        <ListItem
                            containerStyle={styles.listStyle}
                            title='Invitation Range'
                        />
                        <ListItem
                            containerStyle={styles.listStyle}
                            title='Max Participants'
                        />
                    </List>

                    <List containerStyle={styles.listStyle}>
                        <ListItem
                            hideChevron
                            title={
                                <TextInput
                                    multiline = {true}
                                    onContentSizeChange={(event) => this.handleSizeChange(event)}
                                    onChangeText={(description) => this.setState({description})}
                                    style={[ styles.inputStyling, {height: inputHeight} ]}
                                    value={description}
                                    //inputStyle={{textAlign:'center', color: 'black', fontFamily:'bold'}}
                                    keyboardAppearance="light"
                                    placeholder="Description..."
                                    autoFocus={false}
                                    autoCapitalize
                                    autoCorrect={true}
                                    returnKeyType="Done"
                                    //ref={ input => this.description = input }
                                    onSubmitEditing={() => {
                                        Keyboard.dismiss()
                                    }}
                                    blurOnSubmit={false}
                                    placeholderTextColor="black"
                                />
                            }
                        />
                    </List>

                </Card>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1948A',
    },
    listStyle:{
        borderTopWidth: 0,
        borderBottomWidth:0,
        borderBottomColor:'transparent'
    },
    inputStyling: {
        backgroundColor: 'white',
        width: SCREEN_WIDTH * 3 / 4,
        padding: 8,
        fontSize: 18
    },


    titleText:{
        alignItems:'center'
    },
    developmentModeText: {
        marginBottom: 20,
        color: 'rgba(0,0,0,0.4)',
        fontSize: 14,
        lineHeight: 19,
        textAlign: 'center',
    },
    contentContainer: {
        paddingTop: 30,
    },
    welcomeContainer: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    welcomeImage: {
        width: 100,
        height: 80,
        resizeMode: 'contain',
        marginTop: 3,
        marginLeft: -10,
    },
    getStartedContainer: {
        alignItems: 'center',
        marginHorizontal: 50,
    },
    homeScreenFilename: {
        marginVertical: 7,
    },
    codeHighlightText: {
        color: 'rgba(96,100,109, 0.8)',
    },
    codeHighlightContainer: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 3,
        paddingHorizontal: 4,
    },
    getStartedText: {
        fontSize: 17,
        color: 'rgba(96,100,109, 1)',
        lineHeight: 24,
        textAlign: 'center',
    },
    tabBarInfoContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        ...Platform.select({
            ios: {
                shadowColor: 'black',
                shadowOffset: { height: -3 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
            },
            android: {
                elevation: 20,
            },
        }),
        alignItems: 'center',
        backgroundColor: '#fbfbfb',
        paddingVertical: 20,
    },
    tabBarInfoText: {
        fontSize: 17,
        color: 'rgba(96,100,109, 1)',
        textAlign: 'center',
    },
    navigationFilename: {
        marginTop: 5,
    },
    helpContainer: {
        marginTop: 15,
        alignItems: 'center',
    },
    helpLink: {
        paddingVertical: 15,
    },
    helpLinkText: {
        fontSize: 14,
        color: '#2e78b7',
    },
});
