#!/usr/bin/env node
/**
 * Dropbox OAuth Flow - Get Refresh Token
 *
 * This script helps you obtain a refresh token from Dropbox.
 * Run it and follow the instructions.
 */

const http = require('http');
const { parse } = require('url');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const APP_KEY = process.env.DROPBOX_APP_KEY;
const APP_SECRET = process.env.DROPBOX_APP_SECRET;
const REDIRECT_URI = 'http://localhost:3000/auth/dropbox/callback';
const PORT = 3000;

if (!APP_KEY || !APP_SECRET) {
  console.error('❌ Missing DROPBOX_APP_KEY or DROPBOX_APP_SECRET in .env.local');
  process.exit(1);
}

// Step 1: Generate authorization URL
const authUrl = `https://www.dropbox.com/oauth2/authorize?client_id=${APP_KEY}&response_type=code&token_access_type=offline&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

console.log('\n🔐 Dropbox Refresh Token Setup\n');
console.log('Step 1: Open this URL in your browser:');
console.log('----------------------------------------');
console.log(authUrl);
console.log('----------------------------------------\n');
console.log('Step 2: Authorize the app');
console.log('Step 3: You will be redirected back (we will capture the code)\n');
console.log('Starting local server on port', PORT, '...\n');

// Step 2: Create local server to capture callback
const server = http.createServer(async (req, res) => {
  const queryObject = parse(req.url, true).query;
  const code = queryObject.code;

  if (!code) {
    res.writeHead(400, { 'Content-Type': 'text/html' });
    res.end('<h1>Error: No authorization code received</h1>');
    return;
  }

  console.log('✅ Authorization code received:', code);
  console.log('\nExchanging code for tokens...\n');

  try {
    // Step 3: Exchange code for tokens
    const tokenResponse = await fetch('https://api.dropbox.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${APP_KEY}:${APP_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${tokenResponse.status} - ${error}`);
    }

    const tokens = await tokenResponse.json();

    console.log('✅ SUCCESS! Tokens received:\n');
    console.log('Access Token (expires in ~4 hours):');
    console.log(tokens.access_token);
    console.log('\n🎯 Refresh Token (use this - never expires):');
    console.log(tokens.refresh_token);
    console.log('\nToken Type:', tokens.token_type);
    console.log('Expires In:', tokens.expires_in, 'seconds');
    console.log('Scope:', tokens.scope || 'N/A');
    console.log('UID:', tokens.uid || 'N/A');
    console.log('Account ID:', tokens.account_id);

    console.log('\n📝 Add this to your .env.local file:');
    console.log('----------------------------------------');
    console.log(`MONICA_DROPBOX_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log('----------------------------------------\n');

    // Send success response to browser
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <head>
          <title>Success!</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              max-width: 600px;
              margin: 50px auto;
              padding: 20px;
              background: #f5f5f5;
            }
            .success {
              background: white;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            h1 { color: #2ecc71; }
            code {
              background: #f0f0f0;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 14px;
            }
            .token {
              background: #f0f0f0;
              padding: 15px;
              border-radius: 5px;
              word-break: break-all;
              margin: 15px 0;
              font-family: monospace;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="success">
            <h1>✅ Success!</h1>
            <p>Your refresh token has been generated.</p>
            <p>Check the terminal for the token and instructions.</p>
            <div class="token">${tokens.refresh_token}</div>
            <p>You can close this window and return to the terminal.</p>
          </div>
        </body>
      </html>
    `);

    // Close server after successful exchange
    setTimeout(() => {
      console.log('Closing server...');
      server.close();
    }, 1000);

  } catch (error) {
    console.error('❌ Error exchanging code for tokens:', error.message);
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end(`<h1>Error</h1><p>${error.message}</p>`);
    server.close();
  }
});

server.listen(PORT, () => {
  console.log('✅ Server is listening on port', PORT);
  console.log('Waiting for callback...\n');
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Stop any other servers and try again.`);
  } else {
    console.error('❌ Server error:', error.message);
  }
  process.exit(1);
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\nShutting down...');
  server.close();
  process.exit(0);
});
