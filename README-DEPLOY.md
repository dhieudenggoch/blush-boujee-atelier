# 🚀 Blush & Boujee Atelier — Deployment Guide

## ✅ RECOMMENDED: Deploy on Railway (Free, Data Persists)

Railway runs a real server so your products, orders, and settings are saved permanently.

---

### Step 1: Push to GitHub

1. Go to github.com → Sign up / Log in
2. Click + → New Repository
3. Name: blush-boujee-atelier → Private → Create
4. Click "uploading an existing file"
5. Drag ALL files from your blush-boujee folder into the browser
   (package.json, app/, components/, lib/, middleware.js, etc.)
6. Click "Commit changes"

---

### Step 2: Deploy on Railway

1. Go to railway.app → Sign up with GitHub (free)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your blush-boujee-atelier repository
4. Railway auto-detects Next.js ✅

5. Click your service → go to "Variables" tab → add:

   ADMIN_USERNAME    = admin
   ADMIN_PASSWORD    = BlushBoujee@2025
   JWT_SECRET        = blush-boujee-very-long-secret-key-change-this-2025
   NODE_ENV          = production

6. Go to Settings → Networking → click "Generate Domain"
7. Your live URL appears: https://yourapp.up.railway.app

Build command:  npm run build
Start command:  npm start

---

## Option B: Deploy on Vercel (Free but serverless — data resets)

1. Go to vercel.com → Sign up with GitHub
2. Click "Add New Project" → Import your GitHub repo
3. Add Environment Variables:
   ADMIN_USERNAME    = admin
   ADMIN_PASSWORD    = BlushBoujee@2025
   JWT_SECRET        = blush-boujee-very-long-secret-key-change-this-2025
4. Click Deploy

⚠️  On Vercel, the JSON file database resets between deployments.
    Products you add in admin will disappear on next deploy.
    Use Railway instead to avoid this.

---

## Custom Domain (Optional)

Once live on Railway or Vercel:

1. Buy a domain on Namecheap.com or Hostinger.com (~$10/year)
2. In Railway/Vercel dashboard → Settings → Custom Domain
3. Add your domain (e.g. blushboujee.com)
4. Follow the DNS instructions shown (takes 5-30 mins to go live)

---

## Admin Panel

After deploying, your admin is at:
  https://yoursite.com/admin

Default login:
  Username: admin
  Password: BlushBoujee@2025

⚠️  Change these in the environment variables before going live!

---

## Changing Admin Password

In Railway/Vercel dashboard → Variables:
  ADMIN_USERNAME = yourchosenusername
  ADMIN_PASSWORD = YourSecurePassword123!

Then redeploy.

---

## Adding Your Mobile Money Number

1. Log into admin panel → Settings
2. Change the WhatsApp/Mobile Money number to your actual number
3. Format: 256700000000 (country code + number, no + or spaces)
   Example Uganda MTN: 256771234567

---

## Uploading Product Images

1. Admin → Add Item
2. Drag and drop your bag photos
3. Max 5MB per image, JPG/PNG/WebP supported

On Railway: images persist ✅
On Vercel:  images may reset ⚠️ (use Cloudinary for permanent images)

---

Good luck with your launch! 💜
