# 🚀 Chateroids - Interactive Twitch Chat Asteroids Game

> A browser-based overlay that turns your Twitch chat into an interactive asteroids game! Viewers level up, choose upgrades, and battle a boss together through chat messages.

![Game Preview](https://img.shields.io/badge/Status-Ready%20to%20Play-brightgreen)
![Browser Support](https://img.shields.io/badge/Browser-Chrome%2085%2B%20Recommended-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🎮 Features

- **📺 Stream Overlay Ready**: Perfect for OBS/Streamlabs Browser Source
- **⚡ Real-time Chat Integration**: Connects to any Twitch channel via WebSocket
- **🆙 Level-Based Progression**: Viewers gain XP and levels from chatting
- **🛡️ 16+ Unique Upgrades**: Stackable abilities that enhance combat power
- **💾 Persistent Progress**: File-based save system that survives restarts
- **🎯 Single Community Ship**: One ship fires based on all viewer interactions
- **🏆 Leaderboards**: Track top players by level and upgrades

## 🎯 How It Works

### For Streamers
1. Download and open `index.html` in your browser
2. Configure your Twitch channel and boss HP
3. Add as Browser Source in OBS (1920×1080 recommended)
4. Viewers interact through chat automatically!

### For Viewers
- **Chat = Attack**: Every message deals damage and earns 1 XP
- **Level Up**: Gain levels to unlock upgrade choices
- **Choose Upgrades**: Type `!choose 1-3` when you level up
- **Get Stronger**: Your upgrades make future shots more powerful

## 🚀 Quick Start Guide

### Step 1: Download
```bash
# Clone the repository
git clone https://github.com/[username]/chateroids.git
cd chateroids

# Or download ZIP and extract
```

### Step 2: Open in Browser
1. Navigate to the `chateroids` folder
2. Double-click `index.html` or drag it into your browser
3. **Chrome 85+ recommended** for best file saving features

### Step 3: Configure
1. Click the ⚙️ gear icon in the top-left
2. Enter your **Twitch username** (the channel to monitor)
3. Set **Boss HP** (recommended: 2000 for new streams)
4. Click **"Connect to Chat"**

### Step 4: Add to OBS/Streamlabs
1. Add **Browser Source**
2. **URL**: `file:///path/to/your/chateroids/index.html`
3. **Width**: 1920, **Height**: 1080
4. ✅ Check "Shutdown source when not visible"
5. ✅ Check "Refresh browser when scene becomes active"

## 📋 Detailed Setup Instructions

### Browser Source Settings
```
URL: file:///C:/path/to/chateroids/index.html  (Windows)
URL: file:///Users/username/chateroids/index.html  (Mac)
URL: file:///home/username/chateroids/index.html  (Linux)

Width: 1920
Height: 1080
FPS: 30
CSS: (leave blank for default transparency)

☑️ Shutdown source when not visible
☑️ Refresh browser when scene becomes active
☐ Control audio via OBS (unchecked)
```

### Boss HP Recommendations
- **New Channel**: 1000-2000 HP
- **Small Community (10-50 viewers)**: 3000-5000 HP  
- **Medium Community (50-200 viewers)**: 5000-10000 HP
- **Large Community (200+ viewers)**: 10000+ HP

*Formula: Level 1 damage (10) × expected participants × 20*

## 🎮 Chat Commands

| Command | Description | Example |
|---------|-------------|---------|
| `!stats` | View your level, XP, and damage | `!stats` |
| `!upgrades` | List your current upgrades | `!upgrades` |
| `!choose <1-3>` | Select upgrade when leveling up | `!choose 2` |
| `!leaderboard` | Show top 3 players | `!leaderboard` |
| `!help` | Display command help | `!help` |

## 🛡️ Upgrade System

### 💥 Damage Upgrades
- **Damage Boost** (+2 damage) - Stackable
- **Critical Hit** (10% chance 2x damage) - Stackable  
- **Armor Pierce** (+50% boss damage) - Stackable
- **Explosive Rounds** (area damage) - Unique

### 🔥 Rate of Fire
- **Rapid Fire** (-20% cooldown) - Stackable
- **Burst Fire** (+2 shots per message) - Stackable
- **Auto Fire** (periodic shooting) - Unique

### 🎯 Multi-Shot  
- **Dual Shot** (+1 simultaneous shot) - Stackable
- **Spread Shot** (wide arc firing) - Stackable
- **Ricochet** (bouncing bullets) - Unique

### ⚡ Special Abilities
- **Shield Generator** (absorb boss attacks) - Stackable
- **Laser Sight** (+25% accuracy/damage) - Stackable  
- **Overcharge** (next shot 3x damage) - Stackable
- **Time Slow** (slow boss movement) - Unique

### 🔧 Utility
- **XP Boost** (+50% experience) - Stackable
- **Lucky Shot** (5% instant boss damage) - Stackable
- **Regeneration** (repair ship damage) - Stackable
- **Magnetism** (attract bonuses) - Unique

## 💾 Data Management

### Auto-Save
- Saves viewer progress every 30 seconds
- Creates files like `chateroids-username-data.json`
- Progress survives browser/computer restarts

### Manual Controls
- **Ctrl+S**: Manual save
- **Ctrl+L**: Load save file  
- **Ctrl+R**: Reset all progress (streamer only)

### Backup & Transfer
1. Save files are human-readable JSON
2. Copy `.json` files to backup viewer progress
3. Move files between computers to transfer data

## 🔧 Troubleshooting

### Chat Not Connecting
- ✅ Check Twitch username spelling (case-insensitive)
- ✅ Ensure internet connection is stable
- ✅ Try refreshing the browser source in OBS
- ✅ Check browser console (F12) for error messages

### Performance Issues
- Lower OBS browser source FPS to 30
- Reduce boss HP if too many bullets on screen
- Close other browser tabs while streaming
- Use Chrome for best performance

### Save/Load Issues
- **Chrome 85+** required for modern file API
- Manual download/upload fallback available
- Check browser permissions for file access
- Save files as backup before major updates

## 🛠️ Customization

### Modify Game Settings
Edit `js/config.js`:
```javascript
this.baseDamage = 10;        // Starting damage per shot
this.asteroidCount = 8;      // Number of asteroids on screen
this.bulletSpeed = 7;        // How fast bullets travel
```

### Add New Upgrades
Edit `js/upgrade-system.js` in the `upgradeTypes` object:
```javascript
'my_upgrade': { 
    name: 'My Upgrade', 
    description: 'Does something cool', 
    stackable: true 
}
```

### Style Changes
Edit `styles/main.css` to customize:
- Colors and themes
- UI positioning  
- Animation effects
- Font styles

## 📊 Analytics & Monitoring

### Viewer Engagement Metrics
- Track level progression over time
- Monitor upgrade choice popularity  
- Analyze chat participation rates
- Export leaderboard data

### Stream Health Indicators
- Boss defeat frequency
- Average viewer level
- Upgrade distribution
- Session participation rates

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup
```bash
git clone https://github.com/[username]/chateroids.git
cd chateroids
# No build process needed - pure HTML/JS!
# Just open index.html in browser for testing
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

- **Original Concept**: Interactive chat gaming for streamers
- **Twitch Integration**: Uses Twitch IRC WebSocket API
- **File System API**: Modern browser file management
- **Community**: Thanks to all streamers and viewers who test and provide feedback!

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/[username]/chateroids/issues)
- **Discussions**: [GitHub Discussions](https://github.com/[username]/chateroids/discussions)
- **Updates**: Watch this repo for new features and fixes

---

**Made with ❤️ for the streaming community**

*Transform your chat into an epic space battle! 🚀*
