import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Zap, Mail, Lock, User, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'member' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { signup } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.name.trim())                          e.name            = 'Name is required';
    if (!form.email)                                e.email           = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email))     e.email           = 'Enter a valid email';
    if (!form.password)                             e.password        = 'Password is required';
    else if (form.password.length < 6)              e.password        = 'Minimum 6 characters';
    if (form.password !== form.confirmPassword)     e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password, form.role);
      toast.success('Account created! Welcome 🚀');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally { setLoading(false); }
  };

  const Field = ({ id, label, type = 'text', icon: Icon, placeholder, field, children }) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <Icon size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }} />
        <input id={id} type={type} className="form-input" style={{ paddingLeft: '2.5rem' }}
          placeholder={placeholder} value={form[field]}
          onChange={e => setForm({ ...form, [field]: e.target.value })} />
        {children}
      </div>
      {errors[field] && <p className="form-error">⚠ {errors[field]}</p>}
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1.5rem',
      background: 'radial-gradient(ellipse 65% 55% at 80% 100%, rgba(139,92,246,0.12) 0%, transparent 60%), var(--bg)',
    }}>
      <div style={{ position: 'fixed', top: '10%', right: '-8%', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '0%', left: '-8%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.07), transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 440 }} className="animate-slide-up">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: 60, height: 60, borderRadius: 18, margin: '0 auto 1rem',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(99,102,241,0.45)',
          }}>
            <Zap size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.03em' }}>
            Create Account
          </h1>
          <p style={{ color: '#475569', fontSize: '0.875rem', marginTop: '0.4rem' }}>
            Join your team on <span className="gradient-text" style={{ fontWeight: 700 }}>FlowTrack</span>
          </p>
        </div>

        <div className="glass-card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} noValidate>
            <Field id="signup-name"  label="Full Name"     icon={User}   placeholder="John Doe"           field="name" />
            <Field id="signup-email" label="Email Address" icon={Mail}   placeholder="you@example.com" field="email" type="email" />

            {/* Role select */}
            <div className="form-group">
              <label className="form-label">Role</label>
              <div style={{ position: 'relative' }}>
                <Shield size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                <select id="signup-role" className="form-input" style={{ paddingLeft: '2.5rem' }}
                  value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                <input id="signup-password" type={showPass ? 'text' : 'password'} className="form-input"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                  placeholder="Min. 6 characters" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="form-error">⚠ {errors.password}</p>}
            </div>

            {/* Confirm */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                <input id="signup-confirm" type="password" className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Repeat password" value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
              </div>
              {errors.confirmPassword && <p className="form-error">⚠ {errors.confirmPassword}</p>}
            </div>

            <button id="signup-submit" type="submit" className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', fontSize: '0.95rem' }}
              disabled={loading}>
              {loading
                ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                : <><span>Create Account</span><ArrowRight size={17} /></>}
            </button>
          </form>

          <div className="divider" />
          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#475569' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#818cf8', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
