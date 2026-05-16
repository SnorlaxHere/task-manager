import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckSquareOffset, 
  Clock, 
  Warning, 
  Plus, 
  ArrowRight,
  ClipboardText,
  CheckCircle,
  Lightning,
  Alarm,
  FolderOpen
} from '@phosphor-icons/react';
import api from '../lib/api';
import useAuthStore from '../store/authStore';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';

function StatCard({ label, value, variant, icon }) {
  return (
    <div className={`stat-card ${variant}`}>
      <div className="stat-content">
        <div className="stat-header">
          <div className="stat-label">{label}</div>
          <div className="stat-icon-wrapper">{icon}</div>
        </div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/dashboard/my-tasks'),
      api.get('/dashboard/overdue'),
    ]).then(([s, t, o]) => {
      setStats(s.data);
      setMyTasks(t.data.slice(0,5));
      setOverdue(o.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{display:'flex',justifyContent:'center',paddingTop:60}}><div className="spinner" style={{width:36,height:36}}/></div>;

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="page-title gradient-text">Good {getGreeting()}, {user?.firstName} 👋</h1>
          <p className="page-subtitle">Here's what's happening with your projects today.</p>
        </div>
        <button className="btn btn-primary" onClick={()=>navigate('/projects')}><Plus size={16} weight="bold"/> New Project</button>
      </div>

      {overdue.length > 0 && (
        <div className="overdue-strip mb-4">
          <Warning size={20} weight="duotone"/>
          <strong>{overdue.length} overdue task{overdue.length>1?'s':''}</strong> — review them immediately
          <button className="btn btn-ghost btn-sm" style={{marginLeft:'auto',color:'var(--danger)'}} onClick={()=>navigate('/tasks?filter=overdue')}>View <ArrowRight size={16} weight="bold"/></button>
        </div>
      )}

      <div className="stat-grid">
        <StatCard label="My Tasks" value={stats?.total??0} variant="accent" icon={<ClipboardText size={28} weight="duotone" color="var(--accent-light)"/>}/>
        <StatCard label="Completed" value={stats?.completed??0} variant="success" icon={<CheckCircle size={28} weight="duotone" color="var(--success)"/>}/>
        <StatCard label="In Progress" value={stats?.inProgress??0} variant="info" icon={<Lightning size={28} weight="duotone" color="var(--info)"/>}/>
        <StatCard label="Overdue" value={stats?.overdue??0} variant="danger" icon={<Alarm size={28} weight="duotone" color="var(--danger)"/>}/>
        <StatCard label="Projects" value={stats?.projects??0} variant="warning" icon={<FolderOpen size={28} weight="duotone" color="var(--warning)"/>}/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(400px, 1fr))',gap:20}}>
        <div className="card">
          <div className="card-header">
            <h3>My Tasks</h3>
            <button className="btn btn-ghost btn-sm" onClick={()=>navigate('/tasks')}>See all <ArrowRight size={14} weight="bold"/></button>
          </div>
          {myTasks.length === 0 ? (
            <div className="empty-state" style={{padding:'30px 0'}}>
              <CheckSquareOffset size={48} weight="duotone"/>
              <p>No tasks assigned yet</p>
            </div>
          ) : (
            <div className="task-list">
              {myTasks.map(t => (
                <div key={t._id} className={`task-item priority-${t.priority}`} onClick={()=>navigate(`/tasks/${t._id}`)}>
                  <div className="task-item-info">
                    <div className="task-item-title">{t.title}</div>
                    <div className="task-item-meta">
                      <span>{t.project?.name}</span>
                      {t.dueDate && <span>Due {new Date(t.dueDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="task-badges">
                    <Badge type={t.status}/>
                    <Badge type={t.priority}/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Upcoming Deadlines</h3>
            <Clock size={20} weight="duotone" color="var(--text-muted)"/>
          </div>
          {myTasks.filter(t=>t.dueDate && t.status!=='completed').length === 0 ? (
            <div className="empty-state" style={{padding:'30px 0'}}>
              <Clock size={48} weight="duotone"/>
              <p>No upcoming deadlines</p>
            </div>
          ) : (
            <div className="task-list">
              {myTasks.filter(t=>t.dueDate && t.status!=='completed').slice(0,5).map(t => {
                const due = new Date(t.dueDate);
                const isOverdue = due < new Date();
                return (
                  <div key={t._id} className={`task-item priority-${t.priority}`} onClick={()=>navigate(`/tasks/${t._id}`)}>
                    <div style={{width:8,height:8,borderRadius:'50%',background:isOverdue?'var(--danger)':'var(--success)',flexShrink:0}}/>
                    <div className="task-item-info">
                      <div className="task-item-title">{t.title}</div>
                      <div className="task-item-meta" style={{color:isOverdue?'var(--danger)':'var(--text-muted)'}}>
                        {isOverdue ? '⚠️ Overdue · ' : ''}{due.toLocaleDateString()}
                      </div>
                    </div>
                    <Badge type={t.priority}/>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
