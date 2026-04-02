import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const PLANS = [
  {
    id: "saathi",
    name: "SAATHI",
    desc: "Less than a chai per week",
    color: "#2563eb",
    bgLight: "rgba(37,99,235,0.08)",
    baseAnnual: 399,
    baseWeekly: 8,
    heatAnnual: 99,
    heatWeekly: 2,
    payout: 400,
    maxDays: 8,
    features: ["Heavy Rainfall", "Storm / Cyclone", "Flood / Evacuation", "Local Curfew / Blockade"]
  },
  {
    id: "rakshak",
    name: "RAKSHAK",
    desc: "⭐ Most Popular · Less than a samosa per week",
    color: "#10b981",
    bgLight: "rgba(16,185,129,0.08)",
    baseAnnual: 699,
    baseWeekly: 12,
    heatAnnual: 149,
    heatWeekly: 3,
    payout: 500,
    maxDays: 12,
    features: ["Heavy Rainfall", "Storm / Cyclone", "Flood / Evacuation", "Local Curfew / Blockade"]
  },
  {
    id: "suraksha",
    name: "SURAKSHA",
    desc: "Premium Protection · Less than a bus ticket per week",
    color: "#7c3aed",
    bgLight: "rgba(124,58,237,0.08)",
    baseAnnual: 999,
    baseWeekly: 20,
    heatAnnual: 199,
    heatWeekly: 4,
    payout: 700,
    maxDays: 18,
    features: ["Heavy Rainfall", "Storm / Cyclone", "Flood / Evacuation", "Local Curfew / Blockade"]
  }
];

export default function Plans() {
  const navigate = useNavigate();
  const [includeHeat, setIncludeHeat] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [err, setErr] = useState("");

  const selectPlan = async (plan) => {
    const rawPhone = localStorage.getItem("userPhone");
    if (!rawPhone) {
      setErr("User session not found. Please log in again.");
      return;
    }

    setLoadingId(plan.id);
    setErr("");

    const finalWeeklyPremium = plan.baseWeekly + (includeHeat ? plan.heatWeekly : 0);

    // Save the plan settings to the backend to activate the user's dashboard telemetry!
    const { error } = await supabase
      .from("users")
      .update({
        this_week_premium: finalWeeklyPremium,
        coverage_status: "Active"
      })
      .eq("phone", rawPhone);

    setLoadingId(null);

    if (error) {
      setErr("Failed to activate plan. " + error.message);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="plans-page" style={{ padding: '32px' }}>
      <div className="plans-header" style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 12 }}>Parametric Insurance Plans</h1>
        <p style={{ fontSize: 15, color: 'var(--muted)', maxWidth: 640, lineHeight: 1.5 }}>
          GigShield collects premium annually to prevent weather-fraud, but we break the pricing down into weekly costs so it aligns closely with your regular gig earnings. Select your coverage block below to activate your Dashboard.
        </p>
      </div>

      <div className="heat-toggle-box" style={{ 
        background: 'rgba(255,100,0,0.05)', border: '1px solid rgba(255,100,0,0.2)', padding: '16px 24px', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, maxWidth: 640
       }}>
        <div>
          <h3 style={{ fontSize: 16, color: '#f97316', marginBottom: 4 }}>🔥 Extreme Heat Coverage (Optional Add-On)</h3>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.4, maxWidth: 450 }}>Add automated payouts for when temperatures exceed 45°C for 3+ consecutive hours in your localized zone.</p>
        </div>
        
        <label className="switch" style={{ position: 'relative', display: 'inline-block', width: 50, height: 28, flexShrink: 0 }}>
          <input type="checkbox" checked={includeHeat} onChange={e => setIncludeHeat(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
          <span className="slider round" style={{ 
            position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: includeHeat ? '#f97316' : 'rgba(255,255,255,0.08)', transition: '.4s', borderRadius: 28,
            border: '1px solid ' + (includeHeat ? '#ea580c' : 'rgba(255,255,255,0.15)')
          }}>
            <span style={{ 
              position: 'absolute', content: '""', height: 20, width: 20, left: 4, bottom: 3, 
              backgroundColor: includeHeat ? '#fff' : '#888', transition: '.4s', borderRadius: '50%',
              transform: includeHeat ? 'translateX(20px)' : 'none'
            }} />
          </span>
        </label>
      </div>

      {err && <div className="err-msg" style={{ marginBottom: 20 }}>{err}</div>}

      <div className="plans-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, paddingBottom: 60 }}>
        {PLANS.map(p => {
          const wTotal = p.baseWeekly + (includeHeat ? p.heatWeekly : 0);
          const aTotal = p.baseAnnual + (includeHeat ? p.heatAnnual : 0);

          return (
            <div key={p.id} className="plan-card" style={{ 
              background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' 
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: p.color }} />
              
              <h2 style={{ fontSize: 22, fontWeight: 800, color: p.color, marginBottom: 8, letterSpacing: -0.5 }}>{p.name}</h2>
              <p style={{ fontSize: 13, color: 'var(--muted)', minHeight: 38, marginBottom: 20 }}>{p.desc}</p>
              
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
                  <span style={{ fontSize: 36, fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: -1 }}>₹{wTotal}</span>
                  <span style={{ fontSize: 14, color: 'var(--muted)', paddingBottom: 4 }}>/ week</span>
                </div>
                <div style={{ fontSize: 12, color: '#7070a0', marginTop: 10 }}>Billed annually at ₹{aTotal}/year</div>
              </div>

              <div style={{ background: p.bgLight, borderRadius: 8, padding: 16, marginBottom: 24, border: `1px solid ${p.color}22` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                  <span style={{ color: 'var(--muted)' }}>Payout per day:</span>
                  <span style={{ fontWeight: 700, color: p.color }}>₹{p.payout}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--muted)' }}>Max claimable:</span>
                  <span style={{ fontWeight: 700, color: '#fff' }}>{p.maxDays} days/yr</span>
                </div>
              </div>

              <div className="features-list" style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: 'var(--muted)', marginBottom: 16 }}>Included Triggers</div>
                {p.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#e8e8f2', marginBottom: 12 }}>
                    <span style={{ color: p.color, fontWeight: 800 }}>✓</span> {f}
                  </div>
                ))}
                {includeHeat && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#f97316', marginBottom: 12 }}>
                    <span style={{ color: '#f97316', fontWeight: 800 }}>✓</span> Extreme Heat &gt; 45°C
                  </div>
                )}
              </div>

              <button 
                disabled={loadingId === p.id}
                onClick={() => selectPlan(p)}
                style={{ 
                  marginTop: 32, width: '100%', padding: '14px', borderRadius: 8, border: 'none', background: p.color, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: loadingId === p.id ? 0.6 : 1, transition: '0.2s', boxShadow: `0 8px 24px ${p.color}44`
                }}
              >
                {loadingId === p.id ? "Activating..." : `Activate ${p.name} →`}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  );
}
