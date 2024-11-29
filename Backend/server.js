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

// Main synchronization function
async function syncPhotos() {
  try {
    console.log('Starting photo synchronization...');

    const albumId = process.env.ALBUM_ID;
    console.log('Using Album ID:', albumId);
    const albumRef = db.collection('albums').doc(albumId);

    // Fetch media items from the specified album in Google Photos
    const photos = [];
    let nextPageToken = null;

    do {
      const response = await oauth2Client.request({
        url: 'https://photoslibrary.googleapis.com/v1/mediaItems:search',
        method: 'POST',
        data: {
          albumId: albumId,
          pageSize: 100,
          pageToken: nextPageToken,
        },
      });

      const mediaItems = response.data.mediaItems || [];
      photos.push(...mediaItems);

      nextPageToken = response.data.nextPageToken;
    } while (nextPageToken);

    console.log(`Fetched ${photos.length} photos from the album.`);

    // Map of current photos in the album
    const currentPhotoIds = new Set(photos.map((item) => item.id));

    // Fetch existing images from Firestore
    const albumDoc = await albumRef.get();
    const existingImages = albumDoc.exists ? albumDoc.data().images : [];

    // Map of existing photos in Firestore
    const existingPhotoIds = new Set(existingImages.map((item) => item.id));

    // Determine photos to add, update, and delete
    const photosToAdd = photos.filter((item) => !existingPhotoIds.has(item.id));
    const photosToUpdate = photos.filter((item) => existingPhotoIds.has(item.id));
    const photosToDelete = existingImages.filter(
      (item) => !currentPhotoIds.has(item.id)
    );

    console.log(`Adding ${photosToAdd.length} new photos.`);
    console.log(`Updating ${photosToUpdate.length} existing photos.`);
    console.log(`Deleting ${photosToDelete.length} photos.`);

    // Delete removed photos from Firebase Storage and Firestore
    await Promise.all(
      photosToDelete.map(async (item) => {
        const fileName = `${item.id}.jpg`;
        const file = bucket.file(fileName);

        // Delete the file from Firebase Storage
        await file.delete().catch((err) => {
          if (err.code !== 404) {
            // Ignore "Not Found" errors
            throw err;
          }
        });

        console.log(`Deleted ${fileName} from Firebase Storage.`);
      })
    );

    // Process and upload new images to Firebase Storage
    const imagesToAdd = await Promise.all(
      photosToAdd.map(async (item) => {
        const fileName = `${item.id}.jpg`;
        const file = bucket.file(fileName);

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

        // Generate public URL for the image
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
          fileName
        )}?alt=media`;

        return { id: item.id, url: publicUrl };
      })
    );

    // Update existing images if necessary
    const imagesToUpdate = await Promise.all(
      photosToUpdate.map(async (item) => {
        const fileName = `${item.id}.jpg`;
        const file = bucket.file(fileName);

        // Check if the media item has changed
        const existingImage = existingImages.find((img) => img.id === item.id);
        if (existingImage && existingImage.url) {
          // Assuming that baseUrl changes when the photo is edited
          // If baseUrl has changed, re-upload the image
          if (existingImage.baseUrl !== item.baseUrl) {
            // Download and upload the updated image
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

            console.log(`Updated ${fileName} in Firebase Storage.`);
          }
        }

        // Generate public URL for the image
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
          fileName
        )}?alt=media`;

        return { id: item.id, url: publicUrl };
      })
    );

    // Combine all images
    const updatedImages = [
      ...existingImages.filter((item) => currentPhotoIds.has(item.id) && !photosToAdd.some((newItem) => newItem.id === item.id)),
      ...imagesToAdd,
      ...imagesToUpdate,
    ];

    // Save the updated list of images to Firestore
    await albumRef.set({ images: updatedImages });

    console.log('Photo synchronization completed successfully.');
  } catch (error) {
    console.error('Error syncing photos:', error);
  }
}

console.log(
  'FIREBASE_PRIVATE_KEY is',
  process.env.FIREBASE_PRIVATE_KEY ? 'set' : 'not set'
);

syncPhotos();