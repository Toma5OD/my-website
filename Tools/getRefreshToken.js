// getRefreshToken.js

const { google } = require('googleapis');
const readline = require('readline');
const dotenv = require('dotenv');

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/oauth2callback' // This should match your authorized redirect URI
);

const scopes = [
  'https://www.googleapis.com/auth/photoslibrary.readonly'
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  prompt: 'consent',
});

console.log('Authorize this app by visiting this url:\n', authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('\nEnter the code from that page here: ', (code) => {
  rl.close();
  oauth2Client.getToken(code, (err, token) => {
    if (err) {
      return console.error('Error retrieving access token', err);
    }
    console.log('\nYour refresh token is:\n', token.refresh_token);
    // Save this refresh token in your .env file as REFRESH_TOKEN
  });
});

console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);