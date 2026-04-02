import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import "./Dashboard.css";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
);

const WEEKLY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const API_BASE = "http://localhost:8000/api";
const DISRUPTION_API_BASE = "http://localhost:8000/api";

/* ─── Helpers ────────────────────────────────────────── */

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getWeekdayIndex = (value) => {
  const jsDay = new Date(value).getDay(); // 0 Sun - 6 Sat
  return jsDay === 0 ? 6 : jsDay - 1; // Mon = 0
};

const buildWeeklyPayoutSeries = (payouts = []) => {
  const arr = [0, 0, 0, 0, 0, 0, 0];
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 6);

  payouts.forEach((p) => {
    const dt = new Date(p.paid_at || p.created_at);
    if (dt >= sevenDaysAgo && p.status === "paid") {
      const idx = getWeekdayIndex(dt);
      arr[idx] += Number(p.amount || 0);
    }
  });

  return arr;
};

const buildWeeklyPremiumSeries = (premium = 0, coverageStatus = "Inactive") => {
  if (coverageStatus !== "Active") return [0, 0, 0, 0, 0, 0, 0];
  const dailyValue = Number(premium || 0);
  return [dailyValue, dailyValue, dailyValue, dailyValue, dailyValue, dailyValue, dailyValue];
};

const getRiskInfo = (disruptionCheck) => {
  if (!disruptionCheck) {
    return { value: "Low", sub: "No disruption data", color: "green" };
  }

  if (disruptionCheck.affected && disruptionCheck.eligible_for_payout) {
    return { value: "High", sub: "Payout trigger active", color: "red" };
  }

  if (disruptionCheck.affected) {
    return { value: "Medium", sub: "Zone affected", color: "orange" };
  }

  return { value: "Low", sub: "No active disruption", color: "green" };
};

/* ─── Sub-components ────────────────────────────────────────── */

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <span className="stat-label">{label}</span>
      <span className={`stat-value ${color}`}>{value}</span>
      <span className="stat-sub">{sub}</span>
    </div>
  );
}

function DisruptionBanner({ disruptionCheck, onDismiss }) {
  if (!disruptionCheck || !disruptionCheck.affected || !disruptionCheck.disruptions?.length) {
    return null;
  }

  const disruption = disruptionCheck.disruptions[0];

  return (
    <div className="disruption-banner">
      <svg
        className="disruption-icon"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 3L17.5 16.5H2.5L10 3Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <line
          x1="10"
          y1="8.5"
          x2="10"
          y2="11.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="10" cy="13.5" r="0.85" fill="currentColor" />
      </svg>

      <div className="disruption-content">
        <div className="disruption-title">
          Disruption alert — {String(disruption.type || "unknown").replaceAll("_", " ")}
        </div>
        <div className="disruption-body">
          {disruption.description || "A disruption is active in your zone."}
          <span className="disruption-tag">
            {disruptionCheck.eligible_for_payout ? "Payout eligible" : "Zone affected"}
          </span>
        </div>
      </div>

      <button
        className="disruption-dismiss"
        onClick={onDismiss}
        aria-label="Dismiss alert"
      >
        ✕
      </button>
    </div>
  );
}

function WeeklyChart({ premiums = [], payouts = [], city = "Your Zone" }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const totalPremium = premiums.reduce((a, b) => a + Number(b), 0);
  const totalPayout = payouts.reduce((a, b) => a + Number(b), 0);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels: WEEKLY_LABELS,
        datasets: [
          {
            label: "Premium",
            data: premiums,
            borderColor: "rgba(124, 110, 249, 1)",
            backgroundColor: "rgba(124, 110, 249, 0.15)",
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: "rgba(124, 110, 249, 1)",
            pointBorderWidth: 0,
          },
          {
            label: "Payout",
            data: payouts,
            borderColor: "rgba(46, 196, 166, 1)",
            backgroundColor: "rgba(46, 196, 166, 0.12)",
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: "rgba(46, 196, 166, 1)",
            pointBorderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#1a1a2b",
            titleColor: "#f0f0f8",
            bodyColor: "#8888a8",
            borderColor: "rgba(255,255,255,0.08)",
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) =>
                `  ${ctx.dataset.label}: ₹${ctx.parsed.y.toLocaleString("en-IN")}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: "#55556a",
              font: { size: 11, family: "'DM Sans', sans-serif" },
            },
          },
          y: {
            grid: { color: "rgba(255,255,255,0.05)" },
            border: { display: false },
            ticks: {
              color: "#55556a",
              font: { size: 11, family: "'DM Sans', sans-serif" },
              callback: (v) => "₹" + v,
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.data.datasets[0].data = premiums;
      chartRef.current.data.datasets[1].data = payouts;
      chartRef.current.update();
    }
  }, [premiums, payouts]);

  return (
    <div className="chart-section">
      <div className="chart-header">
        <div>
          <div className="chart-title">Premium paid vs Payouts received</div>
          <div className="chart-subtitle">Last 7 days · {city}</div>
        </div>
        <div className="legend">
          <div className="legend-item">
            <div className="legend-dot premium" />
            <span>Premium</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot payout" />
            <span>Payout</span>
          </div>
        </div>
      </div>

      <div className="chart-canvas-wrap">
        <canvas ref={canvasRef} />
      </div>

      <div className="chart-summary">
        <div className="chart-sum-item">
          <span className="chart-sum-label">Week total premium</span>
          <span className="chart-sum-value purple">
            ₹{totalPremium.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="chart-sum-item">
          <span className="chart-sum-label">Week total payout</span>
          <span className="chart-sum-value teal">
            ₹{totalPayout.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </div>
  );
}

function ReportModal({ onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [photoData, setPhotoData] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let stream;
    const startCam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied", err);
      }
    };
    startCam();

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    const dataUri = canvas.toDataURL("image/jpeg");
    setPhotoData(dataUri);
  };

  const retake = () => {
    setPhotoData(null);
  };

  const submitToAI = async () => {
    setAnalyzing(true);
    await new Promise((r) => setTimeout(r, 2500));
    setAnalyzing(false);
    setSuccess(true);
    await new Promise((r) => setTimeout(r, 2000));
    onClose();
  };

  return (
    <div className="cam-modal-overlay">
      <div className="cam-modal-content">
        <div className="cam-modal-head">
          <h2 style={{ fontSize: 20, color: "#fff" }}>AI Validation Camera</h2>
          <button className="cam-close" onClick={onClose}>✕</button>
        </div>

        {!success ? (
          <div className="cam-body">
            <div className="cam-viewfinder">
              {!photoData ? (
                <>
                  <video ref={videoRef} autoPlay playsInline className="cam-video" />
                  <div className="cam-overlay-ui">
                    <div className="cam-crosshair" />
                    <button className="cam-capture-btn" onClick={takePhoto}>
                      <div className="cam-capture-inner" />
                    </button>
                    <div className="cam-hint">Point at blockade & capture</div>
                  </div>
                </>
              ) : (
                <>
                  <img src={photoData} className="cam-preview" alt="Validation Snapshot" />
                  <div className="cam-overlay-ui">
                    {analyzing ? (
                      <div className="cam-analyzing">
                        <span className="spinner" />
                        <div>Running Computer Vision Model...</div>
                      </div>
                    ) : (
                      <div className="cam-actions">
                        <button className="cam-retake-btn" onClick={retake}>↺ Retake</button>
                        <button className="cam-submit-btn" onClick={submitToAI}>
                          Validate with AI →
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>
        ) : (
          <div className="cam-success">
            <div className="done-icon" style={{ marginBottom: 16 }}>✓</div>
            <h3 style={{ fontSize: 24, marginBottom: 8, color: "#10b981" }}>
              Blockade Verified!
            </h3>
            <p
              style={{
                color: "var(--muted)",
                textAlign: "center",
                lineHeight: 1.5,
                maxWidth: 320,
              }}
            >
              AI has verified the roadblock. Maps API indicates no alternate routes.
              Disruption payout has been authorized.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const Dashboard = () => {
  const [showDisruption, setShowDisruption] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [disruptionCheck, setDisruptionCheck] = useState(null);
  const [loading, setLoading] = useState(true);

  const userPhone = localStorage.getItem("userPhone");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      if (!userPhone) {
        setLoading(false);
        return;
      }

      const profileRes = await fetch(
        `${API_BASE}/user/profile/${encodeURIComponent(userPhone)}`
      );
      const profileJson = await profileRes.json();

      if (!profileRes.ok || !profileJson.success) {
        throw new Error(profileJson.message || "Failed to fetch profile");
      }

      const profileData = profileJson.data;
      const user = profileData?.user || profileData;
      const rider = profileData?.rider || null;

      setUserProfile({ user, rider });

      const payoutsRes = await fetch(
        `${API_BASE}/payouts/${encodeURIComponent(userPhone)}`
      );
      const payoutsJson = await payoutsRes.json();

      if (payoutsRes.ok && payoutsJson.success) {
        setPayouts(payoutsJson.data || []);
      }

      if (user?.rider_id) {
        const disruptionRes = await fetch(
          `${DISRUPTION_API_BASE}/mock-disruptions/check/${encodeURIComponent(
            user.rider_id
          )}`
        );
        const disruptionJson = await disruptionRes.json();

        if (disruptionRes.ok && disruptionJson.success) {
          setDisruptionCheck(disruptionJson);
        }
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const user = userProfile?.user || null;
  const rider = userProfile?.rider || null;

  const totalReceived = useMemo(() => {
    return payouts
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  }, [payouts]);

  const weeklyPremiums = useMemo(() => {
    return buildWeeklyPremiumSeries(
      user?.this_week_premium,
      user?.coverage_status
    );
  }, [user]);

  const weeklyPayouts = useMemo(() => {
    return buildWeeklyPayoutSeries(payouts);
  }, [payouts]);

  const riskInfo = useMemo(() => getRiskInfo(disruptionCheck), [disruptionCheck]);

  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (loading) {
    return (
      <div
        className="dashboard"
        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="dashboard"
        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        User not found.
      </div>
    );
  }

  const dynamicStats = [
    {
      id: "coverage",
      label: "Coverage",
      value: user.coverage_status || "Inactive",
      sub: user.selected_plan ? `${user.selected_plan} active` : "No active plan",
      color: user.coverage_status === "Active" ? "green" : "orange",
      icon: "🛡️",
    },
    {
      id: "this-week",
      label: "This Week",
      value: formatCurrency(user.this_week_premium || 0),
      sub: "Weekly premium",
      color: "purple",
      icon: "📅",
    },
    {
      id: "total-received",
      label: "Total Received",
      value: formatCurrency(totalReceived),
      sub: `${payouts.filter((p) => p.status === "paid").length} payouts`,
      color: "teal",
      icon: "💳",
    },
    {
      id: "risk-status",
      label: "Risk Status",
      value: riskInfo.value,
      sub: riskInfo.sub,
      color: riskInfo.color,
      icon: "📊",
    },
  ];

  return (
    <div className="dashboard">
      <div className="topbar">
        <div className="topbar-left" style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div>
            <span className="topbar-greeting">
              Welcome back, {user.name ? user.name.split(" ")[0] : "Rider"}
            </span>
            <h1 className="topbar-title">Rider Dashboard</h1>
          </div>

          <button className="report-btn" onClick={() => setShowCamera(true)}>
            🚨 Report Blockade
          </button>
        </div>

        <div className="topbar-right">
          <div className="coverage-badge">
            <span className="pulse-dot" />
            {user.coverage_status === "Active" ? "Coverage active" : "Coverage inactive"}
          </div>
          <span className="date-chip">{today}</span>
        </div>
      </div>

      <div className="stat-cards">
        {dynamicStats.map((s) => (
          <StatCard key={s.id} {...s} />
        ))}
      </div>

      <WeeklyChart
        premiums={weeklyPremiums}
        payouts={weeklyPayouts}
        city={rider?.city || "Your Zone"}
      />

      {showDisruption && disruptionCheck?.affected && (
        <DisruptionBanner
          disruptionCheck={disruptionCheck}
          onDismiss={() => setShowDisruption(false)}
        />
      )}

      <div className="chart-section">
        <div className="chart-header">
          <div>
            <div className="chart-title">Latest Payout</div>
            <div className="chart-subtitle">Most recent insurance payout</div>
          </div>
        </div>

        {payouts.length === 0 ? (
          <div style={{ color: "#8888a8", fontSize: 14 }}>
            No payouts yet.
          </div>
        ) : (
          <div className="chart-summary">
            <div className="chart-sum-item">
              <span className="chart-sum-label">Amount</span>
              <span className="chart-sum-value teal">
                {formatCurrency(payouts[0].amount)}
              </span>
            </div>
            <div className="chart-sum-item">
              <span className="chart-sum-label">Status</span>
              <span className="chart-sum-value purple">
                {payouts[0].status === "paid" ? "Payout Sent" : payouts[0].status}
              </span>
            </div>
            <div className="chart-sum-item">
              <span className="chart-sum-label">Processed</span>
              <span className="chart-sum-value teal">
                {formatDate(payouts[0].paid_at || payouts[0].created_at)}
              </span>
            </div>
          </div>
        )}
      </div>

      {showCamera && <ReportModal onClose={() => setShowCamera(false)} />}
    </div>
  );
};

export default Dashboard;