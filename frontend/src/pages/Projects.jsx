import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, Users, CalendarBlank, MagnifyingGlass } from '@phosphor-icons/react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Avatar from '../components/Avatar';

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name:'', description:'', status:'active', startDate:'', endDate:'' });
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  useEffect(() => {
    api.get('/projects').then(r=>setProjects(r.data)).finally(()=>setLoading(false));
  }, []);

  const filtered = projects.filter(p=>p.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const { data } = await api.post('/projects', form);
      setProjects(prev=>[data,...prev]);
      setShowModal(false);
      setForm({ name:'', description:'', status:'active', startDate:'', endDate:'' });
      toast.success('Project created!');
    } catch(err) {
      toast.error(err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  if (loading) return <div style={{display:'flex',justifyContent:'center',paddingTop:60}}><div className="spinner" style={{width:36,height:36}}/></div>;

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="page-title gradient-text">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length!==1?'s':''} you're part of</p>
        </div>
        <button className="btn btn-primary" onClick={()=>setShowModal(true)}><Plus size={16} weight="bold"/> New Project</button>
      </div>

      <div className="filter-bar" style={{marginBottom: 32}}>
        <div className="search-wrap" style={{position:'relative', maxWidth:400}}>
          <MagnifyingGlass size={18} weight="bold" style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)'}}/>
          <input className="form-input search-input" style={{paddingLeft:40}} placeholder="Search projects…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <FolderOpen size={64} weight="duotone"/>
          <h3>No projects yet</h3>
          <p>Create your first project to get started</p>
          <button className="btn btn-primary" onClick={()=>setShowModal(true)}><Plus size={16} weight="bold"/> Create Project</button>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))',gap:24}}>
          {filtered.map(p=>(
            <div key={p._id} className="card" style={{cursor:'pointer',display:'flex',flexDirection:'column'}} onClick={()=>navigate(`/projects/${p._id}`)}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                <div style={{fontSize:'1.2rem',fontWeight:700,fontFamily:'Outfit, sans-serif'}}>{p.name}</div>
                <Badge type={p.status}/>
              </div>
              <p style={{color:'var(--text-secondary)',fontSize:'.9rem',marginBottom:20,flex:1}}>{p.description || 'No description'}</p>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:16,borderTop:'1px solid var(--border)'}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div className="avatar-stack">
                    {p.members.slice(0,4).map(m=>(
                      <Avatar key={m._id} name={`${m.user?.firstName} ${m.user?.lastName}`} size="sm"/>
                    ))}
                  </div>
                  <span style={{fontSize:'.8rem',color:'var(--text-muted)',display:'flex',alignItems:'center',gap:4}}><Users size={14} weight="fill"/> {p.members.length}</span>
                </div>
                {p.endDate && <span style={{fontSize:'.8rem',color:'var(--text-muted)',display:'flex',alignItems:'center',gap:4}}><CalendarBlank size={14} weight="bold"/> {new Date(p.endDate).toLocaleDateString()}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="New Project" onClose={()=>setShowModal(false)}
          footer={<><button className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button><button className="btn btn-primary" form="proj-form" type="submit" disabled={saving}>{saving?<span className="spinner"/>:'Create'}</button></>}>
          <form id="proj-form" onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Project Name *</label>
              <input className="form-input" placeholder="e.g. Website Redesign" value={form.name} onChange={e=>set('name',e.target.value)} required minLength={3}/>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="What is this project about?" value={form.description} onChange={e=>set('description',e.target.value)}/>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e=>set('status',e.target.value)}>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input className="form-input" type="date" value={form.endDate} onChange={e=>set('endDate',e.target.value)}/>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
