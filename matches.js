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

// Global list for caching
var currentMatches = [];

function getMatches() {
    if (typeof useFirebase !== 'undefined' && useFirebase) {
        return currentMatches;
    }
    var m = localStorage.getItem('ff_matches');
    return m ? JSON.parse(m) : [];
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
    const btnClass = isJoined ? 'joined-btn' : (isFull ? 'full-btn' : 'join-btn');
    const btnAction = (isJoined || isFull) ? '' : `onclick="joinMatch('${match.id}')"`;
    
    const timeStr = formatMatchTime(match.startTime);
    const dateStr = formatMatchDate(match.startTime);

    // Logic to show Room ID/Pass ONLY to joined users
    let roomInfoHtml = '';
    if (isJoined) {
        roomInfoHtml = `
            <div class="room-info-box" style="background: rgba(0, 242, 255, 0.1); border: 1px solid var(--cyber-blue); padding: 10px; border-radius: 8px; margin: 10px 0; text-align: center;">
                <div style="font-size: 0.7rem; color: var(--cyber-blue); font-weight: bold; text-transform: uppercase; margin-bottom: 5px;">Room Details (Joined Users Only)</div>
                <div style="display: flex; justify-content: space-around; font-family: monospace;">
                    <div>ID: <span style="color: white; font-weight: bold;">${match.roomId || 'WAITING...'}</span></div>
                    <div>PASS: <span style="color: white; font-weight: bold;">${match.roomPass || 'WAITING...'}</span></div>
                </div>
            </div>
        `;
    }

    return `
        <div class="match-card">
            <div class="match-header">
                <span class="match-title">${match.title}</span>
                <span class="match-date"><i class="far fa-calendar-alt"></i> ${dateStr}</span>
            </div>
            
            <div class="match-stats">
                <div class="stat-item">
                    <span class="stat-label">WIN PRIZE</span>
                    <span class="stat-value">৳ ${match.winPrize}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">TYPE</span>
                    <span class="stat-value">${match.entryType}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">ENTRY FEE</span>
                    <span class="stat-value">৳ ${match.entryFee}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">PER KILL</span>
                    <span class="stat-value">৳ ${match.perKill}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">MAP</span>
                    <span class="stat-value">${match.map}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">VERSION</span>
                    <span class="stat-value">${match.version}</span>
                </div>
            </div>

            ${roomInfoHtml}

            <div class="match-footer" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 12px; margin-top: 10px;">
                <div class="spots-info" style="flex-grow: 1;">
                    <div class="spots-text" style="font-size: 0.7rem; color: var(--text-dim);">Only ${total - filled} spots left</div>
                    <div class="spots-bar" style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; margin: 5px 0; position: relative;">
                        <div class="spots-progress" style="width: ${(filled/total)*100}%; height: 100%; background: var(--primary-gradient); border-radius: 3px;"></div>
                    </div>
                    <div class="spots-count" style="font-size: 0.75rem; font-weight: bold;">${filled}/${total}</div>
                </div>
                <div class="match-time-info" style="text-align: right; margin-right: 15px;">
                    <div class="time-text" style="font-size: 0.8rem; font-weight: bold;"><i class="far fa-clock"></i> ${timeStr}</div>
                    <div class="countdown" data-time="${match.startTime}" style="font-size: 0.7rem; color: #ff4b2b;">STARTS IN - 00:00:00</div>
                </div>
                <button class="${btnClass}" ${btnAction} style="padding: 10px 20px; border-radius: 10px; border: none; font-weight: bold; cursor: pointer; background: ${isJoined ? '#444' : (isFull ? '#666' : 'var(--primary-gradient)')}; color: white;">${btnText}</button>
            </div>
        </div>
    `;
}
