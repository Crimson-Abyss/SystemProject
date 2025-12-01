/* eslint-disable no-undef */
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const bcrypt = require('bcrypt');

// Use ':memory:' for an in-memory database, or a file path for a persistent one.
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');

    // Create the users table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uid TEXT UNIQUE,
      fullName TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      dob TEXT,
      gender TEXT,
      password TEXT NOT NULL,
      membershipTier TEXT DEFAULT 'Gold Member',
      points INTEGER NOT NULL DEFAULT 0,
      avatarUrl TEXT,
      role TEXT DEFAULT 'user',
      createdAt TEXT NOT NULL
    )`, (err) => {
      if (err) {
        console.error("Error creating table", err.message);
      } else {
        // Migration: Check if 'uid' column exists (for existing databases)
        db.all("PRAGMA table_info(users)", (err, columns) => {
          if (err) {
            console.error("Error checking table info", err.message);
            return;
          }
          const hasUid = columns.some(col => col.name === 'uid');
          if (!hasUid) {
            console.log("Adding 'uid' column to users table...");
            db.run("ALTER TABLE users ADD COLUMN uid TEXT", (err) => {
              if (err) {
                console.error("Error adding uid column", err.message);
              } else {
                console.log("'uid' column added.");
                // Backfill UIDs for existing users
                backfillUids();
              }
            });
          } else {
            // Also check for null UIDs even if column exists
            backfillUids();
          }

          // Migration: Check if 'role' column exists
          const hasRole = columns.some(col => col.name === 'role');
          if (!hasRole) {
            console.log("Adding 'role' column to users table...");
            db.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'", (err) => {
              if (err) {
                console.error("Error adding role column", err.message);
              } else {
                console.log("'role' column added.");
              }
            });
          }

          // Migration: Check if 'points' column exists
          const hasPoints = columns.some(col => col.name === 'points');
          if (!hasPoints) {
            console.log("Adding 'points' column to users table...");
            db.run("ALTER TABLE users ADD COLUMN points INTEGER NOT NULL DEFAULT 0", (err) => {
              if (err) console.error("Error adding points column", err.message);
              else console.log("'points' column added.");
            });
          }

          seedAdmin();
        
        });
      }
    });

    // Function to backfill UIDs
    function backfillUids() {
      db.all("SELECT id FROM users WHERE uid IS NULL", (err, rows) => {
        if (err) return console.error("Error finding users without UID", err.message);

        if (rows.length > 0) {
          console.log(`Found ${rows.length} users without UID. Backfilling...`);
          const stmt = db.prepare("UPDATE users SET uid = ? WHERE id = ?");
          rows.forEach(row => {
            const uid = crypto.randomUUID();
            stmt.run(uid, row.id);
          });
          stmt.finalize(() => console.log("Backfill complete."));
        }
      });
    }

    // Function to seed admin user
    function seedAdmin() {
      db.get("SELECT id FROM users WHERE role = 'admin'", (err, row) => {
        if (err) {
          console.error("Error checking for admin user", err.message);
          return;
        }
        if (!row) {
          console.log("No admin user found. Creating default admin...");
          const password = 'admin'; // Default password
          const saltRounds = 10;
          bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) {
              console.error("Error hashing admin password", err);
              return;
            }
            const insert = db.prepare(`INSERT INTO users (uid, fullName, email, password, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)`);
            insert.run(crypto.randomUUID(), 'Admin User', 'admin@insteag.com', hash, 'admin', new Date().toISOString(), (err) => {
              if (err) {
                console.error("Error creating admin user", err.message);
              } else {
                console.log("Default admin user created: admin@insteag.com / admin");
              }
            });
            insert.finalize();
          });
        } else {
          console.log("Admin user already exists.");
        }
      });
    }

    // Create the transactions table to log points history
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      description TEXT NOT NULL,
      pointsChange INTEGER NOT NULL,
            createdAt TEXT NOT NULL,
              FOREIGN KEY(userId) REFERENCES users(id)
    )`, (err) => {
      if (err) {
        console.error("Error creating transactions table", err.message);
      }
    });

    // Create the rewards table
    db.run(`CREATE TABLE IF NOT EXISTS rewards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                cost INTEGER NOT NULL
              )`, (err) => {
      if (err) {
        console.error("Error creating rewards table", err.message);
      } else {
        // Pre-populate with some data if the table is new
        db.get("SELECT COUNT(*) as count FROM rewards", (err, row) => {
          if (row.count === 0) {
            const stmt = db.prepare("INSERT INTO rewards (title, description, cost) VALUES (?, ?, ?)");
            const rewardsData = [
              { title: 'Free Coffee', description: 'Freshly brewed, any size.', cost: 150 },
              { title: 'Bakery Pastry', description: 'Croissant, muffin or cookie.', cost: 100 },
              { title: 'Smoothie', description: 'Choose any flavor.', cost: 200 },
              { title: 'Lunch Combo', description: 'Sandwich + drink.', cost: 350 },
            ];
            rewardsData.forEach(r => stmt.run(r.title, r.description, r.cost));
            stmt.finalize();
            console.log('Populated rewards table with initial data.');
          }
        });
      }
    });

    // Create the orders table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER,
                items TEXT NOT NULL,
                totalAmount INTEGER NOT NULL,
                pointsAwarded INTEGER NOT NULL,
                status TEXT DEFAULT 'pending',
                type TEXT NOT NULL,
                redemptionCode TEXT UNIQUE,
                isRedeemed INTEGER DEFAULT 0,
                createdAt TEXT NOT NULL,
                FOREIGN KEY(userId) REFERENCES users(id)
              )`, (err) => {
      if (err) {
        console.error("Error creating orders table", err.message);
      }
    });

    // Create the products table
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category TEXT,
      rating REAL,
      badge TEXT,
      image TEXT
    )`, (err) => {
      if (err) {
        console.error("Error creating products table", err.message);
      } else {
        // Seed products if empty
        db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
          if (row.count === 0) {
            const stmt = db.prepare("INSERT INTO products (name, description, price, category, rating, badge) VALUES (?, ?, ?, ?, ?, ?)");
            const productsData = [
              { name: 'House Blend Coffee', description: 'Our signature rich & smooth drip coffee.', price: 175.00, category: 'Coffee', rating: 4.6, badge: 'Bestseller' },
              { name: 'Matcha Latte', description: 'Ceremonial grade matcha with steamed milk.', price: 210.00, category: 'Tea', rating: 4.8, badge: null },
              { name: 'Blueberry Muffin', description: 'Freshly baked with wild blueberries.', price: 140.00, category: 'Pastries', rating: 4.4, badge: 'New' },
              { name: 'Iced Caramel Latte', description: 'Espresso, milk, and caramel over ice.', price: 235.00, category: 'Coffee', rating: 4.7, badge: null },
              { name: 'Vegan Brownie', description: 'A rich, fudgy brownie, completely plant-based.', price: 155.00, category: 'Pastries', rating: 4.5, badge: null },
              { name: 'Earl Grey Tea', description: 'Classic black tea with bergamot.', price: 125.00, category: 'Tea', rating: 4.3, badge: null },
            ];
            productsData.forEach(p => stmt.run(p.name, p.description, p.price, p.category, p.rating, p.badge));
            stmt.finalize();
            console.log('Populated products table with initial data.');
          }
        });
      }
    });
  }
});

module.exports = db;