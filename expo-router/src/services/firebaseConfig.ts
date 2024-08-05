import { getAnalytics, isSupported } from "firebase/analytics";
import { FirebaseApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCarDd8lDLZIfWkTWJMhjh1_AB4JypMClA",
  authDomain: "goldenbook-50d13.firebaseapp.com",
  projectId: "goldenbook-50d13",
  storageBucket: "goldenbook-50d13.appspot.com",
  messagingSenderId: "792414425810",
  appId: "1:792414425810:web:8bbaa805c211893c0dd30b",
  measurementId: "G-X2HR6MN6TN",
};

let firebaseApp: FirebaseApp;

if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApps()[0];
}

const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);

let analytics;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(firebaseApp);
  }
});

export { analytics, auth, firebaseApp, firestore };
