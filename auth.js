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
            isAdmin: false 
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
            // Ensure old users get new fields
            if (!user.myMatches) user.myMatches = [];
            if (!user.ignMap) user.ignMap = {};
            if (user.wins === undefined) user.wins = 0;
            
            this.currentUser = user;
            localStorage.setItem('ff_user', JSON.stringify(user));
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
        if (!this.currentUser && !window.location.href.includes('login.html')) {
            window.location.href = 'login.html';
        }
    },

    // Verification System (Mock)
    sendVerificationCode(email, type = 'signup') {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = Date.now() + 5 * 60000; // 5 mins
        
        const verificationData = { code, email, expiry, type };
        localStorage.setItem(`ff_verify_${email}`, JSON.stringify(verificationData));
        
        console.log(`[MOCK EMAIL] To: ${email} | Subject: Verify your account | Code: ${code}`);
        
        // In a real app, this would call an API. 
        // For this demo, we'll show it in a professional toast with the code for testing.
        showToast(`Verification code [${code}] sent to ${email}`, "success");
        
        // For testing convenience, we'll also log it clearly or maybe show a hint if the user is the dev.
        // I'll just show the code in the console as per standard mock practices.
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
