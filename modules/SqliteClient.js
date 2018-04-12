//import db from './SqliteDB';
import {SQLite} from "expo";
import Task from "data.task";
const db = SQLite.openDatabase('db.db');

export const initNewFriendsRequestTable = (uid) => {
    db.transaction(
        tx => {
            tx.executeSql('create table if not exists new_friends_request'+ uid +' (' +
                'id integer primary key not null , ' +
                'requesterUid text UNIQUE, ' +
                'username text, ' +
                'photoURL text, ' +
                'type int,' +
                'timestamp int,' +
                'msg text);');
        },
        (error) => console.log("new_friends_request :" + error),
        () => {
            console.log('new_friends_request complete');
        }
    );
};


export const insertNewFriendsRequest = (uid, data, userData) => {
    const {requester, type, timestamp, msg} = data;
    db.transaction(
        tx => {
            tx.executeSql(
                'insert or replace into new_friends_request'+uid+' (requesterUid,type,timestamp, msg, username, photoURL) values (?,?,?,?,?,?)',
                [requester, type, timestamp, msg, userData.username,userData.photoURL]);
        }
        ,
        (error) => console.log("new_friends_request" + error),
        () => {
            console.log('insertNewFriendsRequest complete');
        }
    );
};

export const getNewFriendsRequest = (uid) => {
    return new Task((reject, resolve) => {
        //console.log('getNewFriendsrequest');
        db.transaction(
            tx => {
                tx.executeSql(`SELECT * FROM new_friends_request${uid} ORDER BY timestamp DESC`, [], (_, { rows }) => {
                    let dataArr =  rows['_array'];
                    //console.log(dataArr);
                    resolve(dataArr);
                });
            },
            (error) => reject(error),
            null
        )
    });
};