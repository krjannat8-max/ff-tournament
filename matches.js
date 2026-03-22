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
    
    const update = () => {
        const now = Date.now();
        const elements = document.querySelectorAll('.countdown');
        
        elements.forEach(el => {
            const startTimeStr = el.getAttribute('data-time');
            const startTime = parseInt(startTimeStr);
            
            if (isNaN(startTime) || startTime === 0) {
                el.innerHTML = "TIME NOT SET";
                return;
            }

            const diff = startTime - now;
            
            if (diff <= 0) {
                el.innerHTML = '<span style="color: #00ff88; font-weight: 900; background: rgba(0, 255, 136, 0.1); padding: 2px 8px; border-radius: 4px; animation: blink 1s infinite; border: 1px solid rgba(0, 255, 136, 0.3);">● LIVE NOW</span>';
                el.style.textShadow = "0 0 10px rgba(0, 255, 136, 0.6)";
            } else {
                const hours = Math.floor(diff / 3600000);
                const minutes = Math.floor((diff % 3600000) / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                
                const h = hours.toString().padStart(2, '0');
                const m = minutes.toString().padStart(2, '0');
                const s = seconds.toString().padStart(2, '0');
                
                el.innerHTML = `STARTS IN - ${h}:${m}:${s}`;
                el.style.color = "#ff4b2b";
                el.style.textShadow = "0 0 10px rgba(255, 75, 43, 0.4)";
            }
        });
    };
    
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

    // Result Logic
    const userResult = (auth.currentUser && auth.currentUser.results) ? auth.currentUser.results[match.id] : null;

    const btnText = isJoined ? 'JOINED' : (isFull ? 'FULL' : 'JOIN');
    const btnAction = (isJoined || isFull) ? 'disabled' : `onclick="joinMatch('${match.id}')"`;
    
    const timeStr = formatMatchTime(match.startTime);
    const dateStr = formatMatchDate(match.startTime);

    let roomInfoHtml = '';
    if (isJoined) {
        const updatedAt = match.roomInfoUpdatedAt || 0;
        const now = Date.now();
        const diffMins = (now - updatedAt) / 60000;
        const isExpired = updatedAt > 0 && diffMins > 15;

        if (isExpired) {
            roomInfoHtml = `
                <div style="background: rgba(255, 75, 43, 0.1); border: 1px dashed #ff4b2b; border-radius: 12px; padding: 12px; margin: 15px 0; text-align: center;">
                    <div style="font-size: 0.7rem; color: #ff4b2b; font-weight: 900; text-transform: uppercase;">Room Info Expired</div>
                    <div style="font-size: 0.6rem; color: var(--text-dim); margin-top: 4px;">Hidden after 15 minutes for security</div>
                </div>
            `;
        } else {
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
                    ${updatedAt > 0 ? `<div style="font-size: 0.5rem; color: var(--text-dim); text-align: center; margin-top: 8px;">Hiding in ${Math.max(0, Math.ceil(15 - diffMins))} mins</div>` : ''}
                </div>
            `;
        }
    }

    // Result Badge
    let resultBadge = '';
    if (userResult && userResult !== 'PENDING') {
        const color = userResult === 'WIN' ? '#22c55e' : '#ef4444';
        const icon = userResult === 'WIN' ? 'fa-trophy' : 'fa-times-circle';
        resultBadge = `
            <div style="position: absolute; top: 10px; right: 10px; background: ${color}; color: ${userResult === 'WIN' ? 'black' : 'white'}; padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 900; display: flex; align-items: center; gap: 6px; z-index: 10; box-shadow: 0 0 15px ${color}66;">
                <i class="fas ${icon}"></i> ${userResult}
            </div>
        `;
    }

    return `
        <div style="background: #1a1c23; border-radius: 20px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.4); position: relative;">
            ${resultBadge}
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

                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; background: rgba(255,255,255,0.02); padding: 10px; border-radius: 12px;">
                    <div class="time-info">
                        <div style="font-size: 0.95rem; font-weight: 900; color: #fff; display: flex; align-items: center; gap: 6px;">
                            <i class="far fa-clock" style="color: #00f2ff;"></i> ${timeStr}
                        </div>
                        <div class="countdown" data-time="${match.startTime}" style="font-size: 0.7rem; color: #ff4b2b; font-weight: 900; text-transform: uppercase; margin-top: 4px; letter-spacing: 0.5px;">
                            SYNCING...
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
