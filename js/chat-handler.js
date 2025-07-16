// Chat message handler and game interaction
class ChatHandler {
    constructor() {
        this.recentMessages = [];
        this.maxRecentMessages = 10;
        this.commandCooldowns = new Map(); // username -> last command time
        this.commandCooldownMs = 5000; // 5 seconds between commands per user
        this.pendingUpgrades = new Map(); // username -> available upgrade choices
    }
    
    // Process incoming chat message
    handleMessage(messageData, gameEngine) {
        const { username, message, timestamp } = messageData;
        
        // Add to recent messages for display
        this.addRecentMessage(username, message);
        
        // Check for commands
        const command = this.parseCommand(message);
        if (command) {
            this.processCommand(username, command, gameEngine);
        } else {
            // Regular chat message - deal damage to boss and give points
            this.processChatDamage(username, message, gameEngine);
        }
        
        // Update UI
        this.updateChatDisplay();
    }
    
    addRecentMessage(username, message) {
        this.recentMessages.unshift({
            username,
            message,
            timestamp: Date.now(),
            id: Math.random().toString(36)
        });
        
        // Keep only recent messages
        if (this.recentMessages.length > this.maxRecentMessages) {
            this.recentMessages = this.recentMessages.slice(0, this.maxRecentMessages);
        }
    }
    
    parseCommand(message) {
        const cleanMessage = message.toLowerCase().trim();
        
        // Check for upgrade selection commands (when user levels up)
        const upgradeMatch = cleanMessage.match(/^!choose\s+(\d+)$/);
        if (upgradeMatch) {
            return {
                type: 'choose_upgrade',
                choice: parseInt(upgradeMatch[1])
            };
        }
        
        // Check for other commands
        if (cleanMessage === '!stats' || cleanMessage === '!level') {
            return { type: 'stats' };
        }
        
        if (cleanMessage === '!help') {
            return { type: 'help' };
        }
        
        if (cleanMessage === '!leaderboard' || cleanMessage === '!top') {
            return { type: 'leaderboard' };
        }
        
        if (cleanMessage === '!upgrades') {
            return { type: 'upgrades' };
        }
        
        // Check for shooting command
        if (cleanMessage.includes('!shoot') || cleanMessage.includes('!fire')) {
            return { type: 'shoot' };
        }
        
        return null;
    }
    
    processCommand(username, command, gameEngine) {
        // Check cooldown
        if (this.isOnCooldown(username)) {
            return;
        }
        
        switch (command.type) {
            case 'choose_upgrade':
                this.handleUpgradeChoice(username, command.choice, gameEngine);
                break;
            case 'stats':
                this.handleStatsCommand(username);
                break;
            case 'help':
                this.handleHelpCommand();
                break;
            case 'leaderboard':
                this.handleLeaderboardCommand();
                break;
            case 'upgrades':
                this.handleUpgradesCommand(username);
                break;
            case 'shoot':
                this.handleShootCommand(username, gameEngine);
                break;
        }
        
        // Set cooldown
        this.commandCooldowns.set(username, Date.now());
    }
    
    isOnCooldown(username) {
        const lastCommand = this.commandCooldowns.get(username);
        return lastCommand && (Date.now() - lastCommand) < this.commandCooldownMs;
    }
    
    handleUpgradeChoice(username, choice, gameEngine) {
        // Check if user has pending upgrade choices (stored temporarily)
        const pendingUpgrades = this.pendingUpgrades?.get(username);
        if (!pendingUpgrades) {
            this.showSystemMessage(`${username}: No pending upgrades to choose from. Level up first!`);
            return;
        }
        
        if (choice < 1 || choice > pendingUpgrades.length) {
            this.showSystemMessage(`${username}: Invalid choice. Pick 1-${pendingUpgrades.length}`);
            return;
        }
        
        const selectedUpgrade = pendingUpgrades[choice - 1];
        const success = upgradeSystem.giveUpgrade(username, selectedUpgrade.type);
        
        if (success) {
            this.showSystemMessage(`🎉 ${username} chose: ${selectedUpgrade.name}! ${selectedUpgrade.description}`);
            this.pendingUpgrades.delete(username); // Clear pending upgrades
            
            // Apply upgrades to ship if exists
            const ship = gameEngine.getShipByUsername(username);
            if (ship) {
                this.applyUpgradesToShip(ship);
            }
        } else {
            this.showSystemMessage(`❌ ${username}: Failed to apply upgrade`);
        }
    }
    
    handleStatsCommand(username) {
        const summary = upgradeSystem.getUserSummary(username);
        const message = `${username}: Level ${summary.level} (${summary.xpProgress} XP) | ${summary.upgradeCount} upgrades | ${summary.damage} damage | ${summary.shots} shots per message`;
        this.showSystemMessage(message);
    }
    
    handleUpgradesCommand(username) {
        const upgrades = upgradeSystem.getUserUpgrades(username);
        if (upgrades.length === 0) {
            this.showSystemMessage(`${username}: No upgrades yet. Keep chatting to level up!`);
            return;
        }
        
        const upgradeNames = upgrades.map(u => u.name).join(', ');
        this.showSystemMessage(`${username}'s upgrades: ${upgradeNames}`);
    }
    
    handleHelpCommand() {
        const helpText = [
            'Commands: !stats, !upgrades, !leaderboard, !help',
            'Chat to gain XP and level up!',
            'When you level up, use !choose <1-3> to pick an upgrade',
            'Your shots get stronger with each upgrade!'
        ];
        helpText.forEach(text => this.showSystemMessage(text));
    }
    
    handleLeaderboardCommand() {
        const leaders = upgradeSystem.getLeaderboard(3);
        this.showSystemMessage('🏆 Top Players:');
        leaders.forEach((player, index) => {
            this.showSystemMessage(`${index + 1}. ${player.username}: Level ${player.level} (${player.upgradeCount} upgrades, ${player.damage} dmg)`);
        });
    }
    
    handleShootCommand(username, gameEngine) {
        const ship = gameEngine.getShipByUsername(username);
        if (ship && ship.alive) {
            const bullets = ship.shoot();
            gameEngine.addBullets(bullets);
            this.showSystemMessage(`${username} fires!`);
        }
    }
    
    processChatDamage(username, message, gameEngine) {
        // Award XP for chatting (1 XP per message)
        const leveledUp = upgradeSystem.addExperience(username, 1);
        
        if (leveledUp) {
            const newLevel = upgradeSystem.getUserLevel(username);
            this.showSystemMessage(`🎉 ${username} leveled up to ${newLevel}!`);
            
            // Offer upgrade choices
            const availableUpgrades = upgradeSystem.getAvailableUpgrades(username, 3);
            this.pendingUpgrades.set(username, availableUpgrades);
            
            this.showSystemMessage(`${username}, choose your upgrade:`);
            availableUpgrades.forEach((upgrade, index) => {
                this.showSystemMessage(`${index + 1}. ${upgrade.name}: ${upgrade.description}`);
            });
            this.showSystemMessage(`Type !choose <1-3> to select your upgrade!`);
        }
        
        // Calculate damage based on user's upgrades
        const damage = upgradeSystem.calculateDamage(username);
        const shots = upgradeSystem.calculateShotsPerMessage(username);
        
        // Deal damage to boss (multiple shots if upgraded)
        let totalDamage = 0;
        for (let i = 0; i < shots; i++) {
            const shotDamage = upgradeSystem.calculateDamage(username);
            totalDamage += shotDamage;
            
            // Fire visual bullet
            gameEngine.fireBulletFromChat(username, shotDamage);
        }
        
        const bossDefeated = gameEngine.damageBoss(totalDamage);
        
        if (bossDefeated) {
            this.showSystemMessage(`🎉 Boss defeated! ${username} dealt the final blow!`);
            // Bonus XP for final blow
            upgradeSystem.addExperience(username, 10);
        }
        
        // Ensure user has a ship representation
        gameEngine.ensurePlayerShip(username);
    }
    
    // Apply upgrades to ship visual representation
    applyUpgradesToShip(ship) {
        // This would update ship visuals based on upgrades
        // For now, just store the upgrade info
        ship.userUpgrades = upgradeSystem.getUserUpgrades(ship.username);
        ship.userLevel = upgradeSystem.getUserLevel(ship.username);
        ship.userDamage = upgradeSystem.calculateDamage(ship.username);
    }
    
    showSystemMessage(message) {
        this.addRecentMessage('SYSTEM', message);
        this.updateChatDisplay();
    }
    
    updateChatDisplay() {
        const chatDisplay = document.getElementById('chat-display');
        if (!chatDisplay) return;
        
        // Clear existing messages
        chatDisplay.innerHTML = '';
        
        // Add recent messages
        this.recentMessages.slice(0, 8).forEach(msg => {
            const messageElement = document.createElement('div');
            messageElement.className = 'chat-message';
            messageElement.style.color = msg.username === 'SYSTEM' ? '#ffff00' : '#ffffff';
            messageElement.innerHTML = `<strong>${msg.username}:</strong> ${this.escapeHtml(msg.message)}`;
            chatDisplay.appendChild(messageElement);
        });
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Clean up old messages periodically
    cleanup() {
        const now = Date.now();
        this.recentMessages = this.recentMessages.filter(msg => 
            now - msg.timestamp < 30000 // Keep messages for 30 seconds
        );
        
        // Clean up old cooldowns
        for (const [username, lastTime] of this.commandCooldowns.entries()) {
            if (now - lastTime > this.commandCooldownMs) {
                this.commandCooldowns.delete(username);
            }
        }
    }
}

// Initialize global chat handler
window.chatHandler = new ChatHandler();
