function renderMatches(filterType = 'ALL') {
    const list = document.getElementById('matches-list');
    
    // Get the latest matches (from cache or memory)
    let allMatches = getMatches();
    
    // Always update home page category counts
    updateCategoryCounts(allMatches);

    if (!list) return;

    let filtered = allMatches;
    if (filterType !== 'ALL') {
        filtered = allMatches.filter(m => String(m.type) === String(filterType));
    }

    list.innerHTML = filtered.length > 0 ? 
        filtered.map(match => generateMatchCard(match)).join('') : 
        `<div style="text-align:center; padding:50px; color:var(--text-dim);">No matches found in this category</div>`;
    
    if (typeof startCountdowns === 'function') startCountdowns();
}

function updateCategoryCounts(matches) {
    const categories = ['BR', 'SURVIVAL', 'LONE_WOLF', 'CS_4V4'];
    categories.forEach(type => {
        const count = matches.filter(m => String(m.type) === String(type)).length;
        const countEl = document.querySelector(`.category-card[onclick*="${type}"] .cat-count`);
        if (countEl) {
            countEl.innerText = `${count} matches found`;
        }
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

function checkAdminUI() {
    if (auth.currentUser && auth.currentUser.isAdmin) {
        const header = document.querySelector('.app-header');
        if (header && !header.querySelector('a[href="admin.html"]')) {
            const adminBtn = document.createElement('a');
            adminBtn.href = 'admin.html';
            adminBtn.innerHTML = '<i class="fas fa-cog" style="color:var(--text-dim); margin-right:15px; font-size:1.2rem;"></i>';
            header.insertBefore(adminBtn, header.firstChild);
        }
    }
}

let currentJoinMatchId = null;
let currentJoinFee = 0;

function joinMatch(matchId) {
    let matches = getMatches();
    const match = matches.find(m => String(m.id) === String(matchId));
    if (!match) return showToast("Match details not found!", "error");

    const fee = Number(match.entryFee) || 0;
    if (wallet.balance < fee) {
        showToast('Insufficient balance! TK ' + fee + ' required.', 'error');
        setTimeout(() => location.href = 'wallet.html', 1500);
        return;
    }

    currentJoinMatchId = matchId;
    currentJoinFee = fee;
    
    const modal = document.getElementById('game-id-modal');
    const input = document.getElementById('modal-ign-input');
    
    if (modal && input) {
        input.value = ''; 
        modal.style.display = 'flex';
        setTimeout(() => input.focus(), 100);
    }
}

function closeGameIdModal() {
    const modal = document.getElementById('game-id-modal');
    if (modal) modal.style.display = 'none';
    currentJoinMatchId = null;
    currentJoinFee = 0;
}

async function confirmJoinMatch() {
    if (!currentJoinMatchId) return;
    
    const input = document.getElementById('modal-ign-input');
    const ign = input ? input.value : '';
    
    if (!ign || ign.trim() === "") {
        showToast('Game ID is required!', 'error');
        return;
    }

    const withdrawn = await wallet.withdraw(currentJoinFee);
    if (withdrawn) {
        if (typeof useFirebase !== 'undefined' && useFirebase) {
            try {
                const matchRef = db.collection('matches').doc(String(currentJoinMatchId));
                await matchRef.update({
                    filledSpots: firebase.firestore.FieldValue.increment(1)
                });
                if (auth.addJoinedMatch) await auth.addJoinedMatch(currentJoinMatchId, ign);
            } catch (e) {
                console.error("[Firebase] Join error:", e);
            }
        } else {
            let matches = JSON.parse(localStorage.getItem('ff_matches')) || [];
            const m = matches.find(x => String(x.id) === String(currentJoinMatchId));
            if (m) {
                m.filledSpots = (Number(m.filledSpots) || 0) + 1;
                localStorage.setItem('ff_matches', JSON.stringify(matches));
                window.currentMatches = matches;
                if (auth.addJoinedMatch) auth.addJoinedMatch(currentJoinMatchId, ign);
            }
        }
        
        showToast('Joined Successfully!', 'success');
        closeGameIdModal();
        renderMatches();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    checkAdminUI();
    
    // Initial render from cache
    renderMatches();

    if (typeof useFirebase !== 'undefined' && useFirebase) {
        console.log("[App] Syncing matches from Firebase...");
        db.collection('matches').onSnapshot(function(snapshot) {
            var matches = [];
            snapshot.forEach(function(doc) {
                var data = doc.data();
                data.id = doc.id;
                matches.push(data);
            });
            matches.sort((a, b) => (a.startTime || 0) - (b.startTime || 0));
            
            // Update both memory and cache
            window.currentMatches = matches; 
            localStorage.setItem('ff_matches', JSON.stringify(matches));
            
            renderMatches(); 
        }, function(error) {
            console.error("[Firebase] Error fetching matches:", error);
            // Fallback to local rendering is already done by initial render
        });
    }
});
