import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const BASE_PLANS = [
  { id: "basic", name: "Basic", basePrice: 29, coverage: "₹500/wk", color: "#2563eb", features: ["Weather triggers", "Basic fraud shield", "3 claims/month"] },
  { id: "shield", name: "Shield", basePrice: 59, coverage: "₹1,200/wk", color: "#7c3aed", features: ["Weather + Pollution checks", "Civic disruption coverage", "6 claims/month"] },
  { id: "elite", name: "Elite", basePrice: 99, coverage: "₹2,500/wk", color: "#059669", features: ["Full Disruption Suite", "Unlimited claims", "Dedicated payout agent"] }
];

export default function Plans() {
  const [currentPremium, setCurrentPremium] = useState(0);
  const [loading, setLoading] = useState(true);
  const [riskMultiplier, setRiskMultiplier] = useState(1.0); 

  const userPhone = localStorage.getItem('userPhone');

  useEffect(() => {
    fetchUserPlan();
    
    // Simulate your AI/ML team's dynamic risk score arriving via API
    // If it's raining heavily, the multiplier increases the base insurance price!
    const simulatedLiveRisk = 1.25; 
    setRiskMultiplier(simulatedLiveRisk);
  }, []);

  const fetchUserPlan = async () => {
    if (!userPhone) return;
    const { data } = await supabase.from('users').select('this_week_premium').eq('phone', userPhone).single();
    if (data) setCurrentPremium(data.this_week_premium);
    setLoading(false);
  };

  const selectPlan = async (plan) => {
    const dynamicPrice = Math.round(plan.basePrice * riskMultiplier);
    
    // Optimistically update the UI so the user feels it's instant
    setCurrentPremium(dynamicPrice);

    // Save the new premium plan to the user's database row!
    await supabase.from('users').update({ this_week_premium: dynamicPrice }).eq('phone', userPhone);
    alert(`Successfully upgraded to the ${plan.name} plan for ₹${dynamicPrice}/week! Your Dashboard will now reflect this.`);
  };

  if (loading) return <div style={{ padding: '3rem', color: '#fff' }}>Loading real-time pricing...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Dynamic Insurance Plans</h1>
      <p style={styles.subtitle}>
        Your weekly premiums are calculated dynamically in real-time based on your delivery zone, 
        <span style={{ color: '#f26c6c' }}> live weather APIs, and civic disruption alerts</span>.
      </p>

      {/* Dynamic Warning Alert */}
      <div style={styles.alertBox}>
        <strong>⚠️ Active Route Alert:</strong> High rainfall expected in your working zone tonight. Premium prices are dynamically adjusted by {(riskMultiplier).toFixed(2)}x.
      </div>

      <div style={styles.planGrid}>
        {BASE_PLANS.map(plan => {
          // Calculate what the price is right NOW based on the ML Risk Multiplier
          const dynamicPrice = Math.round(plan.basePrice * riskMultiplier);
          
          // Check if the user is already subscribed to this plan
          // (Since we don't have a plan_id column yet, we just match the premium amount roughly)
          const isCurrent = currentPremium !== 0 && Math.abs(currentPremium - dynamicPrice) < 5; 

          return (
            <div key={plan.id} style={{ ...styles.card, borderColor: isCurrent ? plan.color : '#2a2a3b' }}>
              {isCurrent && <div style={{...styles.activeBadge, background: plan.color}}>Current Plan</div>}
              
              <h3 style={{ ...styles.planTitle, color: plan.color }}>{plan.name}</h3>
              
              <div style={styles.priceWrap}>
                <span style={styles.strikePrice}>₹{plan.basePrice}</span>
                <span style={styles.livePrice}>₹{dynamicPrice}</span>
                <span style={styles.period}>/week</span>
              </div>
              
              <p style={styles.coverage}>Coverage limit: <strong>{plan.coverage}</strong></p>
              
              <ul style={styles.featureList}>
                {plan.features.map(f => <li key={f} style={{marginBottom: 8}}>✓ {f}</li>)}
              </ul>

              <button 
                onClick={() => selectPlan(plan)}
                disabled={isCurrent}
                style={{
                  ...styles.btn,
                  background: isCurrent ? 'rgba(255,255,255,0.05)' : plan.color,
                  color: isCurrent ? '#8888a8' : '#fff',
                  cursor: isCurrent ? 'not-allowed' : 'pointer'
                }}
              >
                {isCurrent ? "Active" : `Upgrade to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '3rem', color: '#f0f0f8', maxWidth: 1100, margin: '0 auto', fontFamily: '"DM Sans", sans-serif' },
  title: { fontSize: 32, fontWeight: 700, margin: '0 0 10px 0', letterSpacing: '-0.5px' },
  subtitle: { fontSize: 15, color: '#8888a8', marginBottom: '2.5rem', lineHeight: 1.6, maxWidth: 600 },
  alertBox: { background: 'rgba(242, 108, 108, 0.12)', border: '1px solid rgba(242, 108, 108, 0.25)', padding: '14px 20px', borderRadius: 10, color: '#f26c6c', marginBottom: '3rem', fontSize: 14.5 },
  planGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' },
  card: { position: 'relative', background: '#13131f', border: '1.5px solid', borderRadius: 20, padding: '32px 28px', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' },
  activeBadge: { position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, color: '#fff' },
  planTitle: { margin: '0 0 20px 0', fontSize: 24, fontWeight: 700 },
  priceWrap: { display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 20 },
  strikePrice: { fontSize: 18, color: '#55556a', textDecoration: 'line-through', fontWeight: 500 },
  livePrice: { fontSize: 42, fontWeight: 800, letterSpacing: '-1px' },
  period: { fontSize: 15, color: '#8888a8' },
  coverage: { fontSize: 15, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 20 },
  featureList: { listStyle: 'none', padding: 0, margin: '0 0 32px 0', color: '#a0a0b8', fontSize: 14.5, flex: 1 },
  btn: { border: 'none', padding: '14px', borderRadius: 10, fontSize: 15, fontWeight: 600, transition: '0.2s', width: '100%' }
};
