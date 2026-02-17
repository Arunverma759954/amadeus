import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AdminLayout from './admin/AdminLayout';
import Searches from './admin/Searches';
import Dashboard from './admin/Dashboard';
import Calendar from './admin/Calendar';
import Profile from './admin/Profile';
import Users from './admin/Users';
import Settings from './admin/Settings';
import Bookings from './admin/Bookings';
import ContentManagement from './admin/ContentManagement';
import CRM from './admin/CRM';
import Login from './admin/Login';

const RequireAuth = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }
  return children;
}

function App() {
  // Magic Auth Handler for Cross-Port Redirection
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('magic_auth') === 'true') {
      const name = params.get('name');
      const email = params.get('email');

      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify({
        name: name,
        email: email,
        role: 'Super Admin',
        avatar: 'https://i.pinimg.com/564x/7f/6c/64/7f6c64f2d6c4f7f1f8c6f5c2cda6a0c4.jpg'
      }));

      // Clean up URL and redirect to dashboard
      window.history.replaceState({}, document.title, "/admin");
      window.location.reload();
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />

        {/* Admin Login Route */}
        <Route path="/admin/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />

        <Route path="/admin" element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }>
          <Route index element={<Dashboard />} />
          <Route path="searches" element={<Searches />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="profile" element={<Profile />} />
          <Route path="users" element={<Users />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="crm" element={<CRM />} />
          <Route path="content" element={<ContentManagement />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
