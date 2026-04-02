import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "./AppLayout.css";

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasPlan, setHasPlan] = useState(true); // default true to prevent flicker
  const [loadingGuard, setLoadingGuard] = useState(true);

  useEffect(() => {
    const verifyPlanAccess = async () => {
      const phone = localStorage.getItem("userPhone");
      if (!phone) { navigate("/"); return; }
      
      const { data } = await supabase.from('users').select('coverage_status').eq('phone', phone).single();
      const planActive = data && data.coverage_status === 'Active';
      
      setHasPlan(planActive);
      setLoadingGuard(false);

      // Instantly trap them inside the plans route if they have no active policy
      if (!planActive && location.pathname !== '/dashboard/plans') {
        navigate('/dashboard/plans', { replace: true });
      }
    };
    
    verifyPlanAccess();
  }, [location.pathname, navigate]);
  const links = [
    { to: ".", label: "Dashboard", end: true, icon: "📊" },
    { to: "risk", label: "Risk Score", icon: "🧠" },
    { to: "plans", label: "Plans", icon: "🛡️" },
    { to: "history", label: "History", icon: "🕒" },
    { to: "bankinfo", label: "Bank Information", icon: "🏦" },
    { to: "profile", label: "Profile", icon: "👤" }
  ];

  const handleLogout = () => {
    localStorage.removeItem("userPhone");
    navigate("/");
  };

  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">GigShield</span>
        </div>
        <nav className="sidebar-nav">
          {links.map((link) => {
            const isLocked = !hasPlan && link.to !== "plans";
            return (
              <NavLink
                key={link.to}
                to={isLocked ? "#" : link.to}
                end={link.end}
                onClick={(e) => { if (isLocked) e.preventDefault(); }}
                className={({ isActive }) => `nav-link ${isActive && !isLocked ? 'active' : ''}`}
                style={{ 
                  opacity: isLocked ? 0.4 : 1, 
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  filter: isLocked ? 'grayscale(100%)' : 'none'
                }}
              >
                <span className="nav-icon">{isLocked ? "🔒" : link.icon}</span>
                {link.label}
              </NavLink>
            );
          })}

          <div style={{ flexGrow: 1 }} />

          <button 
            onClick={handleLogout}
            style={{
              marginTop: 40,
              background: 'none', border: '1px solid rgba(248, 113, 113, 0.2)', color: '#f87171',
              padding: '12px 16px', borderRadius: '8px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', fontWeight: '600',
              fontFamily: 'var(--font)', transition: 'all 0.2s', width: '100%'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(248, 113, 113, 0.1)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'none'; }}
          >
            <span style={{ fontSize: '18px' }}>🚪</span> Logout
          </button>
        </nav>
      </aside>
      <main className="app-main">
        {loadingGuard ? null : <Outlet />}
      </main>
    </div>
  );
}
