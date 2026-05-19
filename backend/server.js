const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// CORS configuration
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'king@90048T', // Change this to your MySQL password if you have one
    database: 'farm_cooperative'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err);
        return;
    }
    console.log('✅ Connected to MySQL database');
});

const JWT_SECRET = 'twihaze_cooperative_secret_key_2024';

// ==================== AUTHENTICATION MIDDLEWARE ====================
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// ==================== TEST ENDPOINT ====================
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Server is running correctly!',
        status: 'online',
        timestamp: new Date().toISOString()
    });
});

// ==================== AUTHENTICATION ENDPOINTS ====================

// Register endpoint
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    console.log('📝 Registration attempt:', { username, email });
    
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const checkQuery = 'SELECT * FROM users WHERE email = ? OR username = ?';
    db.query(checkQuery, [email, username], async (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (results.length > 0) {
            return res.status(400).json({ error: 'User already exists with this email or username' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const insertQuery = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
        
        db.query(insertQuery, [username, email, hashedPassword, 'user'], (err, result) => {
            if (err) {
                console.error('Insert error:', err);
                return res.status(500).json({ error: 'Registration failed' });
            }
            
            console.log('✅ User registered successfully:', username);
            res.status(201).json({ 
                message: 'Registration successful',
                userId: result.insertId 
            });
        });
    });
});

// Login endpoint
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt:', { email });
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        const user = results[0];
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        const token = jwt.sign(
            { id: user.id, role: user.role, username: user.username }, 
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        console.log('✅ User logged in successfully:', user.username);
        
        res.json({ 
            token, 
            user: { 
                id: user.id, 
                username: user.username, 
                email: user.email, 
                role: user.role 
            } 
        });
    });
});

// ==================== PRODUCTS ENDPOINTS ====================

// Get all products
app.get('/api/products', authenticateToken, (req, res) => {
    const query = 'SELECT * FROM products ORDER BY created_at DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching products:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Get single product
app.get('/api/products/:id', authenticateToken, (req, res) => {
    const query = 'SELECT * FROM products WHERE id = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error fetching product:', err);
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(results[0]);
    });
});

// Create product
app.post('/api/products', authenticateToken, (req, res) => {
    const { name, category, quantity, price, unit, min_stock } = req.body;
    
    console.log('📦 Creating product:', { name, category, quantity, price });
    
    if (!name || !category || !quantity || !price) {
        return res.status(400).json({ error: 'Name, category, quantity, and price are required' });
    }
    
    const query = `INSERT INTO products (name, category, quantity, price, unit, min_stock) 
                   VALUES (?, ?, ?, ?, ?, ?)`;
    
    db.query(query, [name, category, parseInt(quantity), parseFloat(price), unit || 'kg', parseInt(min_stock) || 0], (err, result) => {
        if (err) {
            console.error('Error creating product:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log('✅ Product created successfully:', name);
        res.status(201).json({ id: result.insertId, message: 'Product created successfully' });
    });
});

// Update product
app.put('/api/products/:id', authenticateToken, (req, res) => {
    const { name, category, quantity, price, unit, min_stock } = req.body;
    const productId = req.params.id;
    
    console.log('✏️ Updating product:', { id: productId, name });
    
    const query = `UPDATE products 
                   SET name = ?, category = ?, quantity = ?, price = ?, unit = ?, min_stock = ?
                   WHERE id = ?`;
    
    db.query(query, [name, category, parseInt(quantity), parseFloat(price), unit || 'kg', parseInt(min_stock) || 0, productId], (err, result) => {
        if (err) {
            console.error('Error updating product:', err);
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        console.log('✅ Product updated successfully:', name);
        res.json({ message: 'Product updated successfully' });
    });
});

// Delete product
app.delete('/api/products/:id', authenticateToken, (req, res) => {
    const productId = req.params.id;
    
    console.log('🗑️ Deleting product:', productId);
    
    const query = 'DELETE FROM products WHERE id = ?';
    db.query(query, [productId], (err, result) => {
        if (err) {
            console.error('Error deleting product:', err);
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        console.log('✅ Product deleted successfully');
        res.json({ message: 'Product deleted successfully' });
    });
});

// Update stock
app.patch('/api/products/:id/stock', authenticateToken, (req, res) => {
    const { quantity } = req.body;
    const productId = req.params.id;
    
    console.log('📊 Updating stock:', { productId, quantity });
    
    const query = 'UPDATE products SET quantity = ? WHERE id = ?';
    
    db.query(query, [parseInt(quantity), productId], (err, result) => {
        if (err) {
            console.error('Error updating stock:', err);
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        console.log('✅ Stock updated successfully');
        res.json({ message: 'Stock updated successfully' });
    });
});

// ==================== CUSTOMERS ENDPOINTS ====================

// Get all customers
app.get('/api/customers', authenticateToken, (req, res) => {
    const query = 'SELECT * FROM customers ORDER BY created_at DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching customers:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Get single customer
app.get('/api/customers/:id', authenticateToken, (req, res) => {
    const query = 'SELECT * FROM customers WHERE id = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error fetching customer:', err);
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json(results[0]);
    });
});

// Create customer
app.post('/api/customers', authenticateToken, (req, res) => {
    const { name, email, phone, address, city } = req.body;
    
    console.log('👤 Creating customer:', { name, email });
    
    if (!name || !email || !phone) {
        return res.status(400).json({ error: 'Name, email, and phone are required' });
    }
    
    const query = `INSERT INTO customers (name, email, phone, address, city, total_purchases) 
                   VALUES (?, ?, ?, ?, ?, ?)`;
    
    db.query(query, [name, email, phone, address, city, 0], (err, result) => {
        if (err) {
            console.error('Error creating customer:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log('✅ Customer created successfully:', name);
        res.status(201).json({ id: result.insertId, message: 'Customer created successfully' });
    });
});

// Update customer
app.put('/api/customers/:id', authenticateToken, (req, res) => {
    const { name, email, phone, address, city } = req.body;
    const customerId = req.params.id;
    
    console.log('✏️ Updating customer:', { id: customerId, name });
    
    const query = `UPDATE customers 
                   SET name = ?, email = ?, phone = ?, address = ?, city = ?
                   WHERE id = ?`;
    
    db.query(query, [name, email, phone, address, city, customerId], (err, result) => {
        if (err) {
            console.error('Error updating customer:', err);
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        console.log('✅ Customer updated successfully:', name);
        res.json({ message: 'Customer updated successfully' });
    });
});

// Delete customer
app.delete('/api/customers/:id', authenticateToken, (req, res) => {
    const customerId = req.params.id;
    
    console.log('🗑️ Deleting customer:', customerId);
    
    const query = 'DELETE FROM customers WHERE id = ?';
    db.query(query, [customerId], (err, result) => {
        if (err) {
            console.error('Error deleting customer:', err);
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        console.log('✅ Customer deleted successfully');
        res.json({ message: 'Customer deleted successfully' });
    });
});

// ==================== DASHBOARD ENDPOINTS ====================

// Dashboard Stats
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
    const queries = {
        totalSales: 'SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE payment_status = "paid"',
        totalProducts: 'SELECT COALESCE(COUNT(*), 0) as count FROM products',
        pendingDeliveries: 'SELECT COALESCE(COUNT(*), 0) as count FROM deliveries WHERE status = "pending"',
        totalCustomers: 'SELECT COALESCE(COUNT(*), 0) as count FROM customers',
        productsInStock: 'SELECT COALESCE(SUM(quantity), 0) as total FROM products',
        pendingOrders: 'SELECT COALESCE(COUNT(*), 0) as count FROM orders WHERE status = "pending"',
        monthlyRevenue: `SELECT COALESCE(SUM(total_amount), 0) as revenue FROM orders 
                        WHERE MONTH(order_date) = MONTH(CURRENT_DATE()) 
                        AND YEAR(order_date) = YEAR(CURRENT_DATE())
                        AND payment_status = "paid"`
    };
    
    const results = {};
    let completed = 0;
    const total = Object.keys(queries).length;
    
    for (const [key, query] of Object.entries(queries)) {
        db.query(query, (err, result) => {
            if (err) {
                console.error(`Error fetching ${key}:`, err);
                results[key] = 0;
            } else {
                results[key] = result[0]?.total || result[0]?.count || result[0]?.revenue || 0;
            }
            completed++;
            if (completed === total) {
                res.json(results);
            }
        });
    }
});

// Sales report endpoint
app.get('/api/reports/sales', authenticateToken, (req, res) => {
    const query = `
        SELECT 
            DATE_FORMAT(order_date, '%b') as month,
            COALESCE(SUM(total_amount), 0) as total_sales
        FROM orders
        WHERE payment_status = 'paid'
        GROUP BY DATE_FORMAT(order_date, '%Y-%m'), DATE_FORMAT(order_date, '%b')
        ORDER BY order_date DESC
        LIMIT 6
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching sales report:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results.reverse());
    });
});

// ==================== CREATE TABLES IF NOT EXISTS ====================

// Products table
const createProductsTable = `
    CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50),
        quantity INT DEFAULT 0,
        price DECIMAL(10,2) DEFAULT 0,
        unit VARCHAR(20) DEFAULT 'kg',
        min_stock INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
`;

// Customers table
const createCustomersTable = `
    CREATE TABLE IF NOT EXISTS customers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(100),
        total_purchases DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
`;

// Users table
const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;

// Create all tables
db.query(createUsersTable, (err) => {
    if (err) console.error('Error creating users table:', err);
    else console.log('✅ Users table ready');
});

db.query(createProductsTable, (err) => {
    if (err) console.error('Error creating products table:', err);
    else console.log('✅ Products table ready');
});

db.query(createCustomersTable, (err) => {
    if (err) console.error('Error creating customers table:', err);
    else console.log('✅ Customers table ready');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`✅ CORS enabled for http://localhost:5173 and http://localhost:5174`);
    console.log(`📝 Test the server: http://localhost:${PORT}/api/test`);
    console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
    console.log(`👥 Customers API: http://localhost:${PORT}/api/customers`);
    console.log(`🔐 Authentication API: http://localhost:${PORT}/api/register`);
    console.log(`\n✅ Ready to accept requests!\n`);
});