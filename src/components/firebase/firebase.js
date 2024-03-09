import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import {getFirestore} from"firebase/firestore"

const firebaseConfig = {

  apiKey: "AIzaSyCB-ETzk8Ey5gL3DQG17XU-6i7xkx-ERio",
  authDomain: "mostadam-12266.firebaseapp.com",
  projectId: "mostadam-12266",
  storageBucket: "mostadam-12266.appspot.com",
  messagingSenderId: "13842665545",
  appId: "1:13842665545:web:36c50dec150a0864996f98"

};


export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const  db = getFirestore();
