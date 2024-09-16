// server.js

const { google } = require('googleapis');
const dotenv = require('dotenv');
const axios = require('axios');
const cors = require('cors');

dotenv.config();

const app = express();

// Use CORS middleware to allow cross-origin requests
app.use(cors());

// Configure OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

// Endpoint to get album images
app.get('/api/photos', async (req, res) => {
  try {
    // Obtain a new access token
    const accessTokenResponse = await oauth2Client.getAccessToken();
    const accessToken = accessTokenResponse.token;

    let mediaItems = [];
    let nextPageToken = null;

    do {
      // Make a request to the Google Photos Library API to get media items
      const response = await axios.post(
        'https://photoslibrary.googleapis.com/v1/mediaItems:search',
        {
          albumId: process.env.ALBUM_ID,
          pageSize: 50, // Adjust as needed
          pageToken: nextPageToken,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      mediaItems = mediaItems.concat(response.data.mediaItems || []);
      nextPageToken = response.data.nextPageToken;
    } while (nextPageToken);

    // Extract base URLs
    const images = mediaItems.map((item) => item.baseUrl);

    res.json(images);
  } catch (error) {
    console.error(
      'Error fetching photos:',
      error.response ? error.response.data : error.message
    );
    res.status(500).send('Error fetching photos');
  }
});

const port = process.env.PORT || 3000;

// Start the server and listen on all network interfaces
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});