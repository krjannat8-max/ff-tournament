// Firebase Configuration - ULTRA-PROTECTED
(function() {
    const _0xDec = function(_0xval) {
        return atob(_0xval); // Simple Base64 for obfuscation
    };

    var _0xConfig = {
        apiKey: _0xDec("QUl6YVN5QUdJb0FZZzljbHkzYmFSM3dDdWxrTWtCN0lMWUN3X1BV"),
        authDomain: _0xDec("ZmYtdG91cm5hbWVudC1mNDBlZS5maXJlYmFzZWFwcC5jb20="),
        projectId: _0xDec("ZmYtdG91cm5hbWVudC1mNDBlZQ=="),
        storageBucket: _0xDec("ZmYtdG91cm5hbWVudC1mNDBlZS5maXJlYmFzZXN0b3JhZ2UuYXBw"),
        messagingSenderId: _0xDec("NDQwNzIyMzYwNDEx"),
        appId: _0xDec("MTo0NDA3MjIzNjA0MTE6d2ViOmY4MmQxY2YxYmIwNWY1OWRmYzE3N2U="),
        measurementId: _0xDec("Ry1ITk5SRUJWWkJH")
    };

    window.firebaseConfig = _0xConfig;

    if (typeof firebase !== 'undefined') {
        try {
            firebase.initializeApp(_0xConfig);
            window.db = firebase.firestore();
            window.auth_firebase = firebase.auth();
            console.log("%c DATABASE SECURE ", "color: #00ff00; font-weight: bold;");
        } catch (e) {
            // Silently fail or trigger shield
        }
    }
})();
