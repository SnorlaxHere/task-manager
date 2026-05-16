import { Link } from 'react-router-dom';
import { Lightning, CheckSquareOffset, Users, ChartBar, ArrowRight, Shield } from '@phosphor-icons/react';

export default function Landing() {
  return (
    <div style={{background:'var(--bg-primary)',minHeight:'100vh'}}>
      <nav className="landing-nav">
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:34,height:34,borderRadius:'var(--radius-sm)',background:'linear-gradient(135deg,var(--accent),var(--accent-light))',display:'flex',alignItems:'center',justifyContent:'center'}}><Lightning size={16} weight="fill" color="#fff"/></div>
          <span style={{fontWeight:700,fontSize:'1rem'}}>TaskFlow</span>
        </div>
        <div style={{display:'flex',gap:10}}>
          <Link to="/login"><button className="btn btn-secondary btn-sm">Login</button></Link>
          <Link to="/register"><button className="btn btn-primary btn-sm">Get Started</button></Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-badge"><Lightning size={12} weight="fill"/>Team Collaboration Platform</div>
        <h1 className="gradient-text">Manage Projects.<br/>Ship Faster Together.</h1>
        <p>A powerful task manager with role-based access, Kanban boards, and real-time analytics for high-performing teams.</p>
        <div className="hero-cta">
          <Link to="/register"><button className="btn btn-primary btn-lg">Get Started Free <ArrowRight size={16} weight="bold"/></button></Link>
          <Link to="/login"><button className="btn btn-secondary btn-lg">Sign In</button></Link>
        </div>
      </section>

      <section className="features-grid">
        {[
          { icon: <CheckSquareOffset size={24} weight="duotone" color="var(--accent-light)"/>, title:'Task Management', desc:'Create, assign, and track tasks with priorities, due dates, and progress indicators.' },
          { icon: <Users size={24} weight="duotone" color="var(--success)"/>, title:'Team Collaboration', desc:'Invite members, assign roles, and manage who has access to each project.' },
          { icon: <ChartBar size={24} weight="duotone" color="var(--info)"/>, title:'Project Analytics', desc:'Get real-time insights with dashboard stats, progress charts, and deadline tracking.' },
          { icon: <Shield size={24} weight="duotone" color="var(--warning)"/>, title:'Role-Based Access', desc:'Admins control projects; members manage their assigned tasks. Secure by design.' },
        ].map((f,i)=>(
          <div key={i} className="card feature-card">
            <div className="feature-icon mb-4" style={{width:48,height:48,background:'rgba(255,255,255,0.05)',borderRadius:'var(--radius)',display:'flex',alignItems:'center',justifyContent:'center'}}>{f.icon}</div>
            <h3 style={{marginBottom:8}}>{f.title}</h3>
            <p style={{color:'var(--text-secondary)',fontSize:'.875rem',lineHeight:1.6}}>{f.desc}</p>
          </div>
        ))}
      </section>

      <section style={{textAlign:'center',padding:'80px 24px',background:'var(--bg-primary)'}}>
        <h2 style={{marginBottom:12}}>Ready to boost your team's productivity?</h2>
        <p style={{color:'var(--text-secondary)',marginBottom:28}}>Join thousands of teams already using TaskFlow.</p>
        <Link to="/register"><button className="btn btn-primary btn-lg">Start for Free <ArrowRight size={16} weight="bold"/></button></Link>
      </section>

      <footer style={{textAlign:'center',padding:'20px',borderTop:'1px solid var(--border)',color:'var(--text-muted)',fontSize:'.8rem'}}>
        © 2026 TaskFlow · Built with ❤️
      </footer>
    </div>
  );
}
