# Contributing to Chateroids

Thank you for your interest in contributing to Chateroids! This project is designed to be a community-driven tool for streamers and their viewers.

## 🎯 Ways to Contribute

### 🐛 Bug Reports
- Use the [Issues](https://github.com/InvalidSunX/chateroids/issues) page
- Include browser version, OS, and steps to reproduce
- Attach screenshots or video if helpful

### 💡 Feature Requests
- Check existing issues first to avoid duplicates
- Describe the feature and why it would be useful
- Consider how it fits with the streaming overlay use case

### 🔧 Code Contributions
- Fork the repository
- Create a feature branch
- Make your changes
- Test thoroughly
- Submit a pull request

## 🛠️ Development Setup

### Prerequisites
- Modern web browser (Chrome 85+ recommended)
- Basic knowledge of HTML/CSS/JavaScript
- No build tools required!

### Local Development
```bash
1. Fork and clone the repository
   git clone https://github.com/yourusername/chateroids.git

2. Navigate to the project directory
   cd chateroids

3. Open index.html in your browser
   # No server needed - just double-click the file!

4. Make your changes and test locally

5. Test with a real Twitch channel to ensure chat integration works
```

## 📋 Pull Request Guidelines

### Before Submitting
- [ ] Test your changes thoroughly
- [ ] Ensure chat integration still works
- [ ] Verify browser source compatibility with OBS
- [ ] Update documentation if needed
- [ ] Keep changes focused and atomic

### PR Description Template
```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## Testing
- [ ] Tested locally in browser
- [ ] Tested with real Twitch chat
- [ ] Tested as OBS browser source
- [ ] No console errors

## Screenshots/Videos
(If applicable)
```

## 🎨 Code Style

### JavaScript
- Use modern ES6+ features
- Prefer `const` and `let` over `var`
- Use descriptive variable names
- Add comments for complex logic
- Keep functions focused and small

### CSS
- Use meaningful class names
- Group related styles together
- Comment complex animations or layouts
- Maintain responsive design principles

### HTML
- Use semantic HTML elements
- Keep structure clean and accessible
- Ensure overlay transparency works correctly

## 🏗️ Project Structure

```
chateroids/
├── index.html              # Main entry point
├── styles/
│   └── main.css            # All styling
├── js/
│   ├── config.js           # Game configuration
│   ├── twitch-api.js       # Twitch chat integration
│   ├── game-objects.js     # Ship, Boss, Bullet classes
│   ├── upgrade-system.js   # Level and upgrade logic
│   ├── chat-handler.js     # Chat command processing
│   ├── game-engine.js      # Main game loop
│   └── main.js             # Application initialization
├── README.md               # Project documentation
├── LICENSE                 # MIT license
└── .gitignore             # Git ignore rules
```

## 🎮 Feature Areas

### Priority Areas for Contribution
1. **New Upgrade Types** - Add creative upgrade ideas
2. **Visual Effects** - Enhance bullet trails, explosions, etc.
3. **Boss Mechanics** - Add boss attack patterns or behaviors
4. **Performance** - Optimize for better FPS with many viewers
5. **Accessibility** - Improve screen reader support
6. **Mobile Support** - Better responsive design

### Core Systems (Be Careful!)
- Twitch chat integration
- File save/load system
- OBS browser source compatibility

## 🧪 Testing Checklist

Before submitting changes, please verify:

### Basic Functionality
- [ ] Page loads without errors
- [ ] Configuration panel works
- [ ] Can connect to Twitch chat
- [ ] Chat messages trigger bullets
- [ ] Level up system functions
- [ ] Upgrade selection works
- [ ] Save/load system operates

### Browser Source Testing
- [ ] Works as OBS browser source
- [ ] Transparent background maintained
- [ ] No layout issues at 1920x1080
- [ ] Performance acceptable with many bullets

### Cross-Browser Testing
- [ ] Chrome (primary target)
- [ ] Firefox
- [ ] Edge
- [ ] Safari (if available)

## 🔄 Release Process

1. Features are developed in feature branches
2. Pull requests are reviewed by maintainers
3. Merged changes are tested in staging
4. Releases are tagged with version numbers
5. Release notes document new features and fixes

## 🤝 Community Guidelines

- Be respectful and inclusive
- Help newcomers learn and contribute
- Focus on constructive feedback
- Keep discussions relevant to the project
- Remember this is a tool for streamers - prioritize their needs

## 📞 Getting Help

- **Questions**: Use [GitHub Discussions](https://github.com/InvalidSunX/chateroids/discussions)
- **Bugs**: Create an [Issue](https://github.com/InvalidSunX/chateroids/issues)
- **Real-time Help**: Check if there's a Discord server linked in README

## 🏆 Recognition

Contributors will be:
- Listed in release notes for significant contributions
- Mentioned in the README credits section
- Invited to help review future PRs

Thank you for helping make Chateroids better for the streaming community! 🚀
