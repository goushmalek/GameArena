// Tic-Tac-Toe Game with AI - Complete Fixed Version
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = false;
let gameMode = null;
let playerSymbol = 'X';
let aiSymbol = 'O';
let playerName = localStorage.getItem('username') || 'Player';
let tttStartTime = Date.now();
let tttTotalTime = parseInt(localStorage.getItem('ttt_totalTime') || '0');

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

function initGame() {
    hideActionButtons();
    showModeSelection();
}

function showModeSelection() {
    const modal = document.createElement('div');
    modal.className = 'game-mode-modal';
    modal.id = 'gameModeModal';
    modal.innerHTML = `
        <div class="mode-modal-content">
            <h2>🎮 Select Game Mode</h2>
            <div class="mode-buttons">
                <button class="mode-btn" onclick="selectMode('pvp')">
                    <span class="mode-icon">👥</span>
                    <span class="mode-title">2 Players</span>
                    <span class="mode-desc">Play with a friend</span>
                </button>
                <button class="mode-btn" onclick="selectMode('ai')">
                    <span class="mode-icon">🤖</span>
                    <span class="mode-title">vs Computer</span>
                    <span class="mode-desc">Play against AI</span>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function selectMode(mode) {
    gameMode = mode;
    document.getElementById('gameModeModal')?.remove();
    
    if (mode === 'ai') {
        showSymbolSelection();
    } else {
        startGame();
    }
}

function showSymbolSelection() {
    const modal = document.createElement('div');
    modal.className = 'game-mode-modal';
    modal.id = 'symbolModal';
    modal.innerHTML = `
        <div class="mode-modal-content">
            <h2>Choose Your Symbol</h2>
            <div class="symbol-buttons">
                <button class="symbol-btn" onclick="selectSymbol('X')">
                    <span class="symbol-large">❌</span>
                    <span>Play as X</span>
                    <span class="symbol-note">You go first</span>
                </button>
                <button class="symbol-btn" onclick="selectSymbol('O')">
                    <span class="symbol-large">⭕</span>
                    <span>Play as O</span>
                    <span class="symbol-note">Computer goes first</span>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function selectSymbol(symbol) {
    playerSymbol = symbol;
    aiSymbol = symbol === 'X' ? 'O' : 'X';
    currentPlayer = 'X';
    document.getElementById('symbolModal')?.remove();
    startGame();
    
    if (playerSymbol === 'O') {
        setTimeout(aiMove, 500);
    }
}

function startGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    tttStartTime = Date.now();
    hideActionButtons();
    renderBoard();
    updateStatus();
}

function renderBoard() {
    const boardElement = document.getElementById('ttt-board');
    if (!boardElement) return;
    
    boardElement.innerHTML = board.map((cell, index) => `
        <div class="cell ${cell}" onclick="handleCellClick(${index})" data-cell="${index}">
            ${cell === 'X' ? '❌' : cell === 'O' ? '⭕' : ''}
        </div>
    `).join('');
}

function handleCellClick(index) {
    if (!gameActive || board[index] !== '') return;
    if (gameMode === 'ai' && currentPlayer !== playerSymbol) return;
    
    board[index] = currentPlayer;
    renderBoard();
    
    if (checkWinner()) {
        endGame(currentPlayer);
        return;
    }
    
    if (board.every(cell => cell !== '')) {
        endGame('draw');
        return;
    }
    
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatus();
    
    if (gameMode === 'ai' && currentPlayer === aiSymbol && gameActive) {
        setTimeout(aiMove, 500);
    }
}

function aiMove() {
    if (!gameActive) return;
    
    let move = findWinningMove(aiSymbol);
    if (move === -1) move = findWinningMove(playerSymbol);
    if (move === -1 && board[4] === '') move = 4;
    if (move === -1) move = findRandomCorner();
    if (move === -1) move = board.findIndex(cell => cell === '');
    
    if (move !== -1) {
        board[move] = aiSymbol;
        renderBoard();
        
        if (checkWinner()) {
            endGame(aiSymbol);
            return;
        }
        
        if (board.every(cell => cell !== '')) {
            endGame('draw');
            return;
        }
        
        currentPlayer = playerSymbol;
        updateStatus();
    }
}

function findWinningMove(symbol) {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (board[a] === symbol && board[b] === symbol && board[c] === '') return c;
        if (board[a] === symbol && board[c] === symbol && board[b] === '') return b;
        if (board[b] === symbol && board[c] === symbol && board[a] === '') return a;
    }
    return -1;
}

function findRandomCorner() {
    const corners = [0, 2, 6, 8].filter(i => board[i] === '');
    return corners.length > 0 ? corners[Math.floor(Math.random() * corners.length)] : -1;
}

function checkWinner() {
    return winningConditions.some(condition => {
        const [a, b, c] = condition;
        return board[a] && board[a] === board[b] && board[a] === board[c];
    });
}

function updateStatus() {
    const statusElement = document.getElementById('gameStatus');
    if (!statusElement) return;
    
    if (gameMode === 'ai') {
        if (currentPlayer === playerSymbol) {
            statusElement.textContent = `${playerName}'s turn (${playerSymbol})`;
            statusElement.className = 'game-status player-turn';
        } else {
            statusElement.textContent = `Computer's turn (${aiSymbol})`;
            statusElement.className = 'game-status ai-turn';
        }
    } else {
        statusElement.textContent = `Player ${currentPlayer}'s turn`;
        statusElement.className = 'game-status';
    }
}

function endGame(winner) {
    gameActive = false;
    
    const gameTime = Math.floor((Date.now() - tttStartTime) / 1000);
    tttTotalTime += gameTime;
    localStorage.setItem('ttt_totalTime', tttTotalTime);
    
    addToHistory(winner);
    saveToLeaderboard(winner);
    updateScoreboard(winner);
    showResultModal(winner);
}

function updateScoreboard(winner) {
    const playerXElement = document.querySelector('.score-item:nth-child(1) .score-value');
    const playerOElement = document.querySelector('.score-item:nth-child(3) .score-value');
    const drawsElement = document.querySelector('.score-item:nth-child(2) .score-value');
    
    if (!playerXElement || !playerOElement || !drawsElement) return;
    
    let xWins = parseInt(playerXElement.textContent) || 0;
    let oWins = parseInt(playerOElement.textContent) || 0;
    let draws = parseInt(drawsElement.textContent) || 0;
    
    if (winner === 'X') xWins++;
    else if (winner === 'O') oWins++;
    else if (winner === 'draw') draws++;
    
    playerXElement.textContent = xWins;
    playerOElement.textContent = oWins;
    drawsElement.textContent = draws;
    
    if (gameMode === 'ai') {
        const player1Label = document.querySelector('.score-item:nth-child(1) .score-label');
        const player2Label = document.querySelector('.score-item:nth-child(3) .score-label');
        if (player1Label && player2Label) {
            if (playerSymbol === 'X') {
                player1Label.textContent = playerName;
                player2Label.textContent = 'Computer';
            } else {
                player1Label.textContent = 'Computer';
                player2Label.textContent = playerName;
            }
        }
    }
}

function addToHistory(winner) {
    const history = JSON.parse(localStorage.getItem('ttt_history') || '[]');
    
    let result, opponent;
    if (gameMode === 'ai') {
        opponent = 'Computer';
        if (winner === 'draw') result = 'draw';
        else result = (winner === playerSymbol) ? 'win' : 'loss';
    } else {
        opponent = '2 Players';
        result = winner === 'draw' ? 'draw' : 'win';
    }
    
    history.unshift({
        result: result,
        winner: winner,
        opponent: opponent,
        mode: gameMode,
        date: new Date().toISOString()
    });
    
    localStorage.setItem('ttt_history', JSON.stringify(history.slice(0, 20)));
    renderHistory();
}

function renderHistory() {
    const historyContainer = document.getElementById('tttHistory');
    if (!historyContainer) return;
    
    const history = JSON.parse(localStorage.getItem('ttt_history') || '[]');
    
    if (history.length === 0) {
        historyContainer.innerHTML = '<p class="no-history">No games played yet!</p>';
        return;
    }
    
    historyContainer.innerHTML = history.slice(0, 12).map(entry => {
        let emoji, resultText;
        if (entry.result === 'win') {
            emoji = '🏆';
            resultText = entry.mode === 'ai' ? 'You Won!' : `${entry.winner} Won!`;
        } else if (entry.result === 'loss') {
            emoji = '😔';
            resultText = 'Computer Won';
        } else {
            emoji = '🤝';
            resultText = 'Draw';
        }
        
        return `
            <div class="ttt-history-item ${entry.result}">
                <div class="history-result">${emoji}</div>
                <div class="history-opponent">${resultText}</div>
                <div class="history-mode">vs ${entry.opponent}</div>
            </div>
        `;
    }).join('');
}

function saveToLeaderboard(winner) {
    const username = localStorage.getItem('username') || 'Player';
    const leaderboard = JSON.parse(localStorage.getItem('tictactoe_leaderboard') || '[]');
    
    let playerData = leaderboard.find(p => p.name === username);
    if (playerData) {
        playerData.score++;
        playerData.time = tttTotalTime;
        playerData.date = new Date().toISOString();
    } else {
        leaderboard.push({
            name: username,
            score: 1,
            time: tttTotalTime,
            date: new Date().toISOString()
        });
    }
    
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem('tictactoe_leaderboard', JSON.stringify(leaderboard.slice(0, 50)));
}

function showResultModal(winner) {
    const modal = document.createElement('div');
    
    // Determine modal type for styling
    let modalType = 'draw-modal';
    let title, message, emoji;
    
    if (winner === 'draw') {
        modalType = 'draw-modal';
        emoji = '🤝';
        title = 'DRAW!';
        message = "It's a tie!";
    } else if (gameMode === 'ai') {
        if (winner === playerSymbol) {
            modalType = 'win-modal';
            emoji = '🎉';
            title = 'YOU WIN!';
            message = 'You beat the computer!';
        } else {
            modalType = 'lose-modal';
            emoji = '😔';
            title = 'COMPUTER WINS!';
            message = 'Better luck next time!';
        }
    } else {
        modalType = 'win-modal';
        emoji = '🏆';
        title = `PLAYER ${winner} WINS!`;
        message = 'Congratulations!';
    }
    
    modal.className = `game-over-modal ${modalType}`;
    
    // Add confetti for wins
    let confettiHTML = '';
    if (modalType === 'win-modal') {
        for (let i = 0; i < 15; i++) {
            const left = Math.random() * 100;
            const delay = Math.random() * 2;
            const color = ['#0f0', '#0ff', '#ff0'][Math.floor(Math.random() * 3)];
            confettiHTML += `<div class="confetti" style="left:${left}%;animation-delay:${delay}s;background:${color}"></div>`;
        }
    }
    
    modal.innerHTML = `
        <div class="game-over-content">
            ${confettiHTML}
            <h2>${emoji} ${title} ${emoji}</h2>
            <div class="game-over-stats">
                <p style="font-size:1.4rem;justify-content:center;background:rgba(0,255,255,.15);padding:1.5rem;border-radius:12px;">
                    ${message}
                </p>
            </div>
            <button class="close-modal-btn" onclick="this.closest('.game-over-modal').remove()">
                ✕ CLOSE
            </button>
        </div>
    `;
    document.body.appendChild(modal);
    showActionButtons();
}

function showActionButtons() {
    const playAgainBtn = document.getElementById('ttt-play-again');
    const changeModeBtn = document.getElementById('ttt-change-mode');
    if (playAgainBtn) playAgainBtn.style.display = 'inline-block';
    if (changeModeBtn) changeModeBtn.style.display = 'inline-block';
}

function hideActionButtons() {
    const playAgainBtn = document.getElementById('ttt-play-again');
    const changeModeBtn = document.getElementById('ttt-change-mode');
    if (playAgainBtn) playAgainBtn.style.display = 'none';
    if (changeModeBtn) changeModeBtn.style.display = 'none';
}

function resetGame() {
    document.querySelector('.game-over-modal')?.remove();
    hideActionButtons();
    
    if (gameMode === 'ai') {
        startGame();
        if (playerSymbol === 'O') {
            setTimeout(aiMove, 500);
        }
    } else {
        startGame();
    }
}

function changeMode() {
    document.querySelector('.game-over-modal')?.remove();
    hideActionButtons();
    gameMode = null;
    playerSymbol = 'X';
    aiSymbol = 'O';
    showModeSelection();
}

document.addEventListener('DOMContentLoaded', () => {
    // Block any elements being added directly to body (like RPS)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && node.parentElement === document.body) {
                    const allowedClasses = ['settings-btn', 'settings-panel', 'game-page-container', 'username-modal', 'game-mode-modal', 'game-over-modal', 'slots-modal', 'confirm-modal', 'success-toast'];
                    const hasAllowedClass = allowedClasses.some(cls => node.classList && node.classList.contains(cls));
                    const allowedTags = ['HEADER', 'MAIN', 'FOOTER', 'SCRIPT'];
                    
                    if (!hasAllowedClass && !allowedTags.includes(node.tagName)) {
                        node.remove();
                    }
                }
                // Remove any direct text nodes or p tags
                if ((node.nodeType === 3 || node.tagName === 'P') && node.parentElement === document.body) {
                    node.remove();
                }
            });
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: false });
    
    initGame();
    renderHistory();
    
    const playAgainBtn = document.getElementById('ttt-play-again');
    const changeModeBtn = document.getElementById('ttt-change-mode');
    const resetBtn = document.getElementById('ttt-reset');
    
    if (playAgainBtn) playAgainBtn.addEventListener('click', resetGame);
    if (changeModeBtn) changeModeBtn.addEventListener('click', changeMode);
    if (resetBtn) resetBtn.addEventListener('click', () => {
        const xScoreEl = document.querySelector('.score-item:nth-child(1) .score-value');
        const oScoreEl = document.querySelector('.score-item:nth-child(3) .score-value');
        const drawScoreEl = document.querySelector('.score-item:nth-child(2) .score-value');
        if (xScoreEl) xScoreEl.textContent = '0';
        if (oScoreEl) oScoreEl.textContent = '0';
        if (drawScoreEl) drawScoreEl.textContent = '0';
    });
});

// Prevent any alert, confirm, or prompt
window.alert = function() { return true; };
window.confirm = function() { return true; };
window.prompt = function() { return null; };
