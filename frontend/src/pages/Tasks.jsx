import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, CheckSquareOffset, MagnifyingGlass } from '@phosphor-icons/react';
import api from '../lib/api';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

export default function Tasks() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tasks, setTasks]       = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterProject, setFilterProject]   = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title:'', description:'', project:'', priority:'medium', dueDate:'', estimatedHours:'' });
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  useEffect(()=>{
    Promise.all([api.get('/tasks'), api.get('/projects')]).then(([t,p])=>{
      setTasks(t.data); setProjects(p.data);
    }).finally(()=>setLoading(false));
  },[]);

  const filtered = tasks.filter(t=>{
    const q = search.toLowerCase();
    if (q && !t.title.toLowerCase().includes(q)) return false;
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    if (filterProject && t.project?._id !== filterProject) return false;
    return true;
  });

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const { data } = await api.post('/tasks', form);
      setTasks(prev=>[data,...prev]);
      setShowModal(false);
      setForm({ title:'', description:'', project:'', priority:'medium', dueDate:'', estimatedHours:'' });
      toast.success('Task created!');
    } catch(err){ toast.error(err.response?.data?.errors?.[0]?.msg || 'Failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{display:'flex',justifyContent:'center',paddingTop:60}}><div className="spinner" style={{width:36,height:36}}/></div>;

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="page-title gradient-text">Tasks</h1>
          <p className="page-subtitle">{filtered.length} task{filtered.length!==1?'s':''} found</p>
        </div>
        <button className="btn btn-primary" onClick={()=>setShowModal(true)}><Plus size={16} weight="bold"/> New Task</button>
      </div>

      <div className="filter-bar" style={{marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap'}}>
        <div className="search-wrap" style={{position:'relative', flex:2, minWidth:250}}>
          <MagnifyingGlass size={18} weight="bold" style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)'}}/>
          <input className="form-input search-input" style={{paddingLeft:40}} placeholder="Search tasks…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select className="form-select" style={{width:160}} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="todo">To Do</option><option value="in_progress">In Progress</option>
          <option value="review">Review</option><option value="completed">Completed</option>
        </select>
        <select className="form-select" style={{width:160}} value={filterPriority} onChange={e=>setFilterPriority(e.target.value)}>
          <option value="">All Priorities</option>
          <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
        </select>
        <select className="form-select" style={{width:200}} value={filterProject} onChange={e=>setFilterProject(e.target.value)}>
          <option value="">All Projects</option>
          {projects.map(p=><option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
      </div>

      {filtered.length===0 ? (
        <div className="empty-state">
          <CheckSquareOffset size={64} weight="duotone"/>
          <h3>No tasks found</h3>
          <p>Try adjusting your filters or create a new task</p>
        </div>
      ) : (
        <div className="card" style={{padding:0,overflow:'hidden'}}>
          <div className="table-wrap" style={{overflowX:'auto'}}>
            <table style={{width:'100%',textAlign:'left',borderCollapse:'collapse'}}>
              <thead style={{background:'rgba(255,255,255,0.02)'}}>
                <tr>
                  <th style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',fontWeight:600}}>Task</th>
                  <th style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',fontWeight:600}}>Project</th>
                  <th style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',fontWeight:600}}>Status</th>
                  <th style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',fontWeight:600}}>Priority</th>
                  <th style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',fontWeight:600}}>Assignees</th>
                  <th style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',fontWeight:600}}>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t=>(
                  <tr key={t._id} style={{cursor:'pointer',transition:'background var(--transition)',borderBottom:'1px solid var(--border)'}} onClick={()=>navigate(`/tasks/${t._id}`)} onMouseOver={e=>e.currentTarget.style.background='var(--bg-card-hover)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{padding:'16px 20px'}}><div style={{fontWeight:600,maxWidth:240,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',fontFamily:'Outfit, sans-serif'}}>{t.title}</div></td>
                    <td style={{padding:'16px 20px',color:'var(--text-secondary)',fontSize:'.9rem'}}>{t.project?.name||'—'}</td>
                    <td style={{padding:'16px 20px'}}><Badge type={t.status}/></td>
                    <td style={{padding:'16px 20px'}}><Badge type={t.priority}/></td>
                    <td style={{padding:'16px 20px'}}><div className="avatar-stack">{t.assignees?.slice(0,3).map(a=><Avatar key={a._id} name={`${a.firstName} ${a.lastName}`} size="sm"/>)}</div></td>
                    <td style={{padding:'16px 20px',fontSize:'.85rem',color:t.dueDate&&new Date(t.dueDate)<new Date()&&t.status!=='completed'?'var(--danger)':'var(--text-muted)'}}>
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <Modal title="New Task" onClose={()=>setShowModal(false)}
          footer={<><button className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button><button className="btn btn-primary" form="new-task-form" type="submit" disabled={saving}>{saving?<span className="spinner"/>:'Create'}</button></>}>
          <form id="new-task-form" onSubmit={handleCreate}>
            <div className="form-group"><label className="form-label">Title *</label><input className="form-input" placeholder="Task title" value={form.title} onChange={e=>set('title',e.target.value)} required minLength={3}/></div>
            <div className="form-group"><label className="form-label">Project *</label>
              <select className="form-select" value={form.project} onChange={e=>set('project',e.target.value)} required>
                <option value="">Select project…</option>
                {projects.map(p=><option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={e=>set('description',e.target.value)}/></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Priority</label>
                <select className="form-select" value={form.priority} onChange={e=>set('priority',e.target.value)}>
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Due Date</label><input className="form-input" type="date" value={form.dueDate} onChange={e=>set('dueDate',e.target.value)}/></div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
