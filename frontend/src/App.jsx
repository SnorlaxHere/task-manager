import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

import Landing    from './pages/Landing';
import Login      from './pages/Login';
import Register   from './pages/Register';
import AppLayout  from './components/AppLayout';
import Dashboard  from './pages/Dashboard';
import Projects   from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Tasks      from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import Profile    from './pages/Profile';

function PrivateRoute({ children }) {
  const { user, loading } = useAuthStore();
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}><div className="spinner" style={{width:40,height:40}} /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuthStore();
  if (loading) return null;
  return !user ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  const init = useAuthStore(s => s.init);
  useEffect(() => { init(); }, [init]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1c2333', color: '#e8eaf0', border: '1px solid rgba(255,255,255,.07)' } }} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route path="dashboard"          element={<Dashboard />} />
          <Route path="projects"           element={<Projects />} />
          <Route path="projects/:id"       element={<ProjectDetail />} />
          <Route path="tasks"              element={<Tasks />} />
          <Route path="tasks/:id"          element={<TaskDetail />} />
          <Route path="profile"            element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
