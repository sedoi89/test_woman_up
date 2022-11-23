import firebase from 'firebase/compat/app';
import  "firebase/compat/firestore";

 export const firebaseApp =  firebase.initializeApp({
    apiKey: "AIzaSyAz8P_NyspZhmYHOHrYmB5Tzs1iaygBLPk",
    authDomain: "testtask-fd7d7.firebaseapp.com",
    databaseURL: "https://testtask-fd7d7-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "testtask-fd7d7",
    storageBucket: "testtask-fd7d7.appspot.com",
    messagingSenderId: "507328668657",
    appId: "1:507328668657:web:0c21cc359b18e8809c5a50"
});

const db = firebaseApp.firestore();

export  default db
