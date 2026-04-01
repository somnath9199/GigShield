# GigShield ⚡

GigShield is an AI-powered parametric insurance platform tailored to protect India's gig workers (Zomato, Swiggy, Zepto, etc.) from income loss caused by extreme weather, severe pollution, and civic disruptions. 

This repository contains the frontend React dashboard and backend migration scripts. Recently, the platform underwent a major technical upgrade to a **serverless architecture** powered by Supabase.

---

## 🚀 Recent Development Highlights

### 1. Serverless Authentication Migration
The authentication flow (`Auth.jsx`) was re-wired to completely bypass the legacy local Node.js/Express server. The application now connects directly to the **Supabase Cloud Database**.
* **Sign Ups & Logins:** User registration securely inserts and fetches records directly from the Supabase `users` table.
* **Session Management:** Persists user authentication state locally to automatically render personalized data across the app.

### 2. Live Database Wiring & Migrations
The app was previously populated with hardcoded UI data. We built custom PostgreSQL migration scripts using the `pg` client to upgrade the schema and seed active users:
* **Schema Upgrade (`alter.js`):** Dynamically appended necessary telemetry fields (`coverage_status`, `total_received`, `weekly_payouts`, etc.) to the `users` table.
* **Data Seeding (`seed.js`):** Uploaded exactly 10 mock gig-worker profiles directly from the local JSON registry into the live cloud database.

### 3. Dynamic App Layout & Sidebar Navigation
Introduced a global `AppLayout.jsx` component acting as a persistent shell around all authenticated routes (`/dashboard /*`).
* Features a sleek, dark-themed sidebar that seamlessly routes between the Dashboard, Live Location, Risk Score, Plans, and History views using `react-router-dom`.

### 4. Real-Time Rider Dashboard
* **Data Hydration:** `Dashboard.jsx` was stripped of static mock data and rebuilt to query Supabase on mount. It aggregates the authenticated rider's specific premium and payout arrays and pumps them dynamically into the Chart.js metric graphs.
* **UI Polish:** Customized global webkit scrollbars in `index.css` to remove default browser styling in favor of slim, dark-themed scrollbars that integrate perfectly with the SaaS aesthetic.

### 5. Dynamic Insurance Plans (`Plans.jsx`)
Built a fully interactive pricing module simulating AI-driven parametric algorithms.
* **The Mechanic:** The app grabs an underlying Risk Multiplier (simulating active live-weather APIs predicting disruptions) and instantly recalculates the premium prices for the Basic, Shield, and Elite tiers.
* **Database Writes:** Whenever a worker upgrades their coverage plan, the app optimistically updates the UI and fires a write command to the Supabase database to lock in their new weekly rate.

### 6. Claim History Ledger (`History.jsx`)
Constructed a highly transparent parametric ledger.
* Programmatically parses the user's `weekly_payouts` JSON array from Supabase.
* Dynamically generates individual "Claim Receipts" for any past payout events, attaching realistic metadata (Date Processed, Dispute Trigger Event, and Payout Amount).

---

## 🛠️ Tech Stack & Setup
* **Frontend:** React (Vite 5.x), React Router DOM, Chart.js
* **Backend Database:** Supabase (PostgreSQL)
* **SDKs:** TomTom Web SDK (Live Maps)

**Environment Variables Required:**
Create a `.env` in the `client/` folder with:
\`\`\`env
VITE_SUPABASE_URL=https://<your_supabase_project>.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
\`\`\`

**Running Locally:**
\`\`\`bash
cd client
npm install
npm run dev
\`\`\`
*(Vite Dev Server spins up on port `5173`)*
