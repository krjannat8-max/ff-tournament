// Wallet state management
const wallet = {
    get balance() {
        auth.syncBalance();
        return auth.currentUser ? auth.currentUser.balance : 0;
    },
    
    updateHeader() {
        const headerBalance = document.getElementById('header-balance');
        const walletBalance = document.getElementById('wallet-balance');
        const bal = this.balance;
        if (headerBalance) headerBalance.innerText = `৳ ${bal.toFixed(2)}`;
        if (walletBalance) walletBalance.innerText = `৳ ${bal.toFixed(2)}`;
    },

    async submitDepositRequest(amount, txid, method) {
        if (!auth.currentUser) return;
        
        if (useFirebase) {
            try {
                const userEmail = auth.currentUser.email.toLowerCase().trim();
                const newReq = {
                    id: Date.now(),
                    userEmail: userEmail,
                    userName: auth.currentUser.name,
                    amount: parseFloat(amount),
                    txid: txid,
                    method: method,
                    status: 'pending',
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                };
                await db.collection('deposits').add(newReq);
                return true;
            } catch (error) {
                console.error("[Firebase] Deposit failed:", error);
                return false;
            }
        }

        const requests = JSON.parse(localStorage.getItem('ff_deposit_requests')) || [];
        const newReq = {
            id: Date.now(),
            userEmail: auth.currentUser.email,
            userName: auth.currentUser.name,
            amount: parseFloat(amount),
            txid: txid,
            method: method,
            status: 'pending',
            timestamp: new Date().getTime()
        };
        requests.push(newReq);
        localStorage.setItem('ff_deposit_requests', JSON.stringify(requests));
        return true;
    },

    async withdraw(amount) {
        if (!auth.currentUser) return false;

        if (useFirebase) {
            try {
                const userRef = db.collection('users').doc(auth.currentUser.email);
                const userDoc = await userRef.get();
                const currentBal = userDoc.data().balance || 0;
                
                if (currentBal >= amount) {
                    await userRef.update({ balance: currentBal - amount });
                    auth.syncUser();
                    this.updateHeader();
                    return true;
                }
                return false;
            } catch (error) {
                console.error("[Firebase] Withdraw failed:", error);
                return false;
            }
        }

        const users = JSON.parse(localStorage.getItem('ff_users')) || [];
        const userIndex = users.findIndex(u => u.email === auth.currentUser.email);
        
        if (userIndex !== -1 && users[userIndex].balance >= amount) {
            users[userIndex].balance -= amount;
            localStorage.setItem('ff_users', JSON.stringify(users));
            auth.syncBalance();
            this.updateHeader();
            return true;
        }
        return false;
    },

    async submitWithdrawRequest(amount, method, account) {
        if (!auth.currentUser || amount < 100) return false;
        
        if (useFirebase) {
            try {
                const userEmail = auth.currentUser.email.toLowerCase().trim();
                // Deduct upfront
                const userRef = db.collection('users').doc(userEmail);
                const userDoc = await userRef.get();
                const currentBal = userDoc.data().balance || 0;
                
                if (currentBal >= amount) {
                    await userRef.update({ balance: currentBal - amount });
                    
                    const newReq = {
                        id: Date.now(),
                        userEmail: userEmail,
                        userName: auth.currentUser.name || "User",
                        amount: parseFloat(amount),
                        method: method,
                        account: account,
                        status: 'pending',
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    };
                    await db.collection('withdrawals').add(newReq);
                    await auth.syncUser(); 
                    this.updateHeader();
                    return true;
                }
                return false;
            } catch (error) {
                console.error("[Firebase] Withdrawal failed:", error);
                return false;
            }
        }

        // Deduct upfront to prevent double spending
        const withdrawn = await this.withdraw(amount);
        if (withdrawn) {
            const requests = JSON.parse(localStorage.getItem('ff_withdrawals')) || [];
            const newReq = {
                id: Date.now(),
                userEmail: auth.currentUser.email,
                userName: auth.currentUser.name,
                amount: parseFloat(amount),
                method: method,
                account: account,
                status: 'pending',
                timestamp: new Date().getTime()
            };
            requests.push(newReq);
            localStorage.setItem('ff_withdrawals', JSON.stringify(requests));
            return true;
        }
        return false;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    wallet.updateHeader();
});
