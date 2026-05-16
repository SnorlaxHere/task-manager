import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lightning } from '@phosphor-icons/react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>
      
      <div className="auth-card">
        <div className="auth-logo mb-6" style={{display:'flex',alignItems:'center',gap:12,justifyContent:'center',marginBottom:32}}>
          <div className="logo-icon" style={{width:48,height:48,borderRadius:'var(--radius)',background:'var(--grad-primary)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 20px var(--accent-glow)'}}><Lightning size={28} weight="fill" color="#fff"/></div>
          <span style={{fontWeight:800,fontSize:'1.5rem',fontFamily:'Outfit, sans-serif'}}>TaskFlow</span>
        </div>
        <h1 className="auth-title" style={{textAlign:'center',fontSize:'1.8rem',marginBottom:8}}>Welcome back</h1>
        <p className="auth-subtitle" style={{textAlign:'center',color:'var(--text-secondary)',marginBottom:32}}>Sign in to your account</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input id="email" className="form-input" type="email" placeholder="alice@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="password" className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
          </div>
          <button id="login-btn" type="submit" className="btn btn-primary w-full" style={{justifyContent:'center',marginTop:16,width:'100%',padding:14}} disabled={loading}>
            {loading ? <span className="spinner"/> : 'Sign In'}
          </button>
        </form>
        <p className="auth-footer" style={{textAlign:'center',marginTop:24}}>Don't have an account? <Link to="/register" style={{color:'var(--accent-light)',fontWeight:600}}>Sign up</Link></p>
        <div style={{marginTop:32,padding:16,background:'rgba(0,0,0,0.2)',borderRadius:'var(--radius-sm)',fontSize:'.85rem',color:'var(--text-muted)',border:'1px solid var(--border)'}}>
          <div style={{marginBottom:8}}><strong style={{color:'var(--text-primary)'}}>Demo credentials:</strong></div>
          <div style={{marginBottom:4}}>Admin: <span style={{color:'var(--text-secondary)'}}>alice@example.com / Admin123</span></div>
          <div>Member: <span style={{color:'var(--text-secondary)'}}>bob@example.com / Member123</span></div>
        </div>
      </div>
    </div>
  );
}
