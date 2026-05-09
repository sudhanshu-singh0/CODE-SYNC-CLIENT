# Client Deployment (Vercel.com)

1. Push this folder to GitHub
2. Go to vercel.com → New Project → Import repo
3. Set Root Directory to `client`
4. Add these Environment Variables in Vercel dashboard:
   - VITE_BACKEND_URL = https://your-server.onrender.com  ← paste Render URL here
   - VITE_GEMINI_API_KEY = AIzaSyD76X6UZPfClnOBJ_g2ZNyJDFdqBT8jZ40
5. Deploy → copy the Vercel URL
6. Go back to Render → update CLIENT_URL env var with the Vercel URL
