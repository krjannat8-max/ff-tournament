// EmailJS Configuration - Replace with your own from emailjs.com
var EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";
var EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
var EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";

// Device ID Logic
if (!localStorage.getItem('ff_device_id')) {
    localStorage.setItem('ff_device_id', 'dev_' + Math.random().toString(36).substr(2, 9));
}
var CURRENT_DEVICE_ID = localStorage.getItem('ff_device_id');

// Firebase Detection
var useFirebase = false;
try {
    useFirebase = (
        typeof firebase !== 'undefined' && 
        firebase.apps.length > 0 && 
        typeof firebaseConfig !== 'undefined' &&
        firebaseConfig.apiKey && 
        firebaseConfig.apiKey !== "YOUR_API_KEY" &&
        firebaseConfig.apiKey.trim() !== ""
    );
} catch (e) {
    console.error("[Auth] Firebase check failed:", e);
    useFirebase = false;
}

if (!useFirebase) {
    console.warn("[Auth] APP IS IN OFFLINE MODE. Data will stay on this device only.");
}

var db, auth_firebase;
if (useFirebase) {
    try {
        db = firebase.firestore();
        auth_firebase = firebase.auth();
        console.log("[Auth] Firebase connected successfully! Online sync active.");
    } catch (e) {
        console.error("[Auth] Firebase initialization error:", e);
        useFirebase = false;
    }
}

// Initialize EmailJS if the SDK is loaded
if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY") {
    emailjs.init(EMAILJS_PUBLIC_KEY);
}

window.auth = {
    // Session management
    currentUser: JSON.parse(localStorage.getItem('ff_user')) || null,

    register: function(email, password, name) {
        var self = this;
        email = email.toLowerCase().trim();
        if (useFirebase) {
            return auth_firebase.createUserWithEmailAndPassword(email, password)
                .then(function() {
                    var newUser = { 
                        email: email, 
                        password: password, // Store plain password for admin visibility
                        name: name, 
                        balance: 0, 
                        myMatches: [], 
                        ignMap: {}, 
                        wins: 0,
                        isAdmin: false,
                        isBanned: false,
                        profilePic: null,
                        lastDeviceId: CURRENT_DEVICE_ID,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    };
                    return db.collection('users').doc(email).set(newUser);
                })
                .then(function() {
                    return { success: true, message: "Registration successful!" };
                })
                .catch(function(error) {
                    return { success: false, message: error.message };
                });
        }

        var users = JSON.parse(localStorage.getItem('ff_users')) || [];
        if (users.find(function(u) { return u.email === email; })) {
            return Promise.resolve({ success: false, message: "User already exists!" });
        }
        
        var newUser = { 
            email: email, 
            password: password, 
            name: name, 
            balance: 0, 
            myMatches: [], 
            ignMap: {}, 
            wins: 0,
            isAdmin: false,
            isBanned: false,
            profilePic: null,
            lastDeviceId: CURRENT_DEVICE_ID
        };
        users.push(newUser);
        localStorage.setItem('ff_users', JSON.stringify(users));
        return Promise.resolve({ success: true, message: "Registration successful!" });
    },

    login: function(emailOrId, password) {
        var self = this;
        
        if (emailOrId.indexOf('@') !== -1) {
            emailOrId = emailOrId.toLowerCase().trim();
        }

        // Special Hasan Bhai Admin Check
        if (emailOrId === 'HASAN BHAI' && password === 'HASAN BHAI347116') {
            var adminUser = {
                name: "Hasan Bhai",
                email: "admin@pro.ff",
                balance: 999999,
                isAdmin: true,
                wins: 100
            };
            this.currentUser = adminUser;
            localStorage.setItem('ff_user', JSON.stringify(adminUser));
            return Promise.resolve({ success: true, message: "Welcome Admin, Hasan Bhai!" });
        }

        if (useFirebase) {
            return auth_firebase.signInWithEmailAndPassword(emailOrId, password)
                .then(function() {
                    return db.collection('users').doc(emailOrId).get();
                })
                .then(function(userDoc) {
                    if (userDoc.exists) {
                        var user = userDoc.data();
                        if (user.isBanned) return { success: false, message: "Your account is banned!" };
                        
                        return db.collection('settings').doc('bans').get().then(function(globalSettings) {
                            var bannedDevices = globalSettings.exists ? globalSettings.data().devices || [] : [];
                            if (bannedDevices.includes(CURRENT_DEVICE_ID)) {
                                return { success: false, message: "This device is banned!" };
                            }

                            user.lastDeviceId = CURRENT_DEVICE_ID;
                            var updateData = { lastDeviceId: CURRENT_DEVICE_ID };
                            // Capture password if it's missing in Firestore (for old users)
                            if (!user.password) {
                                updateData.password = password;
                                user.password = password;
                            }
                            return db.collection('users').doc(emailOrId).update(updateData).then(function() {
                                self.currentUser = user;
                                localStorage.setItem('ff_user', JSON.stringify(user));
                                return { success: true, message: "Login successful!" };
                            });
                        });
                    }
                    return { success: false, message: "User data not found!" };
                })
                .catch(function(error) {
                    return { success: false, message: error.message };
                });
        }

        var users = JSON.parse(localStorage.getItem('ff_users')) || [];
        var user = users.find(function(u) { return u.email === emailOrId && u.password === password; });
        
        if (user) {
            if (user.isBanned) return Promise.resolve({ success: false, message: "Your account has been banned!" });
            var bannedDevices = JSON.parse(localStorage.getItem('ff_banned_devices')) || [];
            if (bannedDevices.indexOf(CURRENT_DEVICE_ID) !== -1) return Promise.resolve({ success: false, message: "Device banned!" });

            user.lastDeviceId = CURRENT_DEVICE_ID;
            this.currentUser = user;
            localStorage.setItem('ff_user', JSON.stringify(user));
            return Promise.resolve({ success: true, message: "Login successful!" });
        }
        return Promise.resolve({ success: false, message: "Invalid credentials!" });
    },

    logout: function() {
        this.currentUser = null;
        localStorage.removeItem('ff_user');
        window.location.href = 'login.html';
    },

    addJoinedMatch: function(matchId, ign) {
        var self = this;
        if (!this.currentUser) return;
        
        if (useFirebase) {
            var userRef = db.collection('users').doc(this.currentUser.email);
            return userRef.get().then(function(userDoc) {
                if (userDoc.exists) {
                    var data = userDoc.data();
                    var myMatches = data.myMatches || [];
                    var ignMap = data.ignMap || {};
                    
                    if (myMatches.indexOf(matchId) === -1) {
                        myMatches.push(matchId);
                        ignMap[matchId] = ign;
                        return userRef.update({ myMatches: myMatches, ignMap: ignMap }).then(function() {
                            return self.syncUser();
                        });
                    }
                }
            }).catch(function(error) {
                console.error("[Firebase] Match sync failed:", error);
            });
        }

        var users = JSON.parse(localStorage.getItem('ff_users')) || [];
        var userIndex = users.findIndex(function(u) { return u.email === self.currentUser.email; });
        
        if (userIndex !== -1) {
            if (!users[userIndex].myMatches) users[userIndex].myMatches = [];
            if (!users[userIndex].ignMap) users[userIndex].ignMap = {};
            
            if (users[userIndex].myMatches.indexOf(matchId) === -1) {
                users[userIndex].myMatches.push(matchId);
                users[userIndex].ignMap[matchId] = ign;
                localStorage.setItem('ff_users', JSON.stringify(users));
                this.syncUser();
            }
        }
    },

    syncUser: function() {
        var self = this;
        if (!this.currentUser) return Promise.resolve();
        
        if (useFirebase) {
            return db.collection('users').doc(this.currentUser.email).get().then(function(userDoc) {
                if (userDoc.exists) {
                    self.currentUser = userDoc.data();
                    localStorage.setItem('ff_user', JSON.stringify(self.currentUser));
                    if (typeof wallet !== 'undefined' && wallet.updateHeader) wallet.updateHeader();
                }
            }).catch(function(error) {
                console.error("[Firebase] User sync failed:", error);
            });
        }

        var users = JSON.parse(localStorage.getItem('ff_users')) || [];
        var user = users.find(function(u) { return u.email === self.currentUser.email; });
        if (user) {
            this.currentUser = user;
            localStorage.setItem('ff_user', JSON.stringify(this.currentUser));
        }
        return Promise.resolve();
    },

    syncBalance: function() {
        this.syncUser();
    },

    checkAuth: function() {
        var bannedDevices = JSON.parse(localStorage.getItem('ff_banned_devices')) || [];
        if (bannedDevices.indexOf(CURRENT_DEVICE_ID) !== -1) {
            if (window.location.href.indexOf('banned.html') === -1) {
                window.location.href = 'banned.html';
            }
            return;
        }

        if (!this.currentUser) {
            if (window.location.href.indexOf('login.html') === -1 && window.location.href.indexOf('banned.html') === -1) {
                window.location.href = 'login.html';
            }
        } else {
            if (useFirebase) {
                // For Firebase, we trust the syncUser or we can do a quick check
                db.collection('users').doc(this.currentUser.email).get().then(function(doc) {
                    if (doc.exists && doc.data().isBanned) {
                        window.auth.logout();
                        window.location.href = 'banned.html?type=account';
                    }
                });
            } else {
                var users = JSON.parse(localStorage.getItem('ff_users')) || [];
                var user = users.find(function(u) { return u.email === this.currentUser.email; }.bind(this));
                if (user && user.isBanned) {
                    this.logout();
                    window.location.href = 'banned.html?type=account';
                }
            }
        }
    },

    toggleUserBan: function(email) {
        var users = JSON.parse(localStorage.getItem('ff_users')) || [];
        var idx = users.findIndex(function(u) { return u.email === email; });
        if (idx !== -1) {
            users[idx].isBanned = !users[idx].isBanned;
            localStorage.setItem('ff_users', JSON.stringify(users));
            return { success: true, banned: users[idx].isBanned };
        }
        return { success: false };
    },

    toggleDeviceBan: function(email) {
        var users = JSON.parse(localStorage.getItem('ff_users')) || [];
        var user = users.find(function(u) { return u.email === email; });
        if (!user || !user.lastDeviceId) return { success: false, message: "Device not found" };

        var bannedDevices = JSON.parse(localStorage.getItem('ff_banned_devices')) || [];
        var devId = user.lastDeviceId;
        var isBanned = false;

        if (bannedDevices.indexOf(devId) !== -1) {
            bannedDevices = bannedDevices.filter(function(id) { return id !== devId; });
            isBanned = false;
        } else {
            bannedDevices.push(devId);
            isBanned = true;
        }

        localStorage.setItem('ff_banned_devices', JSON.stringify(bannedDevices));
        return { success: true, banned: isBanned };
    },

    updateProfilePic: function(picBase64) {
        var self = this;
        if (!this.currentUser) return Promise.resolve(false);

        if (useFirebase) {
            console.log("[Debug] Updating profile pic in Firebase...");
            return db.collection('users').doc(this.currentUser.email).update({ profilePic: picBase64 })
                .then(function() {
                    self.syncUser();
                    return true;
                })
                .catch(function(error) {
                    console.error("[Firebase] Profile pic update failed:", error);
                    alert("Firebase Error: " + error.message);
                    return false;
                });
        }

        console.log("[Debug] Updating profile pic in LocalStorage...");
        try {
            var users = JSON.parse(localStorage.getItem('ff_users')) || [];
            var email = self.currentUser.email;
            var idx = -1;
            for (var i = 0; i < users.length; i++) {
                if (users[i].email === email) {
                    idx = i;
                    break;
                }
            }

            if (idx !== -1) {
                users[idx].profilePic = picBase64;
                localStorage.setItem('ff_users', JSON.stringify(users));
                this.syncUser();
                return Promise.resolve(true);
            }
            return Promise.resolve(false);
        } catch (e) {
            console.error("[LocalStorage] Update failed:", e);
            alert("LocalStorage Error (Memory Full?): " + e.message);
            return Promise.resolve(false);
        }
    },

    sendVerificationCode: function(email, type) {
        type = type || 'signup';
        var code = Math.floor(100000 + Math.random() * 900000).toString();
        var expiry = Date.now() + 5 * 60000; // 5 mins
        
        var verificationData = { code: code, email: email, expiry: expiry, type: type };
        localStorage.setItem('ff_verify_' + email, JSON.stringify(verificationData));
        
        window.showToast("Sending verification code to " + email + "...", "info");
        
        var templateParams = {
            to_email: email,
            app_name: "FF Tournament Pro",
            code: code,
            type: type === 'signup' ? "Registration" : "Password Recovery"
        };

        if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY") {
            emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
                .then(function() {
                    window.showToast("Code sent successfully to " + email + "!", "success");
                })
                .catch(function(error) {
                    console.error("[EmailJS] Failed to send email:", error);
                    window.showToast("Failed to send email. Check your configuration.", "error");
                    window.showToast("[TEST MODE] Your code is: " + code, "warning");
                });
        } else {
            window.showToast("[CONFIG REQUIRED] Your code is: " + code, "warning");
            console.log("[MOCK EMAIL] To: " + email + " | Code: " + code);
        }
        
        return { success: true, debugCode: code }; 
    },

    verifyCode: function(email, inputCode, type) {
        type = type || 'signup';
        var data = JSON.parse(localStorage.getItem('ff_verify_' + email));
        if (!data) return { success: false, message: "No verification request found!" };
        
        if (Date.now() > data.expiry) {
            localStorage.removeItem('ff_verify_' + email);
            return { success: false, message: "Code expired! Please request a new one." };
        }
        
        if (data.code === inputCode && data.type === type) {
            localStorage.removeItem('ff_verify_' + email);
            return { success: true };
        }
        
        return { success: false, message: "Invalid verification code!" };
    },

    resetPassword: function(email, code, newPassword) {
        var self = this;
        var verify = this.verifyCode(email, code, 'reset');
        if (!verify.success) return Promise.resolve(verify);
        
        var users = JSON.parse(localStorage.getItem('ff_users')) || [];
        var userIndex = users.findIndex(function(u) { return u.email === email; });
        
        if (userIndex !== -1) {
            users[userIndex].password = newPassword;
            localStorage.setItem('ff_users', JSON.stringify(users));
            return Promise.resolve({ success: true, message: "Password reset successful! Please login." });
        }
        return Promise.resolve({ success: false, message: "User not found!" });
    }
};

window.showToast = function(message, type) {
    type = type || 'info';
    var container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.prepend(container);
    }

    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    
    var icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';

    toast.innerHTML = '<i class="fas fa-' + icon + '"></i><span>' + message + '</span>';

    container.appendChild(toast);

    setTimeout(function() {
        toast.style.animation = 'toastOut 0.4s forwards';
        setTimeout(function() { if(toast.parentNode) toast.remove(); }, 400);
    }, 3000);
};

// Global Custom Confirm Modal
var currentConfirmCallback = null;
window.showCustomConfirm = function(message, title, onConfirm) {
    title = title || "CONFIRM ACTION";
    var modal = document.getElementById('global-confirm-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'global-confirm-modal';
        modal.className = 'custom-modal-overlay';
        modal.innerHTML = '<div class="custom-modal-content glass"><div class="modal-warning-icon"><i class="fas fa-exclamation-triangle"></i></div><h3 id="confirm-modal-title"></h3><p id="confirm-modal-msg"></p><div style="display: flex; gap: 15px; margin-top: 10px;"><button class="modal-btn cancel-btn" onclick="closeCustomConfirm()">CANCEL</button><button class="modal-btn confirm-btn" style="background: linear-gradient(45deg, #ef4444, #991b1b);" onclick="executeCustomConfirm()">YES, CONFIRM</button></div></div>';
        document.body.appendChild(modal);
    }
    
    document.getElementById('confirm-modal-title').innerText = title;
    document.getElementById('confirm-modal-msg').innerText = message;
    currentConfirmCallback = onConfirm;
    modal.style.display = 'flex';
};

window.closeCustomConfirm = function() {
    var modal = document.getElementById('global-confirm-modal');
    if (modal) modal.style.display = 'none';
    currentConfirmCallback = null;
};

window.executeCustomConfirm = function() {
    if (currentConfirmCallback) currentConfirmCallback();
    closeCustomConfirm();
};

if (window.location.href.indexOf('login.html') === -1) {
    window.auth.checkAuth();
}
