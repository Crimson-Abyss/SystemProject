const sqlite3 = require('sqlite3').verbose();

// Use ':memory:' for an in-memory database, or a file path for a persistent one.
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    // Create the users table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      dob TEXT,
      gender TEXT,
      password TEXT NOT NULL,
      membershipTier TEXT DEFAULT 'Gold Member',
      points INTEGER NOT NULL DEFAULT 0,
      avatarUrl TEXT,
      createdAt TEXT NOT NULL
    )`, (err) => {
      if (err) {
        console.error("Error creating table", err.message);
      }
    });

    // Create the transactions table to log points history
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      description TEXT NOT NULL,
      pointsChange INTEGER NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users (id)
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
  }
});

module.exports = db;