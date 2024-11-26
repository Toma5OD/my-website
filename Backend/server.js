require('dotenv').config();

const admin = require('firebase-admin');
const axios = require('axios');
const { google } = require('googleapis');

// Initialize Firebase Admin SDK
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

// Google OAuth2 Client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

async function syncPhotos() {
  try {
    console.log('Starting photo synchronization...');

    const albumId = process.env.ALBUM_ID;
    const albumRef = db.collection('albums').doc(albumId);

    // Fetch media items from Google Photos API
    const photos = [];
    let nextPageToken = null;

    do {
      const response = await oauth2Client.request({
        url: 'https://photoslibrary.googleapis.com/v1/mediaItems',
        params: {
          pageSize: 100,
          pageToken: nextPageToken,
        },
      });

      const mediaItems = response.data.mediaItems || [];
      photos.push(...mediaItems);

      nextPageToken = response.data.nextPageToken;
    } while (nextPageToken);

    // Process and upload images to Firebase Storage
    const images = await Promise.all(
      photos.map(async (item) => {
        const fileName = `${item.id}.jpg`;
        const file = bucket.file(fileName);

        // Check if the file already exists
        const [exists] = await file.exists();
        if (!exists) {
          // Download image from Google Photos
          const response = await axios.get(`${item.baseUrl}=d`, {
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
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
          fileName
        )}?alt=media`;

        return { id: item.id, url: publicUrl };
      })
    );

    // Save images metadata to Firestore
    await albumRef.set({ images });

    console.log('Photo synchronization completed successfully.');
  } catch (error) {
    console.error('Error syncing photos:', error);
  }
}

console.log('FIREBASE_PRIVATE_KEY is', process.env.FIREBASE_PRIVATE_KEY ? 'set' : 'not set');

syncPhotos();