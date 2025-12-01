/* eslint-disable no-undef */
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const crypto = require('crypto'); // Import crypto for token generation, etc.
const db = require('./database.js'); // Import the database connection

const app = express();
const port = 3002;
const JWT_SECRET = 'your-secret-key-change-this-in-production'; // In production, use environment variable

// --- Middleware ---
// Use cors to allow cross-origin requests from your frontend
app.use(cors());
// Use express.json() to parse JSON bodies from incoming requests
app.use(express.json());

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token.' });
    req.user = user;
    next();
  });
};


// --- API Endpoints ---

// Signup Endpoint
app.post('/api/signup', async (req, res) => {
  const { name, email, phone, dob, gender, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password for security
    const createdAt = new Date().toISOString();

    const sql = `INSERT INTO users (fullName, email, phone, dob, gender, password, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [name, email, phone, dob, gender, hashedPassword, createdAt];

    // Wrap db.run in a Promise to use await
    const result = await new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID });
      });
    });

    // Return the newly created user profile (excluding the password)
    // Create JWT Payload
    const jwtPayload = {
      id: result.id,
      email,
      name
    };
    const token = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: '1h' });

    // Return the newly created user profile and token
    res.status(201).json({
      user: {
        id: result.id,
        fullName: name,
        email,
        phone,
        dob,
        gender,
        createdAt,
        role: 'user', // Default role
        points: 0 // Default points
      },
      token
    });
  } catch (err) {
    // Check for unique constraint violation (email already exists)
    if (err.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    console.error('Database error on signup:', err.message);
    return res.status(500).json({ message: 'Error creating account.' });
  }
});

// Login Endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.get(sql, [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Server error during login.' });
    }
    // Check for user and then compare password
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT Payload
    const jwtPayload = {
      id: user.id,
      email: user.email,
      name: user.fullName
    };
    // Sign the token
    const token = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: '1h' });

    // Passwords match. Don't send the password hash back to the client.
    const { password: _, ...userProfile } = user;
    return res.json({ message: 'Login successful', user: userProfile, token });
  });
});

// Get Current User Profile Endpoint
app.get('/api/me', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const sql = 'SELECT * FROM users WHERE id = ?';
  db.get(sql, [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Server error fetching profile.' });
    }
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const { password: _, ...userProfile } = user;
    res.json(userProfile);
  });
});

// History Endpoint - Protected
app.get('/api/history/:userId', authenticateToken, (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  // Security Check: Ensure the logged-in user matches the requested user ID
  if (parseInt(userId) !== req.user.id) {
    return res.status(403).json({ message: 'Access denied. You can only view your own history.' });
  }

  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 100;

  const sql = "SELECT * FROM transactions WHERE userId = ? ORDER BY createdAt DESC LIMIT ?";
  db.all(sql, [userId, limit], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching history.', error: err.message });
    }
    res.json(rows);
  });
});

// Rewards Endpoint - Public (but could be protected)
app.get('/api/rewards', (req, res) => {
  // Optional: use req.query.limit to limit results for homepage preview
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 100;

  const sql = "SELECT * FROM rewards ORDER BY cost ASC LIMIT ?";
  db.all(sql, [limit], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching rewards.', error: err.message });
    }
    res.json(rows);
  });
});

// --- Order & Admin Endpoints ---

// Create Order (Admin/POS or App)
app.post('/api/orders', authenticateToken, async (req, res) => {
  const { items, totalAmount, type } = req.body;
  let { userId } = req.body;

  // For app orders, default to the logged-in user if not specified
  if (type === 'app' && !userId) {
    userId = req.user.id;
  }
  // items should be a JSON string or object we stringify
  const itemsStr = typeof items === 'string' ? items : JSON.stringify(items);
  const pointsAwarded = Math.floor(totalAmount / 10); // 1 point per 10 currency units (example)
  const createdAt = new Date().toISOString();

  let redemptionCode = null;
  let status = 'pending';
  let isRedeemed = 0;

  if (type === 'instore') {
    redemptionCode = crypto.randomUUID();
    status = 'completed'; // In-store orders are completed immediately upon payment
  }

  const sql = `INSERT INTO orders (userId, items, totalAmount, pointsAwarded, status, type, redemptionCode, isRedeemed, createdAt) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const params = [userId || null, itemsStr, totalAmount, pointsAwarded, status, type, redemptionCode, isRedeemed, createdAt];

  try {
    const result = await new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID });
      });
    });

    res.status(201).json({
      id: result.id,
      redemptionCode,
      pointsAwarded,
      message: 'Order created successfully'
    });
  } catch (err) {
    console.error("Error creating order:", err.message);
    res.status(500).json({ message: 'Error creating order' });
  }
});

// Get All Orders (Admin only - simplified check)
app.get('/api/orders', authenticateToken, (req, res) => {
  // In a real app, check req.user.role === 'admin'
  const sql = "SELECT orders.*, users.fullName as userName FROM orders LEFT JOIN users ON orders.userId = users.id ORDER BY createdAt DESC";
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error fetching orders' });

    // Parse items JSON
    const orders = rows.map(order => ({
      ...order,
      items: JSON.parse(order.items)
    }));
    res.json(orders);
  });
});

// Confirm App Order (Admin)
app.put('/api/orders/:id/confirm', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Get the order
    const order = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM orders WHERE id = ?", [id], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status === 'completed') return res.status(400).json({ message: 'Order already completed' });

    // 2. Update order status
    await new Promise((resolve, reject) => {
      db.run("UPDATE orders SET status = 'completed' WHERE id = ?", [id], (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    // 3. Award points to user
    if (order.userId) {
      await new Promise((resolve, reject) => {
        db.run("UPDATE users SET points = points + ? WHERE id = ?", [order.pointsAwarded, order.userId], (err) => {
          if (err) reject(err);
          resolve();
        });
      });

      // Log transaction
      await new Promise((resolve, reject) => {
        db.run("INSERT INTO transactions (userId, description, pointsChange, createdAt) VALUES (?, ?, ?, ?)",
          [order.userId, `Order #${order.id} Completed`, order.pointsAwarded, new Date().toISOString()],
          (err) => {
            if (err) reject(err);
            resolve();
          }
        );
      });
    }

    res.json({ message: 'Order confirmed and points awarded' });

  } catch (err) {
    console.error("Error confirming order:", err.message);
    res.status(500).json({ message: 'Error confirming order' });
  }
});

// Claim Points via QR Code (User)
app.post('/api/claim-points', authenticateToken, async (req, res) => {
  const { redemptionCode } = req.body;
  const userId = req.user.id;

  if (!redemptionCode) return res.status(400).json({ message: 'Redemption code required' });

  try {
    const order = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM orders WHERE redemptionCode = ?", [redemptionCode], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    if (!order) return res.status(404).json({ message: 'Invalid code' });
    if (order.isRedeemed) return res.status(400).json({ message: 'Code already redeemed' });

    // Mark as redeemed
    await new Promise((resolve, reject) => {
      db.run("UPDATE orders SET isRedeemed = 1 WHERE id = ?", [order.id], (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    // Award points
    await new Promise((resolve, reject) => {
      db.run("UPDATE users SET points = points + ? WHERE id = ?", [order.pointsAwarded, userId], (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    // Log transaction
    await new Promise((resolve, reject) => {
      db.run("INSERT INTO transactions (userId, description, pointsChange, createdAt) VALUES (?, ?, ?, ?)",
        [userId, `In-store Order #${order.id}`, order.pointsAwarded, new Date().toISOString()],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });

    res.json({ message: `Successfully claimed ${order.pointsAwarded} points!` });

  } catch (err) {
    console.error("Error claiming points:", err.message);
    res.status(500).json({ message: 'Error claiming points' });
  }
});

// --- Admin Management Endpoints ---

// Products CRUD
app.get('/api/products', (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error fetching products' });
    res.json(rows);
  });
});

app.post('/api/products', authenticateToken, (req, res) => {
  const { name, description, price, category, rating, badge, image } = req.body;
  const sql = "INSERT INTO products (name, description, price, category, rating, badge, image) VALUES (?, ?, ?, ?, ?, ?, ?)";
  db.run(sql, [name, description, price, category, rating, badge, image], function(err) {
    if (err) return res.status(500).json({ message: 'Error adding product' });
    res.json({ id: this.lastID, message: 'Product added successfully' });
  });
});

app.put('/api/products/:id', authenticateToken, (req, res) => {
  const { name, description, price, category, rating, badge, image } = req.body;
  const sql = "UPDATE products SET name = ?, description = ?, price = ?, category = ?, rating = ?, badge = ?, image = ? WHERE id = ?";
  db.run(sql, [name, description, price, category, rating, badge, image, req.params.id], function(err) {
    if (err) return res.status(500).json({ message: 'Error updating product' });
    res.json({ message: 'Product updated successfully' });
  });
});

app.delete('/api/products/:id', authenticateToken, (req, res) => {
  db.run("DELETE FROM products WHERE id = ?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ message: 'Error deleting product' });
    res.json({ message: 'Product deleted successfully' });
  });
});

// Rewards CRUD (GET already exists)
app.post('/api/rewards', authenticateToken, (req, res) => {
  const { title, description, cost } = req.body;
  db.run("INSERT INTO rewards (title, description, cost) VALUES (?, ?, ?)", [title, description, cost], function(err) {
    if (err) return res.status(500).json({ message: 'Error adding reward' });
    res.json({ id: this.lastID, message: 'Reward added successfully' });
  });
});

app.put('/api/rewards/:id', authenticateToken, (req, res) => {
  const { title, description, cost } = req.body;
  db.run("UPDATE rewards SET title = ?, description = ?, cost = ? WHERE id = ?", [title, description, cost, req.params.id], function(err) {
    if (err) return res.status(500).json({ message: 'Error updating reward' });
    res.json({ message: 'Reward updated successfully' });
  });
});

app.delete('/api/rewards/:id', authenticateToken, (req, res) => {
  db.run("DELETE FROM rewards WHERE id = ?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ message: 'Error deleting reward' });
    res.json({ message: 'Reward deleted successfully' });
  });
});

// User Management
app.get('/api/users', authenticateToken, (req, res) => {
  db.all("SELECT id, fullName, email, role, points, membershipTier, createdAt FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error fetching users' });
    res.json(rows);
  });
});

// Analytics
app.get('/api/analytics', authenticateToken, async (req, res) => {
  try {
    const totalRevenue = await new Promise((resolve, reject) => {
      db.get("SELECT SUM(totalAmount) as total FROM orders WHERE status = 'completed'", (err, row) => {
        if (err) reject(err);
        resolve(row?.total || 0);
      });
    });

    const totalOrders = await new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM orders", (err, row) => {
        if (err) reject(err);
        resolve(row?.count || 0);
      });
    });

    const totalUsers = await new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM users WHERE role = 'user'", (err, row) => {
        if (err) reject(err);
        resolve(row?.count || 0);
      });
    });

    res.json({
      totalRevenue,
      totalOrders,
      totalUsers
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ message: 'Error fetching analytics' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
