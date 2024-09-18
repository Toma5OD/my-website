
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
   This must be done in both Frontend and Backend Folders

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

## Project Structure

The project is organized into three main directories to separate concerns and facilitate deployment:

```
📁 My Website
│
├── LICENSE
├── README.md
├── .gitignore
├── 📁 Backend
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   └── .env
│
├── 📁 Frontend
│   ├── index.html
│   ├── about.html
│   ├── artwork.html
│   ├── contact.html
│   ├── events.html
│   ├── music.html
│   ├── package.json
│   ├── package-lock.json
│   ├── videos.html
│   └── 📁 images
│       └── park_poster.png
│
└── 📁 Tools
├── getToken.js
└── listAlbums.js
```

### Overview of the Directory Structure

- **Backend**: Contains all server-side code and configuration files for the backend API.
- **Frontend**: Holds all client-side code, including HTML, CSS, JavaScript, and static assets.
- **Tools**: Includes utility scripts used for setup or maintenance tasks, such as obtaining tokens or listing albums.

## Notable Files and Directories

### Backend

- **server.js**: The main server application file. It sets up an Express server, handles API endpoints, and communicates with the Google Photos API to fetch images for the artwork carousel.
- **package.json**: Contains metadata about the backend project and lists the dependencies required to run the server.
- **package-lock.json**: Automatically generated file that locks the versions of the project's dependencies.
- **.env**: Stores environment variables required for the backend, such as API keys and secrets. This file is not committed to the repository for security reasons.

### Frontend

- **index.html**, **about.html**, **artwork.html**, **contact.html**, **events.html**, **music.html**, **videos.html**: These HTML files constitute the different pages of the website. They are static pages styled with Tailwind CSS and use external libraries via CDNs.
- **images/**: Directory containing image assets used in the frontend, such as `park_poster.png`.

### Tools

- **getToken.js**: A utility script used to obtain an OAuth 2.0 refresh token from Google, which is necessary for authenticating requests to the Google Photos API.
- **listAlbums.js**: A script that lists all photo albums associated with the Google account. Useful for retrieving the `ALBUM_ID` required by the backend server to fetch images from a specific album.

---

**Note**: The HTML pages in the `Frontend` directory are self-explanatory and designed to be static content pages for the website. They include links to external resources and scripts via CDNs and do not require additional build steps.

---

By organizing the project in this way, the frontend and backend can be developed, deployed, and scaled independently. The backend server handles API requests and interacts with external services, while the frontend provides the user interface and makes requests to the backend API.

## Updating Artwork Photos

To update the artwork photos on the carousel:
1. **Add new images** to the Google Photos album that is linked to the website (the album ID is stored in the environment variables).
2. **Delete old images** if necessary to remove them from the carousel.
3. The website will automatically reflect the changes without requiring any updates to the code or redeploying the backend server.

## License

This project is licensed under the **Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License**. You may use this code for personal and non-commercial purposes with proper attribution to the original author.

For more details about the license, visit: [https://creativecommons.org/licenses/by-nc-nd/4.0/](https://creativecommons.org/licenses/by-nc-nd/4.0/)
