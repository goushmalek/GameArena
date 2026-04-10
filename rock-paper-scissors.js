// Rock-Paper-Scissors - Complete Game with Leaderboard - NO EXTERNAL MESSAGES
const choices = ['rock', 'paper', 'scissors'];
const choiceEmojis = {rock: '🪨', paper: '📄', scissors: '✂️'};
let playerScore = 0;
let computerScore = 0;
let drawScore = 0;

// Leaderboard tracking
let rpsStartTime = Date.now();
let rpsTotalTime = 0;
let rpsGamesPlayed = 0;

// Load saved data
function loadRPSData() {
    const username = localStorage.getItem('username') || 'Player';
    const leaderboard = JSON.parse(localStorage.getItem('rps_leaderboard') || '[]');
    const playerData = leaderboard.find(p => p.name === username);
    
    if (playerData) {
        rpsTotalTime = playerData.time || 0;
        rpsGamesPlayed = playerData.score || 0;
    }
}

// Save to leaderboard
function saveRPSToLeaderboard() {
    const username = localStorage.getItem('username') || 'Player';
    const leaderboard = JSON.parse(localStorage.getItem('rps_leaderboard') || '[]');
    
    const gameTime = Math.floor((Date.now() - rpsStartTime) / 1000);
    rpsTotalTime += gameTime;
    rpsGamesPlayed++;
    rpsStartTime = Date.now();
    
    let playerData = leaderboard.find(p => p.name === username);
    if (playerData) {
        playerData.score = rpsGamesPlayed;
        playerData.time = rpsTotalTime;
        playerData.date = new Date().toISOString();
    } else {
        leaderboard.push({
            name: username,
            score: rpsGamesPlayed,
            time: rpsTotalTime,
            date: new Date().toISOString()
        });
    }
    
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem('rps_leaderboard', JSON.stringify(leaderboard.slice(0, 50)));
}

// Get computer choice
function getComputerChoice() {
    return choices[Math.floor(Math.random() * choices.length)];
}

// Determine winner
function determineWinner(playerChoice, computerChoice) {
    if (playerChoice === computerChoice) return 'draw';
    if (
        (playerChoice === 'rock' && computerChoice === 'scissors') ||
        (playerChoice === 'paper' && computerChoice === 'rock') ||
        (playerChoice === 'scissors' && computerChoice === 'paper')
    ) {
        return 'player';
    }
    return 'computer';
}

// Play game
function playGame(playerChoice) {
    const computerChoice = getComputerChoice();
    const result = determineWinner(playerChoice, computerChoice);
    
    // Update scores
    if (result === 'player') playerScore++;
    else if (result === 'computer') computerScore++;
    else drawScore++;
    
    // Update display - ONLY in game area
    updateDisplay(playerChoice, computerChoice, result);
    updateScores();
    
    // Save to leaderboard
    saveRPSToLeaderboard();
}

// Update display - ONLY updates elements inside the game container
function updateDisplay(playerChoice, computerChoice, result) {
    const choicesDisplay = document.getElementById('rps-choices-display');
    const resultDisplay = document.getElementById('rps-result');
    const statusDisplay = document.getElementById('rps-status');
    
    if (choicesDisplay) {
        choicesDisplay.innerHTML = `
            <div class="choice-display">
                <span>You: ${choiceEmojis[playerChoice]}</span>
                <span>vs</span>
                <span>Computer: ${choiceEmojis[computerChoice]}</span>
            </div>
        `;
    }
    
    if (resultDisplay) {
        let message = '';
        if (result === 'player') {
            message = '🎉 You Win!';
            resultDisplay.className = 'result-display win';
        } else if (result === 'computer') {
            message = '😔 Computer Wins!';
            resultDisplay.className = 'result-display loss';
        } else {
            message = '🤝 Draw!';
            resultDisplay.className = 'result-display draw';
        }
        resultDisplay.textContent = message;
    }
    
    if (statusDisplay) {
        statusDisplay.textContent = 'Make your next choice!';
    }
}

// Update scores
function updateScores() {
    const playerScoreEl = document.getElementById('rps-score-player');
    const computerScoreEl = document.getElementById('rps-score-computer');
    const drawScoreEl = document.getElementById('rps-score-draw');
    
    if (playerScoreEl) playerScoreEl.textContent = playerScore;
    if (computerScoreEl) computerScoreEl.textContent = computerScore;
    if (drawScoreEl) drawScoreEl.textContent = drawScore;
}

// Reset scores
function resetScores() {
    playerScore = 0;
    computerScore = 0;
    drawScore = 0;
    updateScores();
    
    const choicesDisplay = document.getElementById('rps-choices-display');
    const resultDisplay = document.getElementById('rps-result');
    if (choicesDisplay) choicesDisplay.innerHTML = '';
    if (resultDisplay) {
        resultDisplay.textContent = '';
        resultDisplay.className = 'result-display';
    }
    
    const statusDisplay = document.getElementById('rps-status');
    if (statusDisplay) statusDisplay.textContent = 'Make Your Choice!';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadRPSData();
    rpsStartTime = Date.now();
    
    // Block any elements being added directly to body
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && node.parentElement === document.body) {
                    const allowedClasses = ['settings-panel', 'game-page-container', 'username-modal', 'game-mode-modal', 'game-over-modal', 'slots-modal', 'confirm-modal', 'success-toast'];
                    const hasAllowedClass = allowedClasses.some(cls => node.classList && node.classList.contains(cls));
                    
                    if (!hasAllowedClass && node.tagName !== 'HEADER' && node.tagName !== 'MAIN' && node.tagName !== 'FOOTER' && node.tagName !== 'SCRIPT') {
                        node.remove();
                    }
                }
                // Also remove any direct text nodes or p tags
                if ((node.nodeType === 3 || node.tagName === 'P') && node.parentElement === document.body) {
                    node.remove();
                }
            });
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: false });
    
    // Attach button listeners
    const choiceButtons = document.querySelectorAll('.choice-btn');
    choiceButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const choice = btn.dataset.choice;
            playGame(choice);
        });
    });
    
    // Reset button
    const resetBtn = document.getElementById('rps-reset');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetScores);
    }
});

// Prevent any alert, confirm, or prompt from showing
window.alert = function() { return true; };
window.confirm = function() { return true; };
window.prompt = function() { return null; };
