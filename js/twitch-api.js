// Twitch Chat API integration with bot messaging capability
class TwitchChatAPI {
    constructor() {
        this.ws = null;
        this.connected = false;
        this.channelName = '';
        this.onMessageCallback = null;
        
        // Bot configuration - you'll need to set these
        this.botUsername = ''; // Your bot's Twitch username
        this.botOAuthToken = ''; // OAuth token for your bot (get from https://twitchapps.com/tmi/)
        this.canSendMessages = false; // Will be true when bot credentials are provided
    }
    
    // Configure bot credentials for sending messages
    configureBotCredentials(botUsername, oauthToken) {
        this.botUsername = botUsername.toLowerCase();
        this.botOAuthToken = oauthToken;
        this.canSendMessages = true;
        console.log(`Bot configured: ${this.botUsername}`);
    }
    
    connect(channelName, onMessage) {
        this.channelName = channelName.toLowerCase();
        this.onMessageCallback = onMessage;
        
        // Connect to Twitch IRC via WebSocket
        this.ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
        
        this.ws.onopen = () => {
            console.log('Connected to Twitch chat');
            
            if (this.canSendMessages && this.botOAuthToken && this.botUsername) {
                // Authenticated connection for bot
                this.ws.send(`PASS oauth:${this.botOAuthToken}`);
                this.ws.send(`NICK ${this.botUsername}`);
            } else {
                // Anonymous connection for reading only
                this.ws.send('PASS SCHMOOPIIE');
                this.ws.send('NICK justinfan12345');
            }
            
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
    
    // Send a message to chat (requires bot credentials)
    sendMessage(message) {
        if (!this.connected || !this.canSendMessages || !this.ws) {
            console.warn('Cannot send message: not connected with bot credentials');
            return false;
        }
        
        try {
            this.ws.send(`PRIVMSG #${this.channelName} :${message}`);
            console.log(`Bot sent: ${message}`);
            return true;
        } catch (error) {
            console.error('Error sending message:', error);
            return false;
        }
    }
}

// Initialize global Twitch API
window.twitchAPI = new TwitchChatAPI();
