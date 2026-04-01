import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";
import {
  Chart,
  BarController,  
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(
  BarController,   
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);
import "./Dashboard.css";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const WEEKLY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

function DisruptionBanner({ onDismiss }) {
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
          x1="10" y1="8.5" x2="10" y2="11.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="10" cy="13.5" r="0.85" fill="currentColor" />
      </svg>

      <div className="disruption-content">
        <div className="disruption-title">
          Disruption alert — heavy rain detected
        </div>
        <div className="disruption-body">
          High rainfall in Velachery &amp; Tambaram zones may reduce delivery
          volume today. Your coverage multiplier is active.
          <span className="disruption-tag">+1.3× premium</span>
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

function WeeklyChart({ premiums = [], payouts = [] }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  const totalPremium = premiums.reduce((a, b) => a + Number(b), 0);
  const totalPayout  = payouts.reduce((a, b) => a + Number(b), 0);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: WEEKLY_LABELS,
        datasets: [
          {
            label:           "Premium",
            data:            premiums,
            backgroundColor: "rgba(124, 110, 249, 0.8)",
            borderRadius:    5,
            borderSkipped:   false,
            barPercentage:   0.5,
            categoryPercentage: 0.6,
          },
          {
            label:           "Payout",
            data:            payouts,
            backgroundColor: "rgba(46, 196, 166, 0.8)",
            borderRadius:    5,
            borderSkipped:   false,
            barPercentage:   0.5,
            categoryPercentage: 0.6,
          },
        ],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#1a1a2b",
            titleColor:      "#f0f0f8",
            bodyColor:       "#8888a8",
            borderColor:     "rgba(255,255,255,0.08)",
            borderWidth:     1,
            padding:         10,
            cornerRadius:    8,
            callbacks: {
              label: (ctx) =>
                `  ${ctx.dataset.label}: ₹${ctx.parsed.y.toLocaleString("en-IN")}`,
            },
          },
        },
        scales: {
          x: {
            grid:   { display: false },
            border: { display: false },
            ticks:  {
              color:      "#55556a",
              font:       { size: 11, family: "'DM Sans', sans-serif" },
            },
          },
          y: {
            grid:   { color: "rgba(255,255,255,0.05)" },
            border: { display: false },
            ticks:  {
              color:      "#55556a",
              font:       { size: 11, family: "'DM Sans', sans-serif" },
              callback:   (v) => "₹" + v,
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, []);

  return (
    <div className="chart-section">
      <div className="chart-header">
        <div>
          <div className="chart-title">Premium paid vs Payouts received</div>
          <div className="chart-subtitle">Last 7 days · Chennai</div>
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

/* ─── Main Dashboard ────────────────────────────────────────── */
const Dashboard = () => {
  const [showDisruption, setShowDisruption] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const phone = localStorage.getItem('userPhone');
      if (!phone) return;
      const { data } = await supabase.from('users').select('*').eq('phone', phone).single();
      if (data) setUserData(data);
    };
    fetchUser();
  }, []);

  const today = new Date().toLocaleDateString("en-IN", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
  });

  if (!userData) {
    return <div className="dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  const dynamicStats = [
    { id: "coverage", label: "Coverage", value: userData.coverage_status || "Active", sub: "Renews Monday", color: "green", icon: "🛡️" },
    { id: "this-week", label: "This Week", value: `₹${userData.this_week_premium}`, sub: "Premium paid", color: "purple", icon: "📅" },
    { id: "total-received", label: "Total Received", value: `₹${Number(userData.total_received || 0).toLocaleString('en-IN')}`, sub: "Lifetime payouts", color: "teal", icon: "💳" },
    { id: "risk-status", label: "Risk Status", value: "Low", sub: "No flags this week", color: "green", icon: "📊" },
  ];

  return (
    <div className="dashboard">
      {/* Top bar */}
      <div className="topbar">
        <div className="topbar-left">
          <span className="topbar-greeting">Welcome back, {userData.name ? userData.name.split(' ')[0] : 'Rider'}</span>
          <h1 className="topbar-title">Rider Dashboard</h1>
        </div>
        <div className="topbar-right">
          <div className="coverage-badge">
            <span className="pulse-dot" />
            Coverage active
          </div>
          <span className="date-chip">{today}</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stat-cards">
        {dynamicStats.map((s) => (
          <StatCard key={s.id} {...s} />
        ))}
      </div>

      <WeeklyChart premiums={userData.weekly_premiums || [0,0,0,0,0,0,0]} payouts={userData.weekly_payouts || [0,0,0,0,0,0,0]} />

      {/* Disruption banner */}
      {showDisruption && (
        <DisruptionBanner onDismiss={() => setShowDisruption(false)} />
      )}
    </div>
  );
};

export default Dashboard;