
function renderMatches(filterType = 'ALL') {
    const list = document.getElementById('matches-list');
    const homeList = document.getElementById('home-matches-list');
    if (!list) return;

    let allMatches = getMatches();
    let filtered = allMatches;
    
    if (filterType !== 'ALL') {
        filtered = allMatches.filter(m => m.type === filterType);
    }

    // Update Category View
    list.innerHTML = filtered.length > 0 ? 
        filtered.map(match => generateMatchCard(match)).join('') : 
        `<div style="text-align:center; padding:50px; color:var(--text-dim);">No matches found in this category</div>`;
    
    
    // Also update Home Highlights (Top 3) - REMOVED AS PER USER REQUEST
    // if (homeList) {
    //     homeList.innerHTML = allMatches.slice(0, 3).map(match => generateMatchCard(match)).join('');
    // }

    startCountdowns();
    updateCategoryCounts(allMatches);
}

function updateCategoryCounts(matches) {
    const categories = ['BR', 'SURVIVAL', 'LONE_WOLF', 'CS_4V4'];
    categories.forEach(type => {
        const count = matches.filter(m => m.type === type).length;
        const countEl = document.querySelector(`.category-card[onclick*="${type}"] .cat-count`);
        if (countEl) countEl.innerText = `${count} matches found`;
    });
}

function filterMatches(type) {
    const homeView = document.getElementById('home-view');
    const categoryView = document.getElementById('category-view');
    const titleDisplay = document.getElementById('category-title-display');

    if (homeView && categoryView) {
        homeView.style.display = 'none';
        categoryView.style.display = 'block';
        window.scrollTo(0, 0);
    }

    // Set Title
    const titles = {
        'BR': 'BR CUSTOM TOURNAMENTS',
        'SURVIVAL': 'CS 2 VS 2 BATTLE',
        'LONE_WOLF': 'LONE WOLF 1 VS 1',
        'CS_4V4': 'CS 4 VS 4 SQUAD'
    };
    if (titleDisplay) titleDisplay.innerText = titles[type] || type;

    renderMatches(type);
}

function showHome() {
    const homeView = document.getElementById('home-view');
    const categoryView = document.getElementById('category-view');

    if (homeView && categoryView) {
        homeView.style.display = 'block';
        categoryView.style.display = 'none';
        window.scrollTo(0, 0);
    }
    renderMatches('ALL');
}

// Show Admin button if admin is logged in
function checkAdminUI() {
    if (auth.currentUser && auth.currentUser.isAdmin) {
        const header = document.querySelector('.app-header');
        const adminBtn = document.createElement('a');
        adminBtn.href = 'admin.html';
        adminBtn.innerHTML = '<i class="fas fa-cog" style="color:var(--text-dim); margin-right:15px; font-size:1.2rem;"></i>';
        header.insertBefore(adminBtn, header.firstChild);
    }
}

let currentJoinMatchId = null;
let currentJoinFee = 0;

function joinMatch(matchId) {
    let matches = getMatches();
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    const fee = Number(match.entryFee) || 0;
    if (wallet.balance < fee) {
        showToast('Insufficient balance! Please deposit TK ' + fee, 'error');
        setTimeout(() => location.href = 'wallet.html', 1500);
        return;
    }

    // Prepare to show custom modal
    currentJoinMatchId = matchId;
    currentJoinFee = fee;
    
    const modal = document.getElementById('game-id-modal');
    const input = document.getElementById('modal-ign-input');
    
    if (modal && input) {
        input.value = ''; // Clear previous
        modal.style.display = 'flex';
        setTimeout(() => input.focus(), 100);
    }
}

function closeGameIdModal() {
    const modal = document.getElementById('game-id-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    currentJoinMatchId = null;
    currentJoinFee = 0;
}

function confirmJoinMatch() {
    if (!currentJoinMatchId) return;
    
    const input = document.getElementById('modal-ign-input');
    const ign = input ? input.value : '';
    
    if (!ign || ign.trim() === "") {
        showToast('Game ID is required to join!', 'error');
        return;
    }

    let matches = getMatches();
    const match = matches.find(m => m.id === currentJoinMatchId);
    if (!match) {
        closeGameIdModal();
        return;
    }

    if (wallet.withdraw(currentJoinFee)) {
        match.filledSpots = (Number(match.filledSpots) || 0) + 1;
        match.totalSpots = Number(match.totalSpots) || 48;
        localStorage.setItem('ff_matches', JSON.stringify(matches));
        
        // Track joined match in user profile with IGN
        if (auth.addJoinedMatch) {
            auth.addJoinedMatch(currentJoinMatchId, ign);
        }
        
        showToast('Tournament Joined Successfully!', 'success');
        closeGameIdModal();
        renderMatches();
    } else {
        closeGameIdModal();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    checkAdminUI();
    
    if (typeof useFirebase !== 'undefined' && useFirebase) {
        console.log("[App] Syncing matches from Firebase...");
        db.collection('matches').orderBy('startTime', 'asc').onSnapshot(function(snapshot) {
            var matches = [];
            snapshot.forEach(function(doc) {
                var data = doc.data();
                data.id = doc.id; // Correctly map Firestore ID
                matches.push(data);
            });
            window.currentMatches = matches; // Global update
            renderMatches();
        });
    } else {
        renderMatches();
    }
});
