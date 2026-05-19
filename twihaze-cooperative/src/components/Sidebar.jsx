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
    <div className="fixed left-0 top-0 h-full w-64 bg-green-800 text-white flex flex-col shadow-2xl">
      {/* Logo Section */}
      <div className="p-6 border-b border-green-700">
        <div className="flex items-center gap-3">
          <div className="bg-green-700 p-2 rounded-lg">
            <FaLeaf className="text-green-200 text-2xl" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">TWIHAZE MU</h2>
            <p className="text-xs text-green-300">BIRIBWA COOPERATIVE</p>
          </div>
        </div>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 mt-6 px-3">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 my-1 rounded-lg transition-all duration-300
              ${activeTab === item.name 
                ? 'bg-green-600 text-white shadow-md' 
                : 'text-green-100 hover:bg-green-600 hover:text-white'}`}
            onClick={() => setActiveTab(item.name)}
          >
            <item.icon className="text-xl" />
            <span className="text-sm font-medium">{item.name}</span>
            {activeTab === item.name && (
              <div className="ml-auto w-1 h-6 bg-white rounded-full"></div>
            )}
          </Link>
        ))}
      </nav>
      
      {/* Logout Button */}
      <div className="p-4 border-t border-green-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-red-600/30 transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <FaSignOutAlt className="text-green-300" />
            <span className="text-green-100">Logout</span>
          </div>
          <FaArrowRight className="text-green-300 text-sm" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;