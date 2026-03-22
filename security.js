/**
 * ULTRA-HARDCORE SECURITY SHIELD v2.0 (Anti-Decompile, Anti-Dump, Anti-Tamper)
 * This script uses aggressive obfuscation techniques to prevent source code extraction.
 * Logic inspired by ConfuserEx & JS-Obfuscator.
 */
(function(_0x1a2b, _0x3c4d) {
    const _0x5e6f = function(_0x7g8h) {
        while (--_0x7g8h) {
            _0x1a2b['push'](_0x1a2b['shift']());
        }
    };
    _0x5e6f(++_0x3c4d);
}(['\x63\x6f\x6e\x74\x65\x78\x74\x6d\x65\x6e\x75', '\x70\x72\x65\x76\x65\x6e\x74\x44\x65\x66\x61\x75\x6c\x74', '\x6b\x65\x79\x64\x6f\x77\x6e', '\x62\x69\x6e\x61\x72\x79\x2d\x73\x68\x69\x65\x6c\x64', '\x66\x6c\x65\x78', '\x64\x65\x62\x75\x67\x67\x65\x72', '\x61\x6c\x6c\x6f\x63\x61\x74\x65', '\x74\x6f\x53\x74\x72\x69\x6e\x67', '\x72\x65\x67\x65\x78\x70'], 0x1a4));

const _0xSecurity = {
    _0x1: function() {
        // Domain Lock (Optional but effective)
        // if (!window.location.hostname.includes('github.io')) { document.body.innerHTML = ''; }
        
        // 1. Hardcore Anti-Right Click & Copy
        document.addEventListener('\x63\x6f\x6e\x74\x65\x78\x74\x6d\x65\x6e\x75', e => e['\x70\x72\x65\x76\x65\x6e\x74\x44\x65\x66\x61\x75\x6c\x74']());
        document.addEventListener('copy', e => e.preventDefault());
        document.addEventListener('selectstart', e => e.preventDefault());

        // 2. Anti-Format / Anti-Beautify (Self-Defending)
        const _0xCheckFormat = function() {
            const _0xFunc = function() {
                const _0xRegex = new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x5c\x77\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');
                return !_0xRegex['\x74\x65\x73\x74'](_0xFunc['\x74\x6f\x53\x74\x72\x69\x6e\x67']());
            };
            if (_0xFunc()) { _0xSecurity._0xKill(); }
        };
        _0xCheckFormat();

        // 3. Advanced Keyboard Block
        window.onkeydown = function(e) {
            if (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 83 || e.keyCode === 123 || (e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)))) {
                _0xSecurity._0xKill();
                return false;
            }
        };

        // 4. Heavy Debugger Trap (Causes infinite recursion if DevTools open)
        (function _0xTrap(_0xidx) {
            if (('' + _0xidx / _0xidx)['length'] !== 1 || _0xidx % 20 === 0) {
                (function() {}.constructor('debugger')());
            } else {
                (function() {}.constructor('debugger')());
            }
            _0xTrap(++_0xidx);
        }(0));

        // 5. Memory Dump Protection (Clear sensitive intervals)
        setInterval(() => {
            if (window.outerHeight - window.innerHeight > 160 || window.outerWidth - window.innerWidth > 160) {
                _0xSecurity._0xKill();
            }
        }, 500);
    },

    _0xKill: function() {
        const _0xShield = document.getElementById('\x62\x69\x6e\x61\x72\x79\x2d\x73\x68\x69\x65\x6c\x64');
        if (_0xShield) {
            _0xShield.style.display = '\x66\x6c\x65\x78';
            document.body.style.overflow = 'hidden';
            // Scramble all global variables to prevent memory dumping
            window.auth = null; window.db = null; window.wallet = null;
            // Infinite loop to freeze the tab
            while(true) { console.log("01010101"); }
        }
    }
};

// Start Protection
try {
    _0xSecurity._0x1();
} catch (e) {
    _0xSecurity._0xKill();
}
