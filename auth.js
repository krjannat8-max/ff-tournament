/* EmailJS Configuration - Get these from https://www.emailjs.com/ */
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";   // [REQUIRED] Replace with your Public Key
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";   // [REQUIRED] Replace with your Service ID
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID"; // [REQUIRED] Replace with your Template ID

// Device ID Logic
if (!localStorage.getItem('ff_device_id')) {
    localStorage.setItem('ff_device_id', 'dev_' + Math.random().toString(36).substr(2, 9));
}
const CURRENT_DEVICE_ID = localStorage.getItem('ff_device_id');

// Initialize EmailJS if the SDK is loaded
if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
}

const auth = {
    // Session management
    currentUser: JSON.parse(localStorage.getItem('ff_user')) || null,

    register(email, password, name) {
        const users = JSON.parse(localStorage.getItem('ff_users')) || [];
        if (users.find(u => u.email === email)) {
            return { success: false, message: "User already exists!" };
        }
        
        const newUser = { 
            email, 
            password, 
            name, 
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
        return { success: true, message: "Registration successful!" };
    },

    login(emailOrId, password) {
        // Special Hasan Bhai Admin Check
        if (emailOrId === 'HASAN BHAI' && password === 'HASAN BHAI347116') {
            const adminUser = {
                name: "Hasan Bhai",
                email: "admin@pro.ff",
                balance: 999999,
                isAdmin: true,
                wins: 100
            };
            this.currentUser = adminUser;
            localStorage.setItem('ff_user', JSON.stringify(adminUser));
            return { success: true, message: "Welcome Admin, Hasan Bhai!" };
        }

        const users = JSON.parse(localStorage.getItem('ff_users')) || [];
        const user = users.find(u => u.email === emailOrId && u.password === password);
        
        if (user) {
            // Check if user is banned
            if (user.isBanned) {
                return { success: false, message: "Your account has been banned! Contact support." };
            }

            // Check if device is banned
            const bannedDevices = JSON.parse(localStorage.getItem('ff_banned_devices')) || [];
            if (bannedDevices.includes(CURRENT_DEVICE_ID)) {
                return { success: false, message: "This device has been banned from the platform." };
            }

            // Update device ID for user
            user.lastDeviceId = CURRENT_DEVICE_ID;
            
            // Ensure old users get new fields
            if (!user.myMatches) user.myMatches = [];
            if (!user.ignMap) user.ignMap = {};
            if (user.wins === undefined) user.wins = 0;
            if (user.isBanned === undefined) user.isBanned = false;
            
            this.currentUser = user;
            localStorage.setItem('ff_user', JSON.stringify(user));
            
            // Sync this update back to main user list
            const usersList = JSON.parse(localStorage.getItem('ff_users')) || [];
            const idx = usersList.findIndex(u => u.email === user.email);
            if (idx !== -1) {
                usersList[idx] = user;
                localStorage.setItem('ff_users', JSON.stringify(usersList));
            }

            return { success: true, message: "Login successful!" };
        }
        return { success: false, message: "Invalid credentials!" };
    },

    logout() {
        this.currentUser = null;
        localStorage.removeItem('ff_user');
        window.location.href = 'login.html';
    },

    addJoinedMatch(matchId, ign) {
        if (!this.currentUser) return;
        
        const users = JSON.parse(localStorage.getItem('ff_users')) || [];
        const userIndex = users.findIndex(u => u.email === this.currentUser.email);
        
        if (userIndex !== -1) {
            if (!users[userIndex].myMatches) users[userIndex].myMatches = [];
            if (!users[userIndex].ignMap) users[userIndex].ignMap = {};
            
            if (!users[userIndex].myMatches.includes(matchId)) {
                users[userIndex].myMatches.push(matchId);
                users[userIndex].ignMap[matchId] = ign;
                localStorage.setItem('ff_users', JSON.stringify(users));
                this.syncUser();
            }
        }
    },

    syncUser() {
        if (!this.currentUser) return;
        const users = JSON.parse(localStorage.getItem('ff_users')) || [];
        const user = users.find(u => u.email === this.currentUser.email);
        if (user) {
            this.currentUser = user;
            localStorage.setItem('ff_user', JSON.stringify(this.currentUser));
        }
    },

    syncBalance() {
        this.syncUser();
    },

    checkAuth() {
        // 1. Check Device Ban (Global)
        const bannedDevices = JSON.parse(localStorage.getItem('ff_banned_devices')) || [];
        if (bannedDevices.includes(CURRENT_DEVICE_ID)) {
            if (!window.location.href.includes('banned.html')) {
                window.location.href = 'banned.html';
            }
            return;
        }

        // 2. Check User Session & User Ban
        if (!this.currentUser) {
            if (!window.location.href.includes('login.html') && !window.location.href.includes('banned.html')) {
                window.location.href = 'login.html';
            }
        } else {
            // Check if current user was just banned
            const users = JSON.parse(localStorage.getItem('ff_users')) || [];
            const user = users.find(u => u.email === this.currentUser.email);
            if (user && user.isBanned) {
                this.logout();
                window.location.href = 'banned.html?type=account';
            }
        }
    },

    // Administrative Actions
    toggleUserBan(email) {
        let users = JSON.parse(localStorage.getItem('ff_users')) || [];
        const idx = users.findIndex(u => u.email === email);
        if (idx !== -1) {
            users[idx].isBanned = !users[idx].isBanned;
            localStorage.setItem('ff_users', JSON.stringify(users));
            return { success: true, banned: users[idx].isBanned };
        }
        return { success: false };
    },

    toggleDeviceBan(email) {
        let users = JSON.parse(localStorage.getItem('ff_users')) || [];
        const user = users.find(u => u.email === email);
        if (!user || !user.lastDeviceId) return { success: false, message: "Device not found" };

        let bannedDevices = JSON.parse(localStorage.getItem('ff_banned_devices')) || [];
        const devId = user.lastDeviceId;
        let isBanned = false;

        if (bannedDevices.includes(devId)) {
            bannedDevices = bannedDevices.filter(id => id !== devId);
            isBanned = false;
        } else {
            bannedDevices.push(devId);
            isBanned = true;
        }

        localStorage.setItem('ff_banned_devices', JSON.stringify(bannedDevices));
        return { success: true, banned: isBanned };
    },

    updateProfilePic(picBase64) {
        if (!this.currentUser) return;
        let users = JSON.parse(localStorage.getItem('ff_users')) || [];
        const idx = users.findIndex(u => u.email === this.currentUser.email);
        if (idx !== -1) {
            users[idx].profilePic = picBase64;
            localStorage.setItem('ff_users', JSON.stringify(users));
            this.syncUser();
            return true;
        }
        return false;
    },

    // Verification System (Real Email via EmailJS)
    sendVerificationCode(email, type = 'signup') {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = Date.now() + 5 * 60000; // 5 mins
        
        const verificationData = { code, email, expiry, type };
        localStorage.setItem(`ff_verify_${email}`, JSON.stringify(verificationData));
        
        // Show Toast immediately so the user knows something is happening
        showToast(`Sending verification code to ${email}...`, "info");
        
        // Prepare Email Template Parameters
        const templateParams = {
            to_email: email,
            app_name: "FF Tournament Pro",
            code: code,
            type: type === 'signup' ? "Registration" : "Password Recovery"
        };

        // Send Email via EmailJS
        if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY") {
            emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
                .then(() => {
                    showToast(`Code sent successfully to ${email}!`, "success");
                    console.log(`[EmailJS] Success: Code ${code} sent to ${email}`);
                })
                .catch((error) => {
                    console.error("[EmailJS] Failed to send email:", error);
                    showToast("Failed to send email. Please check your EmailJS configuration.", "error");
                    // Fallback for testing: Show code in toast if EmailJS is not configured properly
                    showToast(`[TEST MODE] Your code is: ${code}`, "warning");
                });
        } else {
            // Fallback for when EmailJS is not yet configured by the user
            console.warn("[AUTH] EmailJS not configured. Falling back to Mock mode.");
            showToast(`[CONFIG REQUIRED] Your code is: ${code}`, "warning");
            console.log(`[MOCK EMAIL] To: ${email} | Code: ${code}`);
        }
        
        return { success: true, debugCode: code }; 
    },

    verifyCode(email, inputCode, type = 'signup') {
        const data = JSON.parse(localStorage.getItem(`ff_verify_${email}`));
        if (!data) return { success: false, message: "No verification request found!" };
        
        if (Date.now() > data.expiry) {
            localStorage.removeItem(`ff_verify_${email}`);
            return { success: false, message: "Code expired! Please request a new one." };
        }
        
        if (data.code === inputCode && data.type === type) {
            localStorage.removeItem(`ff_verify_${email}`);
            return { success: true };
        }
        
        return { success: false, message: "Invalid verification code!" };
    },

    resetPassword(email, code, newPassword) {
        const verify = this.verifyCode(email, code, 'reset');
        if (!verify.success) return verify;
        
        const users = JSON.parse(localStorage.getItem('ff_users')) || [];
        const userIndex = users.findIndex(u => u.email === email);
        
        if (userIndex !== -1) {
            users[userIndex].password = newPassword;
            localStorage.setItem('ff_users', JSON.stringify(users));
            return { success: true, message: "Password reset successful! Please login." };
        }
        return { success: false, message: "User not found!" };
    }
};

// Auto-check auth on protected pages
if (!window.location.href.includes('login.html')) {
    auth.checkAuth();
}

// Premium Notification System
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.prepend(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';

    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'toastOut 0.4s forwards';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// Global Custom Confirm Modal
let currentConfirmCallback = null;

function showCustomConfirm(message, title = "CONFIRM ACTION", onConfirm) {
    let modal = document.getElementById('global-confirm-modal');
    
    // Inject if it doesn't exist
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'global-confirm-modal';
        modal.className = 'custom-modal-overlay';
        modal.innerHTML = `
            <div class="custom-modal-content glass">
                <div class="modal-warning-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3 id="confirm-modal-title" style="color: var(--primary-color); text-transform: uppercase; font-family: 'Space Grotesk', sans-serif; letter-spacing: 2px; text-shadow: var(--neon-glow); margin-bottom: 10px;">CONFIRM ACTION</h3>
                <p id="confirm-modal-msg" style="color: var(--text-main); font-size: 1rem; margin-bottom: 25px; line-height: 1.5;"></p>
                
                <div style="display: flex; gap: 15px; margin-top: 10px;">
                    <button class="modal-btn cancel-btn" onclick="closeCustomConfirm()">CANCEL</button>
                    <button class="modal-btn confirm-btn" style="background: linear-gradient(45deg, #ef4444, #991b1b);" onclick="executeCustomConfirm()">YES, CONFIRM</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    document.getElementById('confirm-modal-title').innerText = title;
    document.getElementById('confirm-modal-msg').innerText = message;
    
    currentConfirmCallback = onConfirm;
    
    modal.style.display = 'flex';
}

function closeCustomConfirm() {
    const modal = document.getElementById('global-confirm-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    currentConfirmCallback = null;
}

function executeCustomConfirm() {
    if (currentConfirmCallback) {
        currentConfirmCallback();
    }
    closeCustomConfirm();
}
