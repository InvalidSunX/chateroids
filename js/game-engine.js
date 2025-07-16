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
        
        // Visual effects
        this.bossFlashTime = 0;
        this.shipFlashTime = 0;
        
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
        // Create boss in the top right corner (quarter visible)
        this.boss = new Boss();
        // Position boss so only bottom-left quarter is visible
        this.boss.position.x = gameConfig.gameWidth - (this.boss.size / 2); // Half off right edge
        this.boss.position.y = this.boss.size / 2; // Half off top edge
        
        // Create community ship (now visible)
        this.communityShip = new Ship(
            100, // Left side but visible
            50,  // Top area
            'Chat'
        );
        
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
    
    generateStars() {
        this.stars = [];
        for (let i = 0; i < 150; i++) {
            this.stars.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 2 + 0.5,
                brightness: Math.random() * 0.8 + 0.2
            });
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
        // Boss stays static - no update needed
        
        // Update community ship (invisible but functional)
        if (this.communityShip) {
            this.communityShip.update(deltaTime);
        }
        
        // Update bullets (no off-screen detection needed for stationary setup)
        this.bullets = this.bullets.filter(bullet => {
            return bullet.update(deltaTime); // Only check if bullet is still alive (lifetime)
        });
        
        // Check collisions
        this.checkCollisions();
    }
    
    checkCollisions() {
        // Bullet vs Boss only (minimal overlay) - generous collision for stationary boss
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            if (this.boss && !this.bossDefeated && 
                this.circleCollision(bullet.position, 5, this.boss.position, this.boss.size)) {
                
                // Boss flash effect when hit
                this.bossFlashTime = Date.now();
                
                const defeated = this.boss.takeDamage(bullet.damage);
                if (defeated) {
                    this.bossDefeated = true;
                    // No system message - just defeat the boss silently
                    
                    // Award bonus XP to bullet owner
                    upgradeSystem.addExperience(bullet.owner, 50);
                }
                
                this.bullets.splice(i, 1);
                this.updateBossHPDisplay();
                continue;
            }
        }
    }
    
    circleCollision(pos1, radius1, pos2, radius2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < radius1 + radius2;
    }
    
    drawStars() {
        this.stars.forEach(star => {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    render() {
        // Clear canvas (transparent for overlay)
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw boss (quarter visible in top right) with flash effect
        if (this.boss && !this.bossDefeated) {
            // Check if boss should flash (white when hit)
            const shouldFlash = Date.now() - this.bossFlashTime < 200; // Flash for 200ms
            this.boss.draw(this.ctx, shouldFlash ? '#ffffff' : null);
        }
        
        // Draw community ship (now visible) with flash effect
        if (this.communityShip) {
            // Check if ship should flash purple when shooting
            const shouldFlash = Date.now() - this.shipFlashTime < 150; // Flash for 150ms
            this.communityShip.draw(this.ctx, shouldFlash ? '#9966ff' : null);
        }
        
        // Draw bullets (now visible)
        this.bullets.forEach(bullet => bullet.draw(this.ctx));
        
        // Draw minimal game info
        this.drawMinimalGameInfo();
    }
    
    drawMinimalGameInfo() {
        if (this.bossDefeated) {
            this.ctx.fillStyle = '#00ff00';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('BOSS DEFEATED!', this.canvas.width / 2, this.canvas.height / 2);
        }
        
        // Debug: Show bullet count (temporary)
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Bullets: ${this.bullets.length}`, 10, this.canvas.height - 20);
    }
    
    // Fire bullet from chat message
    fireBulletFromChat(username, damage) {
        // Ensure community ship exists (now visible)
        if (!this.communityShip) {
            this.communityShip = new Ship(
                100,
                50,
                'Chat'
            );
        }
        
        // Fire bullet toward boss in top right corner
        if (this.boss && !this.bossDefeated) {
            // Ship flash effect when shooting
            this.shipFlashTime = Date.now();
            
            // Calculate direction from ship to boss
            const angle = Math.atan2(
                this.boss.position.y - this.communityShip.position.y,
                this.boss.position.x - this.communityShip.position.x
            );
            
            const bulletVel = new Vector2(
                Math.cos(angle) * gameConfig.bulletSpeed,
                Math.sin(angle) * gameConfig.bulletSpeed
            );
            
            const bullet = new Bullet(
                this.communityShip.position.x + this.communityShip.size,
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
                'Chat'
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
            hpText.textContent = `${Math.ceil(percentage)}%`; // Just show percentage
            
            if (percentage <= 0) {
                hpText.textContent = 'DEFEATED!';
                hpBar.style.background = '#00ff00';
            }
        }
    }
    
    // Reset game state
    reset() {
        this.communityShip = null;
        this.bullets = [];
        this.bossDefeated = false;
        
        // Reset boss to top right corner (quarter visible)
        this.boss = new Boss();
        this.boss.position.x = gameConfig.gameWidth - (this.boss.size / 2);
        this.boss.position.y = this.boss.size / 2;
        gameConfig.bossCurrentHP = gameConfig.bossMaxHP;
        
        // Update UI
        this.updateBossHPDisplay();
        
        // No system message for minimal overlay
    }
}

// Initialize global game engine
window.gameEngine = null;
