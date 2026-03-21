// Firebase Configuration - CONFIGURED
var firebaseConfig = {
    apiKey: "AIzaSyAGIoAYg9cly3baR3wCulkMkB7ILYCw_PU",
    authDomain: "ff-tournament-f40ee.firebaseapp.com",
    projectId: "ff-tournament-f40ee",
    storageBucket: "ff-tournament-f40ee.firebasestorage.app",
    messagingSenderId: "440722360411",
    appId: "1:440722360411:web:f82d1cf1bb05f59dfc177e",
    measurementId: "G-HNNREBVZBG"
};

// Initialize Firebase
if (typeof firebase !== 'undefined') {
    try {
        firebase.initializeApp(firebaseConfig);
        
        // EXPOSE GLOBALLY for use in matches.js, app.js, wallet.js etc.
        window.db = firebase.firestore();
        window.auth_firebase = firebase.auth();
        
        console.log("[Firebase] Centralized Database Initialized Successfully.");
    } catch (e) {
        console.error("[Firebase] Initialization error:", e.message);
    }
} else {
    console.error("[Firebase] Firebase SDK NOT LOADED! Make sure script tags are correct.");
}
