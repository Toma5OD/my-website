// server.js

const express = require('express');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const axios = require('axios');
const cors = require('cors');
const admin = require('firebase-admin');

dotenv.config();

const app = express();

// Firebase setup
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Use CORS middleware to allow cross-origin requests
app.use(
  cors({
    origin: [
      'http://localhost:3000',           // For local development
      'http://127.0.0.1:5500',           // Add this for your local development
      'https://toma5od.netlify.app',     // Your deployed frontend URL
      // Add other allowed origins if necessary
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  })
);

// Configure OAuth2 client for Google APIs
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,     // Your Google API client ID
  process.env.GOOGLE_CLIENT_SECRET, // Your Google API client secret
  process.env.REDIRECT_URI          // Your Google API redirect URI (if applicable)
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN, // Your Google API refresh token
});

// Endpoint to get album images
app.get('/api/photos', async (req, res) => {
  try {
    const albumId = process.env.ALBUM_ID; // Your Google Photos album ID
    const albumRef = db.collection('albums').doc(albumId);
    const albumSnapshot = await albumRef.get();

    // If images exist in Firestore, retrieve and send them
    if (albumSnapshot.exists) {
      const albumData = albumSnapshot.data();
      return res.json(albumData.images);
    }

    // Obtain a new access token (if needed)
    const accessTokenResponse = await oauth2Client.getAccessToken();
    const accessToken = accessTokenResponse.token;

    let mediaItems = [];
    let nextPageToken = null;

    // Fetch media items from Google Photos API
    do {
      const response = await axios.post(
        'https://photoslibrary.googleapis.com/v1/mediaItems:search',
        {
          albumId: albumId,
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

    // Process and upload images to Firebase Storage
  const images = await Promise.all(
  mediaItems.map(async (item) => {
    const fileName = `${item.id}.jpg`;
    const file = bucket.file(fileName);

    // Check if the file already exists in Firebase Storage
    const [exists] = await file.exists();
    if (!exists) {
      // Download image from Google Photos
      const response = await axios({
        url: `${item.baseUrl}=d`, // Download URL
        method: 'GET',
        responseType: 'stream',
      });

      // Upload image to Firebase Storage
      await new Promise((resolve, reject) => {
        const writeStream = file.createWriteStream({
          metadata: {
            contentType: 'image/jpeg',
          },
        });
      
        response.data
          .pipe(writeStream)
          .on('finish', async () => {
            try {
              // Make the file publicly readable
              await file.makePublic();
              resolve();
            } catch (err) {
              reject(err);
            }
          })
          .on('error', reject);
      });
    }

    // Generate public URL for the image
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${encodeURIComponent(fileName)}`;

    return { id: item.id, url: publicUrl };
  })
);

    // Save images metadata to Firestore
    await albumRef.set({ images });

    res.json(images);
  } catch (error) {
    console.error('Error fetching and uploading photos:', error);
    res.status(500).send('Error fetching photos');
  }
});

const port = process.env.PORT || 3000;

// Start the server and listen on all network interfaces
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});