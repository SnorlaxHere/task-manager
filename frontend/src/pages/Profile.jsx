import { useState } from 'react';
import { UserCircle, LockKey, FloppyDisk } from '@phosphor-icons/react';
import useAuthStore from '../store/authStore';
import api from '../lib/api';
import toast from 'react-hot-toast';
import Avatar from '../components/Avatar';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({ firstName: user?.firstName||'', lastName: user?.lastName||'' });
  const [pwForm, setPwForm] = useState({ current:'', next:'', confirm:'' });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('profile');

  const handleProfileSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const { data } = await api.put(`/users/${user._id}`, form);
      updateUser(data); toast.success('Profile updated!');
    } catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    toast('Password change not implemented in this demo', { icon: 'ℹ️' });
  };

  return (
    <div className="animate-slide-up" style={{maxWidth:560, margin:'0 auto'}}>
      <div className="page-header">
        <div>
          <h1 className="page-title gradient-text">Profile</h1>
          <p className="page-subtitle">Manage your personal information</p>
        </div>
      </div>

      <div style={{display:'flex',alignItems:'center',gap:20,marginBottom:32,background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',padding:'24px 28px',backdropFilter:'blur(12px)',boxShadow:'var(--shadow-sm)'}}>
        <Avatar name={`${user?.firstName} ${user?.lastName}`} size="lg"/>
        <div>
          <h2 style={{fontSize:'1.4rem'}}>{user?.firstName} {user?.lastName}</h2>
          <div style={{color:'var(--text-secondary)',fontSize:'.95rem',marginBottom:8}}>{user?.email}</div>
          <div><span className={`badge badge-${user?.role}`}>{user?.role}</span></div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab-btn${tab==='profile'?' active':''}`} onClick={()=>setTab('profile')}><UserCircle size={18} weight="duotone"/> Profile</button>
        <button className={`tab-btn${tab==='security'?' active':''}`} onClick={()=>setTab('security')}><LockKey size={18} weight="duotone"/> Security</button>
      </div>

      {tab==='profile' && (
        <div className="card">
          <form onSubmit={handleProfileSave}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input className="form-input" value={form.firstName} onChange={e=>setForm(f=>({...f,firstName:e.target.value}))} required/>
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="form-input" value={form.lastName} onChange={e=>setForm(f=>({...f,lastName:e.target.value}))} required/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={user?.email} disabled style={{opacity:.5}}/>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving?<span className="spinner"/>:<><FloppyDisk size={16} weight="bold"/> Save Changes</>}
            </button>
          </form>
        </div>
      )}

      {tab==='security' && (
        <div className="card">
          <form onSubmit={handlePasswordSave}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input className="form-input" type="password" value={pwForm.current} onChange={e=>setPwForm(f=>({...f,current:e.target.value}))} required/>
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input className="form-input" type="password" value={pwForm.next} onChange={e=>setPwForm(f=>({...f,next:e.target.value}))} required/>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input className="form-input" type="password" value={pwForm.confirm} onChange={e=>setPwForm(f=>({...f,confirm:e.target.value}))} required/>
            </div>
            <button type="submit" className="btn btn-primary"><LockKey size={16} weight="bold"/> Update Password</button>
          </form>
        </div>
      )}
    </div>
  );
}
