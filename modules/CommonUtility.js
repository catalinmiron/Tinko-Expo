import Task from 'data.task';
import firebase from "firebase";
import 'firebase/firestore'
import {Alert} from "react-native";

export const getPostRequest = (code, bodyData, onComplete, onError) => {
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
}

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

export const getStartTimeString = (startTime) => {
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
}

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
}