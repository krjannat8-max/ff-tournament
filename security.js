/**
 * ULTRA-PREMIUM SECURITY SHIELD v3.0 (APK Optimized)
 * Fixed loading/freezing issues for Mobile APK.
 */
(function() {
    // 1. Hardcore Anti-Right Click & Copy
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('copy', e => e.preventDefault());
    document.addEventListener('selectstart', e => e.preventDefault());

    const triggerShield = () => {
        const shield = document.getElementById('binary-shield');
        const rain = document.getElementById('binary-rain');
        if (shield) {
            shield.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            if (rain && rain.innerHTML === "") {
                let bin = "";
                for(let i=0; i<2000; i++) bin += Math.round(Math.random());
                rain.innerHTML = bin;
            }
        }
    };

    // 2. Advanced Keyboard Block
    window.onkeydown = function(e) {
        if (e.keyCode === 123 || (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 83 || (e.shiftKey && (e.keyCode === 73 || e.keyCode === 74))))) {
            triggerShield();
            return false;
        }
    };

    // 3. DevTools Detection (Non-freezing version)
    setInterval(() => {
        // Detect window size changes (common for DevTools)
        const threshold = 160;
        const isDevToolsOpen = window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold;
        
        if (isDevToolsOpen) {
            triggerShield();
        }
    }, 2000);

    // 4. Protection for Firebase Config (Self-Healing)
    if (typeof firebaseConfig === 'undefined') {
        console.log("Security: System Integrity Compromised");
    }

    // 5. Anti-Iframe
    if (window.self !== window.top) {
        window.top.location = window.self.location;
    }

    console.log("%c SECURITY ACTIVE ", "background: #00ff00; color: #000; font-weight: bold; padding: 2px 5px;");
})();
