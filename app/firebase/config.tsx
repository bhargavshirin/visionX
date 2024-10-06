
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
const firebaseConfig = {
    apiKey: "AIzaSyBs9h2ZKiNH47bjoUHMEfQvfHgjGMu0X3I",
    authDomain: "visionx-b222f.firebaseapp.com",
    projectId: "visionx-b222f",
    storageBucket: "visionx-b222f.appspot.com",
    messagingSenderId: "286056599115",
    appId: "1:286056599115:web:0ee05dc61ded817dd187ce",
    measurementId: "G-MCBC2V3DVV"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const fdb = getDatabase(app);

export { app, db,fdb };
