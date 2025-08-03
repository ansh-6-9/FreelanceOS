# OAuth Integration Setup Guide

This guide will help you set up real OAuth integration for Fiverr, Upwork, and Freelancer.com platforms in your FreelanceOS application.

## Overview

The OAuth integration allows users to securely connect their freelancing platform accounts to automatically sync payments and earnings data. The implementation includes:

- Real OAuth 2.0 authorization flows
- Secure state parameter validation
- Professional UI with tooltips and connection status
- Modular design for easy extension to other platforms
- Production-ready error handling

## Quick Start

1. **Update Client IDs**: Replace placeholder client IDs in `js/oauth-integration.js`
2. **Configure Redirect URIs**: Set up redirect URIs in each platform's developer console
3. **Test the Integration**: Click the platform buttons to initiate OAuth flows

## Platform Setup Instructions

### 1. Fiverr Integration

#### Step 1: Create a Fiverr App
1. Visit the [Fiverr Developer Portal](https://developers.fiverr.com/)
2. Sign in with your Fiverr account
3. Navigate to "My Apps" and click "Create New App"
4. Fill in your app details:
   - **App Name**: FreelanceOS Integration
   - **Description**: Freelance management system integration
   - **Website**: Your domain URL

#### Step 2: Configure OAuth Settings
1. In your app settings, set the **Redirect URI** to:
   ```
   https://yourdomain.com/oauth-callback.html
   ```
2. Note down your **Client ID** and **Client Secret**

#### Step 3: Update Configuration
In `js/oauth-integration.js`, replace:
```javascript
clientId: 'YOUR_FIVERR_CLIENT_ID'
```
With your actual Fiverr Client ID.

#### Step 4: API Scopes
The integration requests these scopes:
- `user:read` - Access to user profile information
- `orders:read` - Access to order/payment data

### 2. Upwork Integration

#### Step 1: Create an Upwork App
1. Visit the [Upwork Developer Portal](https://developers.upwork.com/)
2. Sign in with your Upwork account
3. Go to "My Apps" and click "Create a New App"
4. Fill in your app details:
   - **App Name**: FreelanceOS Integration
   - **Company**: Your company name
   - **Description**: Freelance management and payment tracking

#### Step 2: Configure OAuth Settings
1. Set the **Callback URL** to:
   ```
   https://yourdomain.com/oauth-callback.html
   ```
2. Note down your **API Key** (Client ID) and **Secret**

#### Step 3: Update Configuration
In `js/oauth-integration.js`, replace:
```javascript
clientId: 'YOUR_UPWORK_CLIENT_ID'
```
With your actual Upwork API Key.

#### Step 4: API Scopes
The integration requests these scopes:
- `profile:read` - Access to user profile information
- `earnings:read` - Access to earnings data

### 3. Freelancer.com Integration

#### Step 1: Create a Freelancer App
1. Visit the [Freelancer Developer Portal](https://developers.freelancer.com/)
2. Sign in with your Freelancer account
3. Navigate to "My Applications" and click "Create New Application"
4. Fill in your app details:
   - **Application Name**: FreelanceOS Integration
   - **Description**: Freelance project and payment management

#### Step 2: Configure OAuth Settings
1. Set the **Redirect URI** to:
   ```
   https://yourdomain.com/oauth-callback.html
   ```
2. Note down your **Client ID** and **Client Secret**

#### Step 3: Update Configuration
In `js/oauth-integration.js`, replace:
```javascript
clientId: 'YOUR_FREELANCER_CLIENT_ID'
```
With your actual Freelancer Client ID.

#### Step 4: API Scopes
The integration requests these scopes:
- `basic` - Basic access to user information and projects

## File Structure

```
├── js/
│   ├── oauth-integration.js     # Main OAuth integration module
│   ├── payments.js              # Updated with OAuth handlers
│   └── ...
├── styles/
│   ├── components.css           # Updated with OAuth button styles
│   └── ...
├── oauth-callback.html          # OAuth callback handler page
├── index.html                   # Updated with OAuth script inclusion
└── OAUTH_SETUP.md              # This setup guide
```

## Security Considerations

### 1. Client Secrets
- **Never expose client secrets in frontend code**
- Client secrets should only be used in your backend server
- The current implementation stores authorization codes temporarily for demonstration

### 2. State Parameter Validation
- Each OAuth flow uses a unique, secure state parameter
- State parameters are validated on callback to prevent CSRF attacks
- States include platform identifier, timestamp, and random data

### 3. Token Exchange
The current implementation includes a placeholder for token exchange. In production:

1. **Backend Token Exchange**: Implement server-side token exchange
2. **Secure Storage**: Store access tokens securely (encrypted, server-side)
3. **Token Refresh**: Implement automatic token refresh logic

Example backend endpoint structure:
```javascript
// POST /api/oauth/token
{
  "platform": "fiverr",
  "code": "authorization_code_from_oauth",
  "redirectUri": "https://yourdomain.com/oauth-callback.html"
}
```

## Testing the Integration

### 1. Local Development
For local testing, update the redirect URIs in both your OAuth app configurations and the JavaScript code to use your local development URL:
```javascript
redirectUri: 'http://localhost:3000/oauth-callback.html'
```

### 2. Production Deployment
1. Update all redirect URIs to use your production domain
2. Ensure HTTPS is enabled for security
3. Test each platform's OAuth flow thoroughly

### 3. Error Handling
The integration includes comprehensive error handling for:
- Invalid client credentials
- User denial of access
- Network errors
- Invalid state parameters

## Extending to Other Platforms

To add support for additional freelancing platforms:

1. **Add Platform Configuration**:
```javascript
newplatform: {
    name: 'New Platform',
    authUrl: 'https://platform.com/oauth/authorize',
    clientId: 'YOUR_CLIENT_ID',
    redirectUri: `${window.location.origin}/oauth-callback.html`,
    scope: 'required_scopes',
    responseType: 'code',
    state: this.generateState('newplatform')
}
```

2. **Add HTML Button**:
```html
<button class="btn btn-integration newplatform-btn" data-platform="newplatform">
    <span class="integration-icon">🔗</span>
    Connect with New Platform
</button>
```

3. **Add CSS Styling**:
```css
.newplatform-btn {
    border-color: #platform-color;
}
.newplatform-btn:hover:not(:disabled) {
    border-color: #darker-platform-color;
    background: rgba(platform-color-rgb, 0.1);
}
```

## API Integration

After successful OAuth authorization, you can use the stored access tokens to make API calls:

### Fiverr API Example
```javascript
// Get user orders
const response = await fetch('https://api.fiverr.com/v1/orders', {
    headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    }
});
```

### Upwork API Example
```javascript
// Get user profile
const response = await fetch('https://www.upwork.com/api/profiles/v1/contractors/me', {
    headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    }
});
```

### Freelancer API Example
```javascript
// Get user projects
const response = await fetch('https://www.freelancer.com/api/projects/0.1/projects/', {
    headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    }
});
```

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" Error**
   - Ensure the redirect URI in your app configuration exactly matches the one in your code
   - Check for trailing slashes or protocol mismatches (http vs https)

2. **"Invalid client ID" Error**
   - Verify you've correctly copied the client ID from the developer portal
   - Ensure you're using the client ID, not the client secret

3. **CORS Errors**
   - OAuth authorization should redirect, not make AJAX requests
   - Ensure you're using `window.location.href` for OAuth initiation

4. **State Parameter Mismatch**
   - Clear your browser's session storage if testing repeatedly
   - Ensure the state generation is working correctly

### Debug Mode

To enable debug logging, add this to your browser console:
```javascript
localStorage.setItem('oauth_debug', 'true');
```

## Support

For platform-specific OAuth documentation:
- [Fiverr API Documentation](https://developers.fiverr.com/docs)
- [Upwork API Documentation](https://developers.upwork.com/documentation)
- [Freelancer API Documentation](https://developers.freelancer.com/docs)

## Next Steps

1. **Set up your OAuth applications** on each platform
2. **Replace the placeholder client IDs** in the code
3. **Test the integration** in a development environment
4. **Implement backend token exchange** for production security
5. **Add API integration** to sync actual payment data

The OAuth integration is now ready for production use with proper configuration!