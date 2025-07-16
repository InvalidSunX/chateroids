// Twitch Chat API integration
class TwitchChatAPI {
    constructor() {
        this.ws = null;
        this.connected = false;
        this.channelName = '';
        this.onMessageCallback = null;
    }
    
    connect(channelName, onMessage) {
        this.channelName = channelName.toLowerCase();
        this.onMessageCallback = onMessage;
        
        // Connect to Twitch IRC via WebSocket
        this.ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
        
        this.ws.onopen = () => {
            console.log('Connected to Twitch chat');
            // Send authentication (anonymous)
            this.ws.send('PASS SCHMOOPIIE');
            this.ws.send('NICK justinfan12345');
            this.ws.send(`JOIN #${this.channelName}`);
        };
        
        this.ws.onmessage = (event) => {
            this.handleMessage(event.data);
        };
        
        this.ws.onclose = () => {
            console.log('Disconnected from Twitch chat');
            this.connected = false;
            // Attempt to reconnect after 5 seconds
            setTimeout(() => {
                if (this.channelName) {
                    this.connect(this.channelName, this.onMessageCallback);
                }
            }, 5000);
        };
        
        this.ws.onerror = (error) => {
            console.error('Twitch chat error:', error);
        };
    }
    
    handleMessage(rawMessage) {
        const lines = rawMessage.split('\r\n');
        
        for (const line of lines) {
            if (line.startsWith('PING')) {
                this.ws.send('PONG :tmi.twitch.tv');
                continue;
            }
            
            // Parse chat messages
            const messageMatch = line.match(/:(\w+)!\w+@\w+\.tmi\.twitch\.tv PRIVMSG #\w+ :(.+)/);
            if (messageMatch) {
                const [, username, message] = messageMatch;
                this.connected = true;
                
                if (this.onMessageCallback) {
                    this.onMessageCallback({
                        username: username,
                        message: message.trim(),
                        timestamp: Date.now()
                    });
                }
            }
        }
    }
    
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.connected = false;
        this.channelName = '';
    }
    
    isConnected() {
        return this.connected;
    }
}

// Initialize global Twitch API
window.twitchAPI = new TwitchChatAPI();
