// Initialize default matches if empty
const defaultMatches = [
    {
        id: 1,
        title: "BR Custom | Mobile | Solo",
        type: "BR",
        entryType: "Solo",
        entryFee: 10,
        winPrize: 450,
        perKill: 5,
        map: "Bermuda",
        version: "MOBILE",
        totalSpots: 48,
        filledSpots: 12,
        startTime: new Date().getTime() + 2 * 3600000
    },
    {
        id: 2,
        title: "CS 2vs2 | Duo Battle",
        type: "SURVIVAL",
        entryType: "Duo",
        entryFee: 20,
        winPrize: 800,
        perKill: 0,
        map: "Classic",
        version: "MOBILE",
        totalSpots: 8,
        filledSpots: 2,
        startTime: new Date().getTime() + 4 * 3600000
    },
    {
        id: 3,
        title: "Lone Wolf | 1vs1 Pro",
        type: "LONE_WOLF",
        entryType: "Solo",
        entryFee: 15,
        winPrize: 250,
        perKill: 0,
        map: "Iron Cage",
        version: "MOBILE",
        totalSpots: 2,
        filledSpots: 0,
        startTime: new Date().getTime() + 1 * 3600000
    },
    {
        id: 4,
        title: "CS 4vs4 | Squad Pride",
        type: "CS_4V4",
        entryType: "Squad",
        entryFee: 40,
        winPrize: 1500,
        perKill: 0,
        map: "Classic",
        version: "MOBILE",
        totalSpots: 8,
        filledSpots: 4,
        startTime: new Date().getTime() + 6 * 3600000
    }
];

if (!localStorage.getItem('ff_matches')) {
    localStorage.setItem('ff_matches', JSON.stringify(defaultMatches));
}

function getMatches() {
    const m = localStorage.getItem('ff_matches');
    return m ? JSON.parse(m) : [];
}

function generateMatchCard(match) {
    const filled = Number(match.filledSpots) || 0;
    const total = Number(match.totalSpots) || 48;
    
    // Check if user is joined
    const isJoined = auth.currentUser && 
                     auth.currentUser.myMatches && 
                     auth.currentUser.myMatches.some(id => String(id) === String(match.id));
    
    const isFull = filled >= total;
    const progress = (filled / total) * 100;
    
    // Room Info Logic
    let roomInfoHtml = '';
    if (isJoined) {
        const userIgn = (auth.currentUser && auth.currentUser.ignMap) ? 
                        auth.currentUser.ignMap[match.id] : 'N/A';
        
        const roomData = (match.roomId || match.roomPass) ? `
            <div>
                <div class="room-data-label">Room ID</div>
                <div class="room-data-val">${match.roomId || 'WAITING...'}</div>
            </div>
            <div>
                <div class="room-data-label">Password</div>
                <div class="room-data-val">${match.roomPass || 'WAITING...'}</div>
            </div>
        ` : `
            <div style="grid-column: span 2; text-align:center; color:var(--text-dim); font-size:0.75rem; padding: 5px 0;">
                <i class="fas fa-clock"></i> Room data will be updated 15m before start.
            </div>
        `;

        roomInfoHtml = `
            <div class="room-info-card" style="margin-bottom: 10px;">
                <div style="grid-column: span 2; border-bottom: 1px solid rgba(255,171,0,0.2); padding-bottom: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                    <span class="room-data-label" style="margin:0;">MY GAME ID:</span>
                    <span style="color:var(--accent-yellow); font-weight:800; font-family:monospace;">${userIgn}</span>
                </div>
                ${roomData}
            </div>
        `;
    }

    return `
        <div class="match-card glass">
            <div class="match-header">
                <span style="font-weight: 800; font-size: 0.95rem; color: var(--primary-color);">${match.title}</span>
                <span style="font-size: 0.7rem; font-weight: 700; background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 4px;">3/15/2026</span>
            </div>
            <div class="match-body">
                <div class="info-grid">
                    <div class="info-box">
                        <div class="info-label">Win Prize</div>
                        <div class="info-val highlight">৳ ${match.winPrize || 0}</div>
                    </div>
                    <div class="info-box">
                        <div class="info-label">Type</div>
                        <div class="info-val">${match.entryType || 'Solo'}</div>
                    </div>
                    <div class="info-box">
                        <div class="info-label">Entry Fee</div>
                        <div class="info-val highlight">৳ ${match.entryFee || 0}</div>
                    </div>
                    <div class="info-box">
                        <div class="info-label">Per Kill</div>
                        <div class="info-val">৳ ${match.perKill || 0}</div>
                    </div>
                    <div class="info-box">
                        <div class="info-label">Map</div>
                        <div class="info-val">${match.map || 'Bermuda'}</div>
                    </div>
                    <div class="info-box">
                        <div class="info-label">Version</div>
                        <div class="info-val">${match.version || 'MOBILE'}</div>
                    </div>
                </div>

                <div class="spots-bar-container">
                    <div class="spots-labels">
                        <span>Only ${total - filled} spots left</span>
                        <span style="color: var(--text-dim);">${filled}/${total}</span>
                    </div>
                    <div class="pg-bar">
                        <div class="pg-fill" style="width: ${progress}%"></div>
                    </div>
                </div>

                ${roomInfoHtml}

                <div class="match-footer">
                    <div class="status-tag" id="timer-${match.id}">STARTS IN - ...</div>
                    
                    ${isJoined ? `
                        <button class="btn-premium" style="background: var(--accent-green); color: black;" disabled>
                            <i class="fas fa-check-circle"></i> JOINED
                        </button>
                    ` : `
                        <button class="btn-premium" ${isFull ? 'disabled' : ''} onclick="joinMatch(${match.id})">
                            ${isFull ? 'MATCH FULL' : 'JOIN'}
                        </button>
                    `}
                </div>
            </div>
        </div>
    `;
}

function startCountdowns() {
    const matches = getMatches();
    matches.forEach(match => {
        const timerEl = document.getElementById(`timer-${match.id}`);
        if (!timerEl) return;

        const update = () => {
            const now = new Date().getTime();
            const distance = match.startTime - now;

            if (distance < 0) {
                timerEl.innerHTML = "STARTED";
                return;
            }

            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((distance % (1000 * 60)) / 1000);

            timerEl.innerHTML = `STARTS IN - ${h}h:${m}m:${s}s`;
        };
        update();
        setInterval(update, 1000);
    });
}
