import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

/* ─── API base ─────────────────────────────────────────── */
// Replaced with Supabase client direct integration


/* ─── tiny helpers ──────────────────────────────────────── */
const PLATFORMS = ["Zomato", "Swiggy", "Zepto", "Amazon", "Dunzo", "Blinkit"];

function cls(...args) {
  return args.filter(Boolean).join(" ");
}

/* ════════════════════════════════════════════════════════
   ROOT COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Auth() {
  // "signup" | "login" | "otp-login" | "otp-signup" | "done"
  const [screen, setScreen] = useState("login");
  const [pendingPhone, setPendingPhone] = useState("");
  const [pendingData, setPendingData]   = useState(null); // signup form payload
  const [isNewUser, setIsNewUser] = useState(false);

  const goOtp = (phone, fromSignup = false, payload = null) => {
    setPendingPhone(phone);
    setPendingData(payload);
    setIsNewUser(fromSignup);
    setScreen(fromSignup ? "otp-signup" : "otp-login");
  };

  return (
    <div className="root">
      <GlobalStyles />

      {/* ── Left panel ── */}
      <aside className="left-panel">
        <LeftPanel />
      </aside>

      {/* ── Right panel ── */}
      <main className="right-panel">
        <div className="form-shell">
          <Logo />

          {screen === "login"      && <LoginScreen      onOtp={(p) => goOtp(p, false)} />}
          {screen === "signup"     && <SignupScreen      onOtp={(p, pl) => goOtp(p, true, pl)} onLogin={() => setScreen("login")} />}
          {screen === "otp-login"  && <OtpScreen phone={pendingPhone} payload={null}      onSuccess={() => setScreen("done")} onBack={() => setScreen("login")} />}
          {screen === "otp-signup" && <OtpScreen phone={pendingPhone} payload={pendingData} onSuccess={() => setScreen("done")} onBack={() => setScreen("signup")} />}
          {screen === "done"       && <DoneScreen isNewUser={isNewUser} />}

          {(screen === "login" || screen === "signup") && (
            <p className="switch-row">
              {screen === "login" ? (
                <>New here?{" "}<button className="txt-btn" onClick={() => setScreen("signup")}>Create account</button></>
              ) : (
                <>Already have one?{" "}<button className="txt-btn" onClick={() => setScreen("login")}>Sign in</button></>
              )}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   LOGIN  →  sendOTP
═══════════════════════════════════════════════════════════ */
function LoginScreen({ onOtp }) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handle = async () => {
    const rawPhone = phone.replace(/\D/g, "");
    if (rawPhone.length < 10) {
      setErr("Enter a valid 10-digit number.");
      return;
    }
    setErr("");
    setLoading(true);

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', rawPhone);

    setLoading(false);
    
    if (error || !data || data.length === 0) { 
      setErr("User not found. Please create an account first."); 
      return; 
    }

    const full = `+91${rawPhone.slice(-10)}`;
    onOtp(full);
  };

  return (
    <div className="anim-in">
      <div className="form-head">
        <h2 className="form-title">Welcome back</h2>
        <p className="form-sub">We'll send an OTP to your mobile</p>
      </div>

      <label className="field-label">Mobile number</label>
      <div className="phone-wrap">
        <span className="phone-pfx">+91</span>
        <input
          className="phone-inp"
          type="tel"
          placeholder="98765 43210"
          maxLength={10}
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && handle()}
        />
      </div>

      {err && <p className="err-msg">{err}</p>}

      <button className="primary-btn" onClick={handle} disabled={loading}>
        {loading ? <Spinner /> : "Send OTP →"}
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   SIGNUP  →  Signup endpoint, then sendOTP
═══════════════════════════════════════════════════════════ */
function SignupScreen({ onOtp, onLogin }) {
  const [step, setStep] = useState(1); // 1 = identity, 2 = profile
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [f, setF] = useState({
    Name: "", email: "", password: "", confirm: "",
    phone_number: "", platform: "", country: "India", city: ""
  });

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const setPlatform = (v) => setF((p) => ({ ...p, platform: v }));

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setErr("Geolocation is not supported by your browser");
      return;
    }
    setLoading(true);
    setErr("Locating...");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        
        const cityObj = data.address.city || data.address.town || data.address.village || data.address.county || "";
        const countryObj = data.address.country || "India";
        
        setF(prev => ({ ...prev, city: cityObj, country: countryObj }));
        setErr("");
      } catch (e) {
        setErr("Failed to pull location data automatically.");
      }
      setLoading(false);
    }, (e) => {
      setErr("Location permission was denied.");
      setLoading(false);
    });
  };

  const nextStep = () => {
    const rawPhone = f.phone_number.replace(/\D/g,"");
    if (!rawPhone || rawPhone.length < 10) {
      setErr("Enter a valid 10-digit phone number."); return;
    }
    if (!f.Name || !f.email || !f.password) {
      setErr("Please fill all fields."); return;
    }
    if (f.password !== f.confirm) {
      setErr("Passwords don't match."); return;
    }
    setErr(""); setStep(2);
  };

  const submit = async () => {
    if (!f.country || !f.city) {
      setErr("Please provide your operating zone location."); return;
    }
    if (!f.platform) {
      setErr("Please select your delivery platform."); return;
    }
    
    setErr(""); setLoading(true);
    
    const rawPhone = f.phone_number.replace(/\D/g,"");
    const generatedRiderId = `GS-${rawPhone}`;

    const payload = {
      rider_id: generatedRiderId,
      name: f.Name,
      email: f.email,
      password: f.password,
      phone: rawPhone,
      country: f.country,
      city: f.city,
      isactive: true,
      phone_number_verified: false
    };

    // 1. Create user in Supabase public.users table
    const { error } = await supabase
      .from('users')
      .insert([payload]);

    setLoading(false);
    
    if (error) {
      if (error.message.includes("users_email_key")) {
        setErr("This email address is already registered. Please sign in.");
      } else if (error.message.includes("users_phone_key") || error.message.includes("users_pkey")) {
        setErr("This phone number is already registered. Please sign in.");
      } else {
        setErr(error.message || "Signup failed. Account may already exist.");
      }
      return;
    }

    // 2. Mock sending OTP
    const full = `91${rawPhone.slice(-10)}`;
    onOtp(full, payload);
  };

  return (
    <div className="anim-in">
      {/* progress */}
      <div className="step-bar">
        {[1,2].map((s) => (
          <div key={s} className={cls("step-seg", step >= s && "step-active")} />
        ))}
      </div>

      {step === 1 && (
        <>
          <div className="form-head">
            <h2 className="form-title">Create account</h2>
            <p className="form-sub">Join exactly 84,000 riders in getting protected</p>
          </div>

          <div className="field-grid">
            <label className="field-label" style={{ marginBottom: 6 }}>Mobile number</label>
            <div className="phone-wrap" style={{ marginBottom: 14 }}>
              <span className="phone-pfx">+91</span>
              <input
                className="phone-inp"
                type="tel"
                placeholder="98765 43210"
                maxLength={10}
                value={f.phone_number}
                onChange={(e) => setF((p) => ({ ...p, phone_number: e.target.value.replace(/\D/g,"") }))}
              />
            </div>
            
            <Field label="Full name" placeholder="Ravi Kumar" value={f.Name} onChange={set("Name")} />
            <Field label="Email address" placeholder="ravi@email.com" type="email" value={f.email} onChange={set("email")} />
            <Field label="Password" type="password" placeholder="Min 8 characters" value={f.password} onChange={set("password")} />
            <Field label="Confirm password" type="password" placeholder="Re-enter password" value={f.confirm} onChange={set("confirm")} />
          </div>

          {err && <p className="err-msg">{err}</p>}
          <button className="primary-btn" onClick={nextStep}>Continue →</button>
        </>
      )}

      {step === 2 && (
        <>
          <div className="form-head">
            <button className="back-btn" onClick={() => { setStep(1); setErr(""); }}>← Back</button>
            <h2 className="form-title">Your operating zone</h2>
            <p className="form-sub">Helps us calculate your localized risk score</p>
          </div>

          <div className="field-grid" style={{ position: 'relative' }}>
            <Field label="Country" placeholder="India" value={f.country} onChange={set("country")} />
            
            <Field label="City / Zone" placeholder="Bengaluru" value={f.city} onChange={set("city")} />
            <button 
              onClick={detectLocation}
              disabled={loading}
              style={{ position: 'absolute', right: 0, top: 96, background: 'none', border: 'none', color: '#a78bfa', cursor: loading ? 'wait' : 'pointer', fontSize: 13, fontWeight: 700, padding: 12 }}
            >
              📍 Auto-Detect
            </button>
          </div>

          <label className="field-label" style={{ marginTop: 12 }}>Delivery platform</label>
          <div className="chip-group">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                className={cls("chip", f.platform === p && "chip-on")}
                onClick={() => setPlatform(p)}
              >
                {p}
              </button>
            ))}
          </div>

          {err && <p className="err-msg">{err}</p>}
          <button className="primary-btn" onClick={submit} disabled={loading} style={{ marginTop: 20 }}>
            {loading ? <Spinner /> : "Create & Verify →"}
          </button>
        </>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   OTP SCREEN  →  verifyOTP
═══════════════════════════════════════════════════════════ */
function OtpScreen({ phone, payload, onSuccess, onBack }) {
  const [otp, setOtp] = useState(["","","","","",""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [err, setErr] = useState("");
  const [countdown, setCountdown] = useState(30);
  const refs = Array.from({ length: 6 }, () => useRef(null)); // eslint-disable-line

  useEffect(() => {
    refs[0].current?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const change = (val, i) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) refs[i + 1].current?.focus();
  };

  const keyDown = (e, i) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs[i - 1].current?.focus();
  };

  const paste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);
    if (text.length === 6) {
      setOtp(text.split(""));
      refs[5].current?.focus();
    }
  };

  const verify = async () => {
    const code = otp.join("");
    if (code.length < 6) { setErr("Enter the full 6-digit OTP."); return; }
    setErr(""); setLoading(true);

    // Mock OTP Verification (use 123456 as the demo OTP)
    if (code !== '123456') { 
      setLoading(false);
      setErr("Invalid OTP. For demo purposes, use 123456"); 
      return; 
    }

    // Update verified status
    const rawPhone = phone.replace(/\D/g, "").slice(-10);
    await supabase
      .from('users')
      .update({ phone_number_verified: true })
      .eq('phone', rawPhone);

    localStorage.setItem('userPhone', rawPhone);

    setLoading(false);
    onSuccess();
  };

  const resend = async () => {
    setResending(true);
    await new Promise(r => setTimeout(r, 1000));
    setResending(false);
    setCountdown(30);
    setOtp(["","","","","",""]);
    refs[0].current?.focus();
  };

  const display = phone.replace(/^91/, "");

  return (
    <div className="anim-in">
      <div className="form-head">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2 className="form-title">Verify your number</h2>
        <p className="form-sub">OTP sent to +91 {display}</p>
      </div>

      <label className="field-label">6-digit OTP</label>
      <div className="otp-row" onPaste={paste}>
        {otp.map((v, i) => (
          <input
            key={i}
            ref={refs[i]}
            className={cls("otp-box", v && "otp-filled")}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={v}
            onChange={(e) => change(e.target.value, i)}
            onKeyDown={(e) => keyDown(e, i)}
          />
        ))}
      </div>

      {err && <p className="err-msg">{err}</p>}

      <button className="primary-btn" onClick={verify} disabled={loading}>
        {loading ? <Spinner /> : "Verify OTP →"}
      </button>

      <div className="resend-row">
        {countdown > 0
          ? <span className="resend-hint">Resend in {countdown}s</span>
          : (
            <button className="txt-btn" onClick={resend} disabled={resending}>
              {resending ? "Sending…" : "Resend OTP"}
            </button>
          )
        }
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   DONE SCREEN
═══════════════════════════════════════════════════════════ */
function DoneScreen({ isNewUser }) {
  const navigate = useNavigate();
  return (
    <div className="anim-in done-screen">
      <div className="done-icon">✓</div>
      <h2 className="form-title" style={{ textAlign: "center" }}>You're verified!</h2>
      <p className="form-sub" style={{ textAlign: "center", maxWidth: 280 }}>
        Your phone number is confirmed. GigShield is now monitoring
        disruptions in your zone 24 / 7.
      </p>

      {!isNewUser ? (
        <>
          <div className="done-cards">
            {[
              { label: "Coverage starts", value: "This Monday" },
              { label: "Claim method",    value: "Fully automatic" },
              { label: "Payout channel",  value: "UPI instant" },
            ].map(({ label, value }) => (
              <div key={label} className="done-row">
                <span className="done-key">{label}</span>
                <span className="done-val">{value}</span>
              </div>
            ))}
          </div>
          <button className="primary-btn" onClick={() => navigate('/dashboard')}>Go to Dashboard →</button>
        </>
      ) : (
        <>
          <div className="done-cards" style={{ padding: '24px 20px', textAlign: 'center', background: 'rgba(124, 58, 237, 0.05)', borderColor: 'rgba(124, 58, 237, 0.2)' }}>
            <span className="done-key" style={{ color: '#fff', fontSize: '14.5px', lineHeight: 1.5, display: 'block' }}>
              Final Step! Select your Parametric Insurance Plan to activate your Dashboard.
            </span>
          </div>
          <button className="primary-btn" onClick={() => navigate('/dashboard/plans')}>Choose Plan →</button>
        </>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   SHARED SMALL COMPONENTS
═══════════════════════════════════════════════════════════ */
function Logo() {
  return (
    <div className="logo">
      <span className="logo-icon">⚡</span>
      <span className="logo-text">GigShield</span>
    </div>
  );
}

function Field({ label, placeholder, value, onChange, type = "text" }) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <div className="field-wrap">
      <label className="field-label">{label}</label>
      <div className="inp-wrap">
        <input
          className="text-inp"
          type={isPass ? (show ? "text" : "password") : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        {isPass && (
          <button className="eye-btn" tabIndex={-1} onClick={() => setShow((s) => !s)}>
            {show ? "🙈" : "👁"}
          </button>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return <span className="spinner" />;
}

/* ════════════════════════════════════════════════════════
   LEFT PANEL
═══════════════════════════════════════════════════════════ */
function LeftPanel() {
  const events = [
    { zone: "Chennai · Zone 4", event: "Heavy rain · 94 mm", amt: "+₹420", color: "#2563eb", delay: "0s" },
    { zone: "Delhi · Zone 7",   event: "AQI spike · 318",    amt: "+₹380", color: "#7c3aed", delay: "0.15s" },
    { zone: "Mumbai · Zone 2",  event: "Civic strike",        amt: "+₹510", color: "#059669", delay: "0.3s" },
  ];

  return (
    <>
      <div className="lp-logo">
        <span className="logo-icon">⚡</span>
        <span className="logo-text">GigShield</span>
      </div>

      <div className="lp-hero">
        <h1 className="lp-h1">Income<br /><span className="lp-grad">protected.</span></h1>
        <p className="lp-sub">
          Parametric insurance for India's delivery partners.
          Disruption fires. Payout lands. Zero paperwork.
        </p>
      </div>

      <div className="lp-cards">
        {events.map((ev) => (
          <div key={ev.zone} className="ev-card" style={{ animationDelay: ev.delay }}>
            <div className="ev-dot" style={{ background: ev.color }} />
            <div className="ev-body">
              <span className="ev-zone">{ev.zone}</span>
              <span className="ev-event">{ev.event}</span>
            </div>
            <span className="ev-amt">{ev.amt}</span>
          </div>
        ))}
      </div>

      <p className="lp-foot">84,000+ riders protected · ₹29 / week</p>

      {/* decorative blobs */}
      <div className="blob blob-a" />
      <div className="blob blob-b" />
    </>
  );
}

/* ════════════════════════════════════════════════════════
   GLOBAL CSS
═══════════════════════════════════════════════════════════ */
function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800;900&display=swap');

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      :root {
        --bg:      #07071a;
        --surface: #0f0f26;
        --border:  rgba(255,255,255,0.08);
        --border2: rgba(255,255,255,0.14);
        --text:    #e8e8f2;
        --muted:   #7070a0;
        --accent:  #7c3aed;
        --accent2: #2563eb;
        --green:   #10b981;
        --red:     #f87171;
        --font:    'Figtree', 'DM Sans', sans-serif;
        --radius:  12px;
      }

      body { font-family: var(--font); background: var(--bg); color: var(--text); }

      /* ── layout ── */
      .root {
        display: flex;
        min-height: 100vh;
      }

      .left-panel {
        flex: 1;
        position: relative;
        overflow: hidden;
        background: linear-gradient(150deg, #0e0830 0%, #07071a 70%);
        border-right: 1px solid var(--border);
        padding: 52px 48px;
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .right-panel {
        width: 460px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px 32px;
        overflow-y: auto;
      }

      .form-shell {
        width: 100%;
        max-width: 380px;
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      /* ── logo ── */
      .logo {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 32px;
      }
      .logo-icon { font-size: 22px; }
      .logo-text  { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #fff; }

      /* ── form head ── */
      .form-head   { margin-bottom: 24px; }
      .form-title  { font-size: 26px; font-weight: 800; letter-spacing: -0.8px; color: #fff; margin-bottom: 6px; }
      .form-sub    { font-size: 14px; color: var(--muted); }

      /* ── step bar ── */
      .step-bar { display: flex; gap: 6px; margin-bottom: 28px; }
      .step-seg {
        height: 3px; flex: 1; border-radius: 2px;
        background: rgba(255,255,255,0.1);
        transition: background 0.3s;
      }
      .step-active { background: var(--accent); }

      /* ── field ── */
      .field-grid   { display: flex; flex-direction: column; gap: 0; }
      .field-wrap   { margin-bottom: 14px; }
      .field-label  {
        display: block; font-size: 11px; font-weight: 700;
        color: var(--muted); letter-spacing: 0.8px;
        text-transform: uppercase; margin-bottom: 6px;
      }
      .inp-wrap { position: relative; }
      .text-inp {
        width: 100%;
        background: rgba(255,255,255,0.04);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 11px 14px;
        font-size: 15px; font-family: var(--font);
        color: var(--text); outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .text-inp:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px rgba(124,58,237,0.14);
      }
      .text-inp::placeholder { color: #3a3a60; }
      .eye-btn {
        position: absolute; right: 12px; top: 50%;
        transform: translateY(-50%);
        background: none; border: none; cursor: pointer; font-size: 14px;
      }

      /* ── phone ── */
      .phone-wrap {
        display: flex; align-items: center;
        background: rgba(255,255,255,0.04);
        border: 1px solid var(--border); border-radius: var(--radius);
        overflow: hidden; margin-bottom: 16px;
        transition: border-color 0.2s;
      }
      .phone-wrap:focus-within {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px rgba(124,58,237,0.14);
      }
      .phone-pfx {
        padding: 11px 14px; font-size: 15px;
        color: var(--muted); font-weight: 600;
        border-right: 1px solid var(--border);
        white-space: nowrap;
      }
      .phone-inp {
        flex: 1; background: transparent; border: none; outline: none;
        padding: 11px 14px; font-size: 15px;
        color: var(--text); font-family: var(--font);
      }
      .phone-inp::placeholder { color: #3a3a60; }

      /* ── chip group ── */
      .chip-group { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 4px; }
      .chip {
        background: rgba(255,255,255,0.04);
        border: 1px solid var(--border);
        border-radius: 8px; padding: 7px 14px;
        font-size: 13px; font-weight: 500;
        color: var(--muted); cursor: pointer;
        font-family: var(--font);
        transition: all 0.15s;
      }
      .chip:hover { border-color: var(--border2); color: var(--text); }
      .chip-on {
        background: rgba(124,58,237,0.15);
        border-color: rgba(124,58,237,0.5);
        color: #c4b5fd;
      }

      /* ── otp ── */
      .otp-row { display: flex; gap: 8px; margin-bottom: 20px; }
      .otp-box {
        flex: 1; height: 52px; min-width: 0; width: 0;
        background: rgba(255,255,255,0.04);
        border: 1px solid var(--border); border-radius: var(--radius);
        text-align: center; font-size: 22px; font-weight: 700;
        color: #fff; outline: none; font-family: var(--font);
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .otp-box:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px rgba(124,58,237,0.14);
      }
      .otp-filled { border-color: rgba(124,58,237,0.4); color: #c4b5fd; }

      /* ── primary btn ── */
      .primary-btn {
        width: 100%;
        background: linear-gradient(135deg, var(--accent), var(--accent2));
        color: #fff; border: none; border-radius: var(--radius);
        padding: 13px; font-size: 15px; font-weight: 700;
        cursor: pointer; font-family: var(--font);
        display: flex; align-items: center; justify-content: center; gap: 8px;
        letter-spacing: -0.1px;
        box-shadow: 0 6px 24px rgba(124,58,237,0.3);
        transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
        margin-top: 4px;
      }
      .primary-btn:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 10px 32px rgba(124,58,237,0.45);
      }
      .primary-btn:active:not(:disabled) { transform: scale(0.99); }
      .primary-btn:disabled { opacity: 0.5; cursor: not-allowed; }

      /* ── misc ── */
      .back-btn {
        background: none; border: none; color: var(--muted); font-size: 13px;
        cursor: pointer; padding: 0; margin-bottom: 12px; font-family: var(--font); font-weight: 500;
      }
      .back-btn:hover { color: var(--text); }
      .err-msg { font-size: 13px; color: var(--red); margin-bottom: 12px; }
      .switch-row {
        font-size: 13px; color: var(--muted); text-align: center; margin-top: 20px;
      }
      .txt-btn {
        background: none; border: none; color: #a78bfa; font-family: var(--font);
        font-size: inherit; cursor: pointer; font-weight: 600; padding: 0;
      }
      .txt-btn:hover { color: #c4b5fd; }
      .resend-row { text-align: center; margin-top: 8px; }
      .resend-hint { font-size: 13px; color: var(--muted); }

      /* ── spinner ── */
      .spinner {
        width: 18px; height: 18px; border-radius: 50%;
        border: 2px solid rgba(255,255,255,0.3);
        border-top-color: #fff;
        animation: spin 0.7s linear infinite;
        display: inline-block;
      }
      @keyframes spin { to { transform: rotate(360deg); } }

      /* ── done screen ── */
      .done-screen { display: flex; flex-direction: column; align-items: center; gap: 12px; }
      .done-icon {
        width: 64px; height: 64px; border-radius: 50%;
        background: rgba(16,185,129,0.12);
        border: 1px solid rgba(16,185,129,0.3);
        display: flex; align-items: center; justify-content: center;
        font-size: 28px; color: var(--green);
        margin-bottom: 8px;
      }
      .done-cards {
        width: 100%;
        background: rgba(255,255,255,0.03);
        border: 1px solid var(--border); border-radius: var(--radius);
        padding: 16px 20px;
        display: flex; flex-direction: column; gap: 10px; margin-bottom: 4px;
      }
      .done-row   { display: flex; justify-content: space-between; font-size: 13px; }
      .done-key   { color: var(--muted); }
      .done-val   { color: #c0c0d8; font-weight: 600; }

      /* ── left panel ── */
      .lp-logo {
        display: flex; align-items: center; gap: 8px; margin-bottom: 52px;
      }
      .lp-h1 {
        font-size: 52px; font-weight: 900; letter-spacing: -2.5px;
        line-height: 1.08; color: #fff; margin-bottom: 16px;
      }
      .lp-grad {
        background: linear-gradient(135deg, #7c3aed, #2563eb, #06b6d4);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      }
      .lp-sub {
        font-size: 15px; color: var(--muted); line-height: 1.7; max-width: 360px;
      }
      .lp-hero  { margin-bottom: 40px; }
      .lp-cards { display: flex; flex-direction: column; gap: 10px; flex: 1; }
      .lp-foot  { font-size: 12px; color: #36365a; margin-top: 32px; font-weight: 500; }

      /* live event cards */
      .ev-card {
        display: flex; align-items: center; gap: 12px;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 12px; padding: 14px 16px;
        animation: slideIn 0.5s ease both;
      }
      .ev-dot {
        width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
        animation: pulse 2s infinite;
      }
      .ev-body { flex: 1; display: flex; flex-direction: column; gap: 2px; }
      .ev-zone  { font-size: 13px; font-weight: 700; color: #ddd; }
      .ev-event { font-size: 11px; color: var(--muted); }
      .ev-amt   { font-size: 15px; font-weight: 800; color: var(--green); letter-spacing: -0.3px; }

      /* decorative blobs */
      .blob {
        position: absolute; border-radius: 50%; pointer-events: none;
        animation: blobFloat 8s ease-in-out infinite;
      }
      .blob-a {
        width: 500px; height: 500px;
        background: radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 70%);
        top: -150px; left: -150px;
      }
      .blob-b {
        width: 400px; height: 400px;
        background: radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%);
        bottom: -80px; right: -80px;
        animation-delay: 4s;
      }

      /* ── animations ── */
      @keyframes slideIn {
        from { opacity: 0; transform: translateX(-14px); }
        to   { opacity: 1; transform: translateX(0); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50%       { opacity: 0.5; transform: scale(0.75); }
      }
      @keyframes blobFloat {
        0%, 100% { transform: scale(1); }
        50%       { transform: scale(1.08); }
      }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(20px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .anim-in { animation: fadeUp 0.4s ease both; }

      /* ── scrollbar ── */
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.3); border-radius: 2px; }

      /* ── responsive ── */
      @media (max-width: 800px) {
        .left-panel  { display: none; }
        .right-panel { width: 100%; padding: 32px 20px; align-items: flex-start; padding-top: 60px; }
      }
    `}</style>
  );
}