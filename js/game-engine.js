// Main game engine
class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.running = false;
        this.lastTime = 0;
        
        // Game objects
        this.communityShip = null;  // Single ship that represents the community
        this.boss = null;
        this.asteroids = [];
        this.bullets = [];
        
        // Game state
        this.gameStarted = false;
        this.bossDefeated = false;
        
        this.setupCanvas();
        this.initializeGame();
    }
    
    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        gameConfig.gameWidth = this.canvas.width;
        gameConfig.gameHeight = this.canvas.height;
    }
    
    initializeGame() {
        // Create boss
        this.boss = new Boss();
        
        // Create initial asteroids
        this.generateAsteroids();
        
        // Setup UI updates
        this.updateBossHPDisplay();
    }
    
    generateAsteroids() {
        this.asteroids = [];
        const count = gameConfig.asteroidCount;
        
        for (let i = 0; i < count; i++) {
            let x, y;
            
            // Ensure asteroids don't spawn too close to boss
            do {
                x = Math.random() * gameConfig.gameWidth;
                y = Math.random() * gameConfig.gameHeight;
            } while (
                Math.sqrt((x - this.boss.position.x) ** 2 + (y - this.boss.position.y) ** 2) < 150
            );
            
            this.asteroids.push(new Asteroid(x, y, 20 + Math.random() * 20));
        }
    }
    
    start() {
        if (this.running) return;
        
        this.running = true;
        this.gameStarted = true;
        this.lastTime = performance.now();
        this.gameLoop();
        
        // Start cleanup interval
        setInterval(() => {
            chatHandler.cleanup();
            // Note: File-based auto-save is handled by upgradeSystem.enableAutoSave()
        }, 10000); // Every 10 seconds
    }
    
    stop() {
        this.running = false;
    }
    
    gameLoop() {
        if (!this.running) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update(deltaTime) {
        // Update boss
        if (this.boss && !this.bossDefeated) {
            this.boss.update(deltaTime);
        }
        
        // Update community ship
        if (this.communityShip) {
            this.communityShip.update(deltaTime);
        }
        
        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            const alive = bullet.update(deltaTime);
            return alive && !bullet.isOffScreen();
        });
        
        // Update asteroids
        this.asteroids.forEach(asteroid => asteroid.update(deltaTime));
        
        // Check collisions
        this.checkCollisions();
        
        // Respawn asteroids if needed
        if (this.asteroids.length < gameConfig.asteroidCount / 2) {
            this.generateAsteroids();
        }
    }
    
    checkCollisions() {
        // Bullet vs Boss
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            if (this.boss && !this.bossDefeated && 
                this.circleCollision(bullet.position, 2, this.boss.position, this.boss.size)) {
                
                const defeated = this.boss.takeDamage(bullet.damage);
                if (defeated) {
                    this.bossDefeated = true;
                    chatHandler.showSystemMessage('🎉 BOSS DEFEATED! 🎉');
                    
                    // Award bonus points to bullet owner
                    upgradeSystem.addPoints(bullet.owner, 500);
                }
                
                this.bullets.splice(i, 1);
                this.updateBossHPDisplay();
                continue;
            }
            
            // Bullet vs Asteroids
            for (let j = this.asteroids.length - 1; j >= 0; j--) {
                const asteroid = this.asteroids[j];
                if (this.circleCollision(bullet.position, 2, asteroid.position, asteroid.size)) {
                    // Split asteroid
                    const newAsteroids = asteroid.split();
                    this.asteroids.splice(j, 1);
                    this.asteroids.push(...newAsteroids);
                    
                    // Award points to shooter
                    upgradeSystem.addPoints(bullet.owner, 10);
                    
                    this.bullets.splice(i, 1);
                    break;
                }
            }
        }
        
        // Ship vs Asteroids
        if (this.communityShip && this.communityShip.alive) {
            for (const asteroid of this.asteroids) {
                if (this.circleCollision(this.communityShip.position, this.communityShip.size, asteroid.position, asteroid.size)) {
                    // Community ship hit - maybe show damage effect but don't destroy
                    console.log('Community ship hit by asteroid');
                    break;
                }
            }
        }
    }
    
    circleCollision(pos1, radius1, pos2, radius2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < radius1 + radius2;
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw boss
        if (this.boss && !this.bossDefeated) {
            this.boss.draw(this.ctx);
        }
        
        // Draw community ship
        if (this.communityShip) {
            this.communityShip.draw(this.ctx);
            
            // Show last shooter info
            if (this.communityShip.lastShooter && Date.now() - this.communityShip.lastShotTime < 2000) {
                this.ctx.fillStyle = '#00ff00';
                this.ctx.font = '12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(
                    `${this.communityShip.lastShooter} fired!`, 
                    this.communityShip.position.x, 
                    this.communityShip.position.y - 25
                );
            }
        }
        
        // Draw asteroids
        this.asteroids.forEach(asteroid => asteroid.draw(this.ctx));
        
        // Draw bullets
        this.bullets.forEach(bullet => bullet.draw(this.ctx));
        
        // Draw game info
        this.drawGameInfo();
    }
    
    drawGameInfo() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        
        let y = 20;
        this.ctx.fillText(`Community Ship Active: ${this.communityShip ? 'Yes' : 'No'}`, 20, y);
        y += 20;
        this.ctx.fillText(`Asteroids: ${this.asteroids.length}`, 20, y);
        y += 20;
        this.ctx.fillText(`Bullets: ${this.bullets.length}`, 20, y);
        y += 20;
        this.ctx.fillText(`Recommended Boss HP: ${upgradeSystem.getRecommendedBossHP()}`, 20, y);
        
        if (this.bossDefeated) {
            this.ctx.fillStyle = '#00ff00';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('BOSS DEFEATED!', this.canvas.width / 2, this.canvas.height / 2);
        }
    }
    
    // Fire bullet from chat message
    fireBulletFromChat(username, damage) {
        // Get or create a single community ship
        if (!this.communityShip) {
            this.communityShip = new Ship(
                gameConfig.gameWidth / 2,
                gameConfig.gameHeight - 100,
                'Community'
            );
        }
        
        // Fire bullet from community ship toward boss
        if (this.boss && !this.bossDefeated) {
            const angle = Math.atan2(
                this.boss.position.y - this.communityShip.position.y,
                this.boss.position.x - this.communityShip.position.x
            );
            
            const bulletVel = new Vector2(
                Math.cos(angle) * gameConfig.bulletSpeed,
                Math.sin(angle) * gameConfig.bulletSpeed
            );
            
            const bullet = new Bullet(
                this.communityShip.position.x,
                this.communityShip.position.y,
                bulletVel,
                username,
                damage
            );
            
            this.bullets.push(bullet);
            
            // Show visual feedback on ship
            this.communityShip.lastShooter = username;
            this.communityShip.lastShotTime = Date.now();
        }
    }
    
    // Player management
    ensurePlayerShip(username) {
        // Just ensure community ship exists
        if (!this.communityShip) {
            this.communityShip = new Ship(
                gameConfig.gameWidth / 2,
                gameConfig.gameHeight - 100,
                'Community'
            );
        }
    }
    
    getShipByUsername(username) {
        // Return community ship for any username
        return this.communityShip;
    }
    
    addBullets(bullets) {
        this.bullets.push(...bullets);
    }
    
    damageBoss(damage) {
        if (this.boss && !this.bossDefeated) {
            const defeated = this.boss.takeDamage(damage);
            this.updateBossHPDisplay();
            return defeated;
        }
        return false;
    }
    
    updateBossHPDisplay() {
        const hpBar = document.getElementById('boss-hp-fill');
        const hpText = document.getElementById('boss-hp-text');
        
        if (hpBar && hpText && this.boss) {
            const percentage = gameConfig.getBossHPPercentage();
            hpBar.style.width = `${percentage}%`;
            hpText.textContent = `Boss: ${Math.ceil(percentage)}% (${this.boss.currentHP}/${this.boss.maxHP})`;
            
            if (percentage <= 0) {
                hpText.textContent = 'Boss: DEFEATED!';
                hpBar.style.background = '#00ff00';
            }
        }
    }
    
    // Reset game state
    reset() {
        this.communityShip = null;
        this.bullets = [];
        this.bossDefeated = false;
        
        // Reset boss
        this.boss = new Boss();
        gameConfig.bossCurrentHP = gameConfig.bossMaxHP;
        
        // Reset asteroids
        this.generateAsteroids();
        
        // Update UI
        this.updateBossHPDisplay();
        
        chatHandler.showSystemMessage('🔄 Game Reset! New boss spawned!');
    }
}

// Initialize global game engine
window.gameEngine = null;
