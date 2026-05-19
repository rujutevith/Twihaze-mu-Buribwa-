import { useState, useEffect } from 'react';
import { 
  FaUsers, FaPlus, FaEdit, FaTrash, FaSearch, 
  FaUser, FaEnvelope, FaPhone, FaMapMarker, 
  FaTimes, FaSave, FaUserPlus, FaDollarSign,
  FaChartLine, FaShoppingCart, FaStar
} from 'react-icons/fa';
import axiosInstance from '../utils/axiosConfig';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: ''
  });

  // Statistics
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalPurchases: 0,
    activeCustomers: 0,
    averagePurchase: 0
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [customers]);

  const fetchCustomers = async () => {
    try {
      const response = await axiosInstance.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      // Mock data for demonstration
      setCustomers([
        { id: 1, name: 'Alice Mwangi', email: 'alice@example.com', phone: '+250788123456', address: 'KG 123 St', city: 'Kigali', total_purchases: 1250000, created_at: '2024-01-15' },
        { id: 2, name: 'Bob Kagame', email: 'bob@example.com', phone: '+250788123457', address: 'KN 456 Ave', city: 'Kigali', total_purchases: 850000, created_at: '2024-01-20' },
        { id: 3, name: 'Carol Uwase', email: 'carol@example.com', phone: '+250788123458', address: 'Remera', city: 'Kigali', total_purchases: 2100000, created_at: '2024-02-01' },
        { id: 4, name: 'David Habimana', email: 'david@example.com', phone: '+250788123459', address: 'Nyabugogo', city: 'Kigali', total_purchases: 430000, created_at: '2024-02-10' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalCustomers = customers.length;
    const totalPurchases = customers.reduce((sum, c) => sum + (c.total_purchases || 0), 0);
    const activeCustomers = customers.filter(c => (c.total_purchases || 0) > 100000).length;
    const averagePurchase = totalCustomers > 0 ? totalPurchases / totalCustomers : 0;
    
    setStats({ totalCustomers, totalPurchases, activeCustomers, averagePurchase });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await axiosInstance.put(`/customers/${editingCustomer.id}`, formData);
        alert('Customer updated successfully!');
      } else {
        await axiosInstance.post('/customers', formData);
        alert('Customer added successfully!');
      }
      
      setShowModal(false);
      resetForm();
      fetchCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Error saving customer. Please try again.');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await axiosInstance.delete(`/customers/${id}`);
        alert('Customer deleted successfully!');
        fetchCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Error deleting customer. Please try again.');
      }
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: ''
    });
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
          <FaUsers className="text-green-600" />
          Customer Management
        </h1>
        <p className="text-gray-600 mt-2">Manage your cooperative customers</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-90">Total Customers</p>
              <h3 className="text-2xl font-bold mt-2">{stats.totalCustomers}</h3>
            </div>
            <FaUsers className="text-3xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-90">Total Purchases</p>
              <h3 className="text-2xl font-bold mt-2">RWF {stats.totalPurchases.toLocaleString()}</h3>
            </div>
            <FaDollarSign className="text-3xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-90">Active Customers</p>
              <h3 className="text-2xl font-bold mt-2">{stats.activeCustomers}</h3>
            </div>
            <FaStar className="text-3xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-90">Avg Purchase</p>
              <h3 className="text-2xl font-bold mt-2">RWF {Math.round(stats.averagePurchase).toLocaleString()}</h3>
            </div>
            <FaShoppingCart className="text-3xl opacity-80" />
          </div>
        </div>
      </div>

      {/* Search and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers by name, email or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
          />
        </div>
        
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
        >
          <FaUserPlus />
          Add New Customer
        </button>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-6 py-3 text-left">Customer</th>
                <th className="px-6 py-3 text-left">Contact</th>
                <th className="px-6 py-3 text-left">Location</th>
                <th className="px-6 py-3 text-right">Total Purchases</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <FaUser className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{customer.name}</p>
                        <p className="text-xs text-gray-500">ID: #{customer.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <FaEnvelope className="text-xs" />
                        <span>{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <FaPhone className="text-xs" />
                        <span>{customer.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <FaMapMarker className="text-gray-400 text-sm" />
                      <span className="text-gray-700">{customer.city}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-semibold text-green-600">
                      RWF {(customer.total_purchases || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {(customer.total_purchases || 0) > 1000000 ? (
                      <span className="px-2 py-1 bg-gold-100 text-gold-700 rounded-full text-xs bg-yellow-100 text-yellow-700">
                        VIP
                      </span>
                    ) : (customer.total_purchases || 0) > 500000 ? (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        Regular
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        New
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(customer)}
                        className="text-blue-600 hover:text-blue-800 transition p-1"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id, customer.name)}
                        className="text-red-600 hover:text-red-800 transition p-1"
                      >
                        <FaTrash />
                      </button>
                    </div>
                   </td>
                 </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No customers found</p>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="mt-4 text-green-600 hover:text-green-700"
            >
              Add your first customer
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                    placeholder="Enter customer name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                    placeholder="customer@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                    placeholder="+250 788 123 456"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Address
                </label>
                <div className="relative">
                  <FaMapMarker className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                    placeholder="Street address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  City
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                >
                  <option value="">Select City</option>
                  <option value="Kigali">Kigali</option>
                  <option value="Huye">Huye</option>
                  <option value="Musanze">Musanze</option>
                  <option value="Rubavu">Rubavu</option>
                  <option value="Nyagatare">Nyagatare</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <FaSave />
                  {editingCustomer ? 'Update Customer' : 'Add Customer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;