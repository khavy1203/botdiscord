import firebase from "firebase/app"
import "firebase/auth"
import "firebase/firestore"
import "firebase/storage"
import "firebase/analytics"

const firebaseConfig = {
	apiKey: "AIzaSyBI4sbfJkIaKD4okQf0g9lt8rVj88WgGEg",
  authDomain: "nccbot-769c6.firebaseapp.com",
  projectId: "nccbot-769c6",
  storageBucket: "nccbot-769c6.appspot.com",
  messagingSenderId: "218712133207",
  appId: "1:218712133207:web:760c73f0388a09fb005d12",
  measurementId: "G-KSGWB6SVB0"
}
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

// Auth export
export const auth = firebase.auth()

// Firestore exports
export const db = firebase.firestore()
export const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp
export const fbTimestamp = firebase.firestore.Timestamp
export const fromMillis = firebase.firestore.Timestamp.fromMillis
export const increment = firebase.firestore.FieldValue.increment

// Storage exports
export const storage = firebase.storage();

export const analytics = () => {
  if (typeof window !== "undefined") {
    return firebase.analytics()
  } else {
    return null
  }
}
export default firebase