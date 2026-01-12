# Deployment Guide

## Backend Deployment (Render)

### 1. Create Redis Instance on Render
1. Go to https://render.com and sign in
2. Click "New +" → "Redis"
3. Name: `mits-results-redis`
4. Plan: Free
5. Click "Create Redis"
6. Copy the **Internal Redis URL** (starts with `redis://`)

### 2. Deploy Backend
1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `https://github.com/Suryaveera04/Results_portal.git`
3. Configure:
   - **Name**: `mits-results-backend`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. Add Environment Variables:
   ```
   PORT=5000
   REDIS_URL=<paste-internal-redis-url-from-step-1>
   JWT_SECRET=your_strong_random_secret_key_here
   CONCURRENT_SLOTS=500
   SESSION_DURATION=80
   LOGIN_WINDOW=60
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=236941a4054@mits.ac.in
   EMAIL_PASS=Suryamsv@0427
   NODE_ENV=production
   ```

5. Click "Create Web Service"
6. Wait for deployment (5-10 minutes)
7. Copy your backend URL (e.g., `https://mits-results-backend.onrender.com`)

## Frontend Deployment (Netlify)

### 1. Deploy to Netlify
1. Go to https://netlify.com and sign in
2. Click "Add new site" → "Import an existing project"
3. Choose "Deploy with GitHub"
4. Select repository: `Results_portal`
5. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `frontend/build`

6. Add Environment Variable:
   - Click "Show advanced"
   - Add variable:
     ```
     Key: REACT_APP_API_URL
     Value: https://mits-results-backend.onrender.com/api
     ```
     (Replace with your actual Render backend URL from above)

7. Click "Deploy site"
8. Wait for deployment (2-3 minutes)
9. Your site will be live at: `https://random-name.netlify.app`

### 2. Optional: Custom Domain
1. In Netlify dashboard → "Domain settings"
2. Click "Add custom domain"
3. Follow instructions to configure DNS

## Testing Deployment

1. Open your Netlify URL
2. Click "Enter Queue"
3. Test with credentials:
   - Department: Computer Science & Engineering – Networks (CSE-Networks)
   - Roll No: 23691a4054
   - DOB: 04-05-2005

## Important Notes

- **Render Free Tier**: Backend sleeps after 15 minutes of inactivity. First request may take 30-60 seconds to wake up.
- **Redis Free Tier**: 25MB storage, sufficient for queue management
- **CORS**: Backend already configured to accept requests from any origin
- **WebSocket**: Socket.io will work automatically with Render deployment

## Troubleshooting

### Backend not connecting to Redis
- Verify REDIS_URL in Render environment variables
- Ensure Redis instance is running

### Frontend can't reach backend
- Check REACT_APP_API_URL in Netlify environment variables
- Verify backend URL is correct (include `/api` at the end)
- Check browser console for CORS errors

### Queue not working
- Ensure Redis is connected (check Render logs)
- Verify WebSocket connection in browser console
