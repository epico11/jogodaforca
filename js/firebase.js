// // Import the functions you need from the SDKs you need
// import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
// // import { auth, db } from "./firebase.js";
// // import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

//   // TODO: Add SDKs for Firebase products that you want to use
//   // https://firebase.google.com/docs/web/setup#available-libraries

//   // Your web app's Firebase configuration
// const firebaseConfig = {
//     apiKey: "AIzaSyCVIySA4_momk1VxBBbCvXRJ2bD5c5KYIU",
//     authDomain: "jogo-da-forca-b24d4.firebaseapp.com",
//     projectId: "jogo-da-forca-b24d4",
//     storageBucket: "jogo-da-forca-b24d4.firebasestorage.app",
//     messagingSenderId: "109985832850",
//     appId: "1:109985832850:web:3e6b738ee0c32260b26b4b"
// };

//   // Initialize Firebase
//   const app = initializeApp(firebaseConfig);

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCVIySA4_momk1VxBBbCvXRJ2bD5c5KYIU",
  authDomain: "jogo-da-forca-b24d4.firebaseapp.com",
  projectId: "jogo-da-forca-b24d4",
  storageBucket: "jogo-da-forca-b24d4.firebasestorage.app",
  messagingSenderId: "109985832850",
  appId: "1:109985832850:web:3e6b738ee0c32260b26b4b"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

// Mantém o usuário logado mesmo se fechar a página/navegador
await setPersistence(auth, browserLocalPersistence);

export { app, auth, provider, db, storage };