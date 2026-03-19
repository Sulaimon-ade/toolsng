// Auto-detects the API base URL depending on environment.
// In development (localhost), points to the local Express server.
// In production (Vercel/Render), uses the same origin as the frontend.
 
export const API_URL =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://toolsng.onrender.com';