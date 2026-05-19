import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Customers from './components/Customers';
import Orders from './components/Orders';
import Login from './components/Login';
import Register from './components/Register';

// Placeholder components for other routes (you can create these later)
const Deliveries = () => <div className="p-8"><h1 className="text-2xl font-bold">Deliveries Page</h1></div>;
const Reports = () => <div className="p-8"><h1 className="text-2xl font-bold">Reports Page</h1></div>;
const Users = () => <div className="p-8"><h1 className="text-2xl font-bold">Users Management</h1></div>;
const Settings = () => <div className="p-8"><h1 className="text-2xl font-bold">Settings</h1></div>;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Dashboard');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setIsAuthenticated(true);
      // Set active tab based on current path
      const currentPath = window.location.pathname;
      if (currentPath.includes('/products')) setActiveTab('Products');
      else if (currentPath.includes('/customers')) setActiveTab('Customers');
      else if (currentPath.includes('/orders')) setActiveTab('Orders');
      else if (currentPath.includes('/deliveries')) setActiveTab('Deliveries');
      else if (currentPath.includes('/reports')) setActiveTab('Reports');
      else if (currentPath.includes('/users')) setActiveTab('Users');
      else if (currentPath.includes('/settings')) setActiveTab('Settings');
      else setActiveTab('Dashboard');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleRouteChange = () => {
      const currentPath = window.location.pathname;
      if (currentPath.includes('/products')) setActiveTab('Products');
      else if (currentPath.includes('/customers')) setActiveTab('Customers');
      else if (currentPath.includes('/orders')) setActiveTab('Orders');
      else if (currentPath.includes('/deliveries')) setActiveTab('Deliveries');
      else if (currentPath.includes('/reports')) setActiveTab('Reports');
      else if (currentPath.includes('/users')) setActiveTab('Users');
      else if (currentPath.includes('/settings')) setActiveTab('Settings');
      else if (currentPath.includes('/dashboard')) setActiveTab('Dashboard');
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <Router>
      {!isAuthenticated ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        <div className="flex">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="flex-1 ml-64">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/deliveries" element={<Deliveries />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/users" element={<Users />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;