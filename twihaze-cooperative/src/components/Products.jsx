import { useState, useEffect } from 'react';
import { 
  FaPlus, FaEdit, FaTrash, FaSearch, FaBox, 
  FaSeedling, FaWeightHanging, FaMoneyBillWave,
  FaChartLine, FaTimes, FaSave
} from 'react-icons/fa';
import axiosInstance from '../utils/axiosConfig';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    price: '',
    unit: 'kg',
    min_stock: ''
  });

  // Statistics
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStock: 0,
    categories: 0
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [products]);

  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Mock data if backend not ready
      setProducts([
        { id: 1, name: 'White Maize', category: 'Grains', quantity: 2500, price: 450, unit: 'kg', min_stock: 500 },
        { id: 2, name: 'Red Beans', category: 'Legumes', quantity: 1200, price: 1200, unit: 'kg', min_stock: 200 },
        { id: 3, name: 'Irish Potatoes', category: 'Tubers', quantity: 3000, price: 600, unit: 'kg', min_stock: 400 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
    const lowStock = products.filter(p => p.quantity < p.min_stock).length;
    const categories = [...new Set(products.map(p => p.category))].length;
    
    setStats({ totalProducts, totalValue, lowStock, categories });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price),
        min_stock: parseInt(formData.min_stock) || 0
      };

      if (editingProduct) {
        await axiosInstance.put(`/products/${editingProduct.id}`, productData);
        alert('Product updated successfully!');
      } else {
        await axiosInstance.post('/products', productData);
        alert('Product added successfully!');
      }
      
      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product. Please try again.');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await axiosInstance.delete(`/products/${id}`);
        alert('Product deleted successfully!');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product. Please try again.');
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      quantity: product.quantity,
      price: product.price,
      unit: product.unit,
      min_stock: product.min_stock
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: '',
      quantity: '',
      price: '',
      unit: 'kg',
      min_stock: ''
    });
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
          <FaBox className="text-green-600" />
          Product Management
        </h1>
        <p className="text-gray-600 mt-2">Manage your farm products inventory</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-90">Total Products</p>
              <h3 className="text-2xl font-bold mt-2">{stats.totalProducts}</h3>
            </div>
            <FaBox className="text-3xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-90">Inventory Value</p>
              <h3 className="text-2xl font-bold mt-2">RWF {stats.totalValue.toLocaleString()}</h3>
            </div>
            <FaMoneyBillWave className="text-3xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-90">Low Stock Items</p>
              <h3 className="text-2xl font-bold mt-2">{stats.lowStock}</h3>
            </div>
            <FaChartLine className="text-3xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-90">Categories</p>
              <h3 className="text-2xl font-bold mt-2">{stats.categories}</h3>
            </div>
            <FaSeedling className="text-3xl opacity-80" />
          </div>
        </div>
      </div>

      {/* Search and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
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
          <FaPlus />
          Add New Product
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-6 py-3 text-left">Product Name</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-right">Quantity</th>
                <th className="px-6 py-3 text-right">Price (RWF)</th>
                <th className="px-6 py-3 text-right">Total Value</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FaSeedling className="text-green-500" />
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {product.quantity.toLocaleString()} {product.unit}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {product.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-green-600">
                    RWF {(product.quantity * product.price).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {product.quantity < product.min_stock ? (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                        Low Stock
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        In Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="text-red-600 hover:text-red-800"
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
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Category"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <input
                type="number"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <input
                type="number"
                placeholder="Price (RWF)"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                <FaSave className="inline mr-2" />
                {editingProduct ? 'Update' : 'Save'} Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;