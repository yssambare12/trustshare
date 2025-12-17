# TrustShare

A secure file sharing platform where users can upload and share files with others.

## Links

- **Live App**: [https://trustshare-lhbzbsciz-yogesh-sambares-projects.vercel.app/](https://trustshare-lhbzbsciz-yogesh-sambares-projects.vercel.app/)
- **Frontend Repo**: [https://github.com/yssambare12/trustshare](https://github.com/yssambare12/trustshare)
- **Backend Repo**: [https://github.com/yssambare12/trustshare-backend](https://github.com/yssambare12/trustshare-backend)

## Features

- User authentication and registration
- Secure file upload
- File sharing with other users
- Auto-share functionality based on user detection
- Secure file download
- Modern and responsive UI

## Tech Stack

- React
- Vite
- Tailwind CSS

## Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/yssambare12/trustshare.git
   cd trustshare
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a `.env` file** in the root directory with:
   ```
   VITE_API_URL=your_backend_api_url
   ```
   For local development, use: `VITE_API_URL=http://localhost:5000`

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will run on `http://localhost:5173`

5. **Build for production**
   ```bash
   npm run build
   ```

## Prerequisites

Make sure the backend server is running. See the [backend repository](https://github.com/yssambare12/trustshare-backend) for setup instructions.
