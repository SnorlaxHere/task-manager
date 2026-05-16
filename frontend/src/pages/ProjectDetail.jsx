import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Gear, Trash, UserPlus, Users, ChartBar } from '@phosphor-icons/react';
import api from '../lib/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import ProgressBar from '../components/ProgressBar';

const STATUSES = ['todo','in_progress','review','completed'];
const STATUS_LABELS = { todo:'To Do', in_progress:'In Progress', review:'Review', completed:'Completed' };

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [users, setUsers]   = useState([]);
  const [tab, setTab] = useState('kanban');
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title:'', description:'', priority:'medium', dueDate:'', estimatedHours:'', assignees:[] });
  const [memberUserId, setMemberUserId] = useState('');
  const [saving, setSaving] = useState(false);

  const myRole = project?.members?.find(m=>m.user?._id===user?._id)?.role;

  useEffect(()=>{
    Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/tasks?project=${id}`),
      api.get(`/dashboard/project/${id}/stats`),
      api.get('/users'),
    ]).then(([p,t,s,u])=>{
      setProject(p.data); setTasks(t.data); setStats(s.data); setUsers(u.data);
    }).catch(()=>navigate('/projects'))
    .finally(()=>setLoading(false));
  },[id]);

  const handleCreateTask = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const { data } = await api.post('/tasks', {...taskForm, project:id});
      setTasks(prev=>[data,...prev]);
      setShowTaskModal(false);
      setTaskForm({ title:'', description:'', priority:'medium', dueDate:'', estimatedHours:'', assignees:[] });
      toast.success('Task created!');
    } catch(err){ toast.error(err.response?.data?.errors?.[0]?.msg || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleAddMember = async () => {
    if (!memberUserId) return;
    setSaving(true);
    try {
      await api.post(`/projects/${id}/members`, { userId: memberUserId });
      const { data } = await api.get(`/projects/${id}`);
      setProject(data); setShowMemberModal(false); setMemberUserId('');
      toast.success('Member added!');
    } catch(err){ toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleRemoveMember = async (uid) => {
    try {
      await api.delete(`/projects/${id}/members/${uid}`);
      const { data } = await api.get(`/projects/${id}`);
      setProject(data); toast.success('Member removed');
    } catch(err){ toast.error('Failed'); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this project?')) return;
    try { await api.delete(`/projects/${id}`); toast.success('Project deleted'); navigate('/projects'); }
    catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div style={{display:'flex',justifyContent:'center',paddingTop:60}}><div className="spinner" style={{width:36,height:36}}/></div>;
  if (!project) return null;

  const nonMembers = users.filter(u=>!project.members.some(m=>m.user?._id===u._id));

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm mb-2" onClick={()=>navigate('/projects')}><ArrowLeft size={16} weight="bold"/> Projects</button>
          <h1 className="page-title gradient-text">{project.name}</h1>
          <div style={{display:'flex',gap:12,alignItems:'center',marginTop:8}}>
            <Badge type={project.status}/>
            {project.endDate && <span style={{fontSize:'.85rem',color:'var(--text-muted)'}}>Due {new Date(project.endDate).toLocaleDateString()}</span>}
          </div>
        </div>
        <div style={{display:'flex',gap:12}}>
          {myRole==='admin' && <>
            <button className="btn btn-secondary btn-sm" onClick={()=>setShowMemberModal(true)}><UserPlus size={16} weight="bold"/> Add Member</button>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}><Trash size={16} weight="bold"/> Delete</button>
          </>}
          <button className="btn btn-primary btn-sm" onClick={()=>setShowTaskModal(true)}><Plus size={16} weight="bold"/> Task</button>
        </div>
      </div>

      {project.description && <p style={{color:'var(--text-secondary)',marginBottom:28,fontSize:'.95rem',maxWidth:800}}>{project.description}</p>}

      {stats && (
        <div className="stat-grid" style={{gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))',marginBottom:28}}>
          {[['Total',stats.total,'accent'],['Todo',stats.todo,''],['In Progress',stats.inProgress,'info'],['Review',stats.review,'warning'],['Done',stats.completed,'success']].map(([l,v,c])=>(
            <div key={l} className={`stat-card ${c}`} style={{minHeight:'100px',padding:'16px 20px'}}>
              <div className="stat-header">
                <div className="stat-label">{l}</div>
              </div>
              <div className="stat-value" style={{fontSize:'2rem',paddingTop:12}}>{v}</div>
            </div>
          ))}
        </div>
      )}

      <div className="tabs">
        {['kanban','list','team'].map(t=>(
          <button key={t} className={`tab-btn${tab===t?' active':''}`} onClick={()=>setTab(t)}>
            {t==='kanban'?'Kanban Board':t==='list'?'Task List':'Team'}
          </button>
        ))}
      </div>

      {tab==='kanban' && (
        <div className="kanban-board">
          {STATUSES.map(status=>{
            const col = tasks.filter(t=>t.status===status);
            return (
              <div key={status} className="kanban-col">
                <div className="kanban-col-header">
                  <span className="kanban-col-title" style={{color:status==='completed'?'var(--success)':status==='in_progress'?'var(--info)':status==='review'?'var(--warning)':'var(--text-secondary)'}}>{STATUS_LABELS[status]}</span>
                  <span className="kanban-count">{col.length}</span>
                </div>
                {col.map(task=>(
                  <div key={task._id} className={`kanban-card priority-${task.priority}`} onClick={()=>navigate(`/tasks/${task._id}`)}>
                    <div className="kanban-card-title">{task.title}</div>
                    <div style={{display:'flex',gap:6,marginBottom:12,flexWrap:'wrap'}}>
                      <Badge type={task.priority}/>
                    </div>
                    {task.progress>0 && <ProgressBar value={task.progress}/>}
                    {task.assignees?.length>0 && (
                      <div style={{display:'flex',marginTop:12}}>
                        <div className="avatar-stack">
                          {task.assignees.slice(0,3).map(a=>(
                            <Avatar key={a._id} name={`${a.firstName} ${a.lastName}`} size="sm"/>
                          ))}
                        </div>
                      </div>
                    )}
                    {task.dueDate && <div style={{fontSize:'.75rem',color:new Date(task.dueDate)<new Date()?'var(--danger)':'var(--text-muted)',marginTop:12}}>📅 {new Date(task.dueDate).toLocaleDateString()}</div>}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {tab==='list' && (
        <div className="card">
          {tasks.length===0 ? <div className="empty-state" style={{padding:'40px 0'}}><p>No tasks yet</p></div> :
          <div className="task-list">
            {tasks.map(t=>(
              <div key={t._id} className={`task-item priority-${t.priority}`} onClick={()=>navigate(`/tasks/${t._id}`)}>
                <div className="task-item-info">
                  <div className="task-item-title">{t.title}</div>
                  <div className="task-item-meta">{t.dueDate && <span>Due {new Date(t.dueDate).toLocaleDateString()}</span>}</div>
                </div>
                <div className="task-badges"><Badge type={t.status}/><Badge type={t.priority}/></div>
                <div className="avatar-stack">{t.assignees?.slice(0,3).map(a=><Avatar key={a._id} name={`${a.firstName} ${a.lastName}`} size="sm"/>)}</div>
              </div>
            ))}
          </div>}
        </div>
      )}

      {tab==='team' && (
        <div className="card">
          <div className="table-wrap">
            <table style={{width:'100%',textAlign:'left',borderCollapse:'collapse'}}>
              <thead><tr><th style={{padding:12,borderBottom:'1px solid var(--border)'}}>Member</th><th style={{padding:12,borderBottom:'1px solid var(--border)'}}>Email</th><th style={{padding:12,borderBottom:'1px solid var(--border)'}}>Role</th>{myRole==='admin'&&<th style={{padding:12,borderBottom:'1px solid var(--border)'}}>Actions</th>}</tr></thead>
              <tbody>
                {project.members.map(m=>(
                  <tr key={m._id} style={{borderBottom:'1px solid var(--border)'}}>
                    <td style={{padding:12}}><div style={{display:'flex',alignItems:'center',gap:12}}><Avatar name={`${m.user?.firstName} ${m.user?.lastName}`} size="sm"/><span style={{fontWeight:600}}>{m.user?.firstName} {m.user?.lastName}</span></div></td>
                    <td style={{padding:12,color:'var(--text-secondary)'}}>{m.user?.email}</td>
                    <td style={{padding:12}}><Badge type={m.role}/></td>
                    {myRole==='admin'&&<td style={{padding:12}}>{m.user?._id!==user?._id&&<button className="btn btn-danger btn-sm" onClick={()=>handleRemoveMember(m.user?._id)}><Trash size={16} weight="duotone"/></button>}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showTaskModal && (
        <Modal title="Create Task" onClose={()=>setShowTaskModal(false)}
          footer={<><button className="btn btn-secondary" onClick={()=>setShowTaskModal(false)}>Cancel</button><button className="btn btn-primary" form="task-form" type="submit" disabled={saving}>{saving?<span className="spinner"/>:'Create'}</button></>}>
          <form id="task-form" onSubmit={handleCreateTask}>
            <div className="form-group"><label className="form-label">Title *</label><input className="form-input" placeholder="Task title" value={taskForm.title} onChange={e=>setTaskForm(f=>({...f,title:e.target.value}))} required minLength={3}/></div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" placeholder="Details…" value={taskForm.description} onChange={e=>setTaskForm(f=>({...f,description:e.target.value}))}/></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Priority</label>
                <select className="form-select" value={taskForm.priority} onChange={e=>setTaskForm(f=>({...f,priority:e.target.value}))}>
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Due Date</label><input className="form-input" type="date" value={taskForm.dueDate} onChange={e=>setTaskForm(f=>({...f,dueDate:e.target.value}))}/></div>
            </div>
            <div className="form-group"><label className="form-label">Assignees</label>
              <select className="form-select" multiple value={taskForm.assignees} onChange={e=>setTaskForm(f=>({...f,assignees:[...e.target.selectedOptions].map(o=>o.value)}))} style={{height:100}}>
                {project.members.map(m=><option key={m.user?._id} value={m.user?._id}>{m.user?.firstName} {m.user?.lastName}</option>)}
              </select>
            </div>
          </form>
        </Modal>
      )}

      {showMemberModal && (
        <Modal title="Add Team Member" onClose={()=>setShowMemberModal(false)}
          footer={<><button className="btn btn-secondary" onClick={()=>setShowMemberModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleAddMember} disabled={saving||!memberUserId}>{saving?<span className="spinner"/>:'Add'}</button></>}>
          <div className="form-group">
            <label className="form-label">Select User</label>
            <select className="form-select" value={memberUserId} onChange={e=>setMemberUserId(e.target.value)}>
              <option value="">Choose a user…</option>
              {nonMembers.map(u=><option key={u._id} value={u._id}>{u.firstName} {u.lastName} — {u.email}</option>)}
            </select>
          </div>
        </Modal>
      )}
    </div>
  );
}
