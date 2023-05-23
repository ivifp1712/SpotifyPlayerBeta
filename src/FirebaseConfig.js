// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import "firebase/firestore"
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDYPSIgXoub7LCXxgbB3Ivq3ziANjEhfe4",
    authDomain: "welisten-493cc.firebaseapp.com",
    projectId: "welisten-493cc",
    storageBucket: "welisten-493cc.appspot.com",
    messagingSenderId: "842637042622",
    appId: "1:842637042622:web:c1009875a45380ddb04fef",
    measurementId: "G-CHTELN7HG6"
};

// Initialize Firebase
const fire = initializeApp(firebaseConfig);
const db = getFirestore(fire);
const analytics = getAnalytics(fire);

// export const db = fire.firestore();
export const auth = getAuth(fire);
export default fire;
export { db };
