import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Customers from './components/Customers';
import Orders from './components/Orders';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Dashboard');

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('Auth check - Token:', !!token, 'User:', !!user);
    
    if (token && user) {
      setIsAuthenticated(true);
      // Set active tab based on current path
      const currentPath = window.location.pathname;
      if (currentPath.includes('/products')) {
        setActiveTab('Products');
      } else if (currentPath.includes('/customers')) {
        setActiveTab('Customers');
      } else if (currentPath.includes('/orders')) {
        setActiveTab('Orders');
      } else {
        setActiveTab('Dashboard');
      }
    }
    setLoading(false);
  }, []);

  // Listen for route changes to update active tab
  useEffect(() => {
    const handleRouteChange = () => {
      const currentPath = window.location.pathname;
      if (currentPath.includes('/products')) {
        setActiveTab('Products');
      } else if (currentPath.includes('/customers')) {
        setActiveTab('Customers');
      } else if (currentPath.includes('/orders')) {
        setActiveTab('Orders');
      } else if (currentPath.includes('/dashboard')) {
        setActiveTab('Dashboard');
      }
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