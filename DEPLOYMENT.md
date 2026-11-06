# Deployment Guide: Store Rating & Management Platform

This guide provides complete instructions to deploy the application on **Render** (as a free unified web service) and configure your **Git / GitHub** repository.

---

## 🚀 Part 1: Git Repository & GitHub Setup

The workspace is already initialized as a Git repository. Follow these steps to push it to your GitHub account:

### 1. Create a Repository on GitHub
1. Open [github.com/new](https://github.com/new).
2. Set the repository name to: `roxi-store-ratings` (or any name you prefer).
3. Set the visibility to **Public** (or Private).
4. Do **not** initialize with README, .gitignore, or license (these already exist locally).
5. Click **Create repository**.

### 2. Link Local Repository & Push
Open your terminal in this directory and execute:
```bash
# Add your GitHub repository as remote origin (replace with your repo URL)
git remote add origin https://github.com/singh99abhi/roxi-store-ratings.git

# Set default branch to main and push
git branch -M main
git push -u origin main
```

---

## 🌐 Part 2: Deploy Free on Render (Unified Full-Stack)

Because the Express backend serves both the REST API (`/api/*`) and the built React frontend (`client/dist`), the entire full-stack application deploys as a **single free Web Service** on Render with zero monthly cost.

### Method A: 1-Click Blueprint Deployment (Recommended)
Render automatically detects the included [`render.yaml`](render.yaml) file:

1. Log into your [Render Dashboard](https://dashboard.render.com).
2. In the top navigation, click **New +** &rarr; **Blueprint**.
3. Select your GitHub repository (`roxi-store-ratings`).
4. Render parses `render.yaml` and sets up:
   - **Service Name**: `roxi-store-ratings`
   - **Environment**: `Node`
   - **Region**: `Oregon`
   - **Plan**: `Free`
   - **Build Command**:  
     `npm install && npm --prefix server install && npm --prefix client install && npm --prefix client run build && npm --prefix server run seed`
   - **Start Command**:  
     `node server/src/server.js`
   - **Environment Variables**:
     - `NODE_ENV`: `production`
     - `PORT`: `10000`
     - `JWT_SECRET`: *(auto-generated secure token)*
     - `DB_PATH`: `store_ratings.db`
5. Click **Apply**.
6. Render builds the React app, seeds the database, and exposes your live application at `https://<service-name>.onrender.com`.

---

### Method B: Manual Web Service Setup on Render

If you prefer configuring via the web dashboard without Blueprints:

1. On the Render Dashboard, click **New +** &rarr; **Web Service**.
2. Connect your GitHub repository.
3. Configure the following fields:
   - **Name**: `roxi-store-ratings`
   - **Region**: `Oregon (US West)`
   - **Branch**: `main`
   - **Root Directory**: *(leave blank)*
   - **Runtime**: `Node`
   - **Build Command**:  
     ```bash
     npm install && npm --prefix server install && npm --prefix client install && npm --prefix client run build && npm --prefix server run seed
     ```
   - **Start Command**:  
     ```bash
     node server/src/server.js
     ```
   - **Instance Type**: `Free`
4. Under **Environment Variables**, click **Add Environment Variable**:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `JWT_SECRET` = `roxi-render-super-secret-jwt-key-2026`
5. Click **Create Web Service**.

---

## 🗄️ Optional: Connecting a Render PostgreSQL Database

The application natively supports PostgreSQL when `DATABASE_URL` is configured:

1. In Render Dashboard, click **New +** &rarr; **PostgreSQL**.
2. Give it a name (e.g., `roxi-postgres-db`) and select the Free tier.
3. Once provisioned, copy the **Internal Database URL**.
4. Go to your Web Service &rarr; **Environment** &rarr; add variable:
   - `DATABASE_URL` = `<copied Internal Database URL>`
5. Trigger manual deploy: the application will automatically initialize the schema and tables in PostgreSQL on boot!

---

## 🧪 Local Testing & Verification

To run and test the complete system locally:

```bash
# 1. Run all unit and integration tests
npm test

# 2. Seed database
npm run seed

# 3. Start full-stack application (production build)
npm run build
npm start
```
Then navigate to [http://localhost:5000](http://localhost:5000) in your browser.
