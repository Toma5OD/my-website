const { google } = require('googleapis');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

async function listAlbums() {
  try {
    // Obtain a new access token
    const accessTokenResponse = await oauth2Client.getAccessToken();
    const accessToken = accessTokenResponse.token;

    // Make a request to the Google Photos Library API to list albums
    const response = await axios.get('https://photoslibrary.googleapis.com/v1/albums', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const albums = response.data.albums || [];

    if (albums.length > 0) {
      console.log('Albums:');
      albums.forEach((album) => {
        console.log(`${album.title} (ID: ${album.id})`);
      });
    } else {
      console.log('No albums found.');
    }
  } catch (error) {
    console.error('Error listing albums:', error.response ? error.response.data : error.message);
  }
}

listAlbums();