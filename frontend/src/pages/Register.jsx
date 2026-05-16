import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lightning } from '@phosphor-icons/react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.firstName, form.lastName, form.email, form.password);
      toast.success('Account created! Welcome 🎉');
      navigate('/dashboard');
    } catch (err) {
      const errs = err.response?.data?.errors;
      toast.error(errs ? errs[0].msg : err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="bg-orb orb-2"></div>
      <div className="bg-orb orb-3"></div>
      
      <div className="auth-card">
        <div className="auth-logo mb-6" style={{display:'flex',alignItems:'center',gap:12,justifyContent:'center',marginBottom:32}}>
          <div className="logo-icon" style={{width:48,height:48,borderRadius:'var(--radius)',background:'var(--grad-primary)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 20px var(--accent-glow)'}}><Lightning size={28} weight="fill" color="#fff"/></div>
          <span style={{fontWeight:800,fontSize:'1.5rem',fontFamily:'Outfit, sans-serif'}}>TaskFlow</span>
        </div>
        <h1 className="auth-title" style={{textAlign:'center',fontSize:'1.8rem',marginBottom:8}}>Create account</h1>
        <p className="auth-subtitle" style={{textAlign:'center',color:'var(--text-secondary)',marginBottom:32}}>Start managing your team today</p>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input className="form-input" placeholder="Alice" value={form.firstName} onChange={e=>set('firstName',e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-input" placeholder="Smith" value={form.lastName} onChange={e=>set('lastName',e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="alice@example.com" value={form.email} onChange={e=>set('email',e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Min 8 chars, uppercase, number" value={form.password} onChange={e=>set('password',e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary w-full" style={{justifyContent:'center',marginTop:16,width:'100%',padding:14}} disabled={loading}>
            {loading ? <span className="spinner"/> : 'Create Account'}
          </button>
        </form>
        <p className="auth-footer" style={{textAlign:'center',marginTop:24}}>Already have an account? <Link to="/login" style={{color:'var(--accent-light)',fontWeight:600}}>Sign in</Link></p>
      </div>
    </div>
  );
}
