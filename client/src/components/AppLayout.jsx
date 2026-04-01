import { Outlet, NavLink } from "react-router-dom";
import "./AppLayout.css";

export default function AppLayout() {
  const links = [
    { to: ".", label: "Dashboard", end: true, icon: "📊" },
    { to: "live-location", label: "Live Location", icon: "📍" },
    { to: "risk", label: "Risk Score", icon: "🧠" },
    { to: "plans", label: "Plans", icon: "🛡️" },
    { to: "history", label: "History", icon: "🕒" },
  ];

  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">GigShield</span>
        </div>
        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
