import { useState, useEffect } from 'react';
import { 
  FaDollarSign, FaBox, FaCar, FaChartLine, 
  FaArrowUp, FaBell, FaUserCircle, FaCalendarAlt,
  FaLeaf, FaCreditCard, FaUsers,
  FaTruck, FaSeedling, FaChartBar, FaCoins
} from 'react-icons/fa';
import { LineChart, Line, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import axiosInstance from '../utils/axiosConfig';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 4250000,
    totalProducts: 24,
    pendingDeliveries: 8,
    totalCustomers: 128,
    productsInStock: 2450,
    pendingOrders: 12,
    monthlyRevenue: 4250000
  });
  const [salesData, setSalesData] = useState([
    { month: 'Jan', total_sales: 3200000 },
    { month: 'Feb', total_sales: 3800000 },
    { month: 'Mar', total_sales: 4250000 }
  ]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({ username: 'Admin', role: 'Administrator' });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsResponse = await axiosInstance.get('/dashboard/stats');
      if (statsResponse.data) {
        setStats(prev => ({ ...prev, ...statsResponse.data }));
      }

      const salesResponse = await axiosInstance.get('/reports/sales');
      if (salesResponse.data && salesResponse.data.length > 0) {
        setSalesData(salesResponse.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Header with three underscores */}
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <div className="flex gap-2">
          <div className="w-8 h-1 bg-gray-800 rounded"></div>
          <div className="w-8 h-1 bg-gray-800 rounded"></div>
          <div className="w-8 h-1 bg-gray-800 rounded"></div>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <div className="relative">
            <FaBell className="text-gray-600 text-xl cursor-pointer hover:text-gray-800" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
            <FaUserCircle className="text-gray-600 text-2xl md:text-3xl" />
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">{user.username || 'Admin User'}</p>
              <p className="text-xs text-gray-500">{user.role || 'Administrator'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Section - Black Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-green-100 p-2 rounded-full">
              <FaLeaf className="text-green-600 text-lg" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-black">Welcome back, {user.username || 'Admin'}</h1>
          </div>
          <p className="text-gray-600 text-sm md:text-base">Here's what's happening on your farm today</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 md:px-4 py-2 rounded-lg shadow-md">
          <FaCalendarAlt className="text-green-500" />
          <span className="text-gray-700 text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* First Row - 3 main cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
        {/* Total Sales Card - Green Background */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-4 md:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white text-xs md:text-sm opacity-90 mb-1">Total Sales</p>
              <h3 className="text-xl md:text-2xl font-bold text-white">RWF {stats.totalSales.toLocaleString()}</h3>
            </div>
            <div className="bg-white/20 p-2 md:p-3 rounded-lg">
              <FaDollarSign className="text-white text-lg md:text-xl" />
            </div>
          </div>
          <div className="mt-3 md:mt-4">
            <div className="flex items-center gap-2 text-white">
              <FaArrowUp className="text-green-200 text-xs md:text-sm" />
              <span className="text-green-100 text-xs md:text-sm font-semibold">+18.5%</span>
              <span className="text-green-100 text-xs md:text-sm">from last month</span>
            </div>
          </div>
        </div>

        {/* Available Products Card - Blue Background */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 md:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white text-xs md:text-sm opacity-90 mb-1">Available Products</p>
              <h3 className="text-xl md:text-2xl font-bold text-white">{stats.totalProducts}</h3>
            </div>
            <div className="bg-white/20 p-2 md:p-3 rounded-lg">
              <FaBox className="text-white text-lg md:text-xl" />
            </div>
          </div>
          <div className="mt-3 md:mt-4">
            <p className="text-blue-100 text-xs">Different product categories</p>
          </div>
        </div>

        {/* Pending Deliveries Card - Orange Background */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-4 md:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white text-xs md:text-sm opacity-90 mb-1">Pending Deliveries</p>
              <h3 className="text-xl md:text-2xl font-bold text-white">{stats.pendingDeliveries}</h3>
            </div>
            <div className="bg-white/20 p-2 md:p-3 rounded-lg">
              <FaCar className="text-white text-lg md:text-xl" />
            </div>
          </div>
          <div className="mt-3 md:mt-4">
            <p className="text-orange-100 text-xs">Awaiting dispatch</p>
          </div>
        </div>
      </div>

      {/* Second Row - Complex cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
        {/* Revenue Card with green line and coins */}
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow">
          <div className="mb-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-gray-500 text-xs md:text-sm">Monthly Revenue</h3>
              <FaCreditCard className="text-gray-400" />
            </div>
            <p className="text-xl md:text-2xl font-bold text-gray-800">RWF {stats.monthlyRevenue.toLocaleString()}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-full max-w-[120px] h-1 bg-green-500 rounded"></div>
              <FaArrowUp className="text-green-500 text-xs md:text-sm" />
              <span className="text-green-600 text-xs md:text-sm font-semibold">18.5%</span>
              <span className="text-gray-500 text-xs md:text-sm">from last month</span>
            </div>
          </div>
          
          {/* Coin slider section */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <FaCoins className="text-green-600 text-sm" />
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-bold text-xs">$</span>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xs">€</span>
                </div>
              </div>
              <div className="flex-1 mx-3 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
              <span className="text-xs font-semibold text-green-600">RWF</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Local Currency (Rwandan Franc)</p>
          </div>
        </div>

        {/* Products in Stock Card with blue line */}
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-3xl md:text-4xl font-bold text-blue-600">{stats.productsInStock}</h3>
              <div className="w-full max-w-[128px] h-1 bg-blue-500 rounded mt-2"></div>
              <p className="text-gray-800 mt-3 font-semibold text-sm md:text-base">Products in Stock</p>
              <p className="text-xs text-gray-500 mt-1">Total quantity available</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FaSeedling className="text-blue-600 text-2xl md:text-3xl" />
            </div>
          </div>
        </div>

        {/* Awaiting Delivery Card with orange line */}
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-3xl md:text-4xl font-bold text-orange-600">{stats.pendingOrders}</h3>
              <div className="w-full max-w-[128px] h-1 bg-orange-500 rounded mt-2"></div>
              <p className="text-gray-800 mt-3 font-semibold text-sm md:text-base">Awaiting Delivery</p>
              <p className="text-xs text-gray-500 mt-1">Orders to be delivered</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <FaTruck className="text-orange-600 text-2xl md:text-3xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Sales Chart Section */}
      <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base md:text-lg font-semibold text-black">Sales Performance</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Last 6 months</span>
            <FaChartBar className="text-green-500" />
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesData}>
            <XAxis dataKey="month" stroke="#888" />
            <Tooltip 
              formatter={(value) => [`RWF ${value.toLocaleString()}`, 'Sales']}
              contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="total_sales" fill="#10B981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;