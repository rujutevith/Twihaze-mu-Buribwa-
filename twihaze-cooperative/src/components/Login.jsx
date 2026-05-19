import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaLeaf, FaEnvelope, FaLock } from 'react-icons/fa';
import axiosInstance from '../utils/axiosConfig';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Validation
    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Attempting login with:', { email });
      
      const response = await axiosInstance.post('/login', { 
        email, 
        password 
      });
      
      console.log('Login response:', response.data);
      
      // Save token and user data
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        console.log('Token saved:', response.data.token);
        console.log('User saved:', response.data.user);
        
        // Force navigate to dashboard
        window.location.href = '/dashboard';
        // Or use navigate
        // navigate('/dashboard');
      } else {
        setError('No token received from server');
      }
      
    } catch (err) {
      console.error('Login error details:', err);
      
      if (err.response) {
        // Server responded with error
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        setError(err.response.data?.error || 'Login failed');
      } else if (err.request) {
        // Request made but no response
        console.error('No response received');
        setError('Cannot connect to server. Please check if backend is running.');
      } else {
        // Other error
        console.error('Error:', err.message);
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-cover bg-center"
         style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3")' }}>
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-600 p-3 rounded-full">
              <FaLeaf className="text-white text-3xl" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                placeholder="Enter your email"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-green-600 hover:text-green-700 font-semibold">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;