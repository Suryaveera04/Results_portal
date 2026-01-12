# Deployment Guide - Updated

## Step 1: Create Free Redis on Upstash

1. Go to https://upstash.com and sign up (free)
2. Click "Create Database"
3. Settings:
   - **Name**: `mits-results-redis`
   - **Type**: Regional
   - **Region**: Choose closest to you (e.g., US-East-1)
   - **TLS**: Enabled
4. Click "Create"
5. Copy the **Redis URL** (looks like: `rediss://default:xxxxx@xxxxx.upstash.io:6379`)

## Step 2: Deploy Backend on Render

1. Go to https://render.com and sign in with GitHub
2. Click "New +" → "Web Service"
3. Connect repository: `Results_portal`
4. Configure:
   - **Name**: `mits-results-backend`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. Click "Advanced" → Add Environment Variables:
   ```
   PORT=5000
   REDIS_URL=<paste-upstash-redis-url-here>
   JWT_SECRET=mits_results_secret_key_2024_production
   CONCURRENT_SLOTS=500
   SESSION_DURATION=80
   LOGIN_WINDOW=60
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=236941a4054@mits.ac.in
   EMAIL_PASS=Suryamsv@0427
   NODE_ENV=production
   ```

6. Click "Create Web Service"
7. Wait 5-10 minutes for deployment
8. Copy your backend URL: `https://mits-results-backend.onrender.com`

## Step 3: Deploy Frontend on Netlify

1. Go to https://netlify.com and sign in with GitHub
2. Click "Add new site" → "Import an existing project"
3. Choose "Deploy with GitHub"
4. Select repository: `Results_portal`
5. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `frontend/build`

6. Click "Show advanced" → Add Environment Variable:
   ```
   Key: REACT_APP_API_URL
   Value: https://mits-results-backend.onrender.com/api
   ```
   (Replace with YOUR actual Render backend URL)

7. Click "Deploy site"
8. Wait 2-3 minutes
9. Your site is live! (e.g., `https://random-name.netlify.app`)

## Step 4: Test Your Deployment

1. Open your Netlify URL
2. Click "Enter Queue"
3. Test credentials:
   - **Department**: Computer Science & Engineering – Networks (CSE-Networks)
   - **Roll No**: 23691a4054
   - **DOB**: 04-05-2005

## Alternative: Deploy Backend on Railway (If Render doesn't work)

1. Go to https://railway.app and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `Results_portal`
4. Click "Add variables" and add all environment variables from Step 2
5. In Settings:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`
6. Deploy and copy the URL

## Important Notes

- **Upstash Free Tier**: 10,000 commands/day (more than enough)
- **Render Free Tier**: Sleeps after 15 min inactivity, wakes in 30-60 seconds
- **Netlify Free Tier**: Unlimited bandwidth for personal projects
- First request after sleep will be slow, subsequent requests are fast

## Troubleshooting

### Backend won't start
- Check Render logs for errors
- Verify REDIS_URL is correct (should start with `rediss://`)
- Ensure all environment variables are set

### Frontend can't connect
- Verify REACT_APP_API_URL in Netlify
- Check it ends with `/api`
- Redeploy frontend after changing env variables

### Queue not working
- Check Upstash dashboard for connection
- Verify Redis URL includes password
- Check browser console for WebSocket errors
