# MLA Sales Tracker — React + Node.js + MySQL

Same app, rebuilt with **React** (frontend) and **Node.js/Express** (backend) — matches your
Hostinger Node.js hosting setup (GitHub-based deployment).

---

## 📂 Structure

```
mla-node-app/
├── package.json          ← server dependencies
├── .env                   ← database credentials (edit this)
├── server/
│   ├── index.js           ← Express entrypoint
│   ├── db.js               ← MySQL connection pool
│   └── routes/
│       ├── auth.routes.js       (register, login, forgot password)
│       ├── km.routes.js          (GPS-based KM tracking)
│       ├── visits.routes.js      (client visits + orders)
│       ├── orders.routes.js      (order list + payment update)
│       └── dashboard.routes.js
├── client/                ← React app (Vite)
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx, App.jsx, api.js, styles.css
│       └── screens/ (Login, Register, ForgotPassword, Dashboard, KmTracking, ClientVisits, AddVisit, Orders)
└── database/
    └── schema.sql          ← same MySQL schema as before
```

---

## 🖥️ Running Locally

You need **Node.js** installed (download from nodejs.org) and **MySQL** running (XAMPP works fine — just start the MySQL service from XAMPP, you don't need Apache for this).

### 1. Set up the database
- Open phpMyAdmin (`http://localhost/phpmyadmin` if using XAMPP)
- Create a database (e.g. `mladb`)
- Import `database/schema.sql`

### 2. Configure environment variables
Edit `.env` in the project root — it's already filled in for local XAMPP MySQL:
```
DB_HOST=localhost
DB_NAME=mladb
DB_USER=root
DB_PASSWORD=
```

### 3. Install & run the backend
```bash
npm install
npm run dev
```
This starts the Express server on `http://localhost:5000`.

### 4. Install & run the frontend (in a second terminal)
```bash
cd client
npm install
npm run dev
```
This starts React on `http://localhost:5173` — open this in your browser. It automatically forwards API calls to the backend on port 5000.

---

## 🚀 Deploying to Hostinger (Node.js hosting via GitHub)

Since your `nutrientfert.com` site deploys from GitHub automatically:

1. **Push this project to a GitHub repository** (a new one, or a new folder/branch if you want it alongside your existing site — ask your developer if unsure, since mixing it into an existing business site's repo needs care).
2. In Hostinger hPanel, under your website → **Connect GitHub repo** (or update the existing connection) to point to this project.
3. Build settings:
   - **Build command:** `npm install && npm run build:client`
   - **Start command:** `node server/index.js`
   - **Node version:** 18.x or higher
4. In Hostinger's website dashboard → **Databases** → click **"Connect a database"** to provision a MySQL database. Note the host/name/user/password it gives you.
5. In Hostinger's website dashboard → **Environment variables**, add:
   ```
   DB_HOST=<value from Hostinger>
   DB_NAME=<value from Hostinger>
   DB_USER=<value from Hostinger>
   DB_PASSWORD=<value from Hostinger>
   RATE_PER_KM=3
   ```
6. Import `database/schema.sql` into that new Hostinger database via its phpMyAdmin link (found in the Database section).
7. Redeploy. Visit your domain — you should see the Login screen.

---

## ⚠️ HTTPS required for GPS Tracking
Browsers block location access on non-HTTPS sites. Hostinger's Node.js hosting normally provides HTTPS automatically for your domain — just make sure you're opening `https://yourdomain.com`, not `http://`.

---

## 💰 Cost
- Uses your existing Hostinger plan and MySQL database (usually included)
- No extra services needed
