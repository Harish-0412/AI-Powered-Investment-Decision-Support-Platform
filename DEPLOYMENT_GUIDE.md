# Backend Deployment Guide (Render)

This guide outlines the steps to deploy your backend to **Render** using the free tier.

## Prerequisites
1.  A **GitHub** account with your project repository uploaded.
2.  A **Render** account (Sign up at [render.com](https://render.com)).
3.  A **Neon.tech** account for your PostgreSQL database (if not already using Render's managed DB).

## Step 1: Prepare your Repository
Ensure the `render.yaml` file (already created in your root directory) is committed to your repository. This file automates the service creation on Render.

## Step 2: Connect to Render
1.  Log in to the [Render Dashboard](https://dashboard.render.com).
2.  Click **"New +"** and select **"Blueprint"**.
3.  Connect your GitHub repository.
4.  Render will automatically detect the `render.yaml` file and show the services to be created.

## Step 3: Configure Environment Variables
In the Render dashboard, ensure the following variables are set if not using the Blueprint defaults:
*   `DATABASE_URL`: Your Neon.tech connection string.
*   `REDIS_URL`: Your Upstash Redis connection string.
*   `JWT_SECRET`: A strong random string.
*   `JWT_REFRESH_SECRET`: A strong random string.
*   `FRONTEND_URL`: Your Vercel frontend URL (you can update this later).

## Step 4: Deploy
1.  Click **"Apply"** on the Blueprint page.
2.  Render will start the build process:
    *   `npm install`
    *   `prisma generate`
    *   `tsc` (Build)
3.  Once the build is successful, your API will be live at `https://investment-intelligence-backend.onrender.com`.

## Step 5: Verify Deployment
Visit `https://investment-intelligence-backend.onrender.com/api/v1/health` to verify the service is running.

---
**Note**: Since this is the free tier, the service may "spin down" after inactivity. The first request after a break might take 30-60 seconds to respond.
