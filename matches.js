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

function generateMatchCard(match) {
    const filled = Number(match.filledSpots) || 0;
    const total = Number(match.totalSpots) || 48;
    const isFull = filled >= total;
    
    // Check if user is joined
    const isJoined = auth.currentUser && 
                    auth.currentUser.myMatches && 
                    auth.currentUser.myMatches.some(id => String(id) === String(match.id));

    const btnText = isJoined ? 'JOINED' : (isFull ? 'FULL' : 'JOIN');
    const btnAction = (isJoined || isFull) ? 'disabled' : `onclick="joinMatch('${match.id}')"`;
    
    const timeStr = formatMatchTime(match.startTime);
    const dateStr = formatMatchDate(match.startTime);

    // Official Premium Room Info Design
    let roomInfoHtml = '';
    if (isJoined) {
        roomInfoHtml = `
            <div class="room-info-card">
                <div>
                    <div class="room-data-label">ROOM ID</div>
                    <div class="room-data-val">${match.roomId || 'WAITING...'}</div>
                </div>
                <div>
                    <div class="room-data-label">PASSWORD</div>
                    <div class="room-data-val">${match.roomPass || 'WAITING...'}</div>
                </div>
            </div>
        `;
    }

    return `
        <div class="match-card glass">
            <div class="match-header">
                <span class="card-title" style="font-weight: 900; letter-spacing: 1px; color: var(--text-main);">${match.title}</span>
                <span class="status-tag"><i class="far fa-calendar-alt"></i> ${dateStr}</span>
            </div>
            
            <div class="match-body">
                <div class="info-grid">
                    <div class="info-box">
                        <div class="info-label">WIN PRIZE</div>
                        <div class="info-val highlight">৳ ${match.winPrize}</div>
                    </div>
                    <div class="info-box">
                        <div class="info-label">TYPE</div>
                        <div class="info-val">${match.entryType}</div>
                    </div>
                    <div class="info-box">
                        <div class="info-label">ENTRY FEE</div>
                        <div class="info-val highlight">৳ ${match.entryFee}</div>
                    </div>
                    <div class="info-box">
                        <div class="info-label">PER KILL</div>
                        <div class="info-val">৳ ${match.perKill}</div>
                    </div>
                    <div class="info-box">
                        <div class="info-label">MAP</div>
                        <div class="info-val">${match.map}</div>
                    </div>
                    <div class="info-box">
                        <div class="info-label">VERSION</div>
                        <div class="info-val">MOBILE</div>
                    </div>
                </div>

                <div class="spots-bar-container">
                    <div class="spots-labels">
                        <span style="color: var(--text-dim);">Only ${total - filled} spots left</span>
                        <span style="color: var(--text-main);">${filled}/${total}</span>
                    </div>
                    <div class="pg-bar">
                        <div class="pg-fill" style="width: ${(filled/total)*100}%"></div>
                    </div>
                </div>

                ${roomInfoHtml}

                <div class="match-footer">
                    <div class="time-status">
                        <div style="font-size: 0.9rem; font-weight: 800; display: flex; align-items: center; gap: 6px;">
                            <i class="far fa-clock" style="color: var(--cyber-blue);"></i> ${timeStr}
                        </div>
                        <div class="countdown" data-time="${match.startTime}" style="font-size: 0.7rem; color: var(--primary-color); font-weight: 700; margin-top: 2px;">
                            STARTS IN - 00:00:00
                        </div>
                    </div>
                    <button class="btn-premium" ${btnAction}>${btnText}</button>
                </div>
            </div>
        </div>
    `;
}
