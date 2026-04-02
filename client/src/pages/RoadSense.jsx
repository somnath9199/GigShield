import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────
const TT_KEY  = "JWqUSKWM1eLnRMc3ffGZ3rp0d7kta6Qs";
const OWM_KEY = "2eb916e8b68ea7b73d4e2d187031d3c6";
const LOOK_AHEAD_KM  = 3;
const SCAN_INTERVAL  = 15000;
const MOVE_TICK_MS   = 300;
const MAX_ROUTES     = 3;

// ─── STYLES ──────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');
@import url('https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps.css');

:root {
  --bg:         #0b0d13;
  --surface:    #12151f;
  --surface2:   #1a1e2e;
  --surface3:   #222638;
  --border:     rgba(255,255,255,0.07);
  --border2:    rgba(255,255,255,0.14);
  --text:       #e4e6f0;
  --muted:      #6b7090;
  --accent:     #00e5b4;
  --accent-dim: rgba(0,229,180,0.12);
  --danger:     #ff4f4f;
  --danger-dim: rgba(255,79,79,0.10);
  --flood:      #4a9eff;
  --flood-dim:  rgba(74,158,255,0.10);
  --warn:       #ffb547;
  --warn-dim:   rgba(255,181,71,0.10);
  --alt1:       #c97bff;
  --alt2:       #ff7eb3;
  --mono:       'Space Mono', monospace;
  --sans:       'DM Sans', sans-serif;
}

*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}

.rs-app {
  font-family: var(--sans);
  background: var(--bg);
  color: var(--text);
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── HEADER ── */
.rs-header {
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  z-index: 500;
}
.rs-logo {
  font-family: var(--mono);
  font-size: 14px;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.08em;
  display: flex;
  align-items: center;
  gap: 10px;
}
.rs-live-dot {
  width: 8px; height: 8px;
  background: var(--accent);
  border-radius: 50%;
  animation: livePulse 2s ease-in-out infinite;
}
@keyframes livePulse {
  0%,100%{box-shadow:0 0 0 0 rgba(0,229,180,0.4);opacity:1;}
  50%{box-shadow:0 0 0 5px rgba(0,229,180,0);opacity:0.6;}
}
.rs-header-right { display:flex; align-items:center; gap:12px; }
.rs-scan-count { font-family:var(--mono); font-size:11px; color:var(--muted); }
.rs-scan-count span { color:var(--text); }

.rs-status-badge {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid;
  transition: all 0.4s;
}
.rs-status-badge.safe    { color:var(--accent); border-color:rgba(0,229,180,0.3); background:var(--accent-dim); }
.rs-status-badge.alert   { color:var(--danger); border-color:rgba(255,79,79,0.4); background:var(--danger-dim); animation:badgeBlink 1s step-end infinite; }
.rs-status-badge.scan    { color:var(--warn);   border-color:rgba(255,181,71,0.3); background:var(--warn-dim); }
.rs-status-badge.arrived { color:#b0b8d8; border-color:rgba(255,255,255,0.1); background:transparent; }
@keyframes badgeBlink{0%,100%{opacity:1}50%{opacity:0.5}}

/* ── BODY ── */
.rs-body { display:flex; flex:1; overflow:hidden; }

/* ── SIDEBAR ── */
.rs-sidebar {
  width: 320px;
  flex-shrink: 0;
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.rs-sidebar-scroll {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--surface3) transparent;
}
.rs-sidebar-scroll::-webkit-scrollbar{width:4px;}
.rs-sidebar-scroll::-webkit-scrollbar-thumb{background:var(--surface3);border-radius:2px;}

.rs-panel { padding:14px 16px; border-bottom:1px solid var(--border); }
.rs-panel-label {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.15em;
  color: var(--muted);
  text-transform: uppercase;
  margin-bottom: 11px;
}

/* Route inputs */
.rs-route-inputs { display:flex; flex-direction:column; gap:7px; margin-bottom:10px; }
.rs-input-row { display:flex; align-items:center; gap:8px; }
.rs-dot { width:9px; height:9px; border-radius:50%; flex-shrink:0; }
.rs-dot.from { background:var(--accent); }
.rs-dot.to   { background:var(--danger); }
.rs-rinput {
  flex: 1;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 7px;
  padding: 8px 11px;
  color: var(--text);
  font-family: var(--sans);
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}
.rs-rinput:focus { border-color:rgba(0,229,180,0.35); }
.rs-rinput::placeholder { color:var(--muted); font-style:italic; }

.rs-btn {
  width: 100%;
  padding: 9px 12px;
  border: none;
  border-radius: 8px;
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: all 0.2s;
}
.rs-btn-go {
  background: var(--accent);
  color: #071510;
  margin-bottom: 6px;
}
.rs-btn-go:hover:not(:disabled) { filter:brightness(1.1); transform:translateY(-1px); }
.rs-btn-go:active { transform:translateY(0); }
.rs-btn-go:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
.rs-btn-clear {
  background: var(--surface2);
  color: var(--muted);
  border: 1px solid var(--border);
}
.rs-btn-clear:hover { color:var(--text); border-color:var(--border2); }

/* Toggles */
.rs-toggle-list { display:flex; flex-direction:column; gap:9px; }
.rs-toggle-item { display:flex; align-items:center; justify-content:space-between; cursor:pointer; }
.rs-toggle-label { display:flex; align-items:center; gap:8px; font-size:13px; }
.rs-toggle-icon { font-size:15px; }
.rs-toggle-switch { position:relative; width:34px; height:18px; }
.rs-toggle-switch input { opacity:0; width:0; height:0; position:absolute; }
.rs-toggle-track {
  position: absolute; inset: 0;
  background: var(--surface3);
  border-radius: 9px;
  transition: background 0.25s;
  cursor: pointer;
}
.rs-toggle-track::after {
  content:'';
  position:absolute;
  top:2px; left:2px;
  width:14px; height:14px;
  background:#fff;
  border-radius:50%;
  transition:transform 0.25s;
}
.rs-toggle-switch.checked .rs-toggle-track { background:var(--accent); }
.rs-toggle-switch.checked.flood .rs-toggle-track { background:var(--flood); }
.rs-toggle-switch.checked .rs-toggle-track::after { transform:translateX(16px); }

/* Stats */
.rs-stats-row { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:10px; }
.rs-stat-chip {
  flex:1; min-width:70px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 10px;
  text-align: center;
}
.rs-stat-val { font-family:var(--mono); font-size:15px; color:var(--text); display:block; margin-bottom:2px; }
.rs-stat-key { font-family:var(--mono); font-size:9px; color:var(--muted); letter-spacing:0.05em; text-transform:uppercase; }
.rs-coord-row { display:flex; justify-content:space-between; align-items:center; padding:4px 0; border-bottom:1px solid var(--border); }
.rs-coord-row:last-child { border-bottom:none; }
.rs-coord-key { font-family:var(--mono); font-size:10px; color:var(--muted); }
.rs-coord-val { font-family:var(--mono); font-size:11px; color:var(--accent); }

/* Alternate paths */
.rs-alt-paths { display:flex; flex-direction:column; gap:7px; }
.rs-alt-card {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  position: relative;
  overflow: hidden;
}
.rs-alt-card::before {
  content:'';
  position:absolute;
  left:0; top:0; bottom:0;
  width:3px;
  border-radius:2px 0 0 2px;
}
.rs-alt-card.route-0::before { background:var(--accent); }
.rs-alt-card.route-1::before { background:var(--alt1); }
.rs-alt-card.route-2::before { background:var(--alt2); }
.rs-alt-card:hover { border-color:var(--border2); background:var(--surface3); }
.rs-alt-card.active-route {
  border-color:rgba(0,229,180,0.4);
  background:rgba(0,229,180,0.05);
}
.rs-alt-card.active-route.route-1 { border-color:rgba(201,123,255,0.4); background:rgba(201,123,255,0.05); }
.rs-alt-card.active-route.route-2 { border-color:rgba(255,126,179,0.4); background:rgba(255,126,179,0.05); }
.rs-alt-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:5px; }
.rs-alt-name { font-family:var(--mono); font-size:10px; font-weight:700; letter-spacing:0.06em; }
.rs-alt-name.route-0 { color:var(--accent); }
.rs-alt-name.route-1 { color:var(--alt1); }
.rs-alt-name.route-2 { color:var(--alt2); }
.rs-alt-active-pill {
  font-family:var(--mono); font-size:8px;
  background:rgba(0,229,180,0.15); color:var(--accent);
  padding:2px 7px; border-radius:4px;
  letter-spacing:0.05em;
}
.rs-alt-meta { display:flex; gap:10px; }
.rs-alt-item { font-family:var(--mono); font-size:10px; color:var(--muted); }
.rs-alt-item span { color:var(--text); }
.rs-alt-incidents { margin-top:5px; display:flex; gap:4px; flex-wrap:wrap; }
.rs-no-alts { color:var(--muted); font-size:12px; font-style:italic; padding:8px 0; }

/* Incidents feed */
.rs-feed { display:flex; flex-direction:column; gap:8px; }
.rs-inc-card {
  background:var(--surface2); border:1px solid var(--border);
  border-radius:10px; padding:11px 12px;
  display:flex; gap:10px; align-items:flex-start;
  transition:border-color 0.3s, background 0.3s;
  animation:fadeInUp 0.3s ease-out;
  cursor:pointer;
}
@keyframes fadeInUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.rs-inc-card.block   { border-color:rgba(255,79,79,0.35);   background:rgba(255,79,79,0.05); }
.rs-inc-card.flood   { border-color:rgba(74,158,255,0.35);  background:rgba(74,158,255,0.05); }
.rs-inc-card.weather { border-color:rgba(255,181,71,0.35);  background:rgba(255,181,71,0.05); }
.rs-inc-ico {
  width:34px; height:34px; border-radius:8px;
  display:flex; align-items:center; justify-content:center;
  font-size:16px; flex-shrink:0;
}
.rs-inc-ico.block   { background:rgba(255,79,79,0.15); }
.rs-inc-ico.flood   { background:rgba(74,158,255,0.15); }
.rs-inc-ico.weather { background:rgba(255,181,71,0.15); }
.rs-inc-body { flex:1; min-width:0; }
.rs-inc-title { font-size:12px; font-weight:500; color:var(--text); margin-bottom:2px; line-height:1.4; }
.rs-inc-sub   { font-family:var(--mono); font-size:9px; color:var(--muted); margin-bottom:5px; }
.rs-badge {
  display:inline-block; font-family:var(--mono); font-size:8px;
  letter-spacing:0.06em; padding:2px 6px; border-radius:4px;
  margin-right:3px; text-transform:uppercase;
}
.rs-badge.block    { background:rgba(255,79,79,0.2);  color:var(--danger); }
.rs-badge.flood    { background:rgba(74,158,255,0.2); color:var(--flood); }
.rs-badge.weather  { background:rgba(255,181,71,0.2); color:var(--warn); }
.rs-badge.on-route { background:rgba(0,229,180,0.15); color:var(--accent); }
.rs-badge.off-route{ background:var(--surface3); color:var(--muted); }
.rs-empty-feed {
  padding:24px 10px; text-align:center;
  color:var(--muted); font-size:13px; font-style:italic;
}
.rs-empty-feed .eico { font-size:28px; display:block; margin-bottom:8px; }

/* ── MAP AREA ── */
.rs-map-wrap { flex:1; position:relative; overflow:hidden; }
#rs-map { width:100%; height:100%; }

/* LOADING */
.rs-loading {
  position:absolute; inset:0;
  background:var(--bg);
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap:14px; z-index:999; transition:opacity 0.5s;
}
.rs-loading.hidden { opacity:0; pointer-events:none; }
.rs-loader-logo { font-family:var(--mono); font-size:20px; font-weight:700; color:var(--accent); letter-spacing:0.1em; }
.rs-loader-bar { width:180px; height:3px; background:var(--surface2); border-radius:2px; overflow:hidden; }
.rs-loader-fill { height:100%; background:var(--accent); border-radius:2px; animation:barLoad 1.8s ease-in-out forwards; }
@keyframes barLoad{from{width:0%}to{width:100%}}
.rs-loader-msg { font-family:var(--mono); font-size:11px; color:var(--muted); letter-spacing:0.05em; }

/* TOASTS */
.rs-alerts { position:absolute; top:14px; right:14px; display:flex; flex-direction:column; gap:10px; z-index:400; max-width:290px; pointer-events:none; }
.rs-toast {
  background:var(--surface); border:1px solid;
  border-radius:12px; padding:13px 15px;
  animation:toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1);
  pointer-events:all; position:relative; overflow:hidden;
}
@keyframes toastIn{from{transform:translateX(30px) scale(0.95);opacity:0}to{transform:translateX(0) scale(1);opacity:1}}
.rs-toast::before {
  content:''; position:absolute; left:0; top:0; bottom:0; width:3px;
}
.rs-toast.block  { border-color:rgba(255,79,79,0.45); }
.rs-toast.block::before  { background:var(--danger); }
.rs-toast.flood  { border-color:rgba(74,158,255,0.45); }
.rs-toast.flood::before  { background:var(--flood); }
.rs-toast.weather{ border-color:rgba(255,181,71,0.45); }
.rs-toast.weather::before{ background:var(--warn); }
.rs-toast-head { display:flex; align-items:center; gap:8px; margin-bottom:5px; }
.rs-toast-emoji { font-size:17px; }
.rs-toast-type { font-family:var(--mono); font-size:11px; font-weight:700; letter-spacing:0.06em; flex:1; }
.rs-toast-type.block   { color:var(--danger); }
.rs-toast-type.flood   { color:var(--flood); }
.rs-toast-type.weather { color:var(--warn); }
.rs-toast-close { background:none; border:none; color:var(--muted); cursor:pointer; font-size:13px; padding:0; }
.rs-toast-close:hover { color:var(--text); }
.rs-toast-msg  { font-size:12px; color:var(--muted); line-height:1.5; margin-bottom:5px; }
.rs-toast-dist { font-family:var(--mono); font-size:10px; color:var(--warn); }

/* BOTTOM PILL */
.rs-map-bottom { position:absolute; bottom:14px; left:50%; transform:translateX(-50%); display:flex; align-items:center; gap:10px; z-index:300; }
.rs-map-pill {
  background:var(--surface); border:1px solid var(--border);
  border-radius:20px; padding:7px 16px;
  font-family:var(--mono); font-size:11px; color:var(--muted);
  display:flex; align-items:center; gap:8px; backdrop-filter:blur(10px);
}
.rs-scan-anim { width:7px; height:7px; border-radius:50%; background:var(--accent); animation:livePulse 1.2s ease-in-out infinite; }
`;

// ─── HELPERS ─────────────────────────────────────────────────
function haversineKm(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const s = Math.sin(dLat/2)**2 +
    Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1-s));
}
function isOnRoute(inc, pts, th = 0.3) {
  return pts.some(p => haversineKm(p, inc) < th);
}

// ─── TOGGLE ──────────────────────────────────────────────────
function Toggle({ label, icon, checked, onChange, colorClass }) {
  return (
    <label className="rs-toggle-item">
      <div className="rs-toggle-label">
        <span className="rs-toggle-icon">{icon}</span>
        <span>{label}</span>
      </div>
      <div className={`rs-toggle-switch ${checked?"checked":""} ${colorClass||""}`}
           onClick={() => onChange(!checked)}>
        <div className="rs-toggle-track"/>
      </div>
    </label>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────
export default function RoadSense() {
  const [origin, setOrigin]       = useState("Anna Nagar, Chennai");
  const [dest,   setDest]         = useState("Adyar, Chennai");
  const [status, setStatus]       = useState({ type:"safe", text:"● ALL CLEAR" });
  const [scanCount, setScanCount] = useState(0);
  const [stats, setStats]         = useState({ incidents:0, dist:"—", eta:"—" });
  const [coords, setCoords]       = useState({ lat:"—", lng:"—", spd:"—" });
  const [incidents, setIncidents] = useState([]);
  const [toasts, setToasts]       = useState([]);
  const [pillText, setPillText]   = useState("Enter route and press Start");
  const [scanning, setScanning]   = useState(false);
  const [loading, setLoading]     = useState(true);
  const [loaderMsg, setLoaderMsg] = useState("Initialising map...");
  const [btnLoading, setBtnLoading] = useState(false);
  const [chkBlock,   setChkBlock]   = useState(true);
  const [chkFlood,   setChkFlood]   = useState(true);
  const [chkWeather, setChkWeather] = useState(true);

  // Alternate path state
  const [altRoutes, setAltRoutes]       = useState([]);   // [{points, distM, timeSec}]
  const [activeRouteIdx, setActiveRouteIdx] = useState(0);

  const mapRef        = useRef(null);
  const ttRef         = useRef(null);    // tt instance
  const posMarkerRef  = useRef(null);
  const routeRef      = useRef([]);      // active route points
  const allRoutesRef  = useRef([]);      // all route points arrays
  const currentIdxRef = useRef(0);
  const monitorRef    = useRef(false);
  const alertedRef    = useRef(new Set());
  const incMarkersRef = useRef([]);
  const moveTimerRef  = useRef(null);
  const scanTimerRef  = useRef(null);
  const toastIdRef    = useRef(0);
  const altLayerIds   = useRef([]);      // track alt route layer ids

  // ── Load TomTom SDK ────────────────────────────────────────
  useEffect(() => {
    const existingLink = document.querySelector('link[href*="tomtom"]');
    if (!existingLink) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps.css";
      document.head.appendChild(link);
    }
    const loadScript = (src) => new Promise((res, rej) => {
      if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
      const s = document.createElement("script");
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
    Promise.all([
      loadScript("https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps-web.min.js"),
      loadScript("https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/services/services-web.min.js"),
    ]).then(() => {
      const tt = window.tt;
      ttRef.current = tt;
      const m = tt.map({
        key: TT_KEY,
        container: "rs-map",
        style: {
          version: 8,
          sources: { "tt-tiles": { type:"raster", tileSize:256, attribution:"© TomTom",
            tiles:[`https://api.tomtom.com/map/1/tile/basic/night/{z}/{x}/{y}.png?key=${TT_KEY}`] }},
          layers:[{ id:"tt-raster", type:"raster", source:"tt-tiles" }]
        },
        center: [80.237, 13.052], zoom: 12,
      });
      m.on("load", () => setLoading(false));
      m.addControl(new tt.NavigationControl(), "bottom-right");
      mapRef.current = m;
      if ("Notification" in window && Notification.permission==="default")
        Notification.requestPermission();
    }).catch(() => setLoaderMsg("SDK failed to load"));
  }, []);

  // ── Geocode ────────────────────────────────────────────────
  async function geocode(q) {
    const r = await fetch(`https://api.tomtom.com/search/2/geocode/${encodeURIComponent(q)}.json?key=${TT_KEY}&limit=1`);
    const d = await r.json();
    if (!d.results?.length) throw new Error("Location not found: " + q);
    return { lat: d.results[0].position.lat, lng: d.results[0].position.lon };
  }

  // ── Fetch multiple routes (main + alternates) ──────────────
  async function getRoutes(from, to) {
    const url = `https://api.tomtom.com/routing/1/calculateRoute/${from.lat},${from.lng}:${to.lat},${to.lng}/json?key=${TT_KEY}&traffic=true&travelMode=car&maxAlternatives=${MAX_ROUTES-1}`;
    const r = await fetch(url);
    const d = await r.json();
    if (!d.routes?.length) throw new Error("No route found");
    return d.routes.map(rt => ({
      points: rt.legs[0].points.map(p => ({ lat:p.latitude, lng:p.longitude })),
      distanceM: rt.summary.lengthInMeters,
      travelTimeSec: rt.summary.travelTimeInSeconds,
    }));
  }

  // ── Traffic incidents ──────────────────────────────────────
  async function fetchTrafficIncidents(lat, lng) {
    const delta = 0.06, bbox = `${lng-delta},${lat-delta},${lng+delta},${lat+delta}`;
    const fields = `{incidents{type,geometry{type,coordinates},properties{id,iconCategory,events{description},from,to}}}`;
    try {
      const r = await fetch(`https://api.tomtom.com/traffic/services/5/incidentDetails?key=${TT_KEY}&bbox=${bbox}&fields=${encodeURIComponent(fields)}&language=en-GB&t=1111&categoryFilter=0,1,2,3,4,5,6,7,8,9,10,11&timeValidityFilter=present`);
      if (!r.ok) return [];
      const d = await r.json();
      if (!d.incidents) return [];
      return d.incidents.map(inc => {
        const props=inc.properties||{}, geo=inc.geometry;
        let lat2, lng2;
        if (geo?.type==="Point") [lng2,lat2]=geo.coordinates;
        else if (geo?.type==="LineString") [lng2,lat2]=geo.coordinates[0];
        else return null;
        const isFlood = (props.iconCategory||0)===9;
        const type = isFlood?"flood":"block";
        const title = props.events?.[0]?.description||(isFlood?"Flooding reported":"Traffic incident");
        const desc  = [props.from,props.to].filter(Boolean).join(" → ")||"On your route";
        return { id:props.id||(lat2+","+lng2), type, lat:lat2, lng:lng2, title, desc, onRoute:false };
      }).filter(Boolean);
    } catch(e) { return []; }
  }

  // ── Weather alerts ─────────────────────────────────────────
  async function fetchWeatherAlerts(lat, lng) {
    try {
      const r = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OWM_KEY}&units=metric`);
      if (!r.ok) return [];
      const d = await r.json();
      const id = d.weather?.[0]?.id||0;
      if (id>=200&&id<300)
        return [{id:"wx-storm",type:"weather",lat,lng,
          title:`⛈ Thunderstorm: ${d.weather[0].description}`,
          desc:`Temp ${d.main?.temp}°C · Wind ${d.wind?.speed} m/s`,onRoute:true}];
      if (id>=300&&id<600) {
        const rain=d.rain?.["1h"]||0;
        return [{id:"wx-rain",type:"weather",lat,lng,
          title:`🌧 ${rain>10?"Heavy rain":"Rain"}: ${d.weather[0].description}`,
          desc:`Temp ${d.main?.temp}°C · Rain ${rain} mm/h`,onRoute:true}];
      }
      return [];
    } catch(e) { return []; }
  }

  // ── Draw routes on map ─────────────────────────────────────
  function drawRoutes(routes, activeIdx) {
    const map = mapRef.current;
    if (!map) return;
    // Remove old layers
    altLayerIds.current.forEach(id => {
      if (map.getLayer(id)) map.removeLayer(id);
      if (map.getSource(id)) map.removeSource(id);
    });
    altLayerIds.current = [];
    // Remove main route
    if (map.getLayer("route-line")) map.removeLayer("route-line");
    if (map.getSource("route-src")) map.removeSource("route-src");

    const COLORS = ["#00e5b4", "#c97bff", "#ff7eb3"];
    // Draw inactive routes first (behind)
    routes.forEach((rt, i) => {
      if (i === activeIdx) return;
      const srcId = `alt-route-src-${i}`, layId = `alt-route-line-${i}`;
      map.addSource(srcId, { type:"geojson", data:{ type:"Feature",
        geometry:{ type:"LineString", coordinates: rt.points.map(p=>[p.lng,p.lat]) }}});
      map.addLayer({ id:layId, type:"line", source:srcId,
        paint:{ "line-color":COLORS[i], "line-width":3, "line-opacity":0.4, "line-dasharray":[4,3] }});
      altLayerIds.current.push(srcId, layId);
    });
    // Draw active route on top
    const active = routes[activeIdx];
    map.addSource("route-src", { type:"geojson", data:{ type:"Feature",
      geometry:{ type:"LineString", coordinates: active.points.map(p=>[p.lng,p.lat]) }}});
    map.addLayer({ id:"route-line", type:"line", source:"route-src",
      paint:{ "line-color":COLORS[activeIdx], "line-width":5, "line-opacity":0.95 }});
  }

  // ── Create position marker ─────────────────────────────────
  function createPosMarker(latlng) {
    const tt = ttRef.current, map = mapRef.current;
    if (!tt || !map) return;
    const el = document.createElement("div");
    el.style.cssText = "width:18px;height:18px;background:#00e5b4;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 5px rgba(0,229,180,0.25);";
    if (posMarkerRef.current) posMarkerRef.current.remove();
    posMarkerRef.current = new tt.Marker({ element:el }).setLngLat([latlng.lng,latlng.lat]).addTo(map);
  }

  // ── Incident markers ───────────────────────────────────────
  function clearIncMarkers() {
    incMarkersRef.current.forEach(m=>m.remove());
    incMarkersRef.current=[];
  }
  function addIncMarker(inc) {
    const tt=ttRef.current, map=mapRef.current;
    if (!tt||!map) return;
    const color = inc.type==="block"?"#ff4f4f":inc.type==="flood"?"#4a9eff":"#ffb547";
    const emoji = inc.type==="block"?"🚧":inc.type==="flood"?"🌊":"⛈️";
    const el = document.createElement("div");
    el.style.cssText=`width:34px;height:34px;background:${color}22;border:2px solid ${color};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;cursor:pointer;`;
    el.innerHTML=emoji;
    const popup = new tt.Popup({offset:20,closeButton:false})
      .setHTML(`<div style="font-family:sans-serif;font-size:12px;padding:4px 2px;min-width:160px;"><strong>${inc.title}</strong><br><span style="color:#666;font-size:11px;">${inc.desc}</span></div>`);
    const m = new tt.Marker({element:el}).setLngLat([inc.lng,inc.lat]).setPopup(popup).addTo(map);
    el.addEventListener("click",()=>m.togglePopup());
    incMarkersRef.current.push(m);
  }

  // ── Toast ──────────────────────────────────────────────────
  function addToast(inc, distKm) {
    const id = ++toastIdRef.current;
    const emoji = inc.type==="block"?"🚧":inc.type==="flood"?"🌊":"⛈️";
    const typeLabel = inc.type==="block"?"ROAD BLOCKED":inc.type==="flood"?"FLOOD ZONE":"WEATHER ALERT";
    setToasts(prev => [...prev, { id, type:inc.type, emoji, typeLabel, title:inc.title, desc:inc.desc, distKm }]);
    setTimeout(()=>setToasts(prev=>prev.filter(t=>t.id!==id)), 14000);
    if (Notification.permission==="granted")
      new Notification("RoadSense Alert", { body:`${inc.title} — ${distKm.toFixed(1)} km ahead` });
  }

  // ── Scan ───────────────────────────────────────────────────
  const scanNow = useCallback(async () => {
    if (!monitorRef.current || !routeRef.current.length) return;
    setScanCount(c => c+1);
    const cur = routeRef.current[currentIdxRef.current] || routeRef.current[0];
    setCoords({ lat:cur.lat.toFixed(4)+"°N", lng:cur.lng.toFixed(4)+"°E", spd:coords.spd });

    const [trafficIncs, weatherAlerts] = await Promise.all([
      fetchTrafficIncidents(cur.lat, cur.lng),
      fetchWeatherAlerts(cur.lat, cur.lng),
    ]);

    let candidates = [];
    if (chkBlock)   candidates.push(...trafficIncs.filter(i=>i.type==="block"));
    if (chkFlood)   candidates.push(...trafficIncs.filter(i=>i.type==="flood"));
    if (chkWeather) candidates.push(...weatherAlerts);

    candidates.forEach(inc => { inc.onRoute = isOnRoute(inc, routeRef.current); });
    // Compute incidents per alt route
    allRoutesRef.current.forEach((rt, ri) => {
      rt.incidentCount = candidates.filter(inc => isOnRoute(inc, rt.points)).length;
    });
    setAltRoutes(prev => prev.map((r, ri) => ({
      ...r, incidentCount: allRoutesRef.current[ri]?.incidentCount ?? 0
    })));
    setIncidents(candidates);
    setStats(s => ({ ...s, incidents:candidates.length }));

    clearIncMarkers();
    candidates.forEach(inc=>addIncMarker(inc));

    let hasAlert=false;
    candidates.forEach(inc => {
      const d = haversineKm(cur, inc);
      if (d < LOOK_AHEAD_KM && !alertedRef.current.has(inc.id)) {
        alertedRef.current.add(inc.id);
        addToast(inc, d);
        hasAlert=true;
      }
    });
    if (hasAlert) setStatus({ type:"alert", text:"● ALERT ACTIVE" });
    else if (candidates.length) setStatus({ type:"scan", text:"● INCIDENTS NEARBY" });
    else setStatus({ type:"safe", text:"● ALL CLEAR" });
  }, [chkBlock, chkFlood, chkWeather]);

  // ── Movement sim ───────────────────────────────────────────
  function startMovement() {
    if (moveTimerRef.current) clearInterval(moveTimerRef.current);
    moveTimerRef.current = setInterval(() => {
      if (currentIdxRef.current >= routeRef.current.length-1) {
        clearInterval(moveTimerRef.current);
        setPillText("Arrived at destination");
        setScanning(false);
        setStatus({ type:"arrived", text:"● ARRIVED" });
        monitorRef.current=false;
        return;
      }
      currentIdxRef.current += 2;
      const pt = routeRef.current[Math.min(currentIdxRef.current, routeRef.current.length-1)];
      if (posMarkerRef.current) posMarkerRef.current.setLngLat([pt.lng,pt.lat]);
      setCoords(c => ({ ...c, spd:"28 km/h" }));
      const etaMin = Math.ceil((routeRef.current.length - currentIdxRef.current)*0.05);
      const end = routeRef.current[routeRef.current.length-1];
      setStats(s => ({ ...s, dist:haversineKm(pt,end).toFixed(1), eta:etaMin+" min" }));
    }, MOVE_TICK_MS);
  }

  // ── Switch active route ────────────────────────────────────
  function switchRoute(idx) {
    if (!allRoutesRef.current[idx]) return;
    setActiveRouteIdx(idx);
    routeRef.current = allRoutesRef.current[idx].points;
    currentIdxRef.current = 0;
    drawRoutes(allRoutesRef.current, idx);
    const rt = allRoutesRef.current[idx];
    setStats(s => ({ ...s, dist:(rt.distanceM/1000).toFixed(1), eta:Math.ceil(rt.travelTimeSec/60)+" min" }));
    if (posMarkerRef.current)
      posMarkerRef.current.setLngLat([routeRef.current[0].lng, routeRef.current[0].lat]);
    alertedRef.current.clear();
  }

  // ── Start monitoring ───────────────────────────────────────
  async function startMonitoring() {
    if (!origin.trim()||!dest.trim()) { alert("Please enter both origin and destination."); return; }
    setBtnLoading(true);
    setStatus({ type:"scan", text:"● LOADING ROUTE" });
    setPillText("Geocoding locations...");
    setScanning(true);
    try {
      const [from, to] = await Promise.all([geocode(origin), geocode(dest)]);
      setPillText("Calculating routes...");
      const routes = await getRoutes(from, to);

      allRoutesRef.current = routes.map(r => ({ ...r, incidentCount:0 }));
      routeRef.current = routes[0].points;
      currentIdxRef.current = 0;
      monitorRef.current = true;
      alertedRef.current.clear();
      setActiveRouteIdx(0);
      setAltRoutes(routes.map((r,i) => ({
        label: i===0?"PRIMARY ROUTE":i===1?"ALT ROUTE 1":"ALT ROUTE 2",
        distanceM: r.distanceM,
        travelTimeSec: r.travelTimeSec,
        incidentCount: 0,
      })));

      const map = mapRef.current;
      drawRoutes(allRoutesRef.current, 0);
      createPosMarker(routes[0].points[0]);

      const allPts = routes.flatMap(r=>r.points);
      const lngs=allPts.map(p=>p.lng), lats=allPts.map(p=>p.lat);
      map.fitBounds(
        [[Math.min(...lngs)-0.01, Math.min(...lats)-0.01],
         [Math.max(...lngs)+0.01, Math.max(...lats)+0.01]],
        { padding:60, duration:1000 }
      );
      setStats({ dist:(routes[0].distanceM/1000).toFixed(1), eta:Math.ceil(routes[0].travelTimeSec/60)+" min", incidents:0 });
      setStatus({ type:"safe", text:"● MONITORING" });
      setPillText("Scanning route for disruptions...");

      await scanNow();
      if (scanTimerRef.current) clearInterval(scanTimerRef.current);
      scanTimerRef.current = setInterval(scanNow, SCAN_INTERVAL);
      startMovement();
    } catch(e) {
      console.error(e);
      alert("Error: "+e.message);
      setStatus({ type:"safe", text:"● ALL CLEAR" });
      setPillText("Enter route and press Start");
      setScanning(false);
    } finally {
      setBtnLoading(false);
    }
  }

  // ── Clear ──────────────────────────────────────────────────
  function clearAll() {
    monitorRef.current=false;
    routeRef.current=[]; allRoutesRef.current=[];
    currentIdxRef.current=0;
    alertedRef.current.clear();
    setScanCount(0); setIncidents([]); setAltRoutes([]); setActiveRouteIdx(0);
    setToasts([]);
    if (moveTimerRef.current) clearInterval(moveTimerRef.current);
    if (scanTimerRef.current) clearInterval(scanTimerRef.current);
    if (posMarkerRef.current) { posMarkerRef.current.remove(); posMarkerRef.current=null; }
    clearIncMarkers();
    const map = mapRef.current;
    if (map) {
      altLayerIds.current.forEach(id => {
        if (map.getLayer(id)) map.removeLayer(id);
        if (map.getSource(id)) map.removeSource(id);
      });
      altLayerIds.current=[];
      if (map.getLayer("route-line")) map.removeLayer("route-line");
      if (map.getSource("route-src")) map.removeSource("route-src");
    }
    setStats({ incidents:0, dist:"—", eta:"—" });
    setCoords({ lat:"—", lng:"—", spd:"—" });
    setStatus({ type:"safe", text:"● ALL CLEAR" });
    setPillText("Enter route and press Start");
    setScanning(false);
  }

  const ROUTE_COLORS = ["var(--accent)", "var(--alt1)", "var(--alt2)"];
  const incEmoji = t => t==="block"?"🚧":t==="flood"?"🌊":"⛈️";

  return (
    <>
      <style>{css}</style>
      <div className="rs-app">
        {/* HEADER */}
        <header className="rs-header">
          <div className="rs-logo"><div className="rs-live-dot"/>ROADSENSE</div>
          <div className="rs-header-right">
            <div className="rs-scan-count">Scans: <span>{scanCount}</span></div>
            <div className={`rs-status-badge ${status.type}`}>{status.text}</div>
          </div>
        </header>

        <div className="rs-body">
          {/* SIDEBAR */}
          <div className="rs-sidebar">
            <div className="rs-sidebar-scroll">

              {/* Route */}
              <div className="rs-panel">
                <div className="rs-panel-label">Route</div>
                <div className="rs-route-inputs">
                  <div className="rs-input-row">
                    <div className="rs-dot from"/>
                    <input className="rs-rinput" placeholder="Starting point" value={origin} onChange={e=>setOrigin(e.target.value)}/>
                  </div>
                  <div className="rs-input-row">
                    <div className="rs-dot to"/>
                    <input className="rs-rinput" placeholder="Destination" value={dest} onChange={e=>setDest(e.target.value)}/>
                  </div>
                </div>
                <button className="rs-btn rs-btn-go" disabled={btnLoading} onClick={startMonitoring}>
                  {btnLoading?"⏳ LOADING...":"▶ START MONITORING"}
                </button>
                <button className="rs-btn rs-btn-clear" onClick={clearAll}>✕ CLEAR</button>
              </div>

              {/* Monitor For */}
              <div className="rs-panel">
                <div className="rs-panel-label">Monitor For</div>
                <div className="rs-toggle-list">
                  <Toggle label="Road blocks & accidents" icon="🚧" checked={chkBlock} onChange={setChkBlock}/>
                  <Toggle label="Flooding & waterlogging"  icon="🌊" checked={chkFlood} onChange={setChkFlood} colorClass="flood"/>
                  <Toggle label="Severe weather alerts"   icon="⛈️" checked={chkWeather} onChange={setChkWeather}/>
                </div>
              </div>

              {/* Alternate Paths */}
              <div className="rs-panel">
                <div className="rs-panel-label">Alternate Paths</div>
                {altRoutes.length === 0 ? (
                  <div className="rs-no-alts">Start monitoring to see available routes</div>
                ) : (
                  <div className="rs-alt-paths">
                    {altRoutes.map((rt, i) => (
                      <div
                        key={i}
                        className={`rs-alt-card route-${i} ${activeRouteIdx===i?"active-route":""}`}
                        onClick={() => switchRoute(i)}
                      >
                        <div className="rs-alt-head">
                          <span className={`rs-alt-name route-${i}`}>{rt.label}</span>
                          {activeRouteIdx===i && <span className="rs-alt-active-pill">ACTIVE</span>}
                        </div>
                        <div className="rs-alt-meta">
                          <div className="rs-alt-item">🛣 <span>{(rt.distanceM/1000).toFixed(1)} km</span></div>
                          <div className="rs-alt-item">⏱ <span>{Math.ceil(rt.travelTimeSec/60)} min</span></div>
                        </div>
                        {rt.incidentCount > 0 && (
                          <div className="rs-alt-incidents">
                            <span className="rs-badge block">{rt.incidentCount} incident{rt.incidentCount>1?"s":""}</span>
                          </div>
                        )}
                        {rt.incidentCount === 0 && (
                          <div className="rs-alt-incidents">
                            <span className="rs-badge on-route">✓ clear</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="rs-panel">
                <div className="rs-panel-label">Live Stats</div>
                <div className="rs-stats-row">
                  <div className="rs-stat-chip"><span className="rs-stat-val">{stats.incidents}</span><span className="rs-stat-key">Incidents</span></div>
                  <div className="rs-stat-chip"><span className="rs-stat-val">{stats.dist}</span><span className="rs-stat-key">Ahead km</span></div>
                  <div className="rs-stat-chip"><span className="rs-stat-val">{stats.eta}</span><span className="rs-stat-key">ETA min</span></div>
                </div>
                <div className="rs-coord-row"><span className="rs-coord-key">LAT</span><span className="rs-coord-val">{coords.lat}</span></div>
                <div className="rs-coord-row"><span className="rs-coord-key">LNG</span><span className="rs-coord-val">{coords.lng}</span></div>
                <div className="rs-coord-row"><span className="rs-coord-key">SPEED</span><span className="rs-coord-val">{coords.spd}</span></div>
              </div>

              {/* Incident Feed */}
              <div className="rs-panel">
                <div className="rs-panel-label">Incident Feed</div>
                <div className="rs-feed">
                  {incidents.length === 0 ? (
                    <div className="rs-empty-feed">
                      <span className="eico">{monitorRef.current?"✅":"🛣️"}</span>
                      {monitorRef.current?"No incidents detected on your route right now":"Start monitoring to see live incidents on your route"}
                    </div>
                  ) : [...incidents]
                      .sort((a,b)=>haversineKm(routeRef.current[currentIdxRef.current]||{lat:0,lng:0},a)-haversineKm(routeRef.current[currentIdxRef.current]||{lat:0,lng:0},b))
                      .map((inc,i) => {
                        const d = haversineKm(routeRef.current[currentIdxRef.current]||{lat:inc.lat,lng:inc.lng}, inc);
                        return (
                          <div key={inc.id+i} className={`rs-inc-card ${inc.type}`}
                            onClick={()=>mapRef.current?.flyTo({center:[inc.lng,inc.lat],zoom:15,speed:1.2})}>
                            <div className={`rs-inc-ico ${inc.type}`}>{incEmoji(inc.type)}</div>
                            <div className="rs-inc-body">
                              <div className="rs-inc-title">{inc.title}</div>
                              <div className="rs-inc-sub">{inc.desc} · {d<50?d.toFixed(1)+" km away":"Nearby area"}</div>
                              <span className={`rs-badge ${inc.type}`}>{inc.type.toUpperCase()}</span>
                              <span className={`rs-badge ${inc.onRoute?"on-route":"off-route"}`}>{inc.onRoute?"ON ROUTE":"NEARBY"}</span>
                            </div>
                          </div>
                        );
                      })
                  }
                </div>
              </div>

            </div>
          </div>

          {/* MAP */}
          <div className="rs-map-wrap">
            {loading && (
              <div className="rs-loading">
                <div className="rs-loader-logo">ROADSENSE</div>
                <div className="rs-loader-bar"><div className="rs-loader-fill"/></div>
                <div className="rs-loader-msg">{loaderMsg}</div>
              </div>
            )}
            <div id="rs-map"/>

            {/* Toasts */}
            <div className="rs-alerts">
              {toasts.map(t => (
                <div key={t.id} className={`rs-toast ${t.type}`}>
                  <div className="rs-toast-head">
                    <span className="rs-toast-emoji">{t.emoji}</span>
                    <span className={`rs-toast-type ${t.type}`}>{t.typeLabel}</span>
                    <button className="rs-toast-close" onClick={()=>setToasts(p=>p.filter(x=>x.id!==t.id))}>✕</button>
                  </div>
                  <div className="rs-toast-msg">{t.title}<br/><small>{t.desc}</small></div>
                  <div className="rs-toast-dist">⚠ {t.distKm.toFixed(1)} km ahead on your route</div>
                </div>
              ))}
            </div>

            {/* Bottom pill */}
            <div className="rs-map-bottom">
              <div className="rs-map-pill">
                {scanning && <div className="rs-scan-anim"/>}
                <span>{pillText}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}