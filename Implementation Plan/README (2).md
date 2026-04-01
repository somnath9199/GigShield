# 🛡️ GigShield — AI-Powered Parametric Insurance for India's Gig Economy

> **Guidewire DEVTrails 2026 | University Hackathon**  
> Protecting India's delivery partners from income loss caused by uncontrollable external disruptions.

---

## 📌 Table of Contents

1. [Problem Statement](#problem-statement)
2. [Our Solution](#our-solution)
3. [Persona & Target Segment](#persona--target-segment)
4. [Persona-Based Scenarios & Application Workflow](#persona-based-scenarios--application-workflow)
5. [Weekly Premium Model & Parametric Triggers](#weekly-premium-model--parametric-triggers)
6. [Premium Plans](#premium-plans)
7. [No-Claim Bonus System](#no-claim-bonus-system)
8. [AI/ML Integration](#aiml-integration)
9. [Fraud Detection Architecture](#fraud-detection-architecture)
10. [Platform Choice — Web](#platform-choice--web)
11. [Tech Stack](#tech-stack)
12. [Development Plan](#development-plan)
13. [API Integrations](#api-integrations)

---

## 🚨 Problem Statement

India's platform-based delivery partners (Zomato, Swiggy, Zepto, Amazon, Dunzo etc.) are the backbone of our fast-paced digital economy. However, external disruptions such as **extreme weather, curfews, and local blockades** can reduce their working hours and cause them to lose **20–30% of their monthly earnings**.

Currently, gig workers have **no income protection** against these uncontrollable events. When disruptions occur, they bear the full financial loss with no safety net.

---

## 💡 Our Solution

**GigShield** is an AI-enabled parametric insurance platform that safeguards gig delivery workers against income loss caused by external disruptions.

### Key Pillars:
- ✅ **Automated parametric claims** via OpenWeatherMap, Weatherbit & NASA EONET API triggers
- ✅ **AI-powered photo validation** for curfews and local blockades
- ✅ **Google Maps Routes API** cross-verification for blockade authenticity
- ✅ **Reverse geocoding** via OpenCage API to map GPS coordinates to delivery zones
- ✅ **Intelligent fraud detection** preventing GPS spoofing and fake claims
- ✅ **Annual pricing model** structured and displayed on a weekly basis
- ✅ **Optional add-on coverage** — workers choose which disruptions they want covered
- ✅ **No-Claim Bonus** rewarding honest workers and reducing fraud incentive

---

## 👤 Persona & Target Segment

**Chosen Segment: Food Delivery Partners — Zomato & Swiggy**

### Why Food Delivery?
- Largest gig worker segment in India with **5+ million active delivery partners**
- Most exposed to weather-related disruptions (outdoor, two-wheeler based)
- Operate in hyper-local zones making location-based parametric triggers highly accurate
- Earn weekly and spend weekly — most in need of a financial safety net

### Persona Profile:
| Attribute | Details |
|---|---|
| Name | Ravi Kumar |
| Age | 26 |
| City | Bengaluru |
| Platform | Zomato |
| Monthly Earnings | ₹22,000–₹28,000 |
| Weekly Earnings | ₹5,500–₹7,000 |
| Work Hours | 9 AM – 9 PM (10–12 hrs/day) |
| Vehicle | Two-Wheeler |
| Pain Point | Loses ₹500–₹800/day during heavy rain or curfews |

---

## 🔄 Persona-Based Scenarios & Application Workflow

### Scenario 1 — Heavy Rainfall (Parametric Auto-Trigger)

> **Ravi is on shift. OpenWeatherMap detects rainfall > 60mm/hr in his delivery zone (Koramangala, Bengaluru). His policy's parametric trigger fires automatically.**

**Workflow:**
```
OpenWeatherMap API detects trigger threshold exceeded
        ↓
OpenCage Reverse Geocoding maps Ravi's GPS (lat/lng) → "Koramangala, Bengaluru"
        ↓
System checks Ravi's active policy & confirms delivery zone match
        ↓
Claim auto-initiated (zero action from Ravi)
        ↓
Fraud check: Cross-verify with Weatherbit historical zone rainfall data
        ↓
Claim approved ✅ → Payout credited to UPI via Razorpay within minutes
        ↓
Ravi receives push notification: "₹400 credited for rainfall disruption"
```

---

### Scenario 2 — Local Curfew / Road Blockade (Manual + AI Validation)

> **Ravi is blocked by a police barricade on his route. No major news is reporting it (local street-level blockade). He opens GigShield app and uploads a live photo.**

**Workflow:**
```
Ravi opens app → Taps "Report Blockade"
        ↓
App forces LIVE photo capture (no gallery access)
        ↓
Photo metadata validated: GPS coordinates + timestamp (must be < 15 mins old)
        ↓
OpenCage API: lat/lng → confirms Ravi is inside his registered delivery zone
        ↓
CV Model analyzes photo: Detects barricade / police presence / blocked road
        ↓
Google Maps Routes API called: "Are ANY alternative routes available
        from Ravi's current GPS to his delivery destination?"
        ↓
If NO alternative routes exist → Claim AUTO-APPROVED ✅
If routes exist → Claim REJECTED ❌ (Ravi could take another road)
        ↓
Payout credited via Razorpay if approved
```

**Why Google Maps instead of News API?**
Most local blockades in India (street protests, VIP movements, local bandhs) are **never reported in mainstream news** but Google Maps has real-time road closure data for even small lanes. This makes our validation robust for ground-level Indian realities.

---

### Scenario 3 — Natural Disaster / Flood (NASA EONET Auto-Trigger)

> **NASA EONET API reports a flood event tagged to Ravi's pincode area. Deliveries are halted. His policy auto-triggers.**

**Workflow:**
```
NASA EONET API reports active flood/disaster event
        ↓
OpenCage maps event coordinates → matches Ravi's registered delivery zone
        ↓
Weatherbit API cross-confirms flood indicator data for the zone
        ↓
Claim auto-initiated
        ↓
Payout processed instantly via Razorpay
```

---

### Scenario 4 — Extreme Heat (Optional Add-On Trigger)

> **Ravi opted into the Extreme Heat add-on during onboarding. OpenWeatherMap detects temperature > 45°C in his zone for 3+ consecutive hours.**

**⚠️ Why Extreme Heat is an Optional Add-On — Not a Default Trigger:**

> In India, delivery workers **continue working even during extreme heat** — it is part of their daily reality and does not physically stop them from riding or completing deliveries. Unlike heavy rain or floods which make roads impassable, extreme heat is endured by workers routinely. Including heat as a default trigger would generate **high-frequency claims without genuine income loss**, making the insurer unprofitable. GigShield offers it as an **optional paid add-on** only for workers who genuinely want it — keeping the base plan lean, fair, and sustainable.

**Workflow (only if worker has opted into Heat Add-On):**
```
OpenWeatherMap detects temperature > 45°C for 3+ consecutive hours in delivery zone
        ↓
System checks if worker's active policy includes Heat Add-On
        ↓
If YES → Claim auto-initiated → Payout processed via Razorpay
If NO  → No action (worker not covered for heat disruption)
```

---

## 📊 Weekly Premium Model & Parametric Triggers

### Premium Philosophy — Annual Collection, Weekly Display

GigShield collects premium **annually** but displays and prices it on a **per-week basis**.

**Why Annual Collection?**

| Risk | Weekly Payment | Annual Payment |
|---|---|---|
| Adverse Selection | 🔴 Critical Risk | ✅ Eliminated |
| Worker buys only before known bad weather | Easily exploitable via 10-day forecast | Not possible with annual commitment |
| Cash flow for insurer | Unstable | Predictable |
| Business viability | Low | High |

> **Adverse Selection Problem Explained:** OpenWeatherMap and Google Weather provide 10-day forecasts freely. If workers could buy weekly, they would simply purchase insurance every time a storm is predicted and cancel when weather is clear — making the insurer lose money on every claim. Annual plans eliminate this completely.

---

### Parametric Triggers Table

| Trigger Type | Data Source | Threshold | Claim Type | Included In |
|---|---|---|---|---|
| Heavy Rainfall | OpenWeatherMap API (Free Tier) | > 60mm/hr in delivery zone | Auto | All Plans — Default |
| Storm / Cyclone Alert | OpenWeatherMap Alerts (Free Tier) | Severe storm alert in zone | Auto | All Plans — Default |
| Flood / Natural Disaster | NASA EONET Disaster API (Free) | Active flood/disaster event in zone | Auto | All Plans — Default |
| Flood Indicators | Weatherbit API (Free Tier) | Flood indicator triggered in zone | Auto (cross-verify) | All Plans — Default |
| Local Curfew / Blockade | Live Photo + CV Model + Google Maps Routes API | No alternative routes + barricade detected | Manual + AI | All Plans — Default |
| Extreme Heat | OpenWeatherMap API (Free Tier) | > 45°C for 3+ consecutive hours | Auto | **Optional Add-On Only** |

> **Why Air Pollution (AQI) is Excluded Entirely:** While severe air pollution is a documented health risk, Indian delivery workers **continue delivering even on the most polluted days** — it does not halt their income. Including AQI as a trigger would create auto-triggered claims with no real income loss event, causing serious financial loss to the insurer. GigShield covers only disruptions that **verifiably and physically stop deliveries.**

---

## 💳 Premium Plans

All plans are **annual subscriptions**, displayed as weekly cost for relatability. Each plan includes a **default coverage set** with an **optional Extreme Heat add-on** the worker can choose at onboarding.

---

### 🥉 SAATHI Plan — ₹299/year
**"Less than a chai per week — ₹6/week"**

| Feature | Details |
|---|---|
| Annual Premium | ₹399 |
| Displayed Weekly Cost | ₹8/week |
| Payout Per Disruption Day | ₹400 |
| Max Claimable Days/Year | 8 days |
| Maximum Annual Payout | ₹3200 |
| Best For | Part-time workers, new joiners (₹10,000–15,000/month) |

**✅ Default Coverage:**
- Heavy Rainfall · Storm/Cyclone · Flood/Natural Disaster · Local Curfew/Blockade

**➕ Optional Add-On at Onboarding:**
| Add-On | Extra Annual Cost | Payout Per Heat Day | Max Heat Days |
|---|---|---|---|
| Extreme Heat Coverage | +₹99/year | ₹150/day | 5 days |

---

### 🥈 RAKSHAK Plan — ₹599/year ⭐ Most Popular
**"Less than a samosa per week — ₹12/week"**

| Feature | Details |
|---|---|
| Annual Premium | ₹699 |
| Displayed Weekly Cost | ₹12/week |
| Payout Per Disruption Day | ₹500 |
| Max Claimable Days/Year | 12 days |
| Maximum Annual Payout | ₹6000 |
| Best For | Regular full-time workers (₹20,000–25,000/month) |

**✅ Default Coverage:**
- Heavy Rainfall · Storm/Cyclone · Flood/Natural Disaster · Local Curfew/Blockade

**➕ Optional Add-On at Onboarding:**
| Add-On | Extra Annual Cost | Payout Per Heat Day | Max Heat Days |
|---|---|---|---|
| Extreme Heat Coverage | +₹149/year | ₹300/day | 8 days |

---

### 🥇 SURAKSHA Plan — ₹999/year
**"Less than a bus ticket per week — ₹20/week"**

| Feature | Details |
|---|---|
| Annual Premium | ₹999 |
| Displayed Weekly Cost | ₹20/week |
| Payout Per Disruption Day | ₹700 |
| Max Claimable Days/Year | 18 days |
| Maximum Annual Payout | ₹12,600 |
| Best For | Full-time metro power workers (₹25,000–₹30,000+/month) |

**✅ Default Coverage:**
- Heavy Rainfall · Storm/Cyclone · Flood/Natural Disaster · Local Curfew/Blockade

**➕ Optional Add-On at Onboarding:**
| Add-On | Extra Annual Cost | Payout Per Heat Day | Max Heat Days |
|---|---|---|---|
| Extreme Heat Coverage | +₹199/year | ₹500/day | 12 days |

---

### Profitability Math (RAKSHAK Plan Example)

```
Premium collected per worker:         ₹699/year
Realistic disruption days (metro):    8–12 days/year
Actual claim rate (industry avg):     ~40–50% of eligible events
Average realistic payout:             ₹500 × 5 days × 45% = ~₹1125

With 10,000 workers on RAKSHAK:
Total premiums collected:             ₹6,99,00,000
Estimated total payouts:              ₹200,00,000
                                      ──────────────
Gross Margin (before ops cost):       ~70% ✅
```

> Note: Not all workers are in disrupted zones simultaneously, and not all file claims even when eligible — both further improve margins. Heat add-on premiums are ring-fenced separately, ensuring heat claims are fully funded without impacting the base plan's profitability.

---

## 🎁 No-Claim Bonus System

Workers are **rewarded for not claiming**, which reduces fraud and builds loyalty.

| Plan | 3-Month No Claim | 6-Month No Claim | 12-Month No Claim |
|---|---|---|---|
| SAATHI | — | ₹50 Paytm voucher | ₹75 cashback + renewal discount 10% |
| RAKSHAK | ₹100 cashback | 20% renewal discount | ₹200 cashback + free SURAKSHA upgrade |
| SURAKSHA | ₹150 cashback | 25% renewal discount | ₹300 cashback + loyalty badge |

**Why NCB Works:**
- Workers avoid filing small, borderline claims to protect their bonus
- Reduces fraudulent claims significantly
- Creates strong annual renewal incentive
- Mirrors proven NCB model used by LIC and ACKO in motor insurance

---

## 🤖 AI/ML Integration

### 1. Dynamic Premium Calculation

The base premium is adjusted dynamically at **policy renewal** based on:

```
Final Premium = Base Premium × Zone Risk Factor × Claim History Factor × Loyalty Factor

Zone Risk Factor:     High flood zone = 1.2x | Safe zone = 0.85x
Claim History Factor: 0 claims = 0.9x | 1 claim = 1.0x | 2+ claims = 1.15x
Loyalty Factor:       Year 1 = 1.0x | Year 2 = 0.95x | Year 3+ = 0.90x
```

**ML Model Used:** Gradient Boosted Decision Tree (XGBoost) trained on:
- Historical weather data by pincode (OpenWeatherMap + Weatherbit)
- NASA EONET historical disaster frequency by zone
- Historical claim frequency by zone
- Worker tenure and claim patterns

---

### 2. Computer Vision — Blockade Photo Validation

**Model Architecture:** Fine-tuned MobileNetV3 (lightweight for mobile inference)

**Detects:**
- Police barricades and road barriers
- Uniformed personnel (police/military)
- Crowd gatherings blocking roads
- Signage indicating closures

**Anti-Fraud Layers on Photo:**
- GPS metadata must match worker's registered zone (verified via OpenCage reverse geocoding)
- Timestamp must be within 15 minutes of claim submission
- Live camera enforced (gallery upload disabled)
- Duplicate photo hash detection (same image cannot be reused)

---

### 3. Anomaly Detection in Claims

**Rule-Based + ML Hybrid:**

```
Red Flags Detected:
→ Worker claims disruption but GPS shows they were moving normally
→ Multiple workers in non-overlapping zones claiming same disruption
→ Claim filed outside active policy hours
→ Photo GPS location doesn't match delivery zone (OpenCage mismatch)
→ Same photo hash submitted by multiple accounts
→ Claim frequency significantly above zone average
→ NASA EONET / Weatherbit data contradicts worker's reported disruption location
```

---

## 🔒 Fraud Detection Architecture

### Two-Layer Fraud Defense

**Layer 1 — Automated Rules Engine (Real-time)**
- GPS validation against delivery zone (via OpenCage reverse geocoding)
- Timestamp cross-check
- Photo hash deduplication
- API data cross-verification (OpenWeatherMap + Weatherbit + NASA EONET)

**Layer 2 — ML Anomaly Detection (Async)**
- Identifies unusual claim patterns across worker cohorts
- Flags accounts for manual review
- Continuously retrained on new data

### Blockade Claim — The Google Maps Advantage

> The most innovative fraud prevention in our system: For curfew/blockade claims, we call the **Google Maps Directions API** to check if alternative routes exist between the worker's current GPS location and their delivery destination. If even one route is available, the claim is rejected. This is objective, tamper-proof, and works even for hyper-local blockades that no news API would capture.

---

## 🌐 Platform Choice — Web Application

**Chosen: Web (React.js PWA)**

| Factor | Web | Mobile App |
|---|---|---|
| Development Speed | ✅ Faster (single codebase) | ❌ Separate Android/iOS |
| Device Coverage | ✅ All smartphones via browser | ❌ Requires install |
| Camera Access | ✅ Via browser APIs | ✅ Native |
| Push Notifications | ✅ Via PWA | ✅ Native |
| Hackathon Timeline | ✅ Feasible in 6 weeks | ❌ Too time-consuming |
| Worker Adoption | ✅ No install friction | ❌ Storage concerns on budget phones |

**PWA (Progressive Web App)** gives us native-like experience (camera, GPS, offline mode, push notifications) without requiring app store deployment — ideal for budget Android devices used by most delivery workers.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React.js | UI framework — component-based architecture |
| Tailwind CSS | Utility-first styling — rapid responsive design |
| Chart.js | Analytics dashboards — claim trends, payout history |
| PWA (Service Workers) | Offline capability, push notifications, camera access |

### Backend & Database
| Technology | Purpose |
|---|---|
| Supabase | Authentication (OTP/phone login), real-time DB, storage |
| PostgreSQL | Primary database (via Supabase) |
| JavaScript (Node.js) | Backend API routes and business logic |
| Supabase Edge Functions | Serverless functions for claim processing & triggers |

### AI/ML
| Technology | Purpose |
|---|---|
| TensorFlow.js / ONNX | CV model inference for photo validation |
| Python (training only) | Model training — MobileNetV3 fine-tuning |
| XGBoost | Dynamic premium calculation model |

### External APIs
| API | Purpose | Tier |
|---|---|---|
| OpenWeatherMap API | Rainfall, storm alerts, temperature triggers | Free Tier |
| Weatherbit API | Rainfall & flood indicators, cross-verification | Free Tier |
| NASA EONET Disaster API | Natural disaster & flood event triggers | Free (Public) |
| OpenCage Geocoding API | Reverse geocoding lat/lng → city/zone name | Free Tier |
| Google Maps Directions API | Blockade route validation | Free Tier |
| Razorpay API | Premium collection & instant payouts | Test/Sandbox |

---

## 📅 Development Plan

### Phase 1 — Ideation & Foundation (March 4–20) ✅ Current Phase
- [x] Define persona, scenarios, and application workflow
- [x] Design premium plans and pricing model with optional add-ons
- [x] Define parametric triggers and fraud detection architecture
- [x] Finalize tech stack and all API selections
- [ ] Set up GitHub repository with clean folder architecture
- [ ] Create minimal prototype (React UI — onboarding + plan selection screens)
- [ ] Record 2-minute video walkthrough

### Phase 2 — Automation & Protection (March 21 – April 4)
- [ ] Worker registration & Supabase authentication (OTP login)
- [ ] Insurance policy creation with plan + optional heat add-on selection
- [ ] Dynamic premium calculation engine
- [ ] OpenWeatherMap API integration for rainfall & storm triggers
- [ ] Weatherbit API integration for flood cross-verification
- [ ] NASA EONET integration for natural disaster triggers
- [ ] OpenCage integration for reverse geocoding & zone matching
- [ ] Claims management module
- [ ] Basic worker dashboard

### Phase 3 — Scale & Optimise (April 5–17)
- [ ] CV model integration for blockade photo validation
- [ ] Google Maps Routes API integration for blockade validation
- [ ] Advanced fraud detection (anomaly detection ML model)
- [ ] No-Claim Bonus tracking and reward system
- [ ] Razorpay sandbox integration for payouts
- [ ] Admin/Insurer analytics dashboard (Chart.js)
- [ ] Final pitch deck and 5-minute demo video

---

## 📁 Repository Structure (Planned)

```
gigshield/
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Onboarding, Dashboard, Claims, Plans
│   │   ├── hooks/             # Custom React hooks
│   │   └── utils/             # API helpers, validators
│   └── public/
├── backend/
│   ├── routes/                # API endpoints
│   ├── services/              # Business logic (claims, triggers, fraud)
│   ├── models/                # Database models
│   └── functions/             # Supabase Edge Functions
├── ml/
│   ├── cv-model/              # Blockade photo validation model
│   └── pricing-model/         # Dynamic premium ML model
└── README.md
```

---

## ⚠️ Coverage Exclusions (Strictly Enforced)

As per hackathon requirements, GigShield **strictly excludes**:
- ❌ Health insurance or medical bills
- ❌ Accident coverage
- ❌ Vehicle repair or damage
- ❌ Life insurance
- ❌ Air Pollution / AQI-based claims *(workers continue delivering in pollution — not a verifiable income-loss event)*

GigShield covers **ONLY** income loss during disruptions that **verifiably and physically halt deliveries**.

---

## 👥 Team

> Guidewire DEVTrails 2026 Submission  
> © 2026 — Built with ❤️ for India's gig workers
