const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('./database.js'); // Import the database connection

const app = express();
const port = 3001;
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

  const hashedPassword = await bcrypt.hash(password, 10); // Hash the password for security
  const createdAt = new Date().toISOString();
  const uid = crypto.randomUUID();

  const sql = `INSERT INTO users (uid, fullName, email, phone, dob, gender, password, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [uid, name, email, phone, dob, gender, hashedPassword, createdAt];

  db.run(sql, params, function (err) {
    if (err) {
      // Check for unique constraint violation (email already exists)
      if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(409).json({ message: 'An account with this email already exists.' });
      }
      console.error('Database error on signup:', err.message);
      return res.status(500).json({ message: 'Error creating account.' });
    }

    const userProfile = {
      id: this.lastID,
      uid: uid,
      fullName: name,
      email,
      phone,
      dob,
      gender,
      createdAt,
    };

    // Generate Token
    const token = jwt.sign({ id: userProfile.id, uid: userProfile.uid, email: userProfile.email }, JWT_SECRET, { expiresIn: '1h' });

    // Return the newly created user profile and token
    res.status(201).json({
      user: userProfile,
      token: token
    });
  });
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

    // Passwords match. Don't send the password hash back to the client.
    const { password: _, ...userProfile } = user;

    // Generate Token
    const token = jwt.sign({ id: userProfile.id, uid: userProfile.uid, email: userProfile.email }, JWT_SECRET, { expiresIn: '1h' });

    return res.json({ message: 'Login successful', user: userProfile, token });
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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
