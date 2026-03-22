// Firebase Configuration
(function() {
    var config = {
        apiKey: "AIzaSyAGIoAYg9cly3baR3wCulkMkB7ILYCw_PU",
        authDomain: "ff-tournament-f40ee.firebaseapp.com",
        projectId: "ff-tournament-f40ee",
        storageBucket: "ff-tournament-f40ee.firebasestorage.app",
        messagingSenderId: "440722360411",
        appId: "1:440722360411:web:f82d1cf1bb05f59dfc177e",
        measurementId: "G-HNNREVBZBG"
    };

    window.firebaseConfig = config;

    if (typeof firebase !== 'undefined') {
        try {
            firebase.initializeApp(config);
            window.db = firebase.firestore();
            window.auth_firebase = firebase.auth();
            console.log("%c DATABASE CONNECTED ", "color: #00ff00; font-weight: bold;");
        } catch (e) {
            console.error("Firebase Init Error:", e);
        }
    }
})();
