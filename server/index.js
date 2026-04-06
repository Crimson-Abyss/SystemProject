/* eslint-disable no-undef */
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const db = require('./database.js');
const app = express();
const port = 3002;
const JWT_SECRET = 'your-secret-key-change-this-in-production';
const GOOGLE_CLIENT_ID = '416200821719-omkfgogo5l80p3e0uv38gq5s1e4ntrba.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// --- Middleware ---
app.use(cors());
app.use(express.json());

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

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
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdAt = new Date().toISOString();
    const uid = crypto.randomUUID();

    const sql = `INSERT INTO users (uid, "fullName", email, phone, dob, gender, password, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`;
    const params = [uid, name, email, phone, dob, gender, hashedPassword, createdAt];

    const result = await db.query(sql, params);
    const newUserId = result.rows[0].id;

    const jwtPayload = { id: newUserId, email, name };
    const token = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      user: {
        id: newUserId,
        uid,
        fullName: name,
        email,
        phone,
        dob,
        gender,
        createdAt,
        role: 'user',
        points: 0,
        totalSpent: 0,
        membershipTier: 'Regular',
      },
      token
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    console.error('Database error on signup:', err.message);
    return res.status(500).json({ message: 'Error creating account.' });
  }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const sql = 'SELECT * FROM users WHERE email = $1';
  try {
    const result = await db.query(sql, [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const jwtPayload = { id: user.id, email: user.email, name: user.fullName };
    const token = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: '1h' });

    // Compute tier info
    const tierInfo = db.calculateTier(Number(user.totalSpent || 0));

    const { password: _, ...userProfile } = user;
    return res.json({
      message: 'Login successful',
      user: { ...userProfile, totalSpent: Number(userProfile.totalSpent || 0), membershipTier: tierInfo.tier, tierInfo },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login.' });
  }
});

// Google Auth Endpoint
app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ message: 'Token is required' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Check if user exists
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    let user = userResult.rows[0];

    if (!user) {
      // Create new user with random password
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      const createdAt = new Date().toISOString();
      const uid = crypto.randomUUID();

      const insertSql = `INSERT INTO users (uid, "fullName", email, password, "avatarUrl", "createdAt") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
      const insertParams = [uid, name, email, hashedPassword, picture, createdAt];
      
      const newResult = await db.query(insertSql, insertParams);
      user = newResult.rows[0];
    } else if (!user.avatarUrl && picture) {
      // Update avatar if we didn't have one
      await db.query('UPDATE users SET "avatarUrl" = $1 WHERE id = $2', [picture, user.id]);
      user.avatarUrl = picture;
    }

    const jwtPayload = { id: user.id, email: user.email, name: user.fullName };
    const token = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: '1h' });
    const tierInfo = db.calculateTier(Number(user.totalSpent || 0));

    const { password: _, ...userProfile } = user;
    return res.json({
      message: 'Google login successful',
      user: { ...userProfile, totalSpent: Number(userProfile.totalSpent || 0), membershipTier: tierInfo.tier, tierInfo },
      token
    });

  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(401).json({ message: 'Invalid Google token' });
  }
});

// Forgot Password Endpoint
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    // To prevent email enumeration, always return success even if user not found
    if (!user) {
      return res.json({ message: 'If an account with that email exists, we have sent a reset link.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await db.query(
      'UPDATE users SET "resetToken" = $1, "resetTokenExpiry" = $2 WHERE id = $3',
      [resetToken, resetTokenExpiry, user.id]
    );

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetLink = `${clientUrl}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"InsteaG Rewards" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #10B981;">InsteaG Rewards</h2>
          <h3>Reset Your Password</h3>
          <p>You recently requested a password reset for your account. Click the button below to securely set a new password:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #10B981; color: white; text-decoration: none; border-radius: 8px; margin-top: 15px; font-weight: bold;">Reset Password</a>
          <p style="margin-top: 25px; color: #666; font-size: 13px;">This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);

    res.json({ message: 'If an account with that email exists, we have sent a reset link.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error processing request.' });
  }
});

// Reset Password Endpoint
app.post('/api/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }

  try {
    const userResult = await db.query(
      'SELECT * FROM users WHERE "resetToken" = $1 AND "resetTokenExpiry" > NOW()',
      [token]
    );
    const user = userResult.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      'UPDATE users SET password = $1, "resetToken" = NULL, "resetTokenExpiry" = NULL WHERE id = $2',
      [hashedPassword, user.id]
    );

    res.json({ message: 'Password successfully reset.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password.' });
  }
});

// Get Current User Profile Endpoint
app.get('/api/me', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const sql = 'SELECT * FROM users WHERE id = $1';
  try {
    const result = await db.query(sql, [userId]);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const tierInfo = db.calculateTier(Number(user.totalSpent || 0));
    const { password: _, ...userProfile } = user;
    res.json({
      ...userProfile,
      totalSpent: Number(userProfile.totalSpent || 0),
      membershipTier: tierInfo.tier,
      tierInfo,
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    return res.status(500).json({ message: 'Server error fetching profile.' });
  }
});

// Tier Info Endpoint (public for display)
app.get('/api/tiers', (req, res) => {
  res.json(db.TIERS);
});

// History Endpoint - Protected
app.get('/api/history/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  if (parseInt(userId) !== req.user.id) {
    return res.status(403).json({ message: 'Access denied. You can only view your own history.' });
  }

  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 100;

  const sql = 'SELECT * FROM transactions WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT $2';
  try {
    const result = await db.query(sql, [userId, limit]);
    res.json(result.rows);
  } catch (err) {
    console.error('History fetch error:', err);
    return res.status(500).json({ message: 'Error fetching history.', error: err.message });
  }
});

// Rewards Endpoint
app.get('/api/rewards', async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 100;
  const sql = "SELECT * FROM rewards ORDER BY cost ASC LIMIT $1";
  try {
    const result = await db.query(sql, [limit]);
    res.json(result.rows);
  } catch (err) {
    console.error('Rewards fetch error:', err);
    return res.status(500).json({ message: 'Error fetching rewards.', error: err.message });
  }
});

// --- Order & Admin Endpoints ---

// Create Order (Admin/POS or App)
app.post('/api/orders', authenticateToken, async (req, res) => {
  const { items, totalAmount, type, pointsUsed } = req.body;
  let { userId } = req.body;

  if (type === 'app' && !userId) {
    userId = req.user.id;
  }

  const itemsStr = typeof items === 'string' ? items : JSON.stringify(items);
  const safePointsUsed = Math.max(0, parseInt(pointsUsed) || 0);

  // If points are being used, validate and deduct
  if (safePointsUsed > 0 && userId) {
    const userResult = await db.query('SELECT points FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];
    if (!user || user.points < safePointsUsed) {
      return res.status(400).json({ message: 'Insufficient points.' });
    }
  }

  // Calculate effective total after points discount (1 point = ₱1)
  const effectiveTotal = Math.max(0, totalAmount - safePointsUsed);

  // Get user tier for points multiplier
  let multiplier = 1;
  if (userId) {
    const userResult = await db.query('SELECT "totalSpent" FROM users WHERE id = $1', [userId]);
    if (userResult.rows[0]) {
      const tierInfo = db.calculateTier(Number(userResult.rows[0].totalSpent || 0));
      multiplier = tierInfo.multiplier;
    }
  }

  const basePoints = Math.floor(effectiveTotal / 10);
  const pointsAwarded = Math.floor(basePoints * multiplier);
  const createdAt = new Date().toISOString();

  let redemptionCode = null;
  let status = 'pending';
  let isRedeemed = false;

  if (type === 'instore') {
    redemptionCode = crypto.randomUUID();
    status = 'completed';
  }

  const sql = `INSERT INTO orders ("userId", items, "totalAmount", "pointsAwarded", "pointsUsed", status, type, "redemptionCode", "isRedeemed", "createdAt") 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`;

  const params = [userId || null, itemsStr, effectiveTotal, pointsAwarded, safePointsUsed, status, type, redemptionCode, isRedeemed, createdAt];

  try {
    const result = await db.query(sql, params);

    // Deduct points used
    if (safePointsUsed > 0 && userId) {
      await db.query('UPDATE users SET points = points - $1 WHERE id = $2', [safePointsUsed, userId]);
      await db.query(
        'INSERT INTO transactions ("userId", description, "pointsChange", "createdAt") VALUES ($1, $2, $3, $4)',
        [userId, `Points redeemed on Order #${result.rows[0].id}`, -safePointsUsed, createdAt]
      );
    }

    res.status(201).json({
      id: result.rows[0].id,
      redemptionCode,
      pointsAwarded,
      pointsUsed: safePointsUsed,
      effectiveTotal,
      message: 'Order created successfully'
    });
  } catch (err) {
    console.error("Error creating order:", err.message);
    res.status(500).json({ message: 'Error creating order' });
  }
});

// Get All Orders (Admin)
app.get('/api/orders', authenticateToken, async (req, res) => {
  const sql = 'SELECT orders.*, users."fullName" as "userName" FROM orders LEFT JOIN users ON orders."userId" = users.id ORDER BY orders."createdAt" DESC';
  try {
    const result = await db.query(sql);
    const orders = result.rows.map(order => ({
      ...order,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
    }));
    res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    return res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Confirm App Order (Admin)
app.put('/api/orders/:id/confirm', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const orderResult = await db.query("SELECT * FROM orders WHERE id = $1", [id]);
    const order = orderResult.rows[0];

    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status === 'completed') return res.status(400).json({ message: 'Order already completed' });

    // Update order status
    await db.query("UPDATE orders SET status = 'completed' WHERE id = $1", [id]);

    let tierUpgrade = null;

    // Award points and update totalSpent
    if (order.userId) {
      const orderAmount = Number(order.totalAmount);

      // Get current tier before update
      const userBefore = await db.query('SELECT "totalSpent" FROM users WHERE id = $1', [order.userId]);
      const oldTierInfo = db.calculateTier(Number(userBefore.rows[0].totalSpent || 0));

      // Update points and totalSpent
      await db.query(
        'UPDATE users SET points = points + $1, "totalSpent" = "totalSpent" + $2 WHERE id = $3',
        [order.pointsAwarded, orderAmount, order.userId]
      );

      // Check for tier upgrade
      const userAfter = await db.query('SELECT "totalSpent" FROM users WHERE id = $1', [order.userId]);
      const newTierInfo = db.calculateTier(Number(userAfter.rows[0].totalSpent || 0));

      if (newTierInfo.tier !== oldTierInfo.tier) {
        // Update membershipTier
        await db.query('UPDATE users SET "membershipTier" = $1 WHERE id = $2', [newTierInfo.tier, order.userId]);
        tierUpgrade = { from: oldTierInfo.tier, to: newTierInfo.tier };
      }

      // Log transaction
      await db.query(
        'INSERT INTO transactions ("userId", description, "pointsChange", "createdAt") VALUES ($1, $2, $3, $4)',
        [order.userId, `Order #${order.id} Completed (+${newTierInfo.multiplier}× multiplier)`, order.pointsAwarded, new Date().toISOString()]
      );
    }

    res.json({ message: 'Order confirmed and points awarded', tierUpgrade });

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
    const orderResult = await db.query('SELECT * FROM orders WHERE "redemptionCode" = $1', [redemptionCode]);
    const order = orderResult.rows[0];

    if (!order) return res.status(404).json({ message: 'Invalid code' });
    if (order.isRedeemed) return res.status(400).json({ message: 'Code already redeemed' });

    // Mark as redeemed
    await db.query('UPDATE orders SET "isRedeemed" = true WHERE id = $1', [order.id]);

    const orderAmount = Number(order.totalAmount);

    // Get current tier for multiplier
    const userBefore = await db.query('SELECT "totalSpent" FROM users WHERE id = $1', [userId]);
    const oldTierInfo = db.calculateTier(Number(userBefore.rows[0].totalSpent || 0));

    // Award points with multiplier and update totalSpent
    const basePoints = Math.floor(orderAmount / 10);
    const pointsToAward = Math.floor(basePoints * oldTierInfo.multiplier);

    await db.query(
      'UPDATE users SET points = points + $1, "totalSpent" = "totalSpent" + $2 WHERE id = $3',
      [pointsToAward, orderAmount, userId]
    );

    // Check for tier upgrade
    const userAfter = await db.query('SELECT "totalSpent" FROM users WHERE id = $1', [userId]);
    const newTierInfo = db.calculateTier(Number(userAfter.rows[0].totalSpent || 0));
    let tierUpgrade = null;

    if (newTierInfo.tier !== oldTierInfo.tier) {
      await db.query('UPDATE users SET "membershipTier" = $1 WHERE id = $2', [newTierInfo.tier, userId]);
      tierUpgrade = { from: oldTierInfo.tier, to: newTierInfo.tier };
    }

    // Log transaction
    await db.query(
      'INSERT INTO transactions ("userId", description, "pointsChange", "createdAt") VALUES ($1, $2, $3, $4)',
      [userId, `In-store Order #${order.id} (${newTierInfo.multiplier}× multiplier)`, pointsToAward, new Date().toISOString()]
    );

    res.json({
      message: `Successfully claimed ${pointsToAward} points!`,
      pointsAwarded: pointsToAward,
      tierUpgrade,
    });

  } catch (err) {
    console.error("Error claiming points:", err.message);
    res.status(500).json({ message: 'Error claiming points' });
  }
});

// --- Admin Management Endpoints ---

// Products CRUD
app.get('/api/products', async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM products ORDER BY category, subcategory, price");
    const products = result.rows.map(p => ({
      ...p,
      price: Number(p.price),
      rating: p.rating ? Number(p.rating) : null,
      sizes: typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes,
    }));
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    return res.status(500).json({ message: 'Error fetching products' });
  }
});

app.post('/api/products', authenticateToken, async (req, res) => {
  const { name, description, price, category, subcategory, sizes, rating, badge, image } = req.body;
  const sql = "INSERT INTO products (name, description, price, category, subcategory, sizes, rating, badge, image) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id";
  const sizesStr = sizes ? (typeof sizes === 'string' ? sizes : JSON.stringify(sizes)) : null;
  try {
    const result = await db.query(sql, [name, description, price, category, subcategory, sizesStr, rating, badge, image]);
    res.json({ id: result.rows[0].id, message: 'Product added successfully' });
  } catch (err) {
    console.error("Error adding product:", err);
    return res.status(500).json({ message: 'Error adding product' });
  }
});

app.put('/api/products/:id', authenticateToken, async (req, res) => {
  const { name, description, price, category, subcategory, sizes, rating, badge, image } = req.body;
  const sql = "UPDATE products SET name = $1, description = $2, price = $3, category = $4, subcategory = $5, sizes = $6, rating = $7, badge = $8, image = $9 WHERE id = $10";
  const sizesStr = sizes ? (typeof sizes === 'string' ? sizes : JSON.stringify(sizes)) : null;
  try {
    await db.query(sql, [name, description, price, category, subcategory, sizesStr, rating, badge, image, req.params.id]);
    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error("Error updating product:", err);
    return res.status(500).json({ message: 'Error updating product' });
  }
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    await db.query("DELETE FROM products WHERE id = $1", [req.params.id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error("Error deleting product:", err);
    return res.status(500).json({ message: 'Error deleting product' });
  }
});

// Rewards CRUD
app.post('/api/rewards', authenticateToken, async (req, res) => {
  const { title, description, cost } = req.body;
  try {
    const result = await db.query("INSERT INTO rewards (title, description, cost) VALUES ($1, $2, $3) RETURNING id", [title, description, cost]);
    res.json({ id: result.rows[0].id, message: 'Reward added successfully' });
  } catch (err) {
    console.error("Error adding reward:", err);
    return res.status(500).json({ message: 'Error adding reward' });
  }
});

app.put('/api/rewards/:id', authenticateToken, async (req, res) => {
  const { title, description, cost } = req.body;
  try {
    await db.query("UPDATE rewards SET title = $1, description = $2, cost = $3 WHERE id = $4", [title, description, cost, req.params.id]);
    res.json({ message: 'Reward updated successfully' });
  } catch (err) {
    console.error("Error updating reward:", err);
    return res.status(500).json({ message: 'Error updating reward' });
  }
});

app.delete('/api/rewards/:id', authenticateToken, async (req, res) => {
  try {
    await db.query("DELETE FROM rewards WHERE id = $1", [req.params.id]);
    res.json({ message: 'Reward deleted successfully' });
  } catch (err) {
    console.error("Error deleting reward:", err);
    return res.status(500).json({ message: 'Error deleting reward' });
  }
});

// Re-seed products endpoint (admin only)
app.post('/api/admin/reseed-products', authenticateToken, async (req, res) => {
  try {
    await db.query('DELETE FROM products');
    // Trigger re-seed by restarting (or manually calling seedProducts)
    res.json({ message: 'Products cleared. Restart server to re-seed.' });
  } catch (err) {
    console.error("Error re-seeding:", err);
    res.status(500).json({ message: 'Error re-seeding products' });
  }
});

// User Management
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT id, "fullName", email, role, points, "totalSpent", "membershipTier", "createdAt" FROM users');
    const users = result.rows.map(u => ({
      ...u,
      totalSpent: Number(u.totalSpent || 0),
      membershipTier: db.calculateTier(Number(u.totalSpent || 0)).tier,
    }));
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    return res.status(500).json({ message: 'Error fetching users' });
  }
});

// Analytics
app.get('/api/analytics', authenticateToken, async (req, res) => {
  try {
    const revenueResult = await db.query("SELECT SUM(\"totalAmount\") as total FROM orders WHERE status = 'completed'");
    const totalRevenue = revenueResult.rows[0].total || 0;

    const ordersResult = await db.query("SELECT COUNT(*) FROM orders");
    const totalOrders = ordersResult.rows[0].count || 0;

    const usersResult = await db.query("SELECT COUNT(*) FROM users WHERE role = 'user'");
    const totalUsers = usersResult.rows[0].count || 0;

    res.json({
      totalRevenue: Number(totalRevenue),
      totalOrders: Number(totalOrders),
      totalUsers: Number(totalUsers)
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ message: 'Error fetching analytics' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

module.exports = app;
