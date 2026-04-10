class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('snakeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = 20;
        this.canvas.width = this.gridSize * this.tileCount;
        this.canvas.height = this.gridSize * this.tileCount;
        this.snake = [{x: 10, y: 10}];
        this.food = {x: 15, y: 15};
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('snake_highScore') || '0');
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameLoop = null;
        this.playTime = 0;
        this.playInterval = null;
        this.history = [];
        this.init();
    }

    init() {
        this.loadHistory();
        this.updateDisplay();
        this.renderHistory();
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.addEventListener('keydown', e => this.handleKeyPress(e));
        
        // Add touch control button listeners
        this.addButtonControls();
    }
    
    addButtonControls() {
        const upBtn = document.getElementById('snakeUpBtn');
        const downBtn = document.getElementById('snakeDownBtn');
        const leftBtn = document.getElementById('snakeLeftBtn');
        const rightBtn = document.getElementById('snakeRightBtn');
        
        if (upBtn) {
            upBtn.addEventListener('click', () => {
                if (this.gameRunning && !this.gamePaused && this.dy === 0) {
                    this.dx = 0;
                    this.dy = -1;
                }
            });
            upBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (this.gameRunning && !this.gamePaused && this.dy === 0) {
                    this.dx = 0;
                    this.dy = -1;
                }
            });
        }
        
        if (downBtn) {
            downBtn.addEventListener('click', () => {
                if (this.gameRunning && !this.gamePaused && this.dy === 0) {
                    this.dx = 0;
                    this.dy = 1;
                }
            });
            downBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (this.gameRunning && !this.gamePaused && this.dy === 0) {
                    this.dx = 0;
                    this.dy = 1;
                }
            });
        }
        
        if (leftBtn) {
            leftBtn.addEventListener('click', () => {
                if (this.gameRunning && !this.gamePaused && this.dx === 0) {
                    this.dx = -1;
                    this.dy = 0;
                }
            });
            leftBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (this.gameRunning && !this.gamePaused && this.dx === 0) {
                    this.dx = -1;
                    this.dy = 0;
                }
            });
        }
        
        if (rightBtn) {
            rightBtn.addEventListener('click', () => {
                if (this.gameRunning && !this.gamePaused && this.dx === 0) {
                    this.dx = 1;
                    this.dy = 0;
                }
            });
            rightBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (this.gameRunning && !this.gamePaused && this.dx === 0) {
                    this.dx = 1;
                    this.dy = 0;
                }
            });
        }
    }

    loadHistory() {
        this.history = JSON.parse(localStorage.getItem('snake_history') || '[]');
    }

    startGame() {
        if (this.gameRunning) return;
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.dx = 1;
        this.dy = 0;
        this.score = 0;
        this.playTime = 0;
        this.gameRunning = true;
        this.gamePaused = false;
        document.getElementById('startBtn').style.display = 'none';
        document.getElementById('pauseBtn').style.display = 'block';
        this.updateDisplay();
        this.startPlayTimer();
        // SLOWER SPEED: Changed from 100ms to 180ms
        this.gameLoop = setInterval(() => this.update(), 250);
    }

    startPlayTimer() {
        this.playInterval = setInterval(() => {
            if (!this.gamePaused) this.playTime++;
        }, 1000);
    }

    handleKeyPress(e) {
        if (!this.gameRunning) return;
        const key = e.key.toLowerCase();
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
            e.preventDefault();
        }
        if ((key === 'arrowup' || key === 'w') && this.dy === 0) {
            this.dx = 0; this.dy = -1;
        } else if ((key === 'arrowdown' || key === 's') && this.dy === 0) {
            this.dx = 0; this.dy = 1;
        } else if ((key === 'arrowleft' || key === 'a') && this.dx === 0) {
            this.dx = -1; this.dy = 0;
        } else if ((key === 'arrowright' || key === 'd') && this.dx === 0) {
            this.dx = 1; this.dy = 0;
        }
    }

    update() {
        if (this.gamePaused) return;
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount || this.checkCollision(head)) {
            this.gameOver();
            return;
        }
        this.snake.unshift(head);
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }
        this.draw();
        this.updateDisplay();
    }

    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.snake.forEach((segment, index) => {
            const gradient = this.ctx.createLinearGradient(
                segment.x * this.gridSize, segment.y * this.gridSize,
                (segment.x + 1) * this.gridSize, (segment.y + 1) * this.gridSize
            );
            gradient.addColorStop(0, index === 0 ? '#0ff' : '#0f0');
            gradient.addColorStop(1, index === 0 ? '#0cc' : '#0c0');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(segment.x * this.gridSize, segment.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);
        });
        const foodGradient = this.ctx.createRadialGradient(
            this.food.x * this.gridSize + this.gridSize / 2, this.food.y * this.gridSize + this.gridSize / 2, 0,
            this.food.x * this.gridSize + this.gridSize / 2, this.food.y * this.gridSize + this.gridSize / 2, this.gridSize / 2
        );
        foodGradient.addColorStop(0, '#ff0');
        foodGradient.addColorStop(1, '#f00');
        this.ctx.fillStyle = foodGradient;
        this.ctx.beginPath();
        this.ctx.arc(this.food.x * this.gridSize + this.gridSize / 2, this.food.y * this.gridSize + this.gridSize / 2, this.gridSize / 2 - 2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    generateFood() {
        let newFood;
        do {
            newFood = {x: Math.floor(Math.random() * this.tileCount), y: Math.floor(Math.random() * this.tileCount)};
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        return newFood;
    }

    checkCollision(head) {
        return this.snake.some(segment => segment.x === head.x && segment.y === head.y);
    }

    togglePause() {
        this.gamePaused = !this.gamePaused;
        document.getElementById('pauseBtn').textContent = this.gamePaused ? 'RESUME' : 'PAUSE';
    }

    showGameOverModal() {
        const modal = document.createElement('div');
        modal.className = 'game-over-modal';
        modal.innerHTML = `
            <div class="game-over-content">
                <h2>🎮 Game Over!</h2>
                <div class="game-over-stats">
                    <p>Final Score: <span class="score-value">${this.score}</span></p>
                    <p>High Score: <span class="score-value">${this.highScore}</span></p>
                    <p>Length: <span class="score-value">${this.snake.length}</span></p>
                </div>
                <button class="play-again-btn" onclick="location.reload()">🔄 Play Again</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    gameOver() {
        this.gameRunning = false;
        clearInterval(this.gameLoop);
        clearInterval(this.playInterval);
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snake_highScore', this.highScore);
        }

        // Add to history
        this.history.unshift({
            score: this.score,
            length: this.snake.length,
            time: this.playTime,
            date: new Date().toISOString()
        });
        localStorage.setItem('snake_history', JSON.stringify(this.history.slice(0, 10)));

        this.saveToLeaderboard();
        document.getElementById('startBtn').style.display = 'block';
        document.getElementById('pauseBtn').style.display = 'none';
        this.updateDisplay();
        this.renderHistory();
        setTimeout(() => this.showGameOverModal(), 300);
    }

    renderHistory() {
        const historyContainer = document.getElementById('snakeHistory');
        if (!historyContainer) return;

        if (this.history.length === 0) {
            historyContainer.innerHTML = '<p class="no-history">No games played yet!</p>';
            return;
        }

        historyContainer.innerHTML = this.history.slice(0, 10).map((entry, index) => {
            const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🐍';
            const mins = Math.floor(entry.time / 60);
            const secs = entry.time % 60;
            const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
            return `
                <div class="history-item">
                    <span class="history-icon">${emoji}</span>
                    <div class="history-details">
                        <span class="history-time">⏱️ ${timeStr}</span>
                        <span class="history-moves">📏 Length: ${entry.length}</span>
                    </div>
                    <span class="history-score">${entry.score}</span>
                </div>
            `;
        }).join('');
    }

    saveToLeaderboard() {
        const username = localStorage.getItem('username') || 'Player';
        const leaderboard = JSON.parse(localStorage.getItem('snake_leaderboard') || '[]');
        leaderboard.push({
            name: username,
            score: this.score,
            time: this.playTime,
            date: new Date().toISOString()
        });
        leaderboard.sort((a, b) => b.score - a.score);
        localStorage.setItem('snake_leaderboard', JSON.stringify(leaderboard.slice(0, 50)));
    }

    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('highScore').textContent = this.highScore;
        document.getElementById('length').textContent = this.snake.length;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});
