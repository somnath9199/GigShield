GET    /api/rider/profile              → Get rider profile
PUT    /api/rider/profile              → Update profile details
GET    /api/rider/dashboard            → Summary: coverage, claims, payouts
POST   /api/rider/location             → Update current working zone (GPS)
GET    /api/rider/location/history     → Last 30 days zone history
POST   /api/rider/heartbeat            → App ping every 30 mins (proof of work attempt)
GET    /api/rider/earnings/summary     → 30-day average daily earnings
GET    /api/rider/risk-score           → Current risk score breakdown
GET    /api/rider/notifications        → All alerts and payout notifications
GET    /api/policy/plans               → List available coverage plans
POST   /api/policy/enroll              → Enroll into a plan
GET    /api/policy/active              → Get current active policy
GET    /api/policy/:policyId           → Get specific policy details
PUT    /api/policy/:policyId/pause     → Pause coverage (rider choice)
PUT    /api/policy/:policyId/resume    → Resume paused coverage
DELETE /api/policy/:policyId/cancel    → Cancel policy
GET    /api/policy/:policyId/history   → Full policy lifecycle history
GET    /api/policy/eligibility-check   → Check if rider qualifies (pre-signup)
GET    /api/premium/current            → This week's premium for logged-in rider
GET    /api/premium/calculate          → Real-time premium estimate (quote)
GET    /api/premium/breakdown          → Multiplier breakdown (why this amount)
GET    /api/premium/history            → Week-by-week premium history
POST   /api/premium/pay                → Initiate weekly premium payment (UPI/wallet)
GET    /api/premium/payment-status/:txnId → Check payment transaction status
GET    /api/premium/upcoming           → Next week's projected premium
GET    /api/premium/base-rates         → Public endpoint: base rates by city