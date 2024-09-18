const { google } = require('googleapis');
const dotenv = require('dotenv');

dotenv.config(); // Make sure this is called before accessing process.env

// Verify environment variables
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);
console.log('REDIRECT_URI:', process.env.REDIRECT_URI);

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// Generate a URL for authorization
const scopes = ['https://www.googleapis.com/auth/photoslibrary.readonly'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  prompt: 'consent',
});

console.log('Authorize this app by visiting this url:', authUrl);

// After obtaining the code from the URL, exchange it for tokens
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.question('Enter the code from that page here: ', (code) => {
  oauth2Client.getToken(code, (err, tokens) => {
    if (err) {
      console.error('Error retrieving access token', err);
      return;
    }
    console.log('Your refresh token is:', tokens.refresh_token);
    readline.close();
  });
});