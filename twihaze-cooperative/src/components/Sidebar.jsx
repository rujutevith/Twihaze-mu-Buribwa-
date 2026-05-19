import { Link, useNavigate } from 'react-router-dom';
import { 
  FaTachometerAlt, FaBox, FaUsers, FaTruck, 
  FaCar, FaChartLine, FaUser, FaCog, FaSignOutAlt,
  FaLeaf, FaArrowRight, FaShoppingCart
} from 'react-icons/fa';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: FaTachometerAlt, path: '/dashboard' },
    { name: 'Products', icon: FaBox, path: '/products' },
    { name: 'Customers', icon: FaUsers, path: '/customers' },
    { name: 'Orders', icon: FaShoppingCart, path: '/orders' },
    { name: 'Deliveries', icon: FaCar, path: '/deliveries' },
    { name: 'Reports', icon: FaChartLine, path: '/reports' },
    { name: 'Users', icon: FaUser, path: '/users' },
    { name: 'Settings', icon: FaCog, path: '/settings' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-green-700 text-white flex flex-col shadow-2xl">
      {/* Logo Section with Plant Icon */}
      <div className="p-6 border-b border-green-600">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="bg-green-600 p-2 rounded-lg">
              <FaLeaf className="text-white text-2xl" />
            </div>
          </div>
          <div>
            <h2 className="text-sm font-bold leading-tight tracking-wide text-white">
              TWIHAZE MU
            </h2>
            <p className="text-xs text-green-200 mt-0.5">BIRIBWA COOPERATIVE</p>
          </div>
        </div>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 mt-6 px-3 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group
              ${activeTab === item.name 
                ? 'bg-green-500 text-white shadow-md' 
                : 'text-white hover:bg-green-500 hover:text-white'}`}
            onClick={() => setActiveTab(item.name)}
          >
            <item.icon className={`text-xl transition-all duration-300
              ${activeTab === item.name 
                ? 'text-white' 
                : 'text-green-200 group-hover:text-white'}`} />
            <span className={`text-sm font-medium ${activeTab === item.name ? 'text-white' : ''}`}>
              {item.name}
            </span>
            {activeTab === item.name && (
              <div className="ml-auto w-1 h-6 bg-white rounded-full"></div>
            )}
          </Link>
        ))}
      </nav>
      
      {/* Logout Button */}
      <div className="p-4 border-t border-green-600 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg hover:bg-red-500/30 transition-all duration-300 group"
        >
          <div className="flex items-center gap-3">
            <FaSignOutAlt className="text-green-200 group-hover:text-red-300 text-xl transition-colors" />
            <span className="text-green-100 group-hover:text-red-300 text-sm font-medium transition-colors">
              Logout
            </span>
          </div>
          <FaArrowRight className="text-green-300 text-sm group-hover:text-red-300 group-hover:translate-x-1 transition-all duration-300" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;