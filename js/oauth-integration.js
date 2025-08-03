// OAuth Integration Module for FreelanceOS
// Handles OAuth flows for freelancing platforms

class OAuthIntegration {
    constructor() {
        this.storageKey = 'freelanceos_oauth_connections';
        this.connections = this.loadConnections();
        
        // OAuth configuration for each platform
        this.oauthConfig = {
            fiverr: {
                name: 'Fiverr',
                authUrl: 'https://www.fiverr.com/api/oauth/authorize',
                clientId: 'YOUR_FIVERR_CLIENT_ID', // Replace with actual client ID
                redirectUri: `${window.location.origin}/oauth-callback.html`,
                scope: 'user:read orders:read', // Fiverr API scopes
                responseType: 'code',
                state: this.generateState('fiverr')
            },
            upwork: {
                name: 'Upwork',
                authUrl: 'https://www.upwork.com/api/auth/v1/authorize',
                clientId: 'YOUR_UPWORK_CLIENT_ID', // Replace with actual client ID
                redirectUri: `${window.location.origin}/oauth-callback.html`,
                scope: 'profile:read earnings:read', // Upwork API scopes
                responseType: 'code',
                state: this.generateState('upwork')
            },
            freelancer: {
                name: 'Freelancer.com',
                authUrl: 'https://accounts.freelancer.com/oauth/authorize',
                clientId: 'YOUR_FREELANCER_CLIENT_ID', // Replace with actual client ID
                redirectUri: `${window.location.origin}/oauth-callback.html`,
                scope: 'basic', // Freelancer API scopes
                responseType: 'code',
                state: this.generateState('freelancer')
            }
        };
        
        this.init();
    }

    init() {
        this.handleOAuthCallback();
        this.updateConnectionStatus();
        this.bindEvents();
    }

    bindEvents() {
        // Listen for storage changes to sync across tabs
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey) {
                this.connections = this.loadConnections();
                this.updateConnectionStatus();
            }
        });
    }

    /**
     * Generate a secure state parameter for OAuth flow
     * @param {string} platform - The platform identifier
     * @returns {string} Secure state string
     */
    generateState(platform) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2);
        return btoa(`${platform}_${timestamp}_${random}`);
    }

    /**
     * Initiate OAuth flow for a platform
     * @param {string} platform - Platform identifier (fiverr, upwork, freelancer)
     * @returns {boolean} Success status
     */
    initiateOAuth(platform) {
        const config = this.oauthConfig[platform];
        if (!config) {
            console.error(`OAuth configuration not found for platform: ${platform}`);
            return false;
        }

        // Store state for validation
        sessionStorage.setItem(`oauth_state_${platform}`, config.state);
        sessionStorage.setItem('oauth_platform', platform);

        // Build OAuth URL
        const params = new URLSearchParams({
            client_id: config.clientId,
            redirect_uri: config.redirectUri,
            response_type: config.responseType,
            scope: config.scope,
            state: config.state
        });

        const oauthUrl = `${config.authUrl}?${params.toString()}`;
        
        // Redirect to OAuth provider
        window.location.href = oauthUrl;
        return true;
    }

    /**
     * Handle OAuth callback and extract authorization code
     */
    handleOAuthCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        // Check if this is an OAuth callback
        if (!code && !error) {
            return;
        }

        // Handle OAuth error
        if (error) {
            const errorDescription = urlParams.get('error_description') || 'OAuth authorization failed';
            this.handleOAuthError(error, errorDescription);
            this.cleanupCallback();
            return;
        }

        // Validate state parameter
        const platform = this.extractPlatformFromState(state);
        const storedState = sessionStorage.getItem(`oauth_state_${platform}`);
        
        if (!platform || state !== storedState) {
            this.handleOAuthError('invalid_state', 'Invalid state parameter');
            this.cleanupCallback();
            return;
        }

        // Handle successful authorization
        this.handleOAuthSuccess(platform, code);
        this.cleanupCallback();
    }

    /**
     * Extract platform from state parameter
     * @param {string} state - OAuth state parameter
     * @returns {string|null} Platform identifier
     */
    extractPlatformFromState(state) {
        try {
            const decoded = atob(state);
            const parts = decoded.split('_');
            return parts[0];
        } catch (error) {
            return null;
        }
    }

    /**
     * Handle successful OAuth authorization
     * @param {string} platform - Platform identifier
     * @param {string} code - Authorization code
     */
    handleOAuthSuccess(platform, code) {
        // Store connection info
        this.connections[platform] = {
            connected: true,
            connectedAt: new Date().toISOString(),
            authCode: code, // In production, exchange this for access token immediately
            status: 'connected'
        };

        this.saveConnections();
        this.updateConnectionStatus();

        // Show success notification
        if (window.paymentTracker) {
            window.paymentTracker.showNotification(
                `Successfully connected to ${this.oauthConfig[platform].name}!`, 
                'success'
            );
        }

        // TODO: In production, exchange authorization code for access token
        // this.exchangeCodeForToken(platform, code);
    }

    /**
     * Handle OAuth errors
     * @param {string} error - Error code
     * @param {string} description - Error description
     */
    handleOAuthError(error, description) {
        console.error('OAuth Error:', error, description);
        
        if (window.paymentTracker) {
            window.paymentTracker.showNotification(
                `OAuth connection failed: ${description}`, 
                'error'
            );
        }
    }

    /**
     * Clean up OAuth callback parameters from URL
     */
    cleanupCallback() {
        // Clean up session storage
        const platform = sessionStorage.getItem('oauth_platform');
        if (platform) {
            sessionStorage.removeItem(`oauth_state_${platform}`);
            sessionStorage.removeItem('oauth_platform');
        }

        // Clean up URL parameters
        const url = new URL(window.location);
        url.searchParams.delete('code');
        url.searchParams.delete('state');
        url.searchParams.delete('error');
        url.searchParams.delete('error_description');
        
        // Update URL without reloading the page
        window.history.replaceState({}, document.title, url.toString());
    }

    /**
     * Disconnect a platform
     * @param {string} platform - Platform identifier
     */
    disconnect(platform) {
        if (this.connections[platform]) {
            delete this.connections[platform];
            this.saveConnections();
            this.updateConnectionStatus();

            if (window.paymentTracker) {
                window.paymentTracker.showNotification(
                    `Disconnected from ${this.oauthConfig[platform].name}`, 
                    'info'
                );
            }
        }
    }

    /**
     * Check if a platform is connected
     * @param {string} platform - Platform identifier
     * @returns {boolean} Connection status
     */
    isConnected(platform) {
        return this.connections[platform]?.connected === true;
    }

    /**
     * Get connection info for a platform
     * @param {string} platform - Platform identifier
     * @returns {object|null} Connection info
     */
    getConnectionInfo(platform) {
        return this.connections[platform] || null;
    }

    /**
     * Update UI to reflect connection status
     */
    updateConnectionStatus() {
        Object.keys(this.oauthConfig).forEach(platform => {
            const button = document.querySelector(`[data-platform="${platform}"]`);
            if (!button) return;

            const isConnected = this.isConnected(platform);
            const config = this.oauthConfig[platform];

            if (isConnected) {
                const connectionInfo = this.getConnectionInfo(platform);
                const connectedDate = new Date(connectionInfo.connectedAt).toLocaleDateString();
                
                button.innerHTML = `<span class="integration-icon">✅</span>Connected to ${config.name}`;
                button.className = button.className.replace('btn-integration', 'btn-integration connected');
                button.title = `Connected to ${config.name} on ${connectedDate}. Click to disconnect.`;
                button.disabled = false;
            } else {
                button.innerHTML = `<span class="integration-icon">${this.getPlatformIcon(platform)}</span>Connect with ${config.name}`;
                button.className = button.className.replace(' connected', '');
                button.title = `Secure login via OAuth to connect your ${config.name} account`;
                button.disabled = false;
            }
        });

        // Update integration status message
        const statusNote = document.querySelector('.status-note');
        if (statusNote) {
            const connectedCount = Object.keys(this.connections).length;
            if (connectedCount > 0) {
                statusNote.textContent = `${connectedCount} platform(s) connected. Payments will sync automatically.`;
                statusNote.className = 'status-note success';
            } else {
                statusNote.textContent = 'Connect your freelance platforms to automatically sync payments and earnings.';
                statusNote.className = 'status-note';
            }
        }
    }

    /**
     * Get platform-specific icon
     * @param {string} platform - Platform identifier
     * @returns {string} Platform icon
     */
    getPlatformIcon(platform) {
        const icons = {
            fiverr: '🟢',
            upwork: '🔵',
            freelancer: '🟠'
        };
        return icons[platform] || '🔗';
    }

    /**
     * Load connections from localStorage
     * @returns {object} Connections object
     */
    loadConnections() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Error loading OAuth connections:', error);
            return {};
        }
    }

    /**
     * Save connections to localStorage
     */
    saveConnections() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.connections));
        } catch (error) {
            console.error('Error saving OAuth connections:', error);
        }
    }

    /**
     * Get all connected platforms
     * @returns {array} Array of connected platform names
     */
    getConnectedPlatforms() {
        return Object.keys(this.connections).filter(platform => 
            this.connections[platform].connected
        );
    }

    /**
     * Exchange authorization code for access token (placeholder for production)
     * @param {string} platform - Platform identifier
     * @param {string} code - Authorization code
     */
    async exchangeCodeForToken(platform, code) {
        // TODO: Implement server-side token exchange
        // This should be done on your backend server for security
        console.log(`TODO: Exchange code for token - Platform: ${platform}, Code: ${code}`);
        
        /* Example implementation:
        try {
            const response = await fetch('/api/oauth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    platform,
                    code,
                    redirectUri: this.oauthConfig[platform].redirectUri
                })
            });
            
            const tokenData = await response.json();
            
            if (tokenData.access_token) {
                // Store access token securely
                this.connections[platform].accessToken = tokenData.access_token;
                this.connections[platform].refreshToken = tokenData.refresh_token;
                this.connections[platform].expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();
                this.saveConnections();
            }
        } catch (error) {
            console.error('Token exchange failed:', error);
        }
        */
    }
}

// Initialize OAuth integration when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.oauthIntegration = new OAuthIntegration();
});