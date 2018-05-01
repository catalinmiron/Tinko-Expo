import Task from 'data.task';
import firebase from "firebase";
import 'firebase/firestore'
import {Alert, AsyncStorage} from "react-native";
import {getUserDataFromSql, insertFriendSql, getMeetTitleFromSql} from "./SqliteClient";


export const currentUserUid = () => {
    if(firebase){
        return firebase.auth().currentUser.uid;
    }
};

export const writeInAsyncStorage = (code, data) => {
    let dataString = JSON.stringify(data);
    try {
        AsyncStorage.setItem(code+currentUserUid(), dataString);
    } catch (error) {
        // Error saving data
        console.log(error);
    }
};

export const getFromAsyncStorage = async (code) => {
    try {
        const value = await AsyncStorage.getItem(code + currentUserUid());
        if (value !== null){
            // We have data!!
            //console.log(value);
            let data = JSON.parse(value);
            return data;
        }
    } catch (error) {
        // Error retrieving data
        console.log(error);
        return {};
    }
}

export const getPostRequest = (code, bodyData, onComplete, onError) => {
    try {
        fetch(`https://us-central1-tinko-64673.cloudfunctions.net/${code}`, {
            method:'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bodyData),
        }).then ((response) => {
            //console.log(response);
            if(response.status === 200){
                onComplete(response);
            } else {
                onError("request Failed");
            }
        }).catch((error) => {
            //console.log(error);
            //Alert.alert('Error ' + error);
            onError(error);
        });

    }catch (e) {
        console.log(e)
    }
};

export const getUserData = (userUid) => {
    return new Task((reject, resolve) => {
        let firestoreDb = firebase.firestore();
        var userRef = firestoreDb.collection("Users").doc(userUid);
        userRef.get().then((userDoc) => {
            if (userDoc.exists) {
                //console.log("Document data:", userDoc.data());
                let user = userDoc.data();
                resolve({
                    username: user.username,
                    photoURL: user.photoURL,
                    uid: user.uid,
                    location:user.location,
                    gender:user.gender,
                });
            } else {
                console.log("No such document!");
                reject(error);
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
            reject(error);
        });
    });
};

export const getUserDataFromFirebase = async (userUid, onComplete, onError) => {
    let firestoreDb = firebase.firestore();
    var userRef = firestoreDb.collection("Users").doc(userUid);
    await userRef.get().then((userDoc) => {
        if (userDoc.exists) {
            //console.log("Document data:", userDoc.data());
            let user = userDoc.data();
            onComplete({
                username: user.username,
                photoURL: user.photoURL,
                uid: user.uid,
                location:user.location,
                gender:user.gender,
            });
        } else {
            console.log("No such document!");
            onError(error);
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
        onError(error);
    });
};





export const getUserDataFromDatabase = async (uid, onComplete, onError) => {
    if(uid === currentUserUid()){
        let userData = await getFromAsyncStorage('ThisUser');
        if(userData !== {} && userData){
            console.log('user is theuser, get data from async storage'+userData.username);
            onComplete(userData);
        } else {
            await getUserDataFromFirebase(uid,
                (userData) => {
                    console.log('user is theuser, get data from firebase'+userData.username);
                    onComplete(userData);
                    writeInAsyncStorage('ThisUser', userData);
                },
                (error) => {
                    onError(error);
                })
        }
    } else {
        await getUserDataFromSql(uid)
            .then((userData) => onComplete(userData))
            .catch(async () => {
                await getUserDataFromFirebase(uid,
                    (userData) => {
                        console.log('user isnt the user, get data from firebase'+userData.username);
                        onComplete(userData);
                        insertFriendSql(userData);
                    },
                    (error) => {
                        onError(error);
                    })
            })

    }

};


export const getMeetTitle = async (meetId, onComplete, onError) => {
    await getMeetTitleFromSql(meetId)
        .then((meetTitle) => onComplete(meetTitle))
        .catch(async () => {
            let docRef = firebase.firestore().collection("Meets").doc(meetId);
            await docRef.get().then(
                doc =>{
                    if (!doc.exists){
                        console.log("no data");
                        onError('no data');
                    }else{
                        onComplete(doc.data().title);
                    }
                }
            ).catch(err => {
                console.log("ERROR: ",err);
                onError(err);
            })
        })
};

export const getStartTimeString = (startTime) => {
    if(typeof(startTime)==='string'){
        startTime = new Date(startTime);
    }
    //console.log('--------------------------------',startTime, typeof(startTime));
    let year = startTime.getFullYear();
    let month = startTime.getMonth() + 1;
    let day = startTime.getDate();
    let hour = startTime.getHours();
    let min = ("0" + startTime.getMinutes()).slice(-2);

    let now = new Date();
    let nowYear = now.getFullYear(),
        nowMonth = now.getMonth()+1,
        nowDay = now.getDate();
    if(year===nowYear && month===nowMonth && day===nowDay){
        return `Today ${hour}:${min}`
    } else if(year===nowYear && month===nowMonth && day===nowDay+1){
        return `TMW ${hour}:${min}`
    } else {
        var monthString;
        switch(month){
            case 1:
                monthString='Jan';
                break;
            case 2:
                monthString='Feb';
                break;
            case 3:
                monthString='Mar';
                break;
            case 4:
                monthString='Apr';
                break;
            case 5:
                monthString='May';
                break;
            case 6:
                monthString='June';
                break;
            case 7:
                monthString='July';
                break;
            case 8:
                monthString='Aug';
                break;
            case 9:
                monthString='Sep';
                break;
            case 10:
                monthString='Aug';
                break;
            case 11:
                monthString='Nov';
                break;
            case 12:
                monthString='Dec';
                break;
            default:
                monthString='JAN';
                break;
        }
        return `${monthString} ${day}  ${hour}:${min}`
    }
};

export const getPostTimeString = (postTime) => {
    //console.log(postTime);
    let postTimeTS = postTime.getTime();
    let nowTS = new Date().getTime();
    let dif = nowTS - postTimeTS;
    if(dif < 60*1000){
        return "Just now";
    } else if (dif < 2*60*1000){
        return "1 min ago"
    } else if (dif < 60*60*1000){
        return `${Math.round(dif/(60*1000))} mins ago`;
    } else if (dif < 2*60*60*1000){
        return "1 hour ago"
    } else if (dif < 24*60*60*1000){
        return `${Math.round(dif/(60*60*1000))} hours ago`;
    } else if (dif < 48*60*60*1000){
        return "Yesterday";
    } else {
        return `${Math.round(dif/(24*60*60*1000))} days ago`;
    }
};

export const logoutFromNotification = (uid) => {
    try{
        fetch('http://47.89.187.42:4000/logout', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uid: uid
            }),
        });
    }catch (e) {
        console.log(e);
    }
};


export const getListWhoParticipatedInMeetsByMeetId = (meetId) => {
    try{
        fetch('http://47.89.187.42:4000/getListWhoParticipatedInMeetsByMeetId', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                meetId: meetId
            }),
        });
    }catch (e) {
        console.log(e);
    }
};

export const getDurationString = (duration) => {
    if(duration>2*24*60*60*1000){
        return `${Math.round(duration/(24*60*60*1000))} days`;
    } else if(duration > 24*60*60*1000){
        return "1 day";
    } else if (duration > 2*60*60*1000){
        return `${Math.round(duration/(60*60*1000))} hours`;
    } else if (duration > 60*60*1000){
        return "1 hour";
    } else if (duration > 2*60*1000){
        return `${Math.round(duration/(60*1000))} mins`;
    } else{
        return "1 min";
    }
};


export const getImageSource = (tagName) => {
    switch(tagName){
        case "#party":
            return require('../assets/images/tagsTheme/StaindGlass.jpg');
        case "#sports":
            return require('../assets/images/tagsTheme/lines.jpg');
        case "#food":
            return require('../assets/images/tagsTheme/yumao.jpg');
        case "#shopping":
            return require('../assets/images/tagsTheme/city.png');
        case "#movie":
            return require('../assets/images/tagsTheme/city.png');
        case "#bar":
            return require('../assets/images/tagsTheme/leaves.jpg');
        case "#travel":
            return require('../assets/images/tagsTheme/humian.jpg');
        case "#study":
            return require('../assets/images/tagsTheme/cloud.jpg');
        case "#esports":
            return require('../assets/images/tagsTheme/humian.jpg');
        default:
            return require('../assets/images/tagsTheme/StaindGlass.jpg');

    }
};