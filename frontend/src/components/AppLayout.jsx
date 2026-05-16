import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { 
  SquaresFour, 
  FolderOpen, 
  CheckSquareOffset, 
  UserCircle, 
  SignOut,
  Lightning
} from '@phosphor-icons/react';

export default function AppLayout() {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); navigate('/login');
  };

  return (
    <div className="app-shell">
      {/* Background Orbs */}
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>
      <div className="bg-orb orb-3"></div>

      <nav className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon"><Lightning size={24} weight="fill" /></div>
          <span>TaskFlow</span>
        </div>
        
        <div className="sidebar-nav">
          <div className="nav-label">Main Menu</div>
          <NavLink to="/" className={({isActive})=>`nav-link ${isActive?'active':''}`} end><SquaresFour size={20} weight="duotone" /> Dashboard</NavLink>
          <NavLink to="/projects" className={({isActive})=>`nav-link ${isActive?'active':''}`}><FolderOpen size={20} weight="duotone" /> Projects</NavLink>
          <NavLink to="/tasks" className={({isActive})=>`nav-link ${isActive?'active':''}`}><CheckSquareOffset size={20} weight="duotone" /> Tasks</NavLink>
          
          <div className="nav-label" style={{marginTop: 20}}>Account</div>
          <NavLink to="/profile" className={({isActive})=>`nav-link ${isActive?'active':''}`}><UserCircle size={20} weight="duotone" /> Profile</NavLink>
        </div>

        <div className="sidebar-user">
          <div className="avatar avatar-sm" style={{background:'var(--grad-primary)'}}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:600,fontSize:'.85rem',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{user?.firstName} {user?.lastName}</div>
            <div style={{fontSize:'.75rem',color:'var(--text-muted)'}}>{user?.role}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Logout"><SignOut size={16} weight="duotone" /></button>
        </div>
      </nav>

      <main className="main-content">
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
