import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ArrowLeft,
  Wifi,
  KeyRound,
  Mail
} from 'lucide-react';
import { authApi } from '../services/api';

/* ─── shared input style ─── */
const inp = {
  padding: '11px 14px', borderRadius: '10px',
  border: '1.5px solid #e4ecf2', fontSize: '14px',
  outline: 'none', fontFamily: 'inherit', width: '100%',
  transition: 'border-color 0.18s, box-shadow 0.18s',
  boxSizing: 'border-box',
};
const focus = (e) => { e.target.style.borderColor = '#0d9e6e'; e.target.style.boxShadow = '0 0 0 3px rgba(13,158,110,0.1)'; };
const blur  = (e) => { e.target.style.borderColor = '#e4ecf2'; e.target.style.boxShadow = 'none'; };

/* ─── reusable label ─── */
const Label = ({ children }) => (
  <label style={{ fontSize:'12px', fontWeight:600, color:'#5a6a7a', textTransform:'uppercase', letterSpacing:'0.04em' }}>
    {children}
  </label>
);

/* ─── reusable field wrapper ─── */
const Field = ({ children }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>{children}</div>
);

/* ─── error box ─── */
const ErrorBox = ({ msg }) => msg ? (
  <div style={{ background:'#fff5f5', border:'1px solid rgba(229,62,62,0.2)', borderRadius:'8px', padding:'10px 14px', fontSize:'13px', color:'#e53e3e' }}>
    {msg}
  </div>
) : null;

/* ─── success box ─── */
const SuccessBox = ({ msg }) => msg ? (
  <div style={{ background:'#d4f5e9', border:'1px solid rgba(13,158,110,0.25)', borderRadius:'8px', padding:'10px 14px', fontSize:'13px', color:'#0a6e4a' }}>
    {msg}
  </div>
) : null;

/* ══════════════════════════════════════════════
   LOGIN VIEW
══════════════════════════════════════════════ */
const LoginView = ({ onLogin, onRegister, onForgot }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) { setError('Please enter both username and password.'); return; }
    setLoading(true);
    try {
      const response = await authApi.login(username, password);
      const token = response?.access_token;
      if (!token) throw new Error('Missing token');
      localStorage.setItem('jwt_token', token);
      if (onLogin) onLogin();
      navigate('/');
    } catch (err) {
      setError(err.message || 'Incorrect username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 style={{ fontSize:'18px', fontWeight:700, color:'#1a202c', marginBottom:'4px' }}>Welcome back</h2>
      <p style={{ fontSize:'13px', color:'#5a6a7a', marginBottom:'22px' }}>Sign in to access patient records</p>

      <ErrorBox msg={error} />

      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'15px', marginTop: error ? '14px' : 0 }}>
        <Field>
          <Label>Username</Label>
          <input type="text" placeholder="e.g. doctor@phc.in" value={username}
            onChange={e => setUsername(e.target.value)} autoFocus style={inp}
            onFocus={focus} onBlur={blur}/>
        </Field>

        <Field>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <Label>Password</Label>
            <button type="button" onClick={onForgot}
              style={{ background:'none', border:'none', cursor:'pointer', fontSize:'12px', color:'#0d9e6e', fontWeight:600, fontFamily:'inherit', padding:0 }}>
              Forgot password?
            </button>
          </div>
          <div style={{ position:'relative' }}>
            <input type={showPw ? 'text' : 'password'} placeholder="Enter your password"
              value={password} onChange={e => setPassword(e.target.value)}
              style={{ ...inp, paddingRight:'42px' }} onFocus={focus} onBlur={blur}/>
            <button type="button" onClick={() => setShowPw(p => !p)} aria-label={showPw ? 'Hide password' : 'Show password'}
              style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9aacbb', padding:0, display:'flex' }}>
              {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>
        </Field>

        <button type="submit" disabled={loading} style={{
          display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
          background: loading ? '#9aacbb' : '#0d9e6e', color:'#fff', border:'none',
          padding:'13px', borderRadius:'10px', fontWeight:600, fontSize:'14px',
          cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'inherit', marginTop:'4px',
          boxShadow: loading ? 'none' : '0 4px 12px rgba(13,158,110,0.3)', transition:'all 0.18s',
        }}>
          {loading
            ? <><Spinner/> Signing in…</>
            : <><LogIn size={16}/> Sign In</>
          }
        </button>
      </form>

      <div style={{ position:'relative', margin:'20px 0 16px', textAlign:'center' }}>
        <div style={{ position:'absolute', top:'50%', left:0, right:0, height:'1px', background:'#e4ecf2' }}/>
        <span style={{ position:'relative', background:'#fff', padding:'0 12px', fontSize:'12px', color:'#9aacbb' }}>New to ArogyaSync?</span>
      </div>

      <button type="button" onClick={onRegister} style={{
        display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
        width:'100%', background:'#fff', color:'#0d9e6e',
        border:'1.5px solid rgba(13,158,110,0.35)', padding:'11px', borderRadius:'10px',
        fontWeight:600, fontSize:'14px', cursor:'pointer', fontFamily:'inherit',
        transition:'all 0.18s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = '#f0fdf8'; e.currentTarget.style.borderColor = '#0d9e6e'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = 'rgba(13,158,110,0.35)'; }}
      >
        <UserPlus size={16}/> Create New Account
      </button>
    </>
  );
};

/* ══════════════════════════════════════════════
   REGISTER VIEW
══════════════════════════════════════════════ */
const RegisterView = ({ onBack }) => {
  const [form,    setForm]    = useState({ fullName:'', role:'Medical Officer', username:'', password:'', confirm:'', facilityCode:'' });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.fullName || !form.username || !form.password || !form.confirm) { setError('Please fill in all required fields.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match. Please check and try again.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      await authApi.register({
        username: form.username,
        full_name: form.fullName,
        role: form.role.toUpperCase().replace(/\s+/g, '_'),
        password: form.password,
      });
      setSuccess('Account created successfully! You can now sign in with your credentials.');
      setForm({ fullName:'', role:'Medical Officer', username:'', password:'', confirm:'', facilityCode:'' });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button type="button" onClick={onBack}
        style={{ display:'flex', alignItems:'center', gap:'6px', background:'none', border:'none', cursor:'pointer', color:'#5a6a7a', fontSize:'13px', fontWeight:500, fontFamily:'inherit', padding:0, marginBottom:'16px' }}>
        <ArrowLeft size={15}/> Back to Sign In
      </button>

      <h2 style={{ fontSize:'18px', fontWeight:700, color:'#1a202c', marginBottom:'4px' }}>Create Account</h2>
      <p style={{ fontSize:'13px', color:'#5a6a7a', marginBottom:'20px' }}>Register a new staff account for this PHC</p>

      <ErrorBox msg={error}/>
      <SuccessBox msg={success}/>

      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'14px', marginTop: (error||success) ? '14px' : 0 }}>
        <Field>
          <Label>Full Name *</Label>
          <input type="text" placeholder="e.g. Dr. Anjali Sharma" value={form.fullName} onChange={set('fullName')} autoFocus style={inp} onFocus={focus} onBlur={blur}/>
        </Field>

        <Field>
          <Label>Role</Label>
          <select value={form.role} onChange={set('role')} style={inp} onFocus={focus} onBlur={blur}>
            <option>Medical Officer</option>
            <option>Nurse</option>
            <option>Pharmacist</option>
            <option>Lab Technician</option>
            <option>Admin Staff</option>
          </select>
        </Field>

        <Field>
          <Label>Username *</Label>
          <input type="text" placeholder="e.g. dr.anjali" value={form.username} onChange={set('username')} style={inp} onFocus={focus} onBlur={blur}/>
        </Field>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          <Field>
            <Label>Password *</Label>
            <div style={{ position:'relative' }}>
              <input type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters"
                value={form.password} onChange={set('password')}
                style={{ ...inp, paddingRight:'38px' }} onFocus={focus} onBlur={blur}/>
              <button type="button" onClick={() => setShowPw(p => !p)}
                style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9aacbb', padding:0, display:'flex' }}>
                {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
              </button>
            </div>
          </Field>
          <Field>
            <Label>Confirm Password *</Label>
            <input type="password" placeholder="Re-enter password"
              value={form.confirm} onChange={set('confirm')} style={inp} onFocus={focus} onBlur={blur}/>
          </Field>
        </div>

        <Field>
          <Label>Facility Code <span style={{ fontWeight:400, color:'#9aacbb', textTransform:'none', letterSpacing:0 }}>(optional)</span></Label>
          <input type="text" placeholder="e.g. PHC-KL-0042" value={form.facilityCode} onChange={set('facilityCode')} style={inp} onFocus={focus} onBlur={blur}/>
        </Field>

        <button type="submit" disabled={loading} style={{
          display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
          background: loading ? '#9aacbb' : '#0d9e6e', color:'#fff', border:'none',
          padding:'13px', borderRadius:'10px', fontWeight:600, fontSize:'14px',
          cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'inherit', marginTop:'4px',
          boxShadow: loading ? 'none' : '0 4px 12px rgba(13,158,110,0.3)',
        }}>
          {loading ? <><Spinner/> Creating Account…</> : <><UserPlus size={16}/> Create Account</>}
        </button>
      </form>
    </>
  );
};

/* ══════════════════════════════════════════════
   FORGOT PASSWORD VIEW
══════════════════════════════════════════════ */
const ForgotView = ({ onBack }) => {
  const [username, setUsername] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [sent,     setSent]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username) { setError('Please enter your username or registered email.'); return; }
    setLoading(true);
    try {
      /* ── Real API call ──────────────────────────────
         const res = await fetch('/api/v1/auth/forgot-password', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ username }),
         });
         if (!res.ok) throw new Error('Not found');
      ─────────────────────────────────────────────── */
      await new Promise(r => setTimeout(r, 900));
      setSent(true);
    } catch {
      setError('We could not find an account with that username. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button type="button" onClick={onBack}
        style={{ display:'flex', alignItems:'center', gap:'6px', background:'none', border:'none', cursor:'pointer', color:'#5a6a7a', fontSize:'13px', fontWeight:500, fontFamily:'inherit', padding:0, marginBottom:'16px' }}>
        <ArrowLeft size={15}/> Back to Sign In
      </button>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', width:48, height:48, borderRadius:'14px', background:'rgba(13,158,110,0.1)', border:'1px solid rgba(13,158,110,0.2)', marginBottom:'16px' }}>
        <KeyRound size={22} style={{ color:'#0d9e6e' }}/>
      </div>

      <h2 style={{ fontSize:'18px', fontWeight:700, color:'#1a202c', marginBottom:'4px' }}>Reset Password</h2>
      <p style={{ fontSize:'13px', color:'#5a6a7a', marginBottom:'22px', lineHeight:1.6 }}>
        Enter your username and we'll send a reset link to your registered email address.
      </p>

      {sent ? (
        <div style={{ textAlign:'center', padding:'20px 0' }}>
          <div style={{ width:52, height:52, borderRadius:'50%', background:'var(--color-green-light, #d4f5e9)', border:'2px solid #0d9e6e', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
            <Mail size={22} style={{ color:'#0d9e6e' }}/>
          </div>
          <p style={{ fontWeight:600, fontSize:'15px', color:'#1a202c', marginBottom:'8px' }}>Check your email</p>
          <p style={{ fontSize:'13px', color:'#5a6a7a', lineHeight:1.6 }}>
            If an account exists for <strong>{username}</strong>, a password reset link has been sent. Check your inbox and follow the instructions.
          </p>
          <button type="button" onClick={onBack} style={{
            marginTop:'20px', display:'inline-flex', alignItems:'center', gap:'6px',
            background:'#0d9e6e', color:'#fff', border:'none', padding:'10px 20px',
            borderRadius:'9px', fontWeight:600, fontSize:'13px', cursor:'pointer', fontFamily:'inherit',
          }}>
            <ArrowLeft size={14}/> Back to Sign In
          </button>
        </div>
      ) : (
        <>
          <ErrorBox msg={error}/>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'14px', marginTop: error ? '14px' : 0 }}>
            <Field>
              <Label>Username or Email</Label>
              <input type="text" placeholder="e.g. dr.anjali or doctor@phc.in"
                value={username} onChange={e => setUsername(e.target.value)}
                autoFocus style={inp} onFocus={focus} onBlur={blur}/>
            </Field>
            <button type="submit" disabled={loading} style={{
              display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
              background: loading ? '#9aacbb' : '#0d9e6e', color:'#fff', border:'none',
              padding:'13px', borderRadius:'10px', fontWeight:600, fontSize:'14px',
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'inherit',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(13,158,110,0.3)',
            }}>
              {loading ? <><Spinner/> Sending…</> : <><Mail size={16}/> Send Reset Link</>}
            </button>
          </form>
        </>
      )}
    </>
  );
};

/* ── tiny spinner ── */
const Spinner = () => (
  <span style={{ width:15, height:15, border:'2px solid rgba(255,255,255,0.35)', borderTop:'2px solid #fff', borderRadius:'50%', display:'inline-block', animation:'spin 1s linear infinite' }}/>
);

/* ══════════════════════════════════════════════
   MAIN LOGIN PAGE  (orchestrates the three views)
══════════════════════════════════════════════ */
const Login = ({ onLogin }) => {
  const [view, setView] = useState('login'); // 'login' | 'register' | 'forgot'

  return (
    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(135deg, #0f2027 0%, #0d3040 55%, #0a1f2a 100%)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:'24px', fontFamily:"'Inter', -apple-system, sans-serif",
    }}>
      <div style={{ width:'100%', maxWidth: view === 'register' ? '460px' : '400px', transition:'max-width 0.25s ease' }}>

        {/* Brand */}
        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <div style={{
            width:52, height:52, margin:'0 auto 14px',
            background:'rgba(13,158,110,0.15)', border:'1px solid rgba(13,158,110,0.4)',
            borderRadius:'15px', display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <svg viewBox="0 0 24 24" width="28" height="28">
              <rect x="3" y="3" width="18" height="18" rx="5" fill="#0d9e6e"/>
              <path d="M12 7v10M7 12h10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 style={{ color:'#fff', fontSize:'21px', fontWeight:700, marginBottom:'3px', letterSpacing:'-0.02em' }}>ArogyaSync</h1>
          <p style={{ color:'#6b8fa3', fontSize:'12.5px' }}>Primary Health Centre Management System</p>
        </div>

        {/* Card */}
        <div style={{ background:'#fff', borderRadius:'20px', padding:'28px 32px', boxShadow:'0 24px 48px rgba(0,0,0,0.3)' }}>
          {view === 'login'    && <LoginView    onLogin={onLogin} onRegister={() => setView('register')} onForgot={() => setView('forgot')}/>}
          {view === 'register' && <RegisterView onBack={() => setView('login')}/>}
          {view === 'forgot'   && <ForgotView   onBack={() => setView('login')}/>}
        </div>

        {/* Footer note */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', marginTop:'18px', color:'#4d7089', fontSize:'12px' }}>
          <Wifi size={13}/>
          <span>Offline-first — works without internet connection</span>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Login;