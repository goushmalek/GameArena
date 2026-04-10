class MinesGame{constructor(){this.grid=document.getElementById('minesGrid');this.startBtn=document.getElementById('startGame');this.collectBtn=document.getElementById('collectReward');this.newRoundBtn=document.getElementById('newRound');this.minesCountSelect=document.getElementById('minesCount');this.gameStatus=document.getElementById('gameStatus');this.totalPointsDisplay=document.getElementById('totalPoints');this.roundPointsDisplay=document.getElementById('roundPoints');this.diamondsFoundDisplay=document.getElementById('diamondsFound');this.highestScoreDisplay=document.getElementById('highestScore');this.roundsPlayedDisplay=document.getElementById('roundsPlayed');this.totalPoints=100;this.entryCost=10;this.roundPoints=0;this.diamondsFound=0;this.highestScore=100;this.roundsPlayed=0;this.gameActive=!1;this.totalTiles=25;this.minePositions=[];this.revealedTiles=[];this.pointsPerDiamond=10;this.init()}init(){this.createGrid();this.loadStats();this.startBtn.addEventListener('click',()=>this.startGame());this.collectBtn.addEventListener('click',()=>this.collectReward());this.newRoundBtn.addEventListener('click',()=>this.newRound())}createGrid(){this.grid.innerHTML='';for(let i=0;i<this.totalTiles;i++){const tile=document.createElement('div');tile.className='mine-tile disabled';tile.dataset.index=i;tile.addEventListener('click',()=>this.revealTile(i));this.grid.appendChild(tile)}}startGame(){if(this.entryCost>this.totalPoints){alert('Not enough points! You need 10 points to play.');return}if(this.gameActive)return;this.totalPoints-=this.entryCost;this.gameActive=!0;this.roundPoints=0;this.diamondsFound=0;this.revealedTiles=[];this.roundsPlayed++;this.placeMines();this.enableTiles();this.gameStatus.textContent='Find diamonds! Collect reward anytime!';this.minesCountSelect.disabled=!0;this.startBtn.disabled=!0;this.collectBtn.style.display='block';this.newRoundBtn.style.display='none';this.updateDisplay()}placeMines(){const minesCount=parseInt(this.minesCountSelect.value);this.minePositions=[];while(this.minePositions.length<minesCount){const pos=Math.floor(Math.random()*this.totalTiles);if(!this.minePositions.includes(pos))this.minePositions.push(pos)}}enableTiles(){const tiles=document.querySelectorAll('.mine-tile');tiles.forEach(tile=>{tile.classList.remove('disabled','revealed','safe','mine');tile.textContent=''})}revealTile(index){if(!this.gameActive||this.revealedTiles.includes(index))return;const tile=document.querySelector(`[data-index="${index}"]`);tile.classList.add('revealed');this.revealedTiles.push(index);if(this.minePositions.includes(index)){tile.classList.add('mine');tile.textContent='💣';this.gameOver(!1)}else{tile.classList.add('safe');tile.textContent='💎';this.diamondsFound++;this.roundPoints+=this.pointsPerDiamond;this.updateDisplay()}}collectReward(){if(!this.gameActive)return;this.totalPoints+=this.entryCost+this.roundPoints;this.gameStatus.textContent=`✅ Reward collected! Earned ${this.roundPoints} points!`;this.endRound()}gameOver(won){this.gameActive=!1;this.disableTiles();this.revealAllMines();this.gameStatus.textContent=`💥 Mine hit! Lost ${this.entryCost} points from entry.`;this.collectBtn.style.display='none';this.minesCountSelect.disabled=!1;this.startBtn.disabled=!1;this.newRoundBtn.style.display='block';if(this.totalPoints>this.highestScore)this.highestScore=this.totalPoints;this.updateDisplay();this.saveStats()}endRound(){this.gameActive=!1;this.disableTiles();this.collectBtn.style.display='none';this.minesCountSelect.disabled=!1;this.startBtn.disabled=!1;this.newRoundBtn.style.display='block';if(this.totalPoints>this.highestScore)this.highestScore=this.totalPoints;this.updateDisplay();this.saveStats()}revealAllMines(){const tiles=document.querySelectorAll('.mine-tile');this.minePositions.forEach(pos=>{const tile=tiles[pos];if(!tile.classList.contains('revealed')){tile.classList.add('revealed','mine');tile.textContent='💣'}})}disableTiles(){document.querySelectorAll('.mine-tile').forEach(tile=>tile.classList.add('disabled'))}newRound(){this.roundPoints=0;this.diamondsFound=0;this.revealedTiles=[];this.createGrid();this.gameStatus.textContent='Start game to play! Costs 10 points per round.';this.collectBtn.style.display='none';this.newRoundBtn.style.display='none';this.updateDisplay()}updateDisplay(){this.totalPointsDisplay.textContent=this.totalPoints;this.roundPointsDisplay.textContent=this.roundPoints;this.diamondsFoundDisplay.textContent=this.diamondsFound;this.highestScoreDisplay.textContent=this.highestScore;this.roundsPlayedDisplay.textContent=this.roundsPlayed}saveStats(){localStorage.setItem('mines_totalPoints',this.totalPoints);localStorage.setItem('mines_highestScore',this.highestScore);localStorage.setItem('mines_roundsPlayed',this.roundsPlayed)}loadStats(){this.totalPoints=parseInt(localStorage.getItem('mines_totalPoints')||'100');this.highestScore=parseInt(localStorage.getItem('mines_highestScore')||'100');this.roundsPlayed=parseInt(localStorage.getItem('mines_roundsPlayed')||'0');this.updateDisplay()}}document.addEventListener('DOMContentLoaded',()=>{new MinesGame()});

// Save to leaderboard on game end
MinesGame.prototype.saveToLeaderboard = function() {
    const username = localStorage.getItem('username') || 'Player';
    const leaderboard = JSON.parse(localStorage.getItem('mines_leaderboard') || '[]');
    
    leaderboard.push({
        name: username,
        score: this.highestScore,
        time: this.playTime || 0,
        date: new Date().toISOString()
    });
    
    leaderboard.sort((a,b) => b.score - a.score);
    localStorage.setItem('mines_leaderboard', JSON.stringify(leaderboard.slice(0, 50)));
};

// Track play time
MinesGame.prototype.startPlayTimeTracking = function() {
    if (!this.playTimeInterval) {
        this.playTime = parseInt(localStorage.getItem('mines_totalPlayTime') || '0');
        this.playTimeInterval = setInterval(() => {
            this.playTime++;
            localStorage.setItem('mines_totalPlayTime', this.playTime);
        }, 1000);
    }
};

// Update game over to save leaderboard
const originalEndRound = MinesGame.prototype.endRound;
MinesGame.prototype.endRound = function() {
    originalEndRound.call(this);
    this.saveToLeaderboard();
};

const originalGameOver = MinesGame.prototype.gameOver;
MinesGame.prototype.gameOver = function(won) {
    originalGameOver.call(this, won);
    this.saveToLeaderboard();
};

// Start tracking on game start
const originalStartGame = MinesGame.prototype.startGame;
MinesGame.prototype.startGame = function() {
    originalStartGame.call(this);
    this.startPlayTimeTracking();
};

// Add history tracking
MinesGame.prototype.initHistory = function() {
    this.history = JSON.parse(localStorage.getItem('mines_history') || '[]');
    this.renderHistory();
};

MinesGame.prototype.renderHistory = function() {
    const historyContainer = document.getElementById('minesHistory');
    if (!historyContainer) return;

    if (this.history.length === 0) {
        historyContainer.innerHTML = '<p class="no-history">No games played yet!</p>';
        return;
    }

    historyContainer.innerHTML = this.history.slice(0, 10).map((entry, index) => {
        const emoji = entry.result === 'win' ? '🏆' : '💥';
        const className = entry.result === 'win' ? 'win' : 'loss';
        return `
            <div class="history-item ${className}">
                <span class="history-icon">${emoji}</span>
                <div class="history-details">
                    <span class="history-time">💎 ${entry.diamonds} Diamonds</span>
                    <span class="history-moves">Difficulty: ${entry.difficulty}</span>
                </div>
                <span class="history-score">${entry.points > 0 ? '+' : ''}${entry.points}</span>
            </div>
        `;
    }).join('');
};

MinesGame.prototype.addToHistory = function(result, diamonds, points, difficulty) {
    this.history.unshift({
        result: result,
        diamonds: diamonds,
        points: points,
        difficulty: difficulty,
        date: new Date().toISOString()
    });
    localStorage.setItem('mines_history', JSON.stringify(this.history.slice(0, 10)));
    this.renderHistory();
};

// Update game over to add history
const originalMinesGameOver = MinesGame.prototype.gameOver;
MinesGame.prototype.gameOver = function(won) {
    const difficulty = document.getElementById('minesCount').options[document.getElementById('minesCount').selectedIndex].text;
    this.addToHistory(won ? 'win' : 'loss', this.diamondsFound, won ? this.roundPoints : -10, difficulty);
    originalMinesGameOver.call(this, won);
};

// Initialize history on game creation
const originalMinesInit = MinesGame.prototype.init;
MinesGame.prototype.init = function() {
    originalMinesInit.call(this);
    this.initHistory();
};
