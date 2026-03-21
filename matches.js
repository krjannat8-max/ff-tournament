// Initialize default matches if empty
const defaultMatches = [
    {
        id: "1",
        title: "BR Custom | Mobile | Solo",
        type: "BR",
        entryType: "Solo",
        entryFee: 10,
        winPrize: 450,
        perKill: 5,
        map: "Bermuda",
        version: "MOBILE",
        totalSpots: 48,
        filledSpots: 0,
        startTime: new Date().getTime() + 2 * 3600000
    }
];

// Global matches list - initialized from LocalStorage (the original way)
window.currentMatches = JSON.parse(localStorage.getItem('ff_matches')) || defaultMatches;

function getMatches() {
    // Return the cached list (it will be updated by Firebase if available)
    return window.currentMatches || [];
}

function formatMatchTime(timestamp) {
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + strMinutes + ' ' + ampm;
}

function formatMatchDate(timestamp) {
    const date = new Date(timestamp);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

let countdownInterval = null;
function startCountdowns() {
    if (countdownInterval) clearInterval(countdownInterval);
    
    function update() {
        const now = new Date().getTime();
        const elements = document.querySelectorAll('.countdown');
        
        elements.forEach(el => {
            const startTime = parseInt(el.getAttribute('data-time'));
            if (isNaN(startTime)) return;

            const diff = startTime - now;
            
            if (diff <= 0) {
                el.innerHTML = "LIVE / STARTED";
                el.style.color = "#00ff88"; // Vibrant Green
                el.style.textShadow = "0 0 10px rgba(0, 255, 136, 0.5)";
            } else {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                
                const h = hours < 10 ? '0' + hours : hours;
                const m = minutes < 10 ? '0' + minutes : minutes;
                const s = seconds < 10 ? '0' + seconds : seconds;
                
                el.innerHTML = `STARTS IN - ${h}:${m}:${s}`;
                el.style.color = "#ff4b2b"; // Vibrant Red
                el.style.textShadow = "0 0 10px rgba(255, 75, 43, 0.3)";
            }
        });
    }
    
    update();
    countdownInterval = setInterval(update, 1000);
}

function generateMatchCard(match) {
    const filled = Number(match.filledSpots) || 0;
    const total = Number(match.totalSpots) || 48;
    const isFull = filled >= total;
    
    const isJoined = auth.currentUser && 
                    auth.currentUser.myMatches && 
                    auth.currentUser.myMatches.some(id => String(id) === String(match.id));

    const btnText = isJoined ? 'JOINED' : (isFull ? 'FULL' : 'JOIN');
    const btnAction = (isJoined || isFull) ? 'disabled' : `onclick="joinMatch('${match.id}')"`;
    
    const timeStr = formatMatchTime(match.startTime);
    const dateStr = formatMatchDate(match.startTime);

    let roomInfoHtml = '';
    if (isJoined) {
        roomInfoHtml = `
            <div style="background: rgba(0, 242, 255, 0.1); border: 1px dashed #00f2ff; border-radius: 12px; padding: 12px; margin: 15px 0;">
                <div style="font-size: 0.65rem; color: #00f2ff; font-weight: 900; text-transform: uppercase; margin-bottom: 8px; text-align: center;">Room Access Granted</div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="text-align: left;">
                        <div style="font-size: 0.55rem; color: rgba(255,255,255,0.5);">ID</div>
                        <div style="font-size: 0.9rem; color: #fff; font-weight: 900; font-family: monospace;">${match.roomId || 'WAITING'}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 0.55rem; color: rgba(255,255,255,0.5);">PASS</div>
                        <div style="font-size: 0.9rem; color: #ffd700; font-weight: 900; font-family: monospace;">${match.roomPass || 'WAITING'}</div>
                    </div>
                </div>
            </div>
        `;
    }

    return `
        <div style="background: #1a1c23; border-radius: 20px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.4); position: relative;">
            <div style="padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.05);">
                <span style="font-weight: 900; font-size: 0.95rem; color: #fff; text-transform: uppercase; letter-spacing: 0.5px;">${match.title}</span>
                <span style="font-size: 0.7rem; color: #ffd700; font-weight: 800; background: rgba(255, 215, 0, 0.1); padding: 4px 10px; border-radius: 6px;"><i class="far fa-calendar-alt"></i> ${dateStr}</span>
            </div>
            
            <div style="padding: 20px;">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">
                    <div style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 0.55rem; color: rgba(255,255,255,0.4); margin-bottom: 4px;">WIN PRIZE</div>
                        <div style="font-size: 0.85rem; color: #00ff88; font-weight: 900;">৳${match.winPrize}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 0.55rem; color: rgba(255,255,255,0.4); margin-bottom: 4px;">TYPE</div>
                        <div style="font-size: 0.85rem; color: #fff; font-weight: 900;">${match.entryType}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 0.55rem; color: rgba(255,255,255,0.4); margin-bottom: 4px;">ENTRY FEE</div>
                        <div style="font-size: 0.85rem; color: #ff4b2b; font-weight: 900;">৳${match.entryFee}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 0.55rem; color: rgba(255,255,255,0.4); margin-bottom: 4px;">PER KILL</div>
                        <div style="font-size: 0.85rem; color: #fff; font-weight: 900;">৳${match.perKill}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 0.55rem; color: rgba(255,255,255,0.4); margin-bottom: 4px;">MAP</div>
                        <div style="font-size: 0.85rem; color: #fff; font-weight: 900;">${match.map}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 0.55rem; color: rgba(255,255,255,0.4); margin-bottom: 4px;">VERSION</div>
                        <div style="font-size: 0.85rem; color: #00f2ff; font-weight: 900;">MOBILE</div>
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.7rem; margin-bottom: 8px; font-weight: 800;">
                        <span style="color: rgba(255,255,255,0.4);">ONLY ${total - filled} SPOTS LEFT</span>
                        <span style="color: #fff;">${filled}/${total}</span>
                    </div>
                    <div style="height: 6px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden;">
                        <div style="width: ${(filled/total)*100}%; height: 100%; background: linear-gradient(to right, #ff4b2b, #ff416c); box-shadow: 0 0 10px rgba(255, 75, 43, 0.5);"></div>
                    </div>
                </div>

                ${roomInfoHtml}

                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px;">
                    <div>
                        <div style="font-size: 0.95rem; font-weight: 900; color: #fff; display: flex; align-items: center; gap: 6px;">
                            <i class="far fa-clock" style="color: #00f2ff;"></i> ${timeStr}
                        </div>
                        <div class="countdown" data-time="${match.startTime}" style="font-size: 0.7rem; color: #ff4b2b; font-weight: 900; text-transform: uppercase; margin-top: 2px; letter-spacing: 0.5px;">
                            CALCULATING...
                        </div>
                    </div>
                    <button ${btnAction} style="background: linear-gradient(135deg, #ff4b2b, #ff416c); color: white; border: none; padding: 12px 35px; border-radius: 14px; font-weight: 900; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 5px 15px rgba(255, 75, 43, 0.3); transition: 0.3s;">
                        ${btnText}
                    </button>
                </div>
            </div>
        </div>
    `;
}
