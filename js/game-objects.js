// Game objects: Ships, Boss, Asteroids, Bullets
class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    
    add(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }
    
    multiply(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }
    
    normalize() {
        const mag = Math.sqrt(this.x * this.x + this.y * this.y);
        if (mag > 0) {
            this.x /= mag;
            this.y /= mag;
        }
        return this;
    }
    
    clone() {
        return new Vector2(this.x, this.y);
    }
}

class Ship {
    constructor(x, y, username) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);
        this.rotation = 0;
        this.username = username;
        this.size = 8;
        this.color = this.generateColor(username);
        this.lastShot = 0;
        this.shootCooldown = 500; // ms
        
        // Upgrades specific to this user in this stream
        this.upgrades = {
            speed: 0,
            damage: 0,
            shield: 0,
            multishot: 0
        };
        
        this.points = 0;
        this.alive = true;
        this.respawnTime = 0;
    }
    
    generateColor(username) {
        // Generate a consistent color based on username
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash) % 360;
        return `hsl(${hue}, 70%, 60%)`;
    }
    
    update(deltaTime) {
        if (!this.alive) {
            if (Date.now() > this.respawnTime) {
                this.respawn();
            }
            return;
        }
        
        // Apply movement
        this.position.add(this.velocity.clone().multiply(deltaTime / 16));
        
        // Wrap around screen
        if (this.position.x < 0) this.position.x = gameConfig.gameWidth;
        if (this.position.x > gameConfig.gameWidth) this.position.x = 0;
        if (this.position.y < 0) this.position.y = gameConfig.gameHeight;
        if (this.position.y > gameConfig.gameHeight) this.position.y = 0;
        
        // Apply friction
        this.velocity.multiply(0.98);
    }
    
    shoot() {
        if (!this.alive || Date.now() - this.lastShot < this.shootCooldown) return [];
        
        this.lastShot = Date.now();
        const bullets = [];
        
        const shotCount = 1 + this.upgrades.multishot;
        const angleSpread = this.upgrades.multishot > 0 ? 0.3 : 0;
        
        for (let i = 0; i < shotCount; i++) {
            const angle = this.rotation + (angleSpread * (i - shotCount / 2 + 0.5));
            const bulletVel = new Vector2(
                Math.cos(angle) * (gameConfig.bulletSpeed + this.upgrades.speed),
                Math.sin(angle) * (gameConfig.bulletSpeed + this.upgrades.speed)
            );
            
            bullets.push(new Bullet(
                this.position.x,
                this.position.y,
                bulletVel,
                this.username,
                1 + this.upgrades.damage
            ));
        }
        
        return bullets;
    }
    
    takeDamage() {
        if (this.upgrades.shield > 0) {
            this.upgrades.shield--;
            return false; // Shield absorbed the hit
        }
        
        this.alive = false;
        this.respawnTime = Date.now() + 3000; // 3 second respawn
        return true; // Ship was destroyed
    }
    
    respawn() {
        this.alive = true;
        this.position = new Vector2(
            Math.random() * gameConfig.gameWidth,
            Math.random() * gameConfig.gameHeight
        );
        this.velocity = new Vector2(0, 0);
    }
    
    draw(ctx, overrideColor = null) {
        if (!this.alive) return;
        
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        ctx.strokeStyle = overrideColor || this.color;
        ctx.lineWidth = 2;
        
        // Draw triangle ship
        ctx.beginPath();
        ctx.moveTo(this.size, 0);
        ctx.lineTo(-this.size, -this.size/2);
        ctx.lineTo(-this.size, this.size/2);
        ctx.closePath();
        ctx.stroke();
        
        // Draw username
        ctx.restore();
        ctx.fillStyle = overrideColor || this.color;
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.username, this.position.x, this.position.y - this.size - 5);
    }
}

class Boss {
    constructor() {
        this.position = new Vector2(gameConfig.gameWidth / 2, gameConfig.gameHeight / 2);
        this.velocity = new Vector2(0, 0);
        this.size = 50;
        this.maxHP = gameConfig.bossMaxHP;
        this.currentHP = this.maxHP;
        this.lastAttack = 0;
        this.attackCooldown = 2000; // ms
    }
    
    update(deltaTime) {
        // Simple AI movement
        this.velocity.x += (Math.random() - 0.5) * 0.5;
        this.velocity.y += (Math.random() - 0.5) * 0.5;
        this.velocity.multiply(0.99);
        
        this.position.add(this.velocity.clone().multiply(deltaTime / 16));
        
        // Keep boss on screen
        this.position.x = Math.max(this.size, Math.min(gameConfig.gameWidth - this.size, this.position.x));
        this.position.y = Math.max(this.size, Math.min(gameConfig.gameHeight - this.size, this.position.y));
    }
    
    takeDamage(amount) {
        this.currentHP = Math.max(0, this.currentHP - amount);
        gameConfig.bossCurrentHP = this.currentHP;
        return this.currentHP <= 0;
    }
    
    draw(ctx, overrideColor = null) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.strokeStyle = overrideColor || '#ff0000';
        ctx.lineWidth = 3;
        
        // Draw circle boss
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw HP bar above boss
        ctx.restore();
        const barWidth = 100;
        const barHeight = 8;
        const barX = this.position.x - barWidth / 2;
        const barY = this.position.y - this.size - 20;
        
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        const hpPercent = this.currentHP / this.maxHP;
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
}

class Bullet {
    constructor(x, y, velocity, owner, damage = 1) {
        this.position = new Vector2(x, y);
        this.velocity = velocity;
        this.owner = owner;
        this.damage = damage;
        this.lifetime = 4000; // 4 seconds is plenty for stationary targets
        this.created = Date.now();
    }
    
    update(deltaTime) {
        this.position.add(this.velocity.clone().multiply(deltaTime / 16));
        return Date.now() - this.created < this.lifetime;
    }
    
    draw(ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Asteroid {
    constructor(x, y, size = 20) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(
            (Math.random() - 0.5) * gameConfig.asteroidSpeed,
            (Math.random() - 0.5) * gameConfig.asteroidSpeed
        );
        this.size = size;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
    }
    
    update(deltaTime) {
        this.position.add(this.velocity.clone().multiply(deltaTime / 16));
        this.rotation += this.rotationSpeed;
        
        // Wrap around screen
        if (this.position.x < -this.size) this.position.x = gameConfig.gameWidth + this.size;
        if (this.position.x > gameConfig.gameWidth + this.size) this.position.x = -this.size;
        if (this.position.y < -this.size) this.position.y = gameConfig.gameHeight + this.size;
        if (this.position.y > gameConfig.gameHeight + this.size) this.position.y = -this.size;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 2;
        
        // Draw irregular asteroid shape
        ctx.beginPath();
        const points = 8;
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const radius = this.size * (0.8 + Math.random() * 0.4);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }
    
    split() {
        if (this.size <= 10) return [];
        
        const newSize = this.size / 2;
        return [
            new Asteroid(this.position.x, this.position.y, newSize),
            new Asteroid(this.position.x, this.position.y, newSize)
        ];
    }
}
