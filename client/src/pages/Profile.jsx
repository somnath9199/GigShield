import React, { useEffect, useState } from "react";

/* ─── Google Fonts injected once ─── */
const FontLink = () => (
  <link
    href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap"
    rel="stylesheet"
  />
);

/* ─── tiny helpers ─── */
const Badge = ({ children, variant = "neutral" }) => {
  const map = {
    green: { bg: "rgba(52,211,153,0.12)", color: "#34d399", border: "rgba(52,211,153,0.3)" },
    red:   { bg: "rgba(248,113,113,0.12)", color: "#f87171", border: "rgba(248,113,113,0.3)" },
    orange:{ bg: "rgba(251,146,60,0.12)",  color: "#fb923c", border: "rgba(251,146,60,0.3)" },
    neutral:{ bg: "rgba(148,163,184,0.1)", color: "#94a3b8", border: "rgba(148,163,184,0.2)"},
  };
  const t = map[variant] || map.neutral;
  return (
    <span style={{
      display: "inline-block",
      padding: "4px 12px",
      borderRadius: "6px",
      fontSize: "11px",
      fontWeight: "600",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      background: t.bg,
      color: t.color,
      border: `1px solid ${t.border}`,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {children}
    </span>
  );
};

const Row = ({ label, children }) => (
  <div style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "13px 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    gap: 16,
  }}>
    <span style={{
      fontSize: "12px",
      fontWeight: "500",
      letterSpacing: "0.04em",
      color: "#64748b",
      fontFamily: "'DM Sans', sans-serif",
      textTransform: "uppercase",
      flexShrink: 0,
    }}>{label}</span>
    <span style={{
      fontSize: "14px",
      fontWeight: "400",
      color: "#cbd5e1",
      fontFamily: "'DM Sans', sans-serif",
      textAlign: "right",
    }}>{children}</span>
  </div>
);

const Card = ({ title, accentColor = "#3b82f6", icon, children, style = {} }) => (
  <div style={{
    position: "relative",
    background: "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "20px",
    padding: "28px",
    backdropFilter: "blur(12px)",
    overflow: "hidden",
    transition: "transform 0.25s ease, box-shadow 0.25s ease",
    ...style,
  }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = "translateY(-3px)";
      e.currentTarget.style.boxShadow = `0 20px 48px rgba(0,0,0,0.4), 0 0 0 1px ${accentColor}22`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    {/* top accent bar */}
    <div style={{
      position: "absolute",
      top: 0, left: 0, right: 0,
      height: "2px",
      background: `linear-gradient(90deg, ${accentColor}, transparent)`,
      borderRadius: "20px 20px 0 0",
    }} />

    {/* subtle corner glow */}
    <div style={{
      position: "absolute",
      top: -40, left: -40,
      width: 120, height: 120,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${accentColor}18 0%, transparent 70%)`,
      pointerEvents: "none",
    }} />

    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
      <div style={{
        width: 32, height: 32,
        borderRadius: "9px",
        background: `${accentColor}20`,
        border: `1px solid ${accentColor}40`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "15px",
      }}>{icon}</div>
      <h2 style={{
        margin: 0,
        fontSize: "14px",
        fontWeight: "700",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "#e2e8f0",
        fontFamily: "'Syne', sans-serif",
      }}>{title}</h2>
    </div>

    {children}
  </div>
);

/* ─── Main Component ─── */
const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const userPhone = typeof localStorage !== "undefined"
    ? localStorage.getItem("userPhone")
    : null;

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      if (!userPhone) {
        setError("User phone not found. Please login again.");
        setLoading(false);
        return;
      }
      const response = await fetch(
        `http://localhost:8000/api/user/profile/${encodeURIComponent(userPhone)}`
      );
      const result = await response.json();
      if (!response.ok || !result.success)
        throw new Error(result.message || "Failed to fetch profile");
      setProfile(result.data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => { setRefreshing(true); fetchProfile(); };

  /* ── demo data so the preview works without a backend ── */
  const demoProfile = {
    user: {
      name: "Arjun Mehta",
      email: "arjun.mehta@email.com",
      phone: "+91 98765 43210",
      rider_id: "RDR-20481",
      phone_number_verified: true,
      selected_plan: "Shield Pro",
      this_week_premium: 149,
      coverage_status: "Active",
      include_heat: true,
      payout_setup_done: true,
      bank_account_holder: "Arjun Mehta",
      bank_account_number: "•••• •••• 7823",
      bank_ifsc: "HDFC0001234",
    },
    rider: {
      city: "Bengaluru",
      zone: "Koramangala",
      status: "active",
      vehicle_type: "Motorcycle",
      rating: "4.8 / 5",
      experience_months: 18,
      total_orders_lifetime: 3412,
    },
  };

  const resolvedProfile = profile ?? demoProfile;
  const user   = resolvedProfile?.user   ?? resolvedProfile;
  const rider  = resolvedProfile?.rider  ?? null;

  /* ── Loading ── */
  if (loading) return (
    <>
      <FontLink />
      <div style={S.page}>
        <div style={S.loadWrap}>
          <div style={S.spinner} />
          <p style={{ color: "#475569", fontFamily: "'DM Sans', sans-serif", marginTop: 16 }}>
            Fetching your profile…
          </p>
        </div>
      </div>
    </>
  );

  /* ── Error ── */
  if (error) return (
    <>
      <FontLink />
      <div style={S.page}>
        <div style={S.errorBox}>
          <span style={{ fontSize: 28 }}>⚠</span>
          <h2 style={{ margin: "10px 0 6px", color: "#fca5a5", fontFamily: "'Syne', sans-serif" }}>
            Unable to load profile
          </h2>
          <p style={{ color: "#94a3b8", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{error}</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <FontLink />
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .gs-card { animation: fadeUp 0.5s ease both; }
        .gs-card:nth-child(1){ animation-delay:.05s }
        .gs-card:nth-child(2){ animation-delay:.12s }
        .gs-card:nth-child(3){ animation-delay:.19s }
        .gs-card:nth-child(4){ animation-delay:.26s }
      `}</style>

      <div style={S.page}>
        {/* ── noise grain overlay ── */}
        <div style={S.grain} />

        <div style={S.container}>

          {/* ── HERO HEADER ── */}
          <div style={S.hero}>
            {/* avatar */}
            <div style={S.avatarWrap}>
              <div style={S.avatar}>
                {(user?.name || "U")[0].toUpperCase()}
              </div>
              {user?.coverage_status === "Active" && (
                <div style={S.onlineDot} />
              )}
            </div>

            <div style={{ flex: 1 }}>
              <p style={S.heroEyebrow}>Rider Dashboard</p>
              <h1 style={S.heroName}>{user?.name || "—"}</h1>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                <Badge variant={user?.phone_number_verified ? "green" : "red"}>
                  {user?.phone_number_verified ? "Verified" : "Unverified"}
                </Badge>
                <Badge variant={user?.coverage_status === "Active" ? "green" : "red"}>
                  {user?.coverage_status || "Inactive"}
                </Badge>
                {user?.selected_plan && (
                  <Badge variant="orange">{user.selected_plan}</Badge>
                )}
              </div>
            </div>

            <div style={S.headerRight}>
              <div style={S.statPill}>
                <span style={S.statNum}>
                  {rider?.total_orders_lifetime?.toLocaleString() || "—"}
                </span>
                <span style={S.statLabel}>Deliveries</span>
              </div>
              <div style={S.statPill}>
                <span style={S.statNum}>{rider?.rating || "—"}</span>
                <span style={S.statLabel}>Rating</span>
              </div>
            </div>
          </div>

          {/* ── DIVIDER ── */}
          <div style={S.divider} />

          {/* ── CARDS GRID ── */}
          <div style={S.grid}>

            <div className="gs-card">
              <Card title="Account" icon="👤" accentColor="#6366f1">
                <Row label="Full Name">{user?.name || "—"}</Row>
                <Row label="Email">{user?.email || "—"}</Row>
                <Row label="Phone">{user?.phone || "—"}</Row>
                <Row label="Rider ID">
                  <span style={{ fontFamily: "monospace", color: "#818cf8", fontSize: 13 }}>
                    {user?.rider_id || "—"}
                  </span>
                </Row>
                <Row label="Phone">
                  <Badge variant={user?.phone_number_verified ? "green" : "red"}>
                    {user?.phone_number_verified ? "Verified" : "Not Verified"}
                  </Badge>
                </Row>
              </Card>
            </div>

            <div className="gs-card">
              <Card title="Insurance" icon="🛡️" accentColor="#10b981">
                <Row label="Plan">{user?.selected_plan || "No Plan"}</Row>
                <Row label="Weekly Premium">
                  <span style={{ color: "#34d399", fontWeight: 500 }}>
                    {user?.this_week_premium ? `₹${user.this_week_premium}` : "₹0"}
                  </span>
                </Row>
                <Row label="Coverage">
                  <Badge variant={user?.coverage_status === "Active" ? "green" : "red"}>
                    {user?.coverage_status || "Inactive"}
                  </Badge>
                </Row>
                <Row label="Heat Add-on">
                  <Badge variant={user?.include_heat ? "orange" : "neutral"}>
                    {user?.include_heat ? "Enabled" : "Disabled"}
                  </Badge>
                </Row>
              </Card>
            </div>

            <div className="gs-card">
              <Card title="Bank & Payout" icon="🏦" accentColor="#f59e0b">
                <Row label="Setup Status">
                  <Badge variant={user?.payout_setup_done ? "green" : "red"}>
                    {user?.payout_setup_done ? "Completed" : "Pending"}
                  </Badge>
                </Row>
                <Row label="Account Holder">{user?.bank_account_holder || "—"}</Row>
                <Row label="Account No.">
                  <span style={{ fontFamily: "monospace", letterSpacing: "0.05em" }}>
                    {user?.bank_account_number || "—"}
                  </span>
                </Row>
                <Row label="IFSC">
                  <span style={{ fontFamily: "monospace", color: "#fbbf24" }}>
                    {user?.bank_ifsc || "—"}
                  </span>
                </Row>
              </Card>
            </div>

            

          </div>

          {/* ── REFRESH BUTTON ── */}
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={S.refreshBtn}
              onMouseEnter={e => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {refreshing
                ? <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #ffffff44", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                    Refreshing…
                  </span>
                : "↻ Refresh Profile"}
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

/* ─── Styles ─── */
const S = {
  page: {
    minHeight: "100vh",
    background: "#080d19",
    padding: "40px 24px 64px",
    color: "#f8fafc",
    position: "relative",
    overflow: "hidden",
  },
  grain: {
    position: "fixed",
    inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
    opacity: 0.025,
    pointerEvents: "none",
    zIndex: 0,
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  },

  /* hero */
  hero: {
    display: "flex",
    alignItems: "center",
    gap: 24,
    flexWrap: "wrap",
    animation: "fadeUp 0.45s ease both",
  },
  avatarWrap: {
    position: "relative",
    flexShrink: 0,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: "20px",
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    fontWeight: "800",
    fontFamily: "'Syne', sans-serif",
    color: "#fff",
    boxShadow: "0 0 0 3px rgba(99,102,241,0.2), 0 12px 32px rgba(99,102,241,0.3)",
  },
  onlineDot: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: "#34d399",
    border: "2px solid #080d19",
    boxShadow: "0 0 8px #34d39999",
  },
  heroEyebrow: {
    margin: "0 0 4px",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#475569",
    fontFamily: "'DM Sans', sans-serif",
  },
  heroName: {
    margin: 0,
    fontSize: "clamp(24px, 4vw, 36px)",
    fontWeight: "800",
    fontFamily: "'Syne', sans-serif",
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
    background: "linear-gradient(90deg, #f1f5f9 0%, #94a3b8 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  headerRight: {
    marginLeft: "auto",
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  statPill: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "12px 20px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "14px",
    minWidth: 80,
  },
  statNum: {
    fontSize: "20px",
    fontWeight: "700",
    fontFamily: "'Syne', sans-serif",
    color: "#e2e8f0",
    lineHeight: 1,
  },
  statLabel: {
    fontSize: "10px",
    fontWeight: "500",
    color: "#475569",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    fontFamily: "'DM Sans', sans-serif",
    marginTop: 4,
  },

  divider: {
    height: "1px",
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.08) 70%, transparent)",
    margin: "32px 0",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },

  refreshBtn: {
    padding: "13px 32px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "transparent",
    color: "#cbd5e1",
    fontWeight: "600",
    fontSize: "13px",
    letterSpacing: "0.04em",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.2s ease",
  },

  loadWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
  },
  spinner: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "3px solid rgba(255,255,255,0.08)",
    borderTop: "3px solid #6366f1",
    animation: "spin 0.7s linear infinite",
  },
  errorBox: {
    maxWidth: 520,
    margin: "80px auto",
    background: "rgba(239,68,68,0.07)",
    border: "1px solid rgba(239,68,68,0.18)",
    borderRadius: "20px",
    padding: "36px",
    textAlign: "center",
  },
};

export default Profile;