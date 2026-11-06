# StoreHub — Store Rating & Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![React 18](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![Express.js](https://img.shields.io/badge/Express-4.21-lightgrey?logo=express)](https://expressjs.com/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%7C%20SQLite-blue?logo=postgresql)](https://postgresql.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Render Deploy](https://img.shields.io/badge/Render-1--Click%20Deploy-46E3B7?logo=render)](https://render.com)

A modern full-stack web application developed for the **FullStack Intern Coding Challenge**, allowing users to register, browse registered stores, and submit 1–5 star ratings. Includes role-based dashboards for **System Administrators**, **Store Owners**, and **Normal Users**, strict validation enforcement, and multi-column table sorting.

---

## 🎯 Pre-Seeded Demo Accounts

The database comes pre-seeded with sample records meeting all challenge validation constraints:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@storehub.com` | `Admin@123` | Full administrative dashboard, user & store management |
| **Store Owner** | `owner.robert@storehub.com` | `Owner@123` | Owner of *Downtown Organic Grocery Market* (Avg: 4.7★) |
| **Store Owner** | `owner.sophia@storehub.com` | `Owner@123` | Owner of *Northside Tech & Electronics Depot* (Avg: 4.5★) |
| **Normal User** | `user.benjamin@storehub.com` | `User@123` | Customer with submitted ratings |
| **Normal User** | `user.jessica@storehub.com` | `User@123` | Customer with submitted ratings |

*(Tip: The login page includes 1-click demo switcher buttons for instant testing.)*

---

## ✨ Features Implemented

### 1. System Administrator
- **Dashboard Metrics**: Live counts of Total Users, Total Registered Stores, and Total Submitted Ratings.
- **User Management**:
  - Add new Normal Users, Admin Users, and Store Owners.
  - View list of all users: Name, Email, Address, and Role.
  - Interactive details modal: when viewing a Store Owner, their store's overall rating and review count is dynamically displayed.
- **Store Management**:
  - Add new stores (Name, Email, Address, and assign Store Owner).
  - View list of all stores with overall ratings.
- **Filtering & Sorting**:
  - Apply instant filters by Name, Email, Address, and Role.
  - Ascending/descending sorting on all table columns.
- **Logout** securely terminates session.

### 2. Normal User
- **Registration & Single Login**:
  - Sign up via registration page with real-time constraint validation.
  - Single login portal routing to role-specific dashboard.
- **Store Directory**:
  - Browse all registered stores.
  - Live search by Store Name and Address.
  - Displays: Store Name, Address, Overall Rating (average stars + count), and the current user's submitted rating.
- **Rating Submissions**:
  - Submit ratings ranging from 1 to 5 stars.
  - Modify and update previously submitted ratings with immediate recalculation.
- **Password Management**:
  - Update password post-login with validation checklist.
- **Logout**.

### 3. Store Owner
- **Store Dashboard**:
  - Displays overall average rating score and total reviews count.
  - View a sortable list of customers who submitted ratings (Customer Name, Email, Address, Submitted Rating, and Date).
- **Password Management**: Update password after logging in.
- **Logout**.

### 4. Form Validations (Backend + Frontend)
- **Name**: Between 20 and 60 characters in length.
- **Address**: Maximum 400 characters.
- **Password**: 8 to 16 characters, must include at least one uppercase letter (A-Z) and at least one special character (`!@#$%^&*...`).
- **Email**: Standard RFC 5322 email regex format validation.
- **Ratings**: Integer between 1 and 5.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Axios, React Router v6 |
| **Backend** | Node.js, Express.js, JWT, bcryptjs, CORS |
| **Database** | PostgreSQL (`pg`) with automatic fallback to SQLite (`node:sqlite`) |
| **Cloud Deployment** | Render (`render.yaml` Blueprint), 1-click unified build |

---

## 🚀 Quick Start (Local Run)

### Prerequisites
- Node.js v18 or higher (tested on Node v24)
- npm

### Installation & Run

```bash
# 1. Install dependencies across backend & frontend
npm run install:all

# 2. Run unit & integration test suites
npm test

# 3. Seed the database with demo accounts and stores
npm run seed

# 4. Build frontend for production
npm run build

# 5. Start unified Express production server
npm start
```

Visit [http://localhost:5000](http://localhost:5000) in your web browser.

---

## 🌐 Deploy to Render

For complete deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

- **1-Click Blueprint**: Push to GitHub, open Render Dashboard, click **New +** &rarr; **Blueprint**, select your repo, and click **Apply**.
- The included [`render.yaml`](render.yaml) automatically configures the Node web service, builds the client, seeds the database, and hosts your application.
