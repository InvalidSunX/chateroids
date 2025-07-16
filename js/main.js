// Main application entry point
document.addEventListener('DOMContentLoaded', () => {
    // Initialize canvas and game engine
    const canvas = document.getElementById('game-canvas');
    window.gameEngine = new GameEngine(canvas);
    
    // Start the game immediately
    gameEngine.start();
    
    // Setup UI event handlers
    setupUIHandlers();
    
    // Load saved configuration
    loadConfiguration();
    
    console.log('Chateroids initialized');
});

function setupUIHandlers() {
    // Configuration panel
    const configPanel = document.getElementById('config-panel');
    const showConfigBtn = document.getElementById('show-config');
    const toggleConfigBtn = document.getElementById('toggle-config');
    const connectBtn = document.getElementById('connect-btn');
    
    showConfigBtn.addEventListener('click', () => {
        configPanel.classList.remove('hidden');
        showConfigBtn.style.display = 'none';
    });
    
    toggleConfigBtn.addEventListener('click', () => {
        configPanel.classList.add('hidden');
        showConfigBtn.style.display = 'block';
    });
    
    connectBtn.addEventListener('click', () => {
        const streamerName = document.getElementById('streamer-name').value.trim();
        const bossMaxHP = document.getElementById('boss-max-hp').value;
        const botUsername = document.getElementById('bot-username').value.trim();
        const botOAuth = document.getElementById('bot-oauth').value.trim();
        
        if (!streamerName) {
            alert('Please enter a streamer username');
            return;
        }
        
        // Configure bot credentials if provided
        if (botUsername && botOAuth) {
            // Remove 'oauth:' prefix if user included it
            const cleanOAuth = botOAuth.replace(/^oauth:/, '');
            twitchAPI.configureBotCredentials(botUsername, cleanOAuth);
        }
        
        connectToTwitchChat(streamerName, bossMaxHP);
    });
    
    // Allow Enter key to connect
    document.getElementById('streamer-name').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            connectBtn.click();
        }
    });
    
    // Boss HP input
    document.getElementById('boss-max-hp').addEventListener('change', (e) => {
        const newHP = parseInt(e.target.value) || 1000;
        gameConfig.updateBossMaxHP(newHP);
        if (gameEngine) {
            gameEngine.boss.maxHP = newHP;
            gameEngine.boss.currentHP = newHP;
            gameEngine.updateBossHPDisplay();
        }
    });
    
    // Add save/load buttons to config panel
    addSaveLoadButtons();
}

function addSaveLoadButtons() {
    const configPanel = document.getElementById('config-panel');
    
    // Create save button
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save Viewer Data';
    saveBtn.style.background = '#28a745';
    saveBtn.onclick = async () => {
        try {
            await upgradeSystem.save();
            alert('Viewer data saved successfully!');
        } catch (e) {
            alert('Failed to save data: ' + e.message);
        }
    };
    
    // Create load button
    const loadBtn = document.createElement('button');
    loadBtn.textContent = 'Load Viewer Data';
    loadBtn.style.background = '#17a2b8';
    loadBtn.onclick = async () => {
        try {
            await upgradeSystem.load();
            alert('Viewer data loaded successfully!');
            // Update community ship with any visual upgrades
            if (gameEngine && gameEngine.communityShip) {
                chatHandler.applyUpgradesToShip(gameEngine.communityShip);
            }
        } catch (e) {
            alert('Failed to load data: ' + e.message);
        }
    };
    
    // Create auto-save toggle
    const autoSaveBtn = document.createElement('button');
    autoSaveBtn.textContent = 'Enable Auto-Save';
    autoSaveBtn.style.background = '#6c757d';
    autoSaveBtn.onclick = () => {
        if (upgradeSystem.autoSaveInterval) {
            upgradeSystem.disableAutoSave();
            autoSaveBtn.textContent = 'Enable Auto-Save';
            autoSaveBtn.style.background = '#6c757d';
        } else {
            upgradeSystem.enableAutoSave();
            autoSaveBtn.textContent = 'Disable Auto-Save';
            autoSaveBtn.style.background = '#dc3545';
        }
    };
    
    // Add buttons to config panel
    configPanel.appendChild(saveBtn);
    configPanel.appendChild(loadBtn);
    configPanel.appendChild(autoSaveBtn);
}

function loadConfiguration() {
    // Pre-fill saved configuration
    if (gameConfig.streamerName) {
        document.getElementById('streamer-name').value = gameConfig.streamerName;
    }
    
    document.getElementById('boss-max-hp').value = gameConfig.bossMaxHP;
    
    // Auto-connect if streamer name is saved
    if (gameConfig.streamerName) {
        setTimeout(() => {
            connectToTwitchChat(gameConfig.streamerName, gameConfig.bossMaxHP);
        }, 1000);
    }
}

function connectToTwitchChat(streamerName, bossMaxHP) {
    // Update configuration
    gameConfig.updateStreamerName(streamerName);
    gameConfig.updateBossMaxHP(bossMaxHP);
    
    // Try to load existing viewer data for this streamer (but don't block on it)
    try {
        upgradeSystem.load().catch((error) => {
            console.log('No existing save file found or loading failed:', error);
        });
    } catch (error) {
        console.log('Load function not available, starting fresh');
    }
    
    // Connect to Twitch chat
    if (twitchAPI.isConnected()) {
        twitchAPI.disconnect();
    }
    
    twitchAPI.connect(streamerName, (messageData) => {
        chatHandler.handleMessage(messageData, gameEngine);
    });
    
    // Start the game
    if (!gameEngine.running) {
        gameEngine.start();
    }
    
    // Reset game state for new connection
    gameEngine.reset();
    
    // Hide config UI after successful connection
    const configPanel = document.getElementById('config-panel');
    const showConfigBtn = document.getElementById('show-config');
    if (configPanel) configPanel.classList.add('hidden');
    if (showConfigBtn) showConfigBtn.style.display = 'none';
    
    // Enable auto-save by default
    upgradeSystem.enableAutoSave();
    
    // Update UI
    updateConnectionStatus(true, streamerName);
    chatHandler.showSystemMessage(`🎮 Connected to ${streamerName}'s chat!`);
    chatHandler.showSystemMessage('💬 Type in chat to damage the boss and earn XP!');
    chatHandler.showSystemMessage('🆙 Level up to choose from 3 random upgrades!');
    chatHandler.showSystemMessage('� Use !choose 1-3 to select upgrades, !stats for progress');
    chatHandler.showSystemMessage('💾 Viewer progress auto-saves to file every 30 seconds');
    
    // Hide config panel
    document.getElementById('config-panel').classList.add('hidden');
    document.getElementById('show-config').style.display = 'block';
}

function updateConnectionStatus(connected, streamerName = '') {
    const connectBtn = document.getElementById('connect-btn');
    
    if (connected) {
        connectBtn.textContent = `Connected to ${streamerName}`;
        connectBtn.style.background = '#28a745';
        connectBtn.disabled = true;
    } else {
        connectBtn.textContent = 'Connect to Chat';
        connectBtn.style.background = '#007bff';
        connectBtn.disabled = false;
    }
}

// Update stats panel display
function updateStatsPanel() {
    const levelDisplay = document.getElementById('level-display');
    const xpDisplay = document.getElementById('xp-display');
    const damageDisplay = document.getElementById('damage-display');
    const upgradesDisplay = document.getElementById('upgrades-display');
    
    if (levelDisplay) {
        // Show stats for the most recent active user or highest level user
        const mostRecentUser = chatHandler.getMostRecentActiveUser();
        const highestLevelUser = upgradeSystem.getHighestLevelUser();
        const displayUser = mostRecentUser || highestLevelUser || 'viewer';
        
        const currentLevel = upgradeSystem.getUserLevel(displayUser);
        const currentXP = upgradeSystem.getUserExperience(displayUser);
        const xpForNext = upgradeSystem.getXPRequiredForLevel(currentLevel + 1);
        const currentLevelXP = upgradeSystem.getXPRequiredForLevel(currentLevel);
        const xpProgress = currentXP - currentLevelXP;
        const xpNeeded = xpForNext - currentLevelXP;
        const userDamage = upgradeSystem.calculateDamage(displayUser);
        
        levelDisplay.textContent = `${displayUser} - Level: ${currentLevel}`;
        xpDisplay.textContent = `XP: ${xpProgress}/${xpNeeded}`;
        damageDisplay.textContent = `Damage: ${userDamage}`;
        
        const userUpgrades = upgradeSystem.getUserUpgrades(displayUser);
        upgradesDisplay.textContent = `Upgrades: ${userUpgrades.length}`;
    }
}

// Start stats update interval
setInterval(updateStatsPanel, 1000);

// Add some keyboard controls for testing/demo purposes
document.addEventListener('keydown', (e) => {
    if (!gameEngine || !gameEngine.gameStarted) return;
    
    switch (e.key.toLowerCase()) {
        case 'r':
            // Reset game (for streamers)
            if (e.ctrlKey) {
                gameEngine.reset();
                upgradeSystem.reset();
                chatHandler.showSystemMessage('🔄 Game and upgrades reset by streamer!');
            }
            break;
            
        case 's':
            // Manual save
            if (e.ctrlKey) {
                e.preventDefault();
                upgradeSystem.save().then(() => {
                    chatHandler.showSystemMessage('💾 Viewer data saved manually!');
                }).catch((err) => {
                    chatHandler.showSystemMessage('❌ Save failed: ' + err.message);
                });
            }
            break;
            
        case 'l':
            // Manual load or show leaderboard
            if (e.ctrlKey) {
                e.preventDefault();
                upgradeSystem.load().then(() => {
                    chatHandler.showSystemMessage('📁 Viewer data loaded!');
                    // Update community ship with visual upgrades
                    if (gameEngine && gameEngine.communityShip) {
                        chatHandler.applyUpgradesToShip(gameEngine.communityShip);
                    }
                }).catch(() => {
                    chatHandler.showSystemMessage('❌ Load cancelled or failed');
                });
            } else {
                // Show leaderboard
                chatHandler.handleLeaderboardCommand();
            }
            break;
            
        case 'h':
            // Toggle help
            chatHandler.handleHelpCommand();
            break;
    }
});

// Handle window visibility changes (pause when not visible)
document.addEventListener('visibilitychange', () => {
    if (gameEngine) {
        if (document.hidden) {
            // Page is hidden, could pause game updates
            console.log('Game paused (tab hidden)');
        } else {
            // Page is visible again
            console.log('Game resumed (tab visible)');
        }
    }
});

// Add error handling for the game
window.addEventListener('error', (e) => {
    console.error('Game error:', e.error);
    
    // Try to recover by restarting the game engine
    if (gameEngine && gameConfig.streamerName) {
        setTimeout(() => {
            try {
                gameEngine.stop();
                window.gameEngine = new GameEngine(document.getElementById('game-canvas'));
                if (gameConfig.streamerName) {
                    gameEngine.start();
                    chatHandler.showSystemMessage('⚠️ Game recovered from error');
                }
            } catch (recoveryError) {
                console.error('Failed to recover:', recoveryError);
                if (chatHandler && chatHandler.showSystemMessage) {
                    chatHandler.showSystemMessage('❌ Game error - please refresh the page');
                }
            }
        }, 1000);
    }
});

// Performance monitoring
setInterval(() => {
    if (gameEngine && gameEngine.running) {
        const stats = {
            communityShip: gameEngine.communityShip ? 'Active' : 'None',
            bullets: gameEngine.bullets.length,
            asteroids: gameEngine.asteroids.length,
            bossHP: gameConfig.getBossHPPercentage().toFixed(1),
            connectedUsers: upgradeSystem.userLevels.size
        };
        
        console.log('Game stats:', stats);
    }
}, 30000); // Log every 30 seconds
