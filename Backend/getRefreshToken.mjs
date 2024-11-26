// getRefreshToken.mjs

import 'dotenv/config';
import { google } from 'googleapis';
import http from 'http';
import url from 'url';
import open from 'open'; // Note: Use 'open' instead of 'opn'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/callback' // Must match the redirect URI in Google Cloud Console
);

const scopes = [
  'https://www.googleapis.com/auth/photoslibrary.readonly',
];

// Generate the URL that will be used for the consent dialog
const authorizeUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  prompt: 'consent',
});

const server = http.createServer(async (req, res) => {
  if (req.url.startsWith('/callback')) {
    // Handle the OAuth 2.0 callback
    const qs = new url.URL(req.url, 'http://localhost:3000').searchParams;
    const code = qs.get('code');

    res.end('Authorization successful! You can close this window.');

    server.close();

    // Exchange the authorization code for tokens
    try {
      const { tokens } = await oauth2Client.getToken(code);
      console.log('\nYour refresh token is:\n', tokens.refresh_token);
      // Save the refresh token in your .env file as REFRESH_TOKEN
    } catch (error) {
      console.error('Error retrieving access token', error);
    }
  }
});

server.listen(3000, () => {
  // Open the browser to the authorize URL to start the workflow
  console.log('Authorize this app by visiting this url:\n', authorizeUrl);
  open(authorizeUrl).catch(() => {
    console.log('Please open the URL in your browser:', authorizeUrl);
  });
});