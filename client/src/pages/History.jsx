import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function History() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  const userPhone = localStorage.getItem('userPhone');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    if (!userPhone) return;
    const { data } = await supabase.from('users').select('weekly_payouts').eq('phone', userPhone).single();
    
    if (data && data.weekly_payouts) {
      const historyEntries = [];
      // Simulated reasons for the payouts that triggered this week
      const triggers = ["Heavy Rainfall (>60mm/h)", "Hazardous AQI (450+)", "Extreme Heat (45°C+)", "Civic Curfew - Sector 4", "Severe Waterlogging"];
      
      data.weekly_payouts.forEach((amount, index) => {
        if (Number(amount) > 0) {
          const date = new Date();
          date.setDate(date.getDate() - (6 - index)); 

          historyEntries.push({
            id: `CLM-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            amount: Number(amount),
            date: date.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
            trigger: triggers[Math.floor(Math.random() * triggers.length)],
            status: "Settled",
            channel: "UPI"
          });
        }
      });
      
      setPayouts(historyEntries.reverse());
    }
    setLoading(false);
  };

  if (loading) return <div style={{ padding: '3rem', color: '#fff' }}>Loading claim history...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Claim History</h1>
        <p style={styles.subtitle}>
          A transparent ledger of all your automatic parametric payouts.
        </p>
      </div>

      {payouts.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🌤️</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#f0f0f8' }}>No recent disruptions</h3>
          <p style={{ margin: 0, color: '#8888a8' }}>
            There have been no triggered claim events in your zone for the past 7 days.
          </p>
        </div>
      ) : (
        <div style={styles.list}>
          {payouts.map((claim) => (
            <div key={claim.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.claimId}>{claim.id}</span>
                <span style={styles.statusBadge}>✓ {claim.status}</span>
              </div>
              
              <div style={styles.cardBody}>
                <div style={styles.infoGroup}>
                  <span style={styles.label}>Trigger Event</span>
                  <span style={styles.valueWarning}>{claim.trigger}</span>
                </div>
                
                <div style={styles.infoGroup}>
                  <span style={styles.label}>Date Processed</span>
                  <span style={styles.value}>{claim.date}</span>
                </div>

                <div style={styles.infoGroup}>
                  <span style={styles.label}>Payout Channel</span>
                  <span style={styles.value}>{claim.channel} Automated</span>
                </div>

                <div style={{...styles.infoGroup, alignItems: 'flex-end'}}>
                  <span style={styles.label}>Amount Credited</span>
                  <span style={styles.amount}>₹{claim.amount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '3rem', color: '#f0f0f8', maxWidth: 900, margin: '0 auto', fontFamily: '"DM Sans", sans-serif' },
  header: { marginBottom: '3.5rem' },
  title: { fontSize: 32, fontWeight: 700, margin: '0 0 10px 0', letterSpacing: '-0.5px' },
  subtitle: { fontSize: 15, color: '#8888a8', lineHeight: 1.6 },
  emptyState: { 
    background: '#13131f', border: '1px dashed rgba(255,255,255,0.1)', 
    borderRadius: 16, padding: '4rem 2rem', textAlign: 'center' 
  },
  list: { display: 'flex', flexDirection: 'column', gap: 20 },
  card: { background: '#13131f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px 28px', transition: 'transform 0.2s', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' },
  claimId: { fontFamily: '"DM Mono", monospace', color: '#8888a8', fontSize: 14, background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: 6 },
  statusBadge: { color: '#4ade80', background: 'rgba(74, 222, 128, 0.12)', border: '1px solid rgba(74,222,128,0.2)', padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  cardBody: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 24, alignItems: 'center' },
  infoGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 11, textTransform: 'uppercase', color: '#55556a', fontWeight: 600, letterSpacing: '0.06em' },
  value: { fontSize: 14.5, color: '#d0d0e8', fontWeight: 500 },
  valueWarning: { fontSize: 14.5, color: '#f5a623', fontWeight: 600 },
  amount: { fontSize: 26, color: '#4ade80', fontWeight: 700, letterSpacing: '-0.5px' }
};
