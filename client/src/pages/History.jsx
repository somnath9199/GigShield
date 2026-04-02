import React, { useEffect, useState } from "react";

export default function History() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userPhone = localStorage.getItem("userPhone");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError("");

      if (!userPhone) {
        setError("User phone not found. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://localhost:8000/api/payouts/${userPhone}`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch payout history");
      }

      const mapped = (result.data || []).map((item) => ({
        id: `PY-${item.id}`,
        amount: Number(item.amount || 0),
        date: item.paid_at || item.created_at,
        disruptionId: item.disruption_id,
        status: item.status,
        channel: "Bank Transfer",
      }));

      setPayouts(mapped);
    } catch (err) {
      setError(err.message || "Something went wrong while loading payouts");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusLabel = (status) => {
    if (status === "paid") return "Payout Sent";
    if (status === "pending") return "Pending";
    if (status === "failed") return "Failed";
    return status;
  };

  if (loading) {
    return (
      <div style={{ padding: "3rem", color: "#fff" }}>
        Loading payout history...
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Payout History</h1>
        <p style={styles.subtitle}>
          A transparent ledger of all your automatic insurance payouts.
        </p>
      </div>

      {error ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <h3 style={{ margin: "0 0 8px 0", color: "#f0f0f8" }}>
            Unable to load payout history
          </h3>
          <p style={{ margin: 0, color: "#8888a8" }}>{error}</p>
        </div>
      ) : payouts.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🌤️</div>
          <h3 style={{ margin: "0 0 8px 0", color: "#f0f0f8" }}>
            No payouts yet
          </h3>
          <p style={{ margin: 0, color: "#8888a8" }}>
            There have been no triggered payout events in your zone yet.
          </p>
        </div>
      ) : (
        <div style={styles.list}>
          {payouts.map((claim) => (
            <div key={claim.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.claimId}>{claim.id}</span>
                <span
                  style={{
                    ...styles.statusBadge,
                    ...(claim.status === "paid"
                      ? styles.statusPaid
                      : claim.status === "pending"
                      ? styles.statusPending
                      : styles.statusFailed),
                  }}
                >
                  {claim.status === "paid"
                    ? "✓"
                    : claim.status === "pending"
                    ? "⏳"
                    : "✕"}{" "}
                  {getStatusLabel(claim.status)}
                </span>
              </div>

              <div style={styles.cardBody}>
                <div style={styles.infoGroup}>
                  <span style={styles.label}>Disruption ID</span>
                  <span style={styles.valueWarning}>{claim.disruptionId}</span>
                </div>

                <div style={styles.infoGroup}>
                  <span style={styles.label}>Date Processed</span>
                  <span style={styles.value}>{formatDate(claim.date)}</span>
                </div>

                <div style={styles.infoGroup}>
                  <span style={styles.label}>Payout Channel</span>
                  <span style={styles.value}>{claim.channel}</span>
                </div>

                <div style={{ ...styles.infoGroup, alignItems: "flex-end" }}>
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
  container: {
    padding: "3rem",
    color: "#f0f0f8",
    maxWidth: 900,
    margin: "0 auto",
    fontFamily: '"DM Sans", sans-serif',
  },
  header: { marginBottom: "3.5rem" },
  title: {
    fontSize: 32,
    fontWeight: 700,
    margin: "0 0 10px 0",
    letterSpacing: "-0.5px",
  },
  subtitle: { fontSize: 15, color: "#8888a8", lineHeight: 1.6 },
  emptyState: {
    background: "#13131f",
    border: "1px dashed rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: "4rem 2rem",
    textAlign: "center",
  },
  list: { display: "flex", flexDirection: "column", gap: 20 },
  card: {
    background: "#13131f",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: "24px 28px",
    transition: "transform 0.2s",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  claimId: {
    fontFamily: '"DM Mono", monospace',
    color: "#8888a8",
    fontSize: 14,
    background: "rgba(255,255,255,0.04)",
    padding: "6px 10px",
    borderRadius: 6,
  },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },
  statusPaid: {
    color: "#4ade80",
    background: "rgba(74, 222, 128, 0.12)",
    border: "1px solid rgba(74,222,128,0.2)",
  },
  statusPending: {
    color: "#facc15",
    background: "rgba(250, 204, 21, 0.12)",
    border: "1px solid rgba(250,204,21,0.2)",
  },
  statusFailed: {
    color: "#f87171",
    background: "rgba(248, 113, 113, 0.12)",
    border: "1px solid rgba(248,113,113,0.2)",
  },
  cardBody: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 24,
    alignItems: "center",
  },
  infoGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: {
    fontSize: 11,
    textTransform: "uppercase",
    color: "#55556a",
    fontWeight: 600,
    letterSpacing: "0.06em",
  },
  value: { fontSize: 14.5, color: "#d0d0e8", fontWeight: 500 },
  valueWarning: { fontSize: 14.5, color: "#f5a623", fontWeight: 600 },
  amount: {
    fontSize: 26,
    color: "#4ade80",
    fontWeight: 700,
    letterSpacing: "-0.5px",
  },
};