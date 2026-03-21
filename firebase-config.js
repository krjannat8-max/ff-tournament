// Firebase Configuration - REPLACE THE PLACEHOLDERS BELOW
// Get this from: Firebase Console > Project Settings > General > Your Apps (Web App)
var firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
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
