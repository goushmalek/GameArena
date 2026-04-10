class SlotsGame {
    constructor() {
        this.symbols = ['🎯', '🌟', '🎨', '🎮', '💎', '🎪'];
        this.reels = [
            document.getElementById('reel1'),
            document.getElementById('reel2'),
            document.getElementById('reel3')
        ];
        this.totalPoints = 100;
        this.spinCost = 10;
        this.lastWin = 0;
        this.totalSpins = 0;
        this.totalWins = 0;
        this.highestScore = 100;
        this.playTime = 0;
        this.playInterval = null;
        this.isSpinning = false;
        this.history = [];
        this.init();
    }

    init() {
        this.loadStats();
        this.updateDisplay();
        this.displaySymbols();
        this.renderHistory();
        document.getElementById('spinBtn').addEventListener('click', () => this.spin());
        this.startPlayTimer();
    }

    startPlayTimer() {
        this.playInterval = setInterval(() => {
            this.playTime++;
        }, 1000);
    }

    loadStats() {
        this.totalPoints = parseInt(localStorage.getItem('slots_totalPoints') || '100');
        this.highestScore = parseInt(localStorage.getItem('slots_highestScore') || '100');
        this.totalSpins = parseInt(localStorage.getItem('slots_totalSpins') || '0');
        this.totalWins = parseInt(localStorage.getItem('slots_totalWins') || '0');
        this.history = JSON.parse(localStorage.getItem('slots_history') || '[]');
    }

    saveStats() {
        localStorage.setItem('slots_totalPoints', this.totalPoints);
        localStorage.setItem('slots_highestScore', this.highestScore);
        localStorage.setItem('slots_totalSpins', this.totalSpins);
        localStorage.setItem('slots_totalWins', this.totalWins);
        localStorage.setItem('slots_history', JSON.stringify(this.history.slice(0, 10)));
    }

    displaySymbols(final = null) {
        this.reels.forEach((reel, i) => {
            if (final && final[i]) {
                reel.textContent = final[i];
            } else {
                reel.textContent = this.symbols[Math.floor(Math.random() * this.symbols.length)];
            }
        });
    }

    showNotEnoughPointsModal() {
        const modal = document.createElement('div');
        modal.className = 'slots-modal';
        modal.innerHTML = `
            <div class="slots-modal-content">
                <h2>⚠️ Not Enough Points!</h2>
                <p>You need 10 points to spin.</p>
                <p class="current-points">Current Points: <span>${this.totalPoints}</span></p>
                <div class="modal-buttons">
                    <button class="claim-btn" onclick="slotsGame.claimPoints()">🎁 Claim 100 Points</button>
                    <button class="close-modal-btn" onclick="slotsGame.closeModal()">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        this.currentModal = modal;
    }

    claimPoints() {
        this.totalPoints += 100;
        this.saveStats();
        this.updateDisplay();
        this.closeModal();
        this.showClaimSuccessToast();
    }

    showClaimSuccessToast() {
        const toast = document.createElement('div');
        toast.className = 'success-toast';
        toast.innerHTML = '✅ 100 Points Claimed!';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    closeModal() {
        if (this.currentModal) {
            this.currentModal.remove();
            this.currentModal = null;
        }
    }

    async spin() {
        if (this.isSpinning) return;
        
        if (this.totalPoints < this.spinCost) {
            this.showNotEnoughPointsModal();
            return;
        }

        this.isSpinning = true;
        this.totalPoints -= this.spinCost;
        this.totalSpins++;
        this.updateDisplay();
        document.getElementById('spinBtn').disabled = true;

        this.reels.forEach(reel => reel.classList.add('spinning'));
        const spinDuration = 2000;
        const intervalId = setInterval(() => this.displaySymbols(), 100);

        await new Promise(resolve => setTimeout(resolve, spinDuration));
        clearInterval(intervalId);

        const result = [
            this.symbols[Math.floor(Math.random() * this.symbols.length)],
            this.symbols[Math.floor(Math.random() * this.symbols.length)],
            this.symbols[Math.floor(Math.random() * this.symbols.length)]
        ];

        this.displaySymbols(result);
        this.reels.forEach(reel => reel.classList.remove('spinning'));

        setTimeout(() => {
            this.calculateWin(result);
            this.isSpinning = false;
            document.getElementById('spinBtn').disabled = false;
        }, 500);
    }

    calculateWin(result) {
        let reward = 0;
        let resultType = '';

        if (result[0] === result[1] && result[1] === result[2]) {
            if (result[0] === '🎯') reward = 50;
            else if (result[0] === '🌟') reward = 30;
            else if (result[0] === '🎨') reward = 25;
            else if (result[0] === '🎮') reward = 20;
            else reward = 15;
            this.totalWins++;
            resultType = 'win';
        } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
            reward = 5;
            resultType = 'small-win';
        } else {
            resultType = 'loss';
        }

        if (reward > 0) {
            this.lastWin = reward;
            this.totalPoints += reward;
            if (this.totalPoints > this.highestScore) {
                this.highestScore = this.totalPoints;
            }
            this.saveToLeaderboard();
        }

        // Add to history
        this.history.unshift({
            symbols: result.join(' '),
            reward: reward,
            type: resultType,
            date: new Date().toISOString()
        });

        this.saveStats();
        this.updateDisplay();
        this.renderHistory();
    }

    renderHistory() {
        const historyContainer = document.getElementById('rewardsHistory');
        if (!historyContainer) return;

        if (this.history.length === 0) {
            historyContainer.innerHTML = '<p class="no-history">No spins yet. Start playing!</p>';
            return;
        }

        historyContainer.innerHTML = this.history.slice(0, 10).map((entry, index) => {
            const emoji = entry.type === 'win' ? '🏆' : entry.type === 'small-win' ? '✨' : '❌';
            const className = entry.type === 'win' ? 'win' : entry.type === 'small-win' ? 'small-win' : 'loss';
            return `
                <div class="history-item ${className}">
                    <span class="history-icon">${emoji}</span>
                    <span class="history-symbols">${entry.symbols}</span>
                    <span class="history-reward">${entry.reward > 0 ? '+' + entry.reward : '0'}</span>
                </div>
            `;
        }).join('');
    }

    saveToLeaderboard() {
        const username = localStorage.getItem('username') || 'Player';
        const leaderboard = JSON.parse(localStorage.getItem('slots_leaderboard') || '[]');
        leaderboard.push({
            name: username,
            score: this.highestScore,
            time: this.playTime,
            date: new Date().toISOString()
        });
        leaderboard.sort((a, b) => b.score - a.score);
        localStorage.setItem('slots_leaderboard', JSON.stringify(leaderboard.slice(0, 50)));
    }

    updateDisplay() {
        document.getElementById('totalPoints').textContent = this.totalPoints;
        document.getElementById('lastWin').textContent = this.lastWin;
        document.getElementById('totalSpins').textContent = this.totalSpins;
        document.getElementById('totalWins').textContent = this.totalWins;
        document.getElementById('highestScore').textContent = this.highestScore;
    }
}

let slotsGame;
document.addEventListener('DOMContentLoaded', () => {
    slotsGame = new SlotsGame();
});
