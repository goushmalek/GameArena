class MemoryGame {
    constructor() {
        this.symbols = ['🎮', '🎯', '🎲', '🎨', '🎭', '🎪', '🎬', '🎸'];
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.gameStarted = false;
        this.bestTime = parseInt(localStorage.getItem('memory_bestTime') || '0');
        this.playTime = 0;
        this.history = [];
        this.init();
    }

    init() {
        this.loadHistory();
        this.updateDisplay();
        this.renderHistory();
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
    }

    loadHistory() {
        this.history = JSON.parse(localStorage.getItem('memory_history') || '[]');
    }

    startGame() {
        this.cards = this.shuffleCards([...this.symbols, ...this.symbols]);
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.timer = 0;
        this.playTime = 0;
        this.gameStarted = true;
        clearInterval(this.timerInterval);
        this.renderBoard();
        this.updateDisplay();
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.playTime++;
            this.updateDisplay();
        }, 1000);
    }

    shuffleCards(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    renderBoard() {
        const board = document.getElementById('gameBoard');
        board.innerHTML = '';
        this.cards.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.index = index;
            card.innerHTML = `<div class="card-back">${symbol}</div>`;
            card.addEventListener('click', () => this.flipCard(index));
            board.appendChild(card);
        });
    }

    flipCard(index) {
        if (!this.gameStarted || this.flippedCards.length >= 2) return;
        const card = document.querySelectorAll('.memory-card')[index];
        if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
        
        card.classList.add('flipped');
        this.flippedCards.push({index, symbol: this.cards[index], element: card});
        
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateDisplay();
            setTimeout(() => this.checkMatch(), 600);
        }
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;
        if (card1.symbol === card2.symbol) {
            card1.element.classList.add('matched');
            card2.element.classList.add('matched');
            card1.element.classList.remove('flipped');
            card2.element.classList.remove('flipped');
            this.matchedPairs++;
            this.updateDisplay();
            if (this.matchedPairs === this.symbols.length) {
                this.gameWon();
            }
        } else {
            setTimeout(() => {
                card1.element.classList.remove('flipped');
                card2.element.classList.remove('flipped');
            }, 300);
        }
        this.flippedCards = [];
    }

    showWinModal() {
        const modal = document.createElement('div');
        modal.className = 'game-over-modal';
        modal.innerHTML = `
            <div class="game-over-content">
                <h2>🎉 You Won!</h2>
                <div class="game-over-stats">
                    <p>Time: <span class="score-value">${this.formatTime(this.timer)}</span></p>
                    <p>Moves: <span class="score-value">${this.moves}</span></p>
                    <p>Best Time: <span class="score-value">${this.formatTime(this.bestTime)}</span></p>
                </div>
                <button class="play-again-btn" onclick="location.reload()">🔄 Play Again</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    gameWon() {
        clearInterval(this.timerInterval);
        this.gameStarted = false;
        
        if (this.bestTime === 0 || this.timer < this.bestTime) {
            this.bestTime = this.timer;
            localStorage.setItem('memory_bestTime', this.bestTime);
        }

        const username = localStorage.getItem('username') || 'Player';
        
        // Add to history
        this.history.unshift({
            name: username,
            time: this.timer,
            moves: this.moves,
            score: Math.max(0, 1000 - this.timer * 10 - this.moves * 5),
            date: new Date().toISOString()
        });
        localStorage.setItem('memory_history', JSON.stringify(this.history.slice(0, 10)));

        this.saveToLeaderboard();
        this.updateDisplay();
        this.renderHistory();
        
        setTimeout(() => this.showWinModal(), 500);
    }

    renderHistory() {
        const historyContainer = document.getElementById('matchHistory');
        if (!historyContainer) return;

        if (this.history.length === 0) {
            historyContainer.innerHTML = '<p class="no-history">No games played yet!</p>';
            return;
        }

        const username = localStorage.getItem('username') || 'Player';
        
        historyContainer.innerHTML = this.history.slice(0, 10).map((entry, index) => {
            const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🎮';
            const displayName = entry.name || username;
            return `
                <div class="history-item">
                    <span class="history-icon">${emoji}</span>
                    <div class="history-details">
                        <span class="history-name">👤 ${displayName}</span>
                        <div class="history-stats">
                            <span class="history-time">⏱️ ${this.formatTime(entry.time)}</span>
                            <span class="history-moves">🔄 ${entry.moves} moves</span>
                        </div>
                    </div>
                    <span class="history-score">${entry.score}</span>
                </div>
            `;
        }).join('');
    }

    saveToLeaderboard() {
        const username = localStorage.getItem('username') || 'Player';
        const leaderboard = JSON.parse(localStorage.getItem('memorymatch_leaderboard') || '[]');
        const score = Math.max(0, 1000 - this.timer * 10 - this.moves * 5);
        leaderboard.push({
            name: username,
            score: score,
            time: this.playTime,
            moves: this.moves,
            date: new Date().toISOString()
        });
        leaderboard.sort((a, b) => b.score - a.score);
        localStorage.setItem('memorymatch_leaderboard', JSON.stringify(leaderboard.slice(0, 50)));
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    updateDisplay() {
        document.getElementById('moves').textContent = this.moves;
        document.getElementById('matches').textContent = `${this.matchedPairs}/${this.symbols.length}`;
        document.getElementById('timer').textContent = this.formatTime(this.timer);
        document.getElementById('bestTime').textContent = this.bestTime ? this.formatTime(this.bestTime) : '--';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});
