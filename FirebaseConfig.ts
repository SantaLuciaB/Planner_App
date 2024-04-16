import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCg_PB7QB3QmFej8mIC_16W2h_sREDfOpw",
  authDomain: "projectauth-15e8d.firebaseapp.com",
  projectId: "projectauth-15e8d",
  storageBucket: "projectauth-15e8d.appspot.com",
  messagingSenderId: "1060280641042",
  appId: "1:1060280641042:web:36c485281126a8c0849acb"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_DB = getFirestore(FIREBASE_APP);