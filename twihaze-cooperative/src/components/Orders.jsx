import { useState, useEffect } from 'react';
import { 
  FaShoppingCart, FaPlus, FaTrash, FaSearch, 
  FaEye, FaTimes, FaSave, FaClock, FaCheckCircle,
  FaMoneyBillWave, FaUser, FaBox, FaTruck,
  FaSpinner, FaPrint, FaDownload, FaFilter
} from 'react-icons/fa';
import axiosInstance from '../utils/axiosConfig';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    customer_id: '',
    items: [],
    total_amount: 0,
    status: 'pending',
    payment_status: 'unpaid'
  });
  const [selectedProduct, setSelectedProduct] = useState('');
  const [productQuantity, setProductQuantity] = useState(1);

  // Statistics
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    processingOrders: 0
  });

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
    fetchProducts();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [orders]);

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Mock data
      setOrders([
        { 
          id: 1, 
          order_number: 'ORD-2024-001', 
          customer_name: 'Alice Mwangi', 
          customer_id: 1,
          total_amount: 225000, 
          status: 'completed', 
          payment_status: 'paid',
          order_date: '2024-01-15',
          items: [{product_name: 'White Maize', quantity: 500, unit_price: 450, subtotal: 225000}]
        },
        { 
          id: 2, 
          order_number: 'ORD-2024-002', 
          customer_name: 'Bob Kagame', 
          customer_id: 2,
          total_amount: 144000, 
          status: 'processing', 
          payment_status: 'paid',
          order_date: '2024-01-20',
          items: [{product_name: 'Red Beans', quantity: 120, unit_price: 1200, subtotal: 144000}]
        },
        { 
          id: 3, 
          order_number: 'ORD-2024-003', 
          customer_name: 'Carol Uwase', 
          customer_id: 3,
          total_amount: 360000, 
          status: 'pending', 
          payment_status: 'unpaid',
          order_date: '2024-01-25',
          items: [{product_name: 'Soybeans', quantity: 450, unit_price: 800, subtotal: 360000}]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axiosInstance.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([
        { id: 1, name: 'Alice Mwangi', email: 'alice@example.com', phone: '+250788123456' },
        { id: 2, name: 'Bob Kagame', email: 'bob@example.com', phone: '+250788123457' },
        { id: 3, name: 'Carol Uwase', email: 'carol@example.com', phone: '+250788123458' }
      ]);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([
        { id: 1, name: 'White Maize', price: 450, quantity: 2500, unit: 'kg' },
        { id: 2, name: 'Red Beans', price: 1200, quantity: 1200, unit: 'kg' },
        { id: 3, name: 'Irish Potatoes', price: 600, quantity: 3000, unit: 'kg' },
        { id: 4, name: 'Soybeans', price: 800, quantity: 1500, unit: 'kg' }
      ]);
    }
  };

  const calculateStats = () => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const processingOrders = orders.filter(o => o.status === 'processing').length;
    
    setStats({ totalOrders, totalRevenue, pendingOrders, completedOrders, processingOrders });
  };

  const handleAddProduct = () => {
    if (selectedProduct && productQuantity > 0) {
      const product = products.find(p => p.id === parseInt(selectedProduct));
      const existingItem = formData.items.find(item => item.product_id === product.id);
      
      if (existingItem) {
        setFormData({
          ...formData,
          items: formData.items.map(item =>
            item.product_id === product.id
              ? { ...item, quantity: item.quantity + productQuantity, subtotal: (item.quantity + productQuantity) * item.price }
              : item
          )
        });
      } else {
        setFormData({
          ...formData,
          items: [...formData.items, {
            product_id: product.id,
            product_name: product.name,
            quantity: productQuantity,
            price: product.price,
            subtotal: product.price * productQuantity
          }]
        });
      }
      
      setSelectedProduct('');
      setProductQuantity(1);
    }
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    const total = formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setFormData({ ...formData, total_amount: total });
  };

  useEffect(() => {
    calculateTotal();
  }, [formData.items]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.items.length === 0) {
      alert('Please add at least one product to the order');
      return;
    }
    
    if (!formData.customer_id) {
      alert('Please select a customer');
      return;
    }
    
    try {
      const orderData = {
        customer_id: parseInt(formData.customer_id),
        items: formData.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        })),
        total_amount: formData.total_amount,
        status: formData.status,
        payment_status: formData.payment_status
      };
      
      await axiosInstance.post('/orders', orderData);
      alert('Order created successfully!');
      setShowModal(false);
      resetForm();
      fetchOrders();
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Error saving order. Please try again.');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axiosInstance.patch(`/orders/${id}/status`, { status });
      alert(`Order status updated to ${status}`);
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    }
  };

  const handleDelete = async (id, orderNumber) => {
    if (window.confirm(`Are you sure you want to delete order ${orderNumber}?`)) {
      try {
        await axiosInstance.delete(`/orders/${id}`);
        alert('Order deleted successfully!');
        fetchOrders();
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Error deleting order');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      customer_id: '',
      items: [],
      total_amount: 0,
      status: 'pending',
      payment_status: 'unpaid'
    });
    setSelectedProduct('');
    setProductQuantity(1);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <FaCheckCircle className="inline mr-1" />;
      case 'processing': return <FaSpinner className="inline mr-1 animate-spin" />;
      case 'pending': return <FaClock className="inline mr-1" />;
      default: return null;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'unpaid': return 'bg-red-100 text-red-700';
      case 'partial': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
          <FaShoppingCart className="text-green-600" />
          Order Management
        </h1>
        <p className="text-gray-600 mt-2">Manage customer orders and track deliveries</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-90">Total Orders</p>
              <h3 className="text-2xl font-bold mt-2">{stats.totalOrders}</h3>
            </div>
            <FaShoppingCart className="text-3xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-90">Total Revenue</p>
              <h3 className="text-2xl font-bold mt-2">RWF {stats.totalRevenue.toLocaleString()}</h3>
            </div>
            <FaMoneyBillWave className="text-3xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-90">Pending</p>
              <h3 className="text-2xl font-bold mt-2">{stats.pendingOrders}</h3>
            </div>
            <FaClock className="text-3xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-90">Processing</p>
              <h3 className="text-2xl font-bold mt-2">{stats.processingOrders}</h3>
            </div>
            <FaSpinner className="text-3xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-700 to-green-800 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-90">Completed</p>
              <h3 className="text-2xl font-bold mt-2">{stats.completedOrders}</h3>
            </div>
            <FaCheckCircle className="text-3xl opacity-80" />
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order number or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
          />
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 appearance-none"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <FaPlus />
            New Order
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-6 py-3 text-left">Order #</th>
                <th className="px-6 py-3 text-left">Customer</th>
                <th className="px-6 py-3 text-right">Total Amount</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center">Payment</th>
                <th className="px-6 py-3 text-center">Date</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-semibold text-gray-700">
                      {order.order_number}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 p-2 rounded-full">
                        <FaUser className="text-green-600 text-xs" />
                      </div>
                      <span className="text-gray-800 font-medium">{order.customer_name}</span>
                    </div>
                   </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-green-600">
                      RWF {order.total_amount.toLocaleString()}
                    </span>
                   </td>
                  <td className="px-6 py-4 text-center">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${getStatusColor(order.status)} border-0 focus:ring-2 focus:ring-green-500`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                   </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.payment_status)}`}>
                      {order.payment_status}
                    </span>
                   </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">
                    {new Date(order.order_date).toLocaleDateString()}
                   </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 transition p-1"
                        title="View Details"
                      >
                        <FaEye size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(order.id, order.order_number)}
                        className="text-red-600 hover:text-red-800 transition p-1"
                        title="Delete Order"
                      >
                        <FaTrash size={18} />
                      </button>
                    </div>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <FaShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No orders found</p>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="mt-4 text-green-600 hover:text-green-700 font-semibold"
            >
              Create your first order
            </button>
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaShoppingCart className="text-green-600" />
                Create New Order
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Customer Selection */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Select Customer <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-3 text-gray-400" />
                  <select
                    value={formData.customer_id}
                    onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                    required
                  >
                    <option value="">Choose a customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Order Items <span className="text-red-500">*</span>
                </label>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex gap-3 mb-4">
                    <div className="flex-1 relative">
                      <FaBox className="absolute left-3 top-3 text-gray-400" />
                      <select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                      >
                        <option value="">Select Product</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} - RWF {product.price}/{product.unit} (Stock: {product.quantity})
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="number"
                      value={productQuantity}
                      onChange={(e) => setProductQuantity(parseInt(e.target.value))}
                      min="1"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                      placeholder="Qty"
                    />
                    <button
                      type="button"
                      onClick={handleAddProduct}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      Add
                    </button>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {formData.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center bg-white p-3 rounded-lg border">
                        <div>
                          <p className="font-semibold text-gray-800">{item.product_name}</p>
                          <p className="text-sm text-gray-600">
                            {item.quantity} x RWF {item.price.toLocaleString()} = RWF {item.subtotal.toLocaleString()}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                    {formData.items.length === 0 && (
                      <p className="text-center text-gray-500 py-4">No items added yet. Add products to this order.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Status & Payment */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Order Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Payment Status
                  </label>
                  <select
                    value={formData.payment_status}
                    onChange={(e) => setFormData({...formData, payment_status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="partial">Partial</option>
                  </select>
                </div>
              </div>

              {/* Total Amount */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg text-gray-800">Total Amount:</span>
                  <span className="text-2xl font-bold text-green-600">
                    RWF {formData.total_amount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                  disabled={formData.items.length === 0 || !formData.customer_id}
                >
                  <FaSave />
                  Create Order
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

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="font-semibold text-gray-800">{selectedOrder.order_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-semibold text-gray-800">{new Date(selectedOrder.order_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-semibold text-gray-800">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                    {selectedOrder.payment_status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-bold text-green-600 text-lg">RWF {selectedOrder.total_amount.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Order Items</p>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Product</th>
                        <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Quantity</th>
                        <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Unit Price</th>
                        <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-4 py-2 text-gray-800">{item.product_name}</td>
                          <td className="px-4 py-2 text-right text-gray-600">{item.quantity}</td>
                          <td className="px-4 py-2 text-right text-gray-600">RWF {item.unit_price?.toLocaleString() || item.price?.toLocaleString()}</td>
                          <td className="px-4 py-2 text-right font-semibold text-green-600">
                            RWF {item.subtotal?.toLocaleString() || (item.quantity * item.unit_price)?.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t">
                      <tr>
                        <td colSpan="3" className="px-4 py-2 text-right font-bold text-gray-800">Total:</td>
                        <td className="px-4 py-2 text-right font-bold text-green-600">
                          RWF {selectedOrder.total_amount.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <FaPrint />
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;