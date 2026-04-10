class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('tetrisCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.startBtn = document.getElementById('startGame');
        this.pauseBtn = document.getElementById('pauseGame');
        this.scoreDisplay = document.getElementById('score');
        this.levelDisplay = document.getElementById('level');
        this.linesDisplay = document.getElementById('lines');
        this.nextPiecesDiv = document.getElementById('nextPieces');
        
        this.cols = 10;
        this.rows = 18;
        this.blockSize = 25;
        this.canvas.width = this.cols * this.blockSize;
        this.canvas.height = this.rows * this.blockSize;
        
        this.board = [];
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.playTime = 0;
        this.playInterval = null;
        this.currentPiece = null;
        this.nextPieces = [];
        this.gameRunning = false;
        this.gamePaused = false;
        this.dropInterval = 800;
        this.lastDrop = 0;
        
        this.colors = ['#0ff', '#00f', '#f80', '#ff0', '#0f0', '#f0f', '#f00'];
        this.shapes = [
            [[1,1,1,1]], [[1,1],[1,1]], [[0,1,0],[1,1,1]],
            [[1,0,0],[1,1,1]], [[0,0,1],[1,1,1]],
            [[0,1,1],[1,1,0]], [[1,1,0],[0,1,1]]
        ];
        
        this.init();
    }
    
    init() {
        this.initBoard();
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        document.addEventListener('keydown', e => this.handleKeyPress(e));
        
        // Add touch control button listeners
        this.addButtonControls();
    }
    
    addButtonControls() {
        const rotateBtn = document.getElementById('rotateBtn');
        const dropBtn = document.getElementById('dropBtn');
        const leftBtn = document.getElementById('leftBtn');
        const downBtn = document.getElementById('downBtn');
        const rightBtn = document.getElementById('rightBtn');
        
        if (rotateBtn) {
            rotateBtn.addEventListener('click', () => {
                if (this.gameRunning && !this.gamePaused) this.rotatePiece();
            });
            rotateBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (this.gameRunning && !this.gamePaused) this.rotatePiece();
            });
        }
        
        if (dropBtn) {
            dropBtn.addEventListener('click', () => {
                if (this.gameRunning && !this.gamePaused) this.hardDrop();
            });
            dropBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (this.gameRunning && !this.gamePaused) this.hardDrop();
            });
        }
        
        if (leftBtn) {
            leftBtn.addEventListener('click', () => {
                if (this.gameRunning && !this.gamePaused) this.movePiece(-1, 0);
            });
            leftBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (this.gameRunning && !this.gamePaused) this.movePiece(-1, 0);
            });
        }
        
        if (downBtn) {
            downBtn.addEventListener('click', () => {
                if (this.gameRunning && !this.gamePaused) this.movePiece(0, 1);
            });
            downBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (this.gameRunning && !this.gamePaused) this.movePiece(0, 1);
            });
        }
        
        if (rightBtn) {
            rightBtn.addEventListener('click', () => {
                if (this.gameRunning && !this.gamePaused) this.movePiece(1, 0);
            });
            rightBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (this.gameRunning && !this.gamePaused) this.movePiece(1, 0);
            });
        }
    }
    
    initBoard() {
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
    }
    
    startGame() {
        const username = localStorage.getItem('username');
        if (!username) {
            this.showCustomAlert('Please set username on home page!');
            return;
        }
        
        this.initBoard();
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.playTime = 0;
        this.gameRunning = true;
        this.gamePaused = false;
        this.startBtn.style.display = 'none';
        this.pauseBtn.style.display = 'block';
        
        this.nextPieces = [];
        for (let i = 0; i < 3; i++) this.nextPieces.push(this.generatePiece());
        
        this.spawnPiece();
        this.updateDisplay();
        this.renderNextPieces();
        this.startPlayTimer();
        this.gameLoop();
    }
    
    startPlayTimer() {
        this.playInterval = setInterval(() => {
            if (!this.gamePaused) this.playTime++;
        }, 1000);
    }
    
    generatePiece() {
        const shapeIndex = Math.floor(Math.random() * this.shapes.length);
        return { shape: this.shapes[shapeIndex], color: this.colors[shapeIndex] };
    }
    
    spawnPiece() {
        const piece = this.nextPieces.shift();
        this.nextPieces.push(this.generatePiece());
        this.currentPiece = { ...piece, x: Math.floor(this.cols / 2) - 1, y: 0 };
        this.renderNextPieces();
    }
    
    renderNextPieces() {
        this.nextPiecesDiv.innerHTML = '';
        this.nextPieces.slice(0, 2).forEach(piece => {
            const canvas = document.createElement('canvas');
            canvas.className = 'next-preview';
            canvas.width = 80;
            canvas.height = 80;
            const ctx = canvas.getContext('2d');
            const blockSize = 16;
            const offsetX = (80 - piece.shape[0].length * blockSize) / 2;
            const offsetY = (80 - piece.shape.length * blockSize) / 2;
            ctx.fillStyle = piece.color;
            piece.shape.forEach((row, y) => {
                row.forEach((val, x) => {
                    if (val) ctx.fillRect(offsetX + x * blockSize, offsetY + y * blockSize, blockSize - 1, blockSize - 1);
                });
            });
            this.nextPiecesDiv.appendChild(canvas);
        });
    }
    
    handleKeyPress(e) {
        if (!this.gameRunning || this.gamePaused) return;
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
            e.preventDefault();
        }
        
        switch (e.key) {
            case 'ArrowLeft': this.movePiece(-1, 0); break;
            case 'ArrowRight': this.movePiece(1, 0); break;
            case 'ArrowDown': this.movePiece(0, 1); break;
            case 'ArrowUp': this.rotatePiece(); break;
            case ' ': this.hardDrop(); break;
        }
    }
    
    movePiece(dx, dy) {
        if (!this.canMove(dx, dy)) return false;
        this.currentPiece.x += dx;
        this.currentPiece.y += dy;
        return true;
    }
    
    canMove(dx, dy) {
        const newX = this.currentPiece.x + dx;
        const newY = this.currentPiece.y + dy;
        
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardX = newX + x;
                    const boardY = newY + y;
                    if (boardX < 0 || boardX >= this.cols || boardY >= this.rows) return false;
                    if (boardY >= 0 && this.board[boardY][boardX]) return false;
                }
            }
        }
        return true;
    }
    
    rotatePiece() {
        const rotated = this.currentPiece.shape[0].map((val, i) =>
            this.currentPiece.shape.map(row => row[i]).reverse()
        );
        const oldShape = this.currentPiece.shape;
        this.currentPiece.shape = rotated;
        if (!this.canMove(0, 0)) this.currentPiece.shape = oldShape;
    }
    
    hardDrop() {
        while (this.movePiece(0, 1)) {}
    }
    
    lockPiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardY = this.currentPiece.y + y;
                    const boardX = this.currentPiece.x + x;
                    if (boardY >= 0) this.board[boardY][boardX] = this.currentPiece.color;
                }
            }
        }
        
        this.clearLines();
        this.spawnPiece();
        if (!this.canMove(0, 0)) this.gameOver();
    }
    
    clearLines() {
        let linesCleared = 0;
        for (let y = this.rows - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.cols).fill(0));
                linesCleared++;
                y++;
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += linesCleared * 100 * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(200, 800 - this.level * 80);
            this.updateDisplay();
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        clearInterval(this.playInterval);
        this.startBtn.style.display = 'block';
        this.pauseBtn.style.display = 'none';
        this.saveScore();
        
        const mins = Math.floor(this.playTime / 60);
        const secs = (this.playTime % 60).toString().padStart(2, '0');
        this.showGameOverModal(this.score, `${mins}:${secs}`);
    }
    
    showCustomAlert(message) {
        const modal = document.createElement('div');
        modal.className = 'game-over-modal';
        modal.innerHTML = `
            <div class="game-over-content">
                <h2>⚠️ Notice</h2>
                <p>${message}</p>
                <button class="play-again-btn" onclick="this.closest('.game-over-modal').remove()">OK</button>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    showGameOverModal(score, time) {
        const modal = document.createElement('div');
        modal.className = 'game-over-modal';
        
        // Add confetti particles
        let confettiHTML = '';
        for (let i = 0; i < 20; i++) {
            const left = Math.random() * 100;
            const delay = Math.random() * 3;
            const color = ['#ff0080', '#00ffff', '#ffff00', '#0f0'][Math.floor(Math.random() * 4)];
            confettiHTML += `<div class="confetti" style="left:${left}%;animation-delay:${delay}s;background:${color}"></div>`;
        }
        
        modal.innerHTML = `
            <div class="game-over-content">
                ${confettiHTML}
                <h2>🎮 GAME OVER! 🎮</h2>
                <div class="game-over-stats">
                    <p><span>🏆 Final Score</span><span class="score-value">${score}</span></p>
                    <p><span>⏱️ Time Played</span><span class="score-value">${time}</span></p>
                    <p><span>📊 Lines Cleared</span><span class="score-value">${this.lines}</span></p>
                    <p><span>🎯 Level Reached</span><span class="score-value">${this.level}</span></p>
                </div>
                <button class="play-again-btn" onclick="location.reload()">
                    🔄 PLAY AGAIN
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    saveScore() {
        const username = localStorage.getItem('username') || 'Player';
        const leaderboard = JSON.parse(localStorage.getItem('tetris_leaderboard') || '[]');
        leaderboard.push({
            name: username,
            score: this.score,
            time: this.playTime,
            date: new Date().toISOString()
        });
        leaderboard.sort((a, b) => b.score - a.score);
        localStorage.setItem('tetris_leaderboard', JSON.stringify(leaderboard.slice(0, 50)));
    }
    
    togglePause() {
        this.gamePaused = !this.gamePaused;
        this.pauseBtn.textContent = this.gamePaused ? 'RESUME' : 'PAUSE';
    }
    
    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.board[y][x]) {
                    this.ctx.fillStyle = this.board[y][x];
                    this.ctx.fillRect(x * this.blockSize, y * this.blockSize, this.blockSize - 1, this.blockSize - 1);
                }
            }
        }
        
        if (this.currentPiece) {
            this.ctx.fillStyle = this.currentPiece.color;
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x]) {
                        this.ctx.fillRect(
                            (this.currentPiece.x + x) * this.blockSize,
                            (this.currentPiece.y + y) * this.blockSize,
                            this.blockSize - 1,
                            this.blockSize - 1
                        );
                    }
                }
            }
        }
    }
    
    gameLoop(timestamp = 0) {
        if (!this.gameRunning) return;
        
        if (!this.gamePaused) {
            if (timestamp - this.lastDrop > this.dropInterval) {
                if (!this.movePiece(0, 1)) this.lockPiece();
                this.lastDrop = timestamp;
            }
            this.draw();
        }
        
        requestAnimationFrame(t => this.gameLoop(t));
    }
    
    updateDisplay() {
        this.scoreDisplay.textContent = this.score;
        this.levelDisplay.textContent = this.level;
        this.linesDisplay.textContent = this.lines;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TetrisGame();
});
