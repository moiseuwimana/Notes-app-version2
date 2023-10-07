// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use

import { getFirestore, collection} from "firebase/firestore";


// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKMc4FNJhBYqV-8Lq6wEPMP0FinamfJew",
  authDomain: "react-notes-56867.firebaseapp.com",
  projectId: "react-notes-56867",
  storageBucket: "react-notes-56867.appspot.com",
  messagingSenderId: "831423111059",
  appId: "1:831423111059:web:2315bce3bcf14e1c26d266"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export const notesCollection = collection(db, "notes")