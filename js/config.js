// Configuration management
class Config {
    constructor() {
        this.streamerName = '';
        this.bossMaxHP = 2000; // Default: 10 damage * 200
        this.bossCurrentHP = 2000;
        this.gameWidth = window.innerWidth;
        this.gameHeight = window.innerHeight;
        
        // Game settings
        this.asteroidCount = 8;
        this.shipSpeed = 5;
        this.bulletSpeed = 7;
        this.asteroidSpeed = 2;
        
        this.loadFromStorage();
    }
    
    loadFromStorage() {
        const saved = localStorage.getItem('chateroids-config');
        if (saved) {
            const config = JSON.parse(saved);
            this.streamerName = config.streamerName || '';
            this.bossMaxHP = config.bossMaxHP || 2000;
        }
    }
    
    saveToStorage() {
        const config = {
            streamerName: this.streamerName,
            bossMaxHP: this.bossMaxHP
        };
        localStorage.setItem('chateroids-config', JSON.stringify(config));
    }
    
    updateStreamerName(name) {
        this.streamerName = name.toLowerCase().replace(/[^a-z0-9_]/g, '');
        this.saveToStorage();
    }
    
    updateBossMaxHP(hp) {
        this.bossMaxHP = Math.max(100, parseInt(hp) || 2000);
        this.bossCurrentHP = this.bossMaxHP;
        this.saveToStorage();
    }
    
    getBossHPPercentage() {
        return (this.bossCurrentHP / this.bossMaxHP) * 100;
    }
}

// Initialize global config
window.gameConfig = new Config();
