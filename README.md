
# My Website for Tomás Ó Dálaigh

## Description

This is a personal website for musician **Tomás Ó Dálaigh** that showcases his music, events, videos, and artwork. The site integrates with Google Photos to dynamically update an artwork carousel, which is populated from a Google Photos album.

The website is built using **HTML5**, **Tailwind CSS**, and **JavaScript** with **Swiper.js** for the carousel. A **Node.js** backend server fetches images from the Google Photos API, providing up-to-date images in the artwork section.

## Technologies Used

### Frontend:
- **HTML5**: The website structure and content.
- **Tailwind CSS**: For responsive and modern styling.
- **Google Fonts**: For custom typography.
- **Swiper.js**: Used to create a dynamic and responsive carousel for the artwork section.
- **Axios**: To fetch data from the backend server.

### Backend:
- **Node.js & Express**: Backend server used to interact with the Google Photos API.
- **Google Photos API**: The backend fetches images from a Google Photos album using OAuth2.
- **Google OAuth2**: Secure authentication for accessing the Google Photos API.
- **Dotenv**: Manages environment variables for sensitive data like API keys.

## Features

- **Dynamic Carousel**: The artwork section automatically updates to display the latest gig posters from a Google Photos album.
- **Events, Videos, and Contact Pages**: The website also features a section for upcoming events, music videos, and contact information.
- **Responsive Design**: The site is fully responsive, ensuring an optimal viewing experience across devices.

## How the Backend Server Works

The backend is a **Node.js** server hosted on **Render** that fetches photos from your Google Photos album using the Google Photos API. 

1. **Authentication**: The backend uses OAuth2 for authentication. The credentials (`client_id`, `client_secret`, `refresh_token`) are stored securely as environment variables and not included in the codebase.
2. **Fetching Photos**: Upon request, the backend queries the Google Photos API for images from a specific album using the `albumId` stored in the environment.
3. **Updating Carousel**: Every time the frontend requests photos, the backend responds with the most up-to-date images from your Google Photos album.

## Running the Backend Server on Render

The backend server is hosted on **Render**. Here’s how to deploy and configure it:

### Step-by-Step Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_REPO/my-website.git
   cd my-website
   ```

2. **Install dependencies** by running:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   On **Render**, go to your service's settings and add the following environment variables:
   - `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret
   - `REDIRECT_URI`: The URI where the Google OAuth service will redirect after authentication
   - `REFRESH_TOKEN`: The token used to refresh the Google API access
   - `ALBUM_ID`: Your Google Photos album ID

4. **Deploy to Render**:
   After setting up the environment variables, Render will automatically deploy the service. It will provide a public URL (e.g., `https://your-app.onrender.com`).

5. **API Endpoint**:
   The backend server exposes an API endpoint at `/api/photos`, which the frontend accesses to retrieve the artwork photos.

## Updating Artwork Photos

To update the artwork photos on the carousel:
1. **Add new images** to the Google Photos album that is linked to the website (the album ID is stored in the environment variables).
2. **Delete old images** if necessary to remove them from the carousel.
3. The website will automatically reflect the changes without requiring any updates to the code or redeploying the backend server.

## License

This project is licensed under the **Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License**. You may use this code for personal and non-commercial purposes with proper attribution to the original author.

For more details about the license, visit: [https://creativecommons.org/licenses/by-nc-nd/4.0/](https://creativecommons.org/licenses/by-nc-nd/4.0/)

## How to Contribute

As this project may become monetized, contributions are currently not accepted. However, feel free to reach out via the contact page if you would like to discuss collaboration opportunities.
