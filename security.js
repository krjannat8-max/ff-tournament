/**
 * Ultra-Premium Security Shield (Anti-Crack & Anti-Debugging)
 * Designed for Bangladesh Mobile Tournament Official
 */
(function() {
    // 1. Disable Right Click
    document.addEventListener('contextmenu', e => e.preventDefault());

    // 2. Disable Keyboard Shortcuts
    document.addEventListener('keydown', e => {
        // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (
            e.keyCode === 123 || 
            (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || 
            (e.ctrlKey && e.keyCode === 85)
        ) {
            e.preventDefault();
            triggerBinaryShield();
            return false;
        }
    });

    function triggerBinaryShield() {
        const shield = document.getElementById('binary-shield');
        const rain = document.getElementById('binary-rain');
        
        if (shield) {
            shield.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Generate binary rain content if empty
            if (rain && rain.innerHTML === "") {
                let bin = "";
                for(let i=0; i<5000; i++) {
                    bin += Math.round(Math.random());
                }
                rain.innerHTML = bin;
            }

            // Optional: Alert or Redirect after a few seconds
            setTimeout(() => {
                window.location.reload();
            }, 5000);
        }
    }

    // 3. Advanced DevTools Detection
    let devtoolsOpen = false;
    const threshold = 160;

    const checkDevTools = () => {
        const widthDiff = window.outerWidth - window.innerWidth > threshold;
        const heightDiff = window.outerHeight - window.innerHeight > threshold;
        
        if (widthDiff || heightDiff) {
            if (!devtoolsOpen) {
                triggerBinaryShield();
                devtoolsOpen = true;
            }
        } else {
            devtoolsOpen = false;
        }
    };

    // 4. Debugger Trap (Causes infinite loop if DevTools is open)
    setInterval(() => {
        const startTime = performance.now();
        debugger;
        const endTime = performance.now();
        if (endTime - startTime > 100) {
            triggerBinaryShield();
        }
        checkDevTools();
    }, 1000);

    // 5. Prevent Iframe embedding (Anti-Clickjacking)
    if (window.self !== window.top) {
        window.top.location = window.self.location;
    }

    console.log("%c SECURITY ACTIVE ", "background: #ff4b2b; color: #fff; font-weight: bold; padding: 5px; border-radius: 5px;");
})();
