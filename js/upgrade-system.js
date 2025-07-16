// Upgrade system for ships - Level-based progression
class UpgradeSystem {
    constructor() {
        this.userExperience = new Map(); // username -> experience points
        this.userLevels = new Map();     // username -> current level
        this.userUpgrades = new Map();   // username -> selected upgrades array
        this.fileHandle = null;          // File handle for saving
        this.autoSaveInterval = null;    // Auto-save timer
        
        // XP progression (exponential growth)
        this.getXPForLevel = (level) => Math.floor(100 * Math.pow(1.15, level - 1));
        
        // Base damage for level calculation
        this.baseDamage = 10;
        
        // Upgrade catalog - continuous progression
        this.upgradeTypes = {
            // Damage upgrades
            'damage_boost': { name: 'Damage Boost', description: '+2 damage per shot', stackable: true },
            'critical_hit': { name: 'Critical Hit', description: '10% chance for 2x damage', stackable: true },
            'armor_pierce': { name: 'Armor Pierce', description: '+50% damage to boss', stackable: true },
            'explosive_rounds': { name: 'Explosive Rounds', description: 'Shots deal area damage', stackable: false },
            
            // Rate of fire upgrades
            'rapid_fire': { name: 'Rapid Fire', description: '-20% cooldown between shots', stackable: true },
            'burst_fire': { name: 'Burst Fire', description: 'Fire 3 shots rapidly', stackable: true },
            'auto_fire': { name: 'Auto Fire', description: 'Automatically fire every 2 seconds', stackable: false },
            
            // Multi-shot upgrades
            'dual_shot': { name: 'Dual Shot', description: 'Fire 2 shots simultaneously', stackable: true },
            'spread_shot': { name: 'Spread Shot', description: 'Fire in a wide arc', stackable: true },
            'ricochet': { name: 'Ricochet', description: 'Shots bounce off asteroids', stackable: false },
            
            // Special abilities
            'shield_gen': { name: 'Shield Generator', description: 'Absorb next 3 boss attacks', stackable: true },
            'laser_sight': { name: 'Laser Sight', description: '+25% accuracy and damage', stackable: true },
            'overcharge': { name: 'Overcharge', description: 'Next shot deals 3x damage', stackable: true },
            'time_slow': { name: 'Time Slow', description: 'Slow boss movement for 10 seconds', stackable: false },
            
            // Utility upgrades
            'xp_boost': { name: 'XP Boost', description: '+50% experience from chat', stackable: true },
            'lucky_shot': { name: 'Lucky Shot', description: '5% chance for instant boss damage', stackable: true },
            'regeneration': { name: 'Regeneration', description: 'Slowly repair ship damage', stackable: true },
            'magnetism': { name: 'Magnetism', description: 'Attract power-ups and bonuses', stackable: false }
        };
    }
    
    // Get or create user data
    getUserLevel(username) {
        return this.userLevels.get(username) || 1;
    }
    
    getUserExperience(username) {
        return this.userExperience.get(username) || 0;
    }
    
    getUserUpgrades(username) {
        if (!this.userUpgrades.has(username)) {
            this.userUpgrades.set(username, []);
        }
        return this.userUpgrades.get(username);
    }
    
    // Add experience and handle level ups
    addExperience(username, xp = 1) {
        const currentXP = this.getUserExperience(username);
        const currentLevel = this.getUserLevel(username);
        const newXP = currentXP + xp;
        
        this.userExperience.set(username, newXP);
        
        // Check for level up
        const xpNeeded = this.getXPForLevel(currentLevel + 1);
        if (newXP >= xpNeeded) {
            this.levelUp(username);
            return true; // User leveled up
        }
        return false; // No level up
    }
    
    levelUp(username) {
        const currentLevel = this.getUserLevel(username);
        const newLevel = currentLevel + 1;
        this.userLevels.set(username, newLevel);
        
        console.log(`${username} leveled up to ${newLevel}!`);
        return newLevel;
    }
    
    // Get available upgrades for a user's level
    getAvailableUpgrades(username, count = 3) {
        const userUpgrades = this.getUserUpgrades(username);
        const availableUpgrades = [];
        
        for (const [key, upgrade] of Object.entries(this.upgradeTypes)) {
            // Check if upgrade is stackable or not already owned
            if (upgrade.stackable || !userUpgrades.find(u => u.type === key)) {
                availableUpgrades.push({
                    type: key,
                    name: upgrade.name,
                    description: upgrade.description,
                    stackable: upgrade.stackable
                });
            }
        }
        
        // Shuffle and return requested count
        const shuffled = availableUpgrades.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }
    
    // Award upgrade to user
    giveUpgrade(username, upgradeType) {
        const userUpgrades = this.getUserUpgrades(username);
        const upgrade = this.upgradeTypes[upgradeType];
        
        if (!upgrade) return false;
        
        // Check if user can have this upgrade
        if (!upgrade.stackable && userUpgrades.find(u => u.type === upgradeType)) {
            return false; // Already has non-stackable upgrade
        }
        
        userUpgrades.push({
            type: upgradeType,
            name: upgrade.name,
            description: upgrade.description,
            acquired: Date.now()
        });
        
        this.userUpgrades.set(username, userUpgrades);
        return true;
    }
    
    // Calculate user's total damage
    calculateDamage(username) {
        const userUpgrades = this.getUserUpgrades(username);
        let damage = this.baseDamage;
        
        // Count damage upgrades
        const damageBoosts = userUpgrades.filter(u => u.type === 'damage_boost').length;
        const armorPierce = userUpgrades.filter(u => u.type === 'armor_pierce').length;
        const laserSight = userUpgrades.filter(u => u.type === 'laser_sight').length;
        
        damage += damageBoosts * 2; // +2 per damage boost
        damage += armorPierce * (this.baseDamage * 0.5); // +50% base damage per armor pierce
        damage += laserSight * (this.baseDamage * 0.25); // +25% base damage per laser sight
        
        // Critical hit chance
        const critChance = userUpgrades.filter(u => u.type === 'critical_hit').length * 0.1; // 10% per upgrade
        if (Math.random() < critChance) {
            damage *= 2; // Critical hit!
        }
        
        return Math.floor(damage);
    }
    
    // Calculate shots per message
    calculateShotsPerMessage(username) {
        const userUpgrades = this.getUserUpgrades(username);
        let shots = 1;
        
        // Count multi-shot upgrades
        const dualShots = userUpgrades.filter(u => u.type === 'dual_shot').length;
        const burstFire = userUpgrades.filter(u => u.type === 'burst_fire').length;
        
        shots += dualShots; // +1 shot per dual shot upgrade
        shots += burstFire * 2; // +2 shots per burst fire upgrade
        
        return shots;
    }
    
    // Get user progress summary
    getUserSummary(username) {
        const level = this.getUserLevel(username);
        const xp = this.getUserExperience(username);
        const xpNeeded = this.getXPForLevel(level + 1);
        const upgrades = this.getUserUpgrades(username);
        const damage = this.calculateDamage(username);
        const shots = this.calculateShotsPerMessage(username);
        
        return {
            username,
            level,
            xp,
            xpNeeded,
            xpProgress: `${xp}/${xpNeeded}`,
            upgradeCount: upgrades.length,
            damage,
            shots,
            upgrades: upgrades.map(u => u.name)
        };
    }
    
    // Get leaderboard of top players
    getLeaderboard(limit = 5) {
        const players = Array.from(this.userLevels.entries())
            .map(([username, level]) => ({
                username,
                level,
                xp: this.getUserExperience(username),
                upgradeCount: this.getUserUpgrades(username).length,
                damage: this.calculateDamage(username)
            }))
            .sort((a, b) => {
                // Sort by level first, then by XP
                if (a.level !== b.level) return b.level - a.level;
                return b.xp - a.xp;
            })
            .slice(0, limit);
        
        return players;
    }
    
    // Reset all progress (for new stream/boss)
    reset() {
        this.userExperience.clear();
        this.userLevels.clear();
        this.userUpgrades.clear();
    }
    
    // Calculate recommended boss HP based on level 1 damage
    getRecommendedBossHP() {
        return this.baseDamage * 200; // 2000 HP for base damage of 10
    }
    
    // Save/load from file system for persistence
    async save() {
        const data = {
            experience: Object.fromEntries(this.userExperience),
            levels: Object.fromEntries(this.userLevels),
            upgrades: Object.fromEntries(this.userUpgrades),
            lastSaved: new Date().toISOString(),
            streamerName: gameConfig.streamerName,
            baseDamage: this.baseDamage
        };
        
        try {
            // Use File System Access API if available (Chrome 86+)
            if ('showSaveFilePicker' in window) {
                await this.saveWithFileAPI(data);
            } else {
                // Fallback to download method
                this.saveAsDownload(data);
            }
        } catch (e) {
            console.error('Failed to save upgrade data:', e);
            // Fallback to localStorage as backup
            localStorage.setItem(`chateroids-upgrades-${gameConfig.streamerName}`, JSON.stringify(data));
        }
    }
    
    async saveWithFileAPI(data) {
        if (!this.fileHandle) {
            // First time saving - let user choose location
            this.fileHandle = await window.showSaveFilePicker({
                suggestedName: `chateroids-${gameConfig.streamerName}-data.json`,
                types: [{
                    description: 'Chateroids save files',
                    accept: { 'application/json': ['.json'] }
                }]
            });
        }
        
        const writable = await this.fileHandle.createWritable();
        await writable.write(JSON.stringify(data, null, 2));
        await writable.close();
        
        console.log('Viewer data saved to file successfully');
    }
    
    saveAsDownload(data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chateroids-${gameConfig.streamerName}-data.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('Viewer data downloaded as file');
    }
    
    async load() {
        try {
            // Try File System Access API first
            if ('showOpenFilePicker' in window) {
                await this.loadWithFileAPI();
            } else {
                // Fallback to file input
                this.loadWithFileInput();
            }
        } catch (e) {
            console.log('File loading cancelled or failed, checking localStorage backup...');
            this.loadFromLocalStorage();
        }
    }
    
    async loadWithFileAPI() {
        const [fileHandle] = await window.showOpenFilePicker({
            types: [{
                description: 'Chateroids save files',
                accept: { 'application/json': ['.json'] }
            }]
        });
        
        this.fileHandle = fileHandle; // Store for future saves
        const file = await fileHandle.getFile();
        const text = await file.text();
        const data = JSON.parse(text);
        
        this.loadDataFromObject(data);
        console.log('Viewer data loaded from file successfully');
    }
    
    loadWithFileInput() {
        // Create hidden file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.style.display = 'none';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                const text = await file.text();
                const data = JSON.parse(text);
                this.loadDataFromObject(data);
                console.log('Viewer data loaded from file successfully');
            }
            document.body.removeChild(input);
        };
        
        document.body.appendChild(input);
        input.click();
    }
    
    loadFromLocalStorage() {
        const saved = localStorage.getItem(`chateroids-upgrades-${gameConfig.streamerName}`);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.loadDataFromObject(data);
                console.log('Viewer data loaded from localStorage backup');
            } catch (e) {
                console.error('Failed to load from localStorage:', e);
            }
        }
    }
    
    loadDataFromObject(data) {
        if (data.experience) {
            this.userExperience = new Map(Object.entries(data.experience));
        }
        if (data.levels) {
            this.userLevels = new Map(Object.entries(data.levels).map(([k, v]) => [k, parseInt(v)]));
        }
        if (data.upgrades) {
            this.userUpgrades = new Map(Object.entries(data.upgrades));
        }
        if (data.baseDamage) {
            this.baseDamage = data.baseDamage;
        }
        
        // Legacy compatibility for old point-based system
        if (data.points && !data.experience) {
            console.log('Converting old point-based data to new level system...');
            for (const [username, points] of Object.entries(data.points)) {
                // Convert points to XP (1:1 ratio)
                this.userExperience.set(username, points);
                // Calculate level based on XP
                let level = 1;
                let xp = points;
                while (xp >= this.getXPForLevel(level + 1)) {
                    level++;
                }
                this.userLevels.set(username, level);
            }
        }
        
        // Validate the data is for the correct streamer
        if (data.streamerName && data.streamerName !== gameConfig.streamerName) {
            console.warn(`Loading data for ${data.streamerName} but current streamer is ${gameConfig.streamerName}`);
        }
    }
    
    // Auto-save functionality
    enableAutoSave(intervalMs = 30000) {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        this.autoSaveInterval = setInterval(() => {
            if (this.userExperience.size > 0 || this.userLevels.size > 0) {
                this.save();
            }
        }, intervalMs);
        
        console.log(`Auto-save enabled every ${intervalMs/1000} seconds`);
    }
    
    disableAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }
}

// Initialize global upgrade system
window.upgradeSystem = new UpgradeSystem();
