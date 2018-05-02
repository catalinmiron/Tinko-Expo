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


export const getMeetInfo = async (meetId, onComplete, onError) => {
    await getMeetTitleFromSql(meetId)
        .then((meetTitle, tagName) => onComplete(meetTitle, tagName))
        .catch(async () => {
            let docRef = firebase.firestore().collection("Meets").doc(meetId);
            await docRef.get().then(
                doc =>{
                    if (!doc.exists){
                        console.log("no data");
                        onError('no data');
                    }else{
                        let meet = doc.data();
                        let title = meet.title;
                        let tagName = meet.tagsList[0];
                        onComplete(title, tagName);
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
            return require('../assets/images/tagsTheme/sky.jpg');
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

export const getMeetAvatarUri = (tagName) => {
    switch(tagName){
        case "#party":
            return 'https://firebasestorage.googleapis.com/v0/b/tinko-64673.appspot.com/o/System%2FMeetAvatar%2FStaindGlassavatar.jpg?alt=media&token=c0f51bf5-90f5-4139-abc8-f254af428a71';
        case "#sports":
            return 'https://firebasestorage.googleapis.com/v0/b/tinko-64673.appspot.com/o/System%2FMeetAvatar%2Flinesavatar.jpg?alt=media&token=7c62b1e0-25ac-4bb3-94c6-b80e733a6fc1';
        case "#food":
            return 'https://firebasestorage.googleapis.com/v0/b/tinko-64673.appspot.com/o/System%2FMeetAvatar%2Fyumaoavatar.jpg?alt=media&token=fe623811-bf97-4390-803a-1e79f848916a';
        case "#shopping":
            return 'https://firebasestorage.googleapis.com/v0/b/tinko-64673.appspot.com/o/System%2FMeetAvatar%2Fcityavatar.png?alt=media&token=d6ced46b-0673-4688-969b-f0781863810e';
        case "#movie":
            return 'https://firebasestorage.googleapis.com/v0/b/tinko-64673.appspot.com/o/System%2FMeetAvatar%2Fskyavatar.jpg?alt=media&token=fcc00315-6498-45ec-a1e6-3b8df8fb6d3a';
        case "#bar":
            return 'https://firebasestorage.googleapis.com/v0/b/tinko-64673.appspot.com/o/System%2FMeetAvatar%2Fleavesavatar.jpg?alt=media&token=5b48042a-3cca-4349-9273-1b378c75eb3e';
        case "#travel":
            return 'https://firebasestorage.googleapis.com/v0/b/tinko-64673.appspot.com/o/System%2FMeetAvatar%2Fhumianavatar.jpg?alt=media&token=fcdc91ca-a5bd-49e7-8093-364c3092bc67';
        case "#study":
            return 'https://firebasestorage.googleapis.com/v0/b/tinko-64673.appspot.com/o/System%2FMeetAvatar%2Fcloudavatar.jpg?alt=media&token=b56e43a4-7c60-4810-bc6b-f6682c69fe4a';
        case "#esports":
            return 'https://firebasestorage.googleapis.com/v0/b/tinko-64673.appspot.com/o/System%2FMeetAvatar%2Fhumianavatar.jpg?alt=media&token=fcdc91ca-a5bd-49e7-8093-364c3092bc67';
        default:
            return 'https://firebasestorage.googleapis.com/v0/b/tinko-64673.appspot.com/o/System%2FMeetAvatar%2FStaindGlassavatar.jpg?alt=media&token=c0f51bf5-90f5-4139-abc8-f254af428a71';

    }
}