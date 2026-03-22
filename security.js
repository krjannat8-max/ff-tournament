/**
 * ULTRA-PREMIUM SECURITY SHIELD v4.0 (Safe Mode)
 * Removed automatic triggers that cause freezing in APK/Emulators.
 */
(function() {
    // 1. Basic Protections (Non-intrusive)
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

    // 2. Keyboard Block (Only for common inspection keys)
    window.onkeydown = function(e) {
        if (e.keyCode === 123 || (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 83 || (e.shiftKey && (e.keyCode === 73 || e.keyCode === 74))))) {
            triggerShield();
            return false;
        }
    };

    // 3. Anti-Iframe
    if (window.self !== window.top) {
        window.top.location = window.self.location;
    }

    console.log("%c SECURITY ACTIVE ", "background: #00ff00; color: #000; font-weight: bold; padding: 2px 5px;");
})();
