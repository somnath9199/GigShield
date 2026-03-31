import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const NAV_LINKS = ["How It Works", "Features", "Pricing", "Dashboard"];

const STATS = [
  { value: "12M+", label: "Gig Workers in India" },
  { value: "₹4,200", label: "Avg. Monthly Loss" },
  { value: "< 2 min", label: "Claim Processing" },
  { value: "98.4%", label: "Payout Accuracy" },
];

const DISRUPTIONS = [
  {
    icon: "🌧️",
    title: "Extreme Weather",
    desc: "Heavy rain, floods, cyclones, and extreme heat that halt deliveries",
    color: "#2563eb",
  },
  {
    icon: "🌫️",
    title: "Severe Pollution",
    desc: "AQI spikes beyond safe working thresholds for outdoor workers",
    color: "#7c3aed",
  },
  {
    icon: "🚫",
    title: "Civic Disruptions",
    desc: "Curfews, local strikes, and sudden zone closures blocking access",
    color: "#059669",
  },
  {
    icon: "🌊",
    title: "Natural Disasters",
    desc: "Floods, earthquakes, and events that make delivery impossible",
    color: "#dc2626",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Onboard in 3 Minutes",
    desc: "Verify your delivery platform ID. AI builds your risk profile from your zone, history, and earnings patterns.",
  },
  {
    step: "02",
    title: "Get Weekly Coverage",
    desc: "Choose a ₹29–₹99/week plan. Premiums are dynamically priced based on your city, zone risk, and weather forecasts.",
  },
  {
    step: "03",
    title: "Real-Time Monitoring",
    desc: "We watch weather APIs, pollution boards, and civic alerts 24/7. No action needed from you.",
  },
  {
    step: "04",
    title: "Automatic Payout",
    desc: "When a trigger fires, we validate your location & activity, detect fraud, and deposit directly to UPI within minutes.",
  },
];

const PLANS = [
  {
    name: "Basic",
    price: "₹29",
    period: "/ week",
    coverage: "Up to ₹500/week",
    features: ["Weather triggers", "UPI instant payout", "Basic fraud shield", "3 claims/month"],
    accent: "#2563eb",
    popular: false,
  },
  {
    name: "Shield",
    price: "₹59",
    period: "/ week",
    coverage: "Up to ₹1,200/week",
    features: [
      "All weather + pollution",
      "Civic disruption coverage",
      "AI risk score dashboard",
      "6 claims/month",
      "Priority support",
    ],
    accent: "#7c3aed",
    popular: true,
  },
  {
    name: "Elite",
    price: "₹99",
    period: "/ week",
    coverage: "Up to ₹2,500/week",
    features: [
      "Full disruption suite",
      "Multi-zone coverage",
      "Predictive alerts",
      "Unlimited claims",
      "Dedicated agent",
      "Family accident rider",
    ],
    accent: "#059669",
    popular: false,
  },
];

const METRICS = [
  { label: "Active Policies", value: "84,291", change: "+12.4%", up: true },
  { label: "Claims This Week", value: "3,847", change: "+5.1%", up: true },
  { label: "Fraud Blocked", value: "₹18.2L", change: "-2.3%", up: false },
  { label: "Avg Payout Time", value: "1m 47s", change: "-18s", up: true },
];

const TESTIMONIALS = [
  {
    name: "Ravi Kumar",
    city: "Chennai",
    platform: "Swiggy",
    quote:
      "Last monsoon season I lost 9 working days. GigShield credited ₹1,100 automatically — I didn't even raise a claim.",
    initials: "RK",
  },
  {
    name: "Priya Nair",
    city: "Kochi",
    platform: "Zomato",
    quote:
      "The AQI trigger saved me during Diwali week. ₹800 in my account before I even woke up the next morning.",
    initials: "PN",
  },
  {
    name: "Arjun Singh",
    city: "Delhi",
    platform: "Zepto",
    quote:
      "Weekly premium fits perfectly with my earnings cycle. No monthly lock-in. Exactly what gig workers need.",
    initials: "AS",
  },
];

function AnimatedCounter({ target, duration = 1500 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const numeric = parseInt(target.replace(/[^0-9]/g, ""));
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(ease * numeric));
            if (progress < 1) requestAnimationFrame(tick);
            else setCount(numeric);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  const prefix = target.match(/^[^0-9]*/)?.[0] || "";
  const suffix = target.match(/[^0-9]*$/)?.[0] || "";
  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

function MiniChart() {
  const data = [40, 55, 35, 70, 45, 80, 60, 90, 75, 95, 85, 100];
  const max = Math.max(...data);
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * 280},${80 - (v / max) * 70}`)
    .join(" ");
  return (
    <svg viewBox="0 0 280 90" fill="none" style={{ width: "100%", height: 60 }}>
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,80 ${points} 280,80`}
        fill="url(#chartGrad)"
      />
      <polyline
        points={points}
        stroke="#7c3aed"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activePlan, setActivePlan] = useState(1);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={styles.root}>
      <style>{css}</style>

      {/* NAV */}
      <nav style={{ ...styles.nav, ...(scrolled ? styles.navScrolled : {}) }}>
        <div style={styles.navInner}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>⚡</span>
            <span style={styles.logoText}>GigShield</span>
          </div>
          <div style={styles.navLinks}>
            {NAV_LINKS.map((l) => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} style={styles.navLink} className="nav-link">
                {l}
              </a>
            ))}
          </div>
          <button style={styles.navCta} className="cta-btn" onClick={() => navigate('/Auth')}>
            Login / Sign Up
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.heroBg}>
          <div style={styles.heroBlobA} className="blob-a" />
          <div style={styles.heroBlobB} className="blob-b" />
          <div style={styles.heroGrid} />
        </div>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge} className="fade-up">
            <span style={styles.badgeDot} />
            AI-Powered Parametric Insurance
          </div>
          <h1 style={styles.heroTitle} className="fade-up-delay-1">
            India's Gig Workers<br />
            <span style={styles.heroGradient}>Deserve a Safety Net</span>
          </h1>
          <p style={styles.heroSub} className="fade-up-delay-2">
            When extreme weather, pollution, or civic disruptions stop you from working,
            GigShield automatically detects the event and pays you — no claim forms, no waiting.
          </p>
          <div style={styles.heroActions} className="fade-up-delay-3">
            <button style={styles.heroPrimary} className="cta-btn" onClick={() => navigate('/Auth')}>
              Start for ₹29/week
            </button>
            <button style={styles.heroSecondary} className="ghost-btn">
              See How It Works ↓
            </button>
          </div>
          <div style={styles.platforms} className="fade-up-delay-3">
            <span style={styles.platformLabel}>Covering workers on</span>
            {["Zomato", "Swiggy", "Zepto", "Amazon", "Dunzo", "Blinkit"].map((p) => (
              <span key={p} style={styles.platformChip}>{p}</span>
            ))}
          </div>
        </div>

        {/* Floating card */}
        <div style={styles.heroCard} className="float-card fade-up-delay-2">
          <div style={styles.cardHeader}>
            <span style={styles.cardDot} />
            <span style={{ fontSize: 13, color: "#10b981", fontWeight: 600 }}>LIVE TRIGGER DETECTED</span>
          </div>
          <div style={styles.cardTitle}>Heavy Rainfall — Chennai Zone 4</div>
          <div style={styles.cardMeta}>AQI 312 · Rainfall 94mm · Disruption Score 8.7/10</div>
          <div style={styles.cardPayouts}>
            <div style={styles.payoutRow}>
              <span>Ravi K. — Swiggy</span>
              <span style={{ color: "#10b981", fontWeight: 700 }}>+₹420</span>
            </div>
            <div style={styles.payoutRow}>
              <span>Meena S. — Zomato</span>
              <span style={{ color: "#10b981", fontWeight: 700 }}>+₹385</span>
            </div>
            <div style={styles.payoutRow}>
              <span>Arun T. — Zepto</span>
              <span style={{ color: "#10b981", fontWeight: 700 }}>+₹510</span>
            </div>
          </div>
          <div style={styles.cardFooter}>Auto-credited via UPI · 1m 12s ago</div>
        </div>
      </section>

      {/* STATS */}
      <section style={styles.statsBar}>
        {STATS.map((s) => (
          <div key={s.label} style={styles.statItem}>
            <div style={styles.statValue}>
              <AnimatedCounter target={s.value} />
            </div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* PROBLEM */}
      <section style={styles.section}>
        <div style={styles.sectionInner}>
          <div style={styles.sectionTag}>THE PROBLEM</div>
          <h2 style={styles.sectionTitle}>
            Every Disruption Costs You<br />
            <span style={styles.accent}>Days of Income</span>
          </h2>
          <p style={styles.sectionSub}>
            India's 12M+ delivery partners lose 20–30% of monthly earnings when uncontrollable
            external events strike. There's no fallback. Until now.
          </p>
          <div style={styles.disruptionGrid}>
            {DISRUPTIONS.map((d) => (
              <div key={d.title} style={styles.disruptionCard} className="hover-lift">
                <div style={{ ...styles.disruptionIcon, background: d.color + "18" }}>
                  <span style={{ fontSize: 28 }}>{d.icon}</span>
                </div>
                <h3 style={styles.disruptionTitle}>{d.title}</h3>
                <p style={styles.disruptionDesc}>{d.desc}</p>
                <div style={{ ...styles.disruptionBar, background: d.color }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ ...styles.section, background: "#0a0a14" }}>
        <div style={styles.sectionInner}>
          <div style={styles.sectionTag}>HOW IT WORKS</div>
          <h2 style={styles.sectionTitle}>
            Protection That Works<br />
            <span style={styles.accent}>While You Work</span>
          </h2>
          <div style={styles.stepsGrid}>
            {HOW_IT_WORKS.map((s, i) => (
              <div key={s.step} style={styles.stepCard} className="hover-lift">
                <div style={styles.stepNum}>{s.step}</div>
                <h3 style={styles.stepTitle}>{s.title}</h3>
                <p style={styles.stepDesc}>{s.desc}</p>
                {i < HOW_IT_WORKS.length - 1 && <div style={styles.stepArrow}>→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={styles.section}>
        <div style={styles.sectionInner}>
          <div style={styles.sectionTag}>CORE FEATURES</div>
          <h2 style={styles.sectionTitle}>
            Built with AI at<br />
            <span style={styles.accent}>Every Layer</span>
          </h2>
          <div style={styles.featuresGrid}>
            {/* Large feature */}
            <div style={styles.featureLarge} className="hover-lift">
              <div style={styles.featureIcon}>🧠</div>
              <h3 style={styles.featureTitle}>AI Risk Assessment</h3>
              <p style={styles.featureDesc}>
                Dynamic weekly premiums computed from your delivery zone, historical weather patterns,
                seasonal risk, platform earnings data, and real-time forecasts.
              </p>
              <div style={styles.featureChart}>
                <div style={styles.chartLabel}>Risk Score Trend (30 days)</div>
                <MiniChart />
              </div>
            </div>

            <div style={styles.featureSmall} className="hover-lift">
              <div style={styles.featureIcon}>🔍</div>
              <h3 style={styles.featureTitle}>Fraud Detection</h3>
              <p style={styles.featureDesc}>
                Location + activity validation, duplicate claim prevention, and anomaly scoring
                on every payout request — in real time.
              </p>
            </div>

            <div style={styles.featureSmall} className="hover-lift">
              <div style={styles.featureIcon}>⚡</div>
              <h3 style={styles.featureTitle}>Parametric Automation</h3>
              <p style={styles.featureDesc}>
                Triggers fire when weather APIs, AQI boards, or civic alerts cross thresholds.
                Zero manual intervention required.
              </p>
            </div>

            <div style={styles.featureSmall} className="hover-lift">
              <div style={styles.featureIcon}>💸</div>
              <h3 style={styles.featureTitle}>Instant UPI Payout</h3>
              <p style={styles.featureDesc}>
                Verified claims are settled directly to your UPI ID — average 1m 47s from trigger to credit.
              </p>
            </div>

            <div style={styles.featureSmall} className="hover-lift">
              <div style={styles.featureIcon}>📊</div>
              <h3 style={styles.featureTitle}>Analytics Dashboard</h3>
              <p style={styles.featureDesc}>
                Track your coverage status, trigger history, earnings protected, and fraud flags — all in one view.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ ...styles.section, background: "#0a0a14" }}>
        <div style={styles.sectionInner}>
          <div style={styles.sectionTag}>WEEKLY PRICING</div>
          <h2 style={styles.sectionTitle}>
            Aligned with Your<br />
            <span style={styles.accent}>Earnings Cycle</span>
          </h2>
          <p style={styles.sectionSub}>
            No monthly lock-ins. Pay weekly, cancel anytime. Coverage renews every Monday.
          </p>
          <div style={styles.plansGrid}>
            {PLANS.map((plan, i) => (
              <div
                key={plan.name}
                style={{
                  ...styles.planCard,
                  ...(plan.popular ? styles.planCardPopular : {}),
                  borderColor: activePlan === i ? plan.accent : "transparent",
                }}
                className="hover-lift"
                onClick={() => setActivePlan(i)}
              >
                {plan.popular && <div style={styles.popularBadge}>Most Popular</div>}
                <div style={styles.planName}>{plan.name}</div>
                <div style={styles.planPrice}>
                  {plan.price}
                  <span style={styles.planPeriod}>{plan.period}</span>
                </div>
                <div style={{ ...styles.planCoverage, color: plan.accent }}>{plan.coverage}</div>
                <div style={styles.planDivider} />
                {plan.features.map((f) => (
                  <div key={f} style={styles.planFeature}>
                    <span style={{ ...styles.planCheck, color: plan.accent }}>✓</span> {f}
                  </div>
                ))}
                <button
                  style={{ ...styles.planBtn, background: plan.accent }}
                  className="cta-btn"
                  onClick={() => navigate('/Auth')}
                >
                  Get {plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section id="dashboard" style={styles.section}>
        <div style={styles.sectionInner}>
          <div style={styles.sectionTag}>LIVE ANALYTICS</div>
          <h2 style={styles.sectionTitle}>
            Everything You Need<br />
            <span style={styles.accent}>In One Dashboard</span>
          </h2>
          <div style={styles.dashGrid}>
            {METRICS.map((m) => (
              <div key={m.label} style={styles.metricCard} className="hover-lift">
                <div style={styles.metricLabel}>{m.label}</div>
                <div style={styles.metricValue}>{m.value}</div>
                <div
                  style={{
                    ...styles.metricChange,
                    color: m.up ? "#10b981" : "#f87171",
                  }}
                >
                  {m.up ? "↑" : "↓"} {m.change}
                </div>
              </div>
            ))}
          </div>
          <div style={styles.dashPreview}>
            <div style={styles.dashHeader}>
              <span style={styles.dashTitle}>Claim Activity — Last 7 Days</span>
              <div style={styles.dashLegend}>
                <span style={styles.legendDot("#7c3aed")} />Payouts
                <span style={styles.legendDot("#059669")} />Fraud Blocked
              </div>
            </div>
            {/* Bar Chart */}
            <div style={styles.barChart}>
              {[62, 80, 45, 95, 70, 88, 76].map((v, i) => (
                <div key={i} style={styles.barGroup}>
                  <div style={styles.barWrap}>
                    <div
                      style={{
                        ...styles.bar,
                        height: `${v}%`,
                        background: "linear-gradient(to top, #7c3aed, #a78bfa)",
                      }}
                      className="bar-anim"
                    />
                    <div
                      style={{
                        ...styles.bar,
                        height: `${v * 0.15}%`,
                        background: "linear-gradient(to top, #059669, #34d399)",
                      }}
                      className="bar-anim"
                    />
                  </div>
                  <div style={styles.barLabel}>{["M", "T", "W", "T", "F", "S", "S"][i]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ ...styles.section, background: "#0a0a14" }}>
        <div style={styles.sectionInner}>
          <div style={styles.sectionTag}>STORIES</div>
          <h2 style={styles.sectionTitle}>
            Real Workers,<br />
            <span style={styles.accent}>Real Relief</span>
          </h2>
          <div style={styles.testiGrid}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} style={styles.testiCard} className="hover-lift">
                <div style={styles.testiQuote}>"{t.quote}"</div>
                <div style={styles.testiAuthor}>
                  <div style={styles.testiAvatar}>{t.initials}</div>
                  <div>
                    <div style={styles.testiName}>{t.name}</div>
                    <div style={styles.testiMeta}>{t.platform} · {t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaBlobA} className="blob-a" />
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>
            Don't Let the Next Storm<br />Empty Your Pocket
          </h2>
          <p style={styles.ctaSub}>
            Join 84,000+ delivery partners who've made disruptions irrelevant to their income.
          </p>
          <button style={styles.ctaBtn} className="cta-btn" onClick={() => navigate('/Auth')}>
            Get Protected for ₹29/week →
          </button>
          <div style={styles.ctaNote}>No paperwork. No health/life coverage. Income-only protection.</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerLogo}>
            <span style={styles.logoIcon}>⚡</span>
            <span style={styles.logoText}>GigShield</span>
          </div>
          <div style={styles.footerNote}>
            © 2025 GigShield · AI-Powered Parametric Insurance for India's Gig Economy
          </div>
          <div style={styles.footerDisclaimer}>
            GigShield covers income disruption only. Health, life, accident, and vehicle coverage are strictly excluded.
          </div>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  root: {
    fontFamily: "'DM Sans', 'Outfit', 'Nunito Sans', sans-serif",
    background: "#06060f",
    color: "#e8e8f0",
    overflowX: "hidden",
    minHeight: "100vh",
  },
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    padding: "20px 0",
    transition: "all 0.3s ease",
  },
  navScrolled: {
    background: "rgba(6,6,15,0.92)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    padding: "14px 0",
  },
  navInner: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  logoIcon: {
    fontSize: 22,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 800,
    letterSpacing: "-0.5px",
    color: "#fff",
  },
  navLinks: {
    display: "flex",
    gap: 32,
  },
  navLink: {
    color: "#a0a0b8",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 500,
    transition: "color 0.2s",
  },
  navCta: {
    background: "linear-gradient(135deg, #7c3aed, #2563eb)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 20px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: "0.2px",
  },
  hero: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    position: "relative",
    padding: "120px 24px 80px",
    overflow: "hidden",
  },
  heroBg: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  },
  heroBlobA: {
    position: "absolute",
    width: 700,
    height: 700,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)",
    top: -200,
    left: -200,
  },
  heroBlobB: {
    position: "absolute",
    width: 600,
    height: 600,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)",
    bottom: -100,
    right: 0,
  },
  heroGrid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
    backgroundSize: "60px 60px",
  },
  heroContent: {
    maxWidth: 620,
    position: "relative",
    zIndex: 2,
    marginLeft: "max(24px, calc((100vw - 1200px)/2))",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(124,58,237,0.15)",
    border: "1px solid rgba(124,58,237,0.3)",
    borderRadius: 100,
    padding: "6px 16px",
    fontSize: 12,
    fontWeight: 600,
    color: "#a78bfa",
    letterSpacing: "0.5px",
    marginBottom: 24,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#10b981",
    boxShadow: "0 0 8px #10b981",
    animation: "pulse 2s infinite",
  },
  heroTitle: {
    fontSize: "clamp(38px, 5vw, 64px)",
    fontWeight: 900,
    lineHeight: 1.08,
    letterSpacing: "-2px",
    color: "#ffffff",
    marginBottom: 20,
  },
  heroGradient: {
    background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 50%, #06b6d4 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSub: {
    fontSize: 17,
    color: "#8888aa",
    lineHeight: 1.7,
    marginBottom: 36,
    maxWidth: 520,
  },
  heroActions: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 28,
  },
  heroPrimary: {
    background: "linear-gradient(135deg, #7c3aed, #2563eb)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "14px 28px",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "-0.2px",
    boxShadow: "0 8px 32px rgba(124,58,237,0.35)",
  },
  heroSecondary: {
    background: "transparent",
    color: "#a0a0b8",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10,
    padding: "14px 24px",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
  },
  platforms: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  platformLabel: {
    fontSize: 12,
    color: "#666680",
    marginRight: 4,
    fontWeight: 500,
  },
  platformChip: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 6,
    padding: "3px 10px",
    fontSize: 12,
    fontWeight: 600,
    color: "#a0a0b8",
  },
  heroCard: {
    position: "absolute",
    right: "max(24px, calc((100vw - 1200px)/2))",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(15,15,30,0.9)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 24,
    width: 300,
    backdropFilter: "blur(20px)",
    boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.2)",
    zIndex: 2,
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  cardDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#10b981",
    boxShadow: "0 0 10px #10b981",
    animation: "pulse 2s infinite",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#fff",
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 11,
    color: "#666680",
    marginBottom: 16,
  },
  cardPayouts: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginBottom: 12,
  },
  payoutRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    color: "#c0c0d8",
    background: "rgba(16,185,129,0.05)",
    padding: "6px 10px",
    borderRadius: 6,
  },
  cardFooter: {
    fontSize: 11,
    color: "#555570",
    textAlign: "center",
  },
  statsBar: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    background: "rgba(124,58,237,0.08)",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  statItem: {
    padding: "32px 24px",
    textAlign: "center",
    borderRight: "1px solid rgba(255,255,255,0.06)",
  },
  statValue: {
    fontSize: 36,
    fontWeight: 900,
    color: "#fff",
    letterSpacing: "-1px",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#666680",
    fontWeight: 500,
  },
  section: {
    padding: "100px 24px",
  },
  sectionInner: {
    maxWidth: 1200,
    margin: "0 auto",
  },
  sectionTag: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "2px",
    color: "#7c3aed",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: "clamp(28px, 4vw, 48px)",
    fontWeight: 900,
    letterSpacing: "-1.5px",
    lineHeight: 1.15,
    marginBottom: 16,
    color: "#ffffff",
  },
  sectionSub: {
    fontSize: 16,
    color: "#8888aa",
    lineHeight: 1.7,
    maxWidth: 560,
    marginBottom: 56,
  },
  accent: {
    background: "linear-gradient(135deg, #7c3aed, #2563eb)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  disruptionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 20,
  },
  disruptionCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 28,
    position: "relative",
    overflow: "hidden",
    transition: "all 0.3s",
  },
  disruptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  disruptionTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: "#fff",
    marginBottom: 8,
  },
  disruptionDesc: {
    fontSize: 14,
    color: "#8888aa",
    lineHeight: 1.6,
  },
  disruptionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.5,
  },
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 24,
  },
  stepCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 28,
    position: "relative",
    transition: "all 0.3s",
  },
  stepNum: {
    fontSize: 42,
    fontWeight: 900,
    color: "rgba(124,58,237,0.2)",
    letterSpacing: "-2px",
    marginBottom: 12,
    lineHeight: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#fff",
    marginBottom: 8,
  },
  stepDesc: {
    fontSize: 14,
    color: "#8888aa",
    lineHeight: 1.6,
  },
  stepArrow: {
    position: "absolute",
    right: -12,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 18,
    color: "#7c3aed",
    zIndex: 2,
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gridTemplateRows: "auto auto",
    gap: 20,
  },
  featureLarge: {
    gridColumn: "span 2",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 32,
    transition: "all 0.3s",
  },
  featureSmall: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 28,
    transition: "all 0.3s",
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#fff",
    marginBottom: 10,
  },
  featureDesc: {
    fontSize: 14,
    color: "#8888aa",
    lineHeight: 1.65,
  },
  featureChart: {
    marginTop: 20,
    background: "rgba(124,58,237,0.06)",
    borderRadius: 8,
    padding: "12px 16px 4px",
  },
  chartLabel: {
    fontSize: 11,
    color: "#555570",
    marginBottom: 4,
    fontWeight: 600,
    letterSpacing: "0.5px",
  },
  plansGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 20,
  },
  planCard: {
    background: "rgba(255,255,255,0.03)",
    border: "2px solid transparent",
    borderRadius: 16,
    padding: 28,
    cursor: "pointer",
    transition: "all 0.3s",
    position: "relative",
  },
  planCardPopular: {
    background: "rgba(124,58,237,0.08)",
  },
  popularBadge: {
    position: "absolute",
    top: -12,
    left: "50%",
    transform: "translateX(-50%)",
    background: "linear-gradient(135deg, #7c3aed, #2563eb)",
    color: "#fff",
    fontSize: 11,
    fontWeight: 700,
    padding: "4px 14px",
    borderRadius: 100,
    letterSpacing: "0.5px",
    whiteSpace: "nowrap",
  },
  planName: {
    fontSize: 13,
    fontWeight: 700,
    color: "#8888aa",
    letterSpacing: "1px",
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 40,
    fontWeight: 900,
    color: "#fff",
    letterSpacing: "-1.5px",
    lineHeight: 1,
    marginBottom: 4,
  },
  planPeriod: {
    fontSize: 16,
    fontWeight: 500,
    color: "#666680",
    letterSpacing: 0,
  },
  planCoverage: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 20,
  },
  planDivider: {
    height: 1,
    background: "rgba(255,255,255,0.06)",
    marginBottom: 16,
  },
  planFeature: {
    fontSize: 13,
    color: "#a0a0b8",
    marginBottom: 8,
    lineHeight: 1.5,
  },
  planCheck: {
    fontWeight: 700,
    marginRight: 6,
  },
  planBtn: {
    width: "100%",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "12px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 20,
    letterSpacing: "0.2px",
  },
  dashGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    marginBottom: 24,
  },
  metricCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: "20px 24px",
    transition: "all 0.3s",
  },
  metricLabel: {
    fontSize: 12,
    color: "#666680",
    fontWeight: 600,
    letterSpacing: "0.5px",
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: 800,
    color: "#fff",
    letterSpacing: "-0.5px",
    marginBottom: 4,
  },
  metricChange: {
    fontSize: 12,
    fontWeight: 600,
  },
  dashPreview: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: "28px 32px",
  },
  dashHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  dashTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#a0a0b8",
  },
  dashLegend: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontSize: 12,
    color: "#666680",
  },
  legendDot: (color) => ({
    display: "inline-block",
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: color,
    marginRight: 4,
  }),
  barChart: {
    display: "flex",
    alignItems: "flex-end",
    gap: 12,
    height: 140,
  },
  barGroup: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "100%",
  },
  barWrap: {
    flex: 1,
    width: "100%",
    display: "flex",
    alignItems: "flex-end",
    gap: 3,
  },
  bar: {
    flex: 1,
    borderRadius: "4px 4px 0 0",
    transition: "height 1s cubic-bezier(.34,1.56,.64,1)",
  },
  barLabel: {
    fontSize: 11,
    color: "#666680",
    marginTop: 8,
    fontWeight: 600,
  },
  testiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 20,
  },
  testiCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 28,
    transition: "all 0.3s",
  },
  testiQuote: {
    fontSize: 14,
    color: "#c0c0d8",
    lineHeight: 1.7,
    marginBottom: 20,
    fontStyle: "italic",
  },
  testiAuthor: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  testiAvatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #7c3aed, #2563eb)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    color: "#fff",
    flexShrink: 0,
  },
  testiName: {
    fontSize: 14,
    fontWeight: 700,
    color: "#fff",
  },
  testiMeta: {
    fontSize: 12,
    color: "#666680",
  },
  ctaSection: {
    padding: "100px 24px",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(180deg, #06060f 0%, #0d0820 50%, #06060f 100%)",
  },
  ctaBlobA: {
    position: "absolute",
    width: 800,
    height: 800,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
    top: "50%",
    left: "50%",
    transform: "translate(-50%,-50%)",
    pointerEvents: "none",
  },
  ctaContent: {
    position: "relative",
    zIndex: 2,
    maxWidth: 600,
    margin: "0 auto",
  },
  ctaTitle: {
    fontSize: "clamp(28px, 4vw, 52px)",
    fontWeight: 900,
    color: "#fff",
    letterSpacing: "-1.5px",
    lineHeight: 1.15,
    marginBottom: 16,
  },
  ctaSub: {
    fontSize: 16,
    color: "#8888aa",
    marginBottom: 36,
    lineHeight: 1.6,
  },
  ctaBtn: {
    background: "linear-gradient(135deg, #7c3aed, #2563eb)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "18px 40px",
    fontSize: 17,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 12px 40px rgba(124,58,237,0.4)",
    letterSpacing: "-0.2px",
    marginBottom: 16,
    display: "inline-block",
  },
  ctaNote: {
    fontSize: 12,
    color: "#555570",
    fontWeight: 500,
  },
  footer: {
    padding: "40px 24px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    background: "#06060f",
  },
  footerInner: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    textAlign: "center",
  },
  footerLogo: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  footerNote: {
    fontSize: 13,
    color: "#555570",
  },
  footerDisclaimer: {
    fontSize: 11,
    color: "#444460",
    maxWidth: 500,
    lineHeight: 1.5,
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(0.85); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(-50%) translateX(0); }
    50% { transform: translateY(calc(-50% - 12px)) translateX(4px); }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes blobPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.06); }
  }

  .fade-up { animation: fadeUp 0.7s ease forwards; }
  .fade-up-delay-1 { animation: fadeUp 0.7s 0.15s ease both; }
  .fade-up-delay-2 { animation: fadeUp 0.7s 0.3s ease both; }
  .fade-up-delay-3 { animation: fadeUp 0.7s 0.45s ease both; }

  .float-card { animation: float 4s ease-in-out infinite; }
  .blob-a { animation: blobPulse 6s ease-in-out infinite; }
  .blob-b { animation: blobPulse 8s ease-in-out infinite reverse; }

  .hover-lift { transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease !important; }
  .hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 48px rgba(0,0,0,0.4);
    border-color: rgba(124,58,237,0.3) !important;
  }

  .cta-btn { transition: transform 0.2s, box-shadow 0.2s !important; }
  .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(124,58,237,0.5) !important; }

  .ghost-btn { transition: color 0.2s, border-color 0.2s !important; }
  .ghost-btn:hover { color: #fff !important; border-color: rgba(255,255,255,0.25) !important; }

  .nav-link:hover { color: #fff !important; }

  .bar-anim { animation: fadeUp 0.8s ease both; }

  @media (max-width: 900px) {
    .float-card { display: none !important; }
    div[style*="gridTemplateColumns: repeat(4"] { grid-template-columns: repeat(2, 1fr) !important; }
    div[style*="gridTemplateColumns: repeat(3"] { grid-template-columns: 1fr !important; }
    div[style*="gridTemplateColumns: repeat(4, 1fr)"] { grid-template-columns: repeat(2, 1fr) !important; }
  }

  @media (max-width: 600px) {
    div[style*="gridTemplateColumns: repeat(2"] { grid-template-columns: 1fr !important; }
    div[style*="display: flex"][style*="gap: 32px"] { display: none !important; }
  }

  html { scroll-behavior: smooth; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #06060f; }
  ::-webkit-scrollbar-thumb { background: #7c3aed; border-radius: 3px; }
`;