
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "286056599115",
    appId: "",
    measurementId: ""
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const fdb = getDatabase(app);

export { app, db,fdb };
