/* eslint-disable no-undef */
const { Pool } = require('pg');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Initialize PostgreSQL connection pool using Supabase URI
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to the PostgreSQL database.');

  initializeDatabase(client)
    .then(() => release())
    .catch((err) => {
      console.error('Error initializing database:', err);
      release();
    });
});

// --- Tier System Constants ---
const TIERS = [
  { name: 'Regular',  threshold: 0,     multiplier: 1,   discount: 0,  birthdayBonus: 0   },
  { name: 'Silver',   threshold: 2000,  multiplier: 1.5, discount: 5,  birthdayBonus: 50  },
  { name: 'Gold',     threshold: 5000,  multiplier: 2,   discount: 10, birthdayBonus: 100 },
  { name: 'Platinum', threshold: 15000, multiplier: 3,   discount: 15, birthdayBonus: 200 },
];

function calculateTier(totalSpent) {
  let currentTier = TIERS[0];
  for (const tier of TIERS) {
    if (totalSpent >= tier.threshold) {
      currentTier = tier;
    }
  }
  // Find next tier
  const currentIndex = TIERS.indexOf(currentTier);
  const nextTier = currentIndex < TIERS.length - 1 ? TIERS[currentIndex + 1] : null;
  return {
    tier: currentTier.name,
    multiplier: currentTier.multiplier,
    discount: currentTier.discount,
    birthdayBonus: currentTier.birthdayBonus,
    nextTier: nextTier ? nextTier.name : null,
    nextTierThreshold: nextTier ? nextTier.threshold : null,
    progress: nextTier ? ((totalSpent - currentTier.threshold) / (nextTier.threshold - currentTier.threshold)) * 100 : 100,
  };
}

async function initializeDatabase(client) {
  try {
    // 1. Create Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        uid UUID UNIQUE,
        "fullName" VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(50),
        dob DATE,
        gender VARCHAR(50),
        password VARCHAR(255) NOT NULL,
        "membershipTier" VARCHAR(50) DEFAULT 'Regular',
        points INTEGER NOT NULL DEFAULT 0,
        "totalSpent" NUMERIC NOT NULL DEFAULT 0,
        "avatarUrl" TEXT,
        role VARCHAR(50) DEFAULT 'user',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add totalSpent column if it doesn't exist (migration for existing DBs)
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE users ADD COLUMN IF NOT EXISTS "totalSpent" NUMERIC NOT NULL DEFAULT 0;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS "resetToken" VARCHAR(255);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS "resetTokenExpiry" TIMESTAMP WITH TIME ZONE;
      EXCEPTION WHEN others THEN NULL;
      END $$;
    `);

    // Ensure all existing users have UIDs
    await backfillUids(client);
    // Ensure default admin exists
    await seedAdmin(client);

    // 2. Create Transactions Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL REFERENCES users(id),
        description TEXT NOT NULL,
        "pointsChange" INTEGER NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Create Rewards Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS rewards (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        cost INTEGER NOT NULL
      )
    `);

    // Seed Rewards if empty
    const rewardsResult = await client.query('SELECT COUNT(*) FROM rewards');
    if (parseInt(rewardsResult.rows[0].count, 10) === 0) {
      const rewardsData = [
        ['Free Regular Milktea', 'Any regular series milktea, medium size.', 100],
        ['Free Coffee Upgrade', 'Upgrade any coffee drink to Venti.', 80],
        ['Free Add-on', 'Any add-on topping for free.', 50],
        ['Free Cream Cheese Milktea', 'Any flavor from the Cream Cheese Series.', 150],
        ['Free Premium Drink', 'Any drink from the Premium Series.', 200],
        ['Free Signature Drink', 'Any Signature Drink, Venti size.', 250],
      ];
      for (const reward of rewardsData) {
        await client.query('INSERT INTO rewards (title, description, cost) VALUES ($1, $2, $3)', reward);
      }
      console.log('Populated rewards table with initial data.');
    }

    // 4. Create Orders Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER REFERENCES users(id),
        items JSONB NOT NULL,
        "totalAmount" NUMERIC NOT NULL,
        "pointsAwarded" INTEGER NOT NULL,
        "pointsUsed" INTEGER NOT NULL DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pending',
        type VARCHAR(50) NOT NULL,
        "redemptionCode" UUID UNIQUE,
        "isRedeemed" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add pointsUsed column if it doesn't exist (migration)
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS "pointsUsed" INTEGER NOT NULL DEFAULT 0;
      EXCEPTION WHEN others THEN NULL;
      END $$;
    `);

    // 5. Create Products Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price NUMERIC NOT NULL,
        category VARCHAR(100),
        subcategory VARCHAR(100),
        sizes JSONB,
        rating NUMERIC,
        badge VARCHAR(50),
        image TEXT
      )
    `);

    // Add new columns if missing (migration for existing DBs)
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100);
        ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes JSONB;
      EXCEPTION WHEN others THEN NULL;
      END $$;
    `);

    // Seed Products if empty
    const productsResult = await client.query('SELECT COUNT(*) FROM products');
    if (parseInt(productsResult.rows[0].count, 10) === 0) {
      await seedProducts(client);
    }

  } catch (err) {
    console.error('Database initialization error:', err);
    throw err;
  }
}

async function seedProducts(client) {
  // ==========================================
  // MILKTEA — REGULAR SERIES
  // ==========================================
  const milkteaRegular = [
    ['Classic Milktea', 'Our timeless classic milk tea blend.', 90, 'Milktea', 'Regular Series', '{"M":65,"L":70,"1L":90,"B1T1":90}', 4.6, 'Bestseller', '/images/menu/classic_milktea.png'],
    ['Chocolate', 'Rich chocolate milk tea.', 90, 'Milktea', 'Regular Series', '{"M":65,"L":70,"1L":90,"B1T1":90}', 4.5, null, '/images/menu/chocolate_milktea.png'],
    ['Cookies & Cream', 'Cookies and cream flavored milk tea.', 90, 'Milktea', 'Regular Series', '{"M":65,"L":70,"1L":90,"B1T1":90}', 4.5, null, '/images/menu/classic_milktea.png'],
    ['Dark Choco', 'Deep dark chocolate milk tea.', 90, 'Milktea', 'Regular Series', '{"M":65,"L":70,"1L":90,"B1T1":90}', 4.4, null, '/images/menu/chocolate_milktea.png'],
    ['Red Velvet', 'Creamy red velvet flavored milk tea.', 95, 'Milktea', 'Regular Series', '{"M":70,"L":80,"1L":95,"B1T1":95}', 4.7, null, '/images/menu/red_velvet_milktea.png'],
    ['Cheesecake', 'Rich cheesecake flavored milk tea.', 95, 'Milktea', 'Regular Series', '{"M":70,"L":80,"1L":95,"B1T1":95}', 4.6, null, '/images/menu/cream_cheese_milktea.png'],
    ['Black Forest', 'Chocolate cherry milk tea blend.', 95, 'Milktea', 'Regular Series', '{"M":70,"L":80,"1L":95,"B1T1":95}', 4.5, null, '/images/menu/chocolate_milktea.png'],
    ['Strawberry', 'Sweet strawberry milk tea.', 99, 'Milktea', 'Regular Series', '{"M":70,"L":80,"1L":95,"B1T1":99}', 4.7, null, '/images/menu/strawberry_milktea.png'],
    ['Cappuccino', 'Coffee-flavored milk tea.', 99, 'Milktea', 'Regular Series', '{"M":70,"L":80,"1L":95,"B1T1":99}', 4.4, null, '/images/menu/caramel_milktea.png'],
    ['Vanilla', 'Smooth vanilla milk tea.', 99, 'Milktea', 'Regular Series', '{"M":70,"L":80,"1L":95,"B1T1":99}', 4.3, null, '/images/menu/classic_milktea.png'],
    ['Mango', 'Tropical mango milk tea.', 99, 'Milktea', 'Regular Series', '{"M":70,"L":80,"1L":95,"B1T1":99}', 4.5, null, '/images/menu/strawberry_milktea.png'],
    ['Wintermelon', 'Refreshing wintermelon milk tea.', 99, 'Milktea', 'Regular Series', '{"M":70,"L":80,"1L":95,"B1T1":99}', 4.6, null, '/images/menu/classic_milktea.png'],
    ['Salted Caramel', 'Sweet & salty caramel milk tea.', 99, 'Milktea', 'Regular Series', '{"M":70,"L":80,"1L":95,"B1T1":99}', 4.7, 'Popular', '/images/menu/caramel_milktea.png'],
    ['Taro', 'Purple taro root milk tea.', 99, 'Milktea', 'Regular Series', '{"M":70,"L":80,"1L":95,"B1T1":99}', 4.8, 'Popular', '/images/menu/taro_milktea.png'],
    ['Blueberry', 'Sweet blueberry milk tea.', 119, 'Milktea', 'Regular Series', '{"M":70,"L":80,"1L":95,"B1T1":119}', 4.4, null, '/images/menu/strawberry_milktea.png'],
    ['Matcha Dark', 'Bold matcha milk tea blend.', 119, 'Milktea', 'Regular Series', '{"M":70,"L":80,"1L":95,"B1T1":119}', 4.6, null, '/images/menu/matcha_milktea.png'],
    ['Java Chip', 'Coffee chip milk tea.', 119, 'Milktea', 'Regular Series', '{"M":70,"L":80,"1L":95,"B1T1":119}', 4.5, null, '/images/menu/caramel_milktea.png'],
    ['Chocolate Mousse', 'Airy chocolate mousse milk tea.', 119, 'Milktea', 'Regular Series', '{"M":70,"L":80,"1L":95,"B1T1":119}', 4.5, null, '/images/menu/chocolate_milktea.png'],
    ['Hokkaido', 'Rich Hokkaido milk tea.', 119, 'Milktea', 'Regular Series', '{"M":70,"L":80,"1L":115,"B1T1":119}', 4.7, null, '/images/menu/classic_milktea.png'],
    ['Okinawa', 'Brown sugar Okinawa milk tea.', 119, 'Milktea', 'Regular Series', '{"M":70,"L":80,"1L":115,"B1T1":119}', 4.8, 'Popular', '/images/menu/classic_milktea.png'],
    ['Bamboo Charcoal', 'Activated charcoal milk tea.', 125, 'Milktea', 'Regular Series', '{"M":70,"L":80,"1L":110,"B1T1":125}', 4.3, null, '/images/menu/chocolate_milktea.png'],
    ['Matcha', 'Classic matcha green tea milk tea.', 125, 'Milktea', 'Regular Series', '{"M":70,"L":80,"1L":120,"B1T1":125}', 4.7, null, '/images/menu/matcha_milktea.png'],
  ];

  // ==========================================
  // MILKTEA — CREAM CHEESE SERIES (Venti 22oz = 95)
  // ==========================================
  const milkteaCreamCheese = [
    ['Cream Cheese Red Velvet', 'Red velvet with cream cheese foam.', 95, 'Milktea', 'Cream Cheese Series', '{"Venti":95}', 4.8, null, '/images/menu/cream_cheese_milktea.png'],
    ['Cream Cheese Blueberry', 'Blueberry with cream cheese foam.', 95, 'Milktea', 'Cream Cheese Series', '{"Venti":95}', 4.6, null, '/images/menu/cream_cheese_milktea.png'],
    ['Cream Cheese Wintermelon', 'Wintermelon with cream cheese foam.', 95, 'Milktea', 'Cream Cheese Series', '{"Venti":95}', 4.7, null, '/images/menu/cream_cheese_milktea.png'],
    ['Cream Cheese Dark Choco', 'Dark chocolate with cream cheese foam.', 95, 'Milktea', 'Cream Cheese Series', '{"Venti":95}', 4.5, null, '/images/menu/cream_cheese_milktea.png'],
    ['Cream Cheese Cheesecake', 'Cheesecake with cream cheese foam.', 95, 'Milktea', 'Cream Cheese Series', '{"Venti":95}', 4.7, null, '/images/menu/cream_cheese_milktea.png'],
    ['Cream Cheese Black Forest', 'Black forest with cream cheese foam.', 95, 'Milktea', 'Cream Cheese Series', '{"Venti":95}', 4.5, null, '/images/menu/cream_cheese_milktea.png'],
    ['Cream Cheese Matcha Dark', 'Matcha dark with cream cheese foam.', 95, 'Milktea', 'Cream Cheese Series', '{"Venti":95}', 4.6, null, '/images/menu/cream_cheese_milktea.png'],
    ['Cream Cheese Chocolate', 'Chocolate with cream cheese foam.', 95, 'Milktea', 'Cream Cheese Series', '{"Venti":95}', 4.5, null, '/images/menu/cream_cheese_milktea.png'],
    ['Cream Cheese Okinawa', 'Okinawa with cream cheese foam.', 95, 'Milktea', 'Cream Cheese Series', '{"Venti":95}', 4.8, 'Popular', '/images/menu/cream_cheese_milktea.png'],
    ['Cream Cheese Strawberry', 'Strawberry with cream cheese foam.', 95, 'Milktea', 'Cream Cheese Series', '{"Venti":95}', 4.7, null, '/images/menu/cream_cheese_milktea.png'],
  ];

  // ==========================================
  // MILKTEA — PREMIUM SERIES (Venti 22oz)
  // ==========================================
  const milkteaPremium = [
    ['Wintermelon Frost', 'Frosty wintermelon premium blend.', 129, 'Milktea', 'Premium Series', '{"Venti":129}', 4.7, null, '/images/menu/premium_milktea.png'],
    ['Frosty Dark Choco', 'Premium frozen dark chocolate.', 129, 'Milktea', 'Premium Series', '{"Venti":129}', 4.6, null, '/images/menu/premium_milktea.png'],
    ['Oreo Creamy Dark', 'Creamy dark chocolate with Oreo.', 129, 'Milktea', 'Premium Series', '{"Venti":129}', 4.8, 'Popular', '/images/menu/premium_milktea.png'],
    ['Oreo Creamy Velvet', 'Red velvet blended with Oreo.', 129, 'Milktea', 'Premium Series', '{"Venti":129}', 4.7, null, '/images/menu/premium_milktea.png'],
    ['Oreo Frosty Matcha', 'Frosty matcha blended with Oreo.', 129, 'Milktea', 'Premium Series', '{"Venti":129}', 4.6, null, '/images/menu/premium_milktea.png'],
    ['Oreo Wintermelon Crème', 'Wintermelon crème with Oreo.', 129, 'Milktea', 'Premium Series', '{"Venti":129}', 4.5, null, '/images/menu/premium_milktea.png'],
    ['Frosty Bamboo Charcoal', 'Frozen bamboo charcoal blend.', 129, 'Milktea', 'Premium Series', '{"Venti":129}', 4.4, null, '/images/menu/premium_milktea.png'],
    ['Strawberry Cheesecake', 'Premium strawberry cheesecake drink.', 139, 'Milktea', 'Premium Series', '{"Venti":139}', 4.9, 'New', '/images/menu/strawberry_milktea.png'],
  ];

  // ==========================================
  // MILKTEA — SIGNATURE DRINKS (Venti 22oz)
  // ==========================================
  const milkteaSignature = [
    ['Meiji Apollo', 'Our signature Meiji chocolate drink.', 139, 'Milktea', 'Signature Drinks', '{"Venti":139}', 4.9, 'Signature', '/images/menu/signature_milktea.png'],
    ['Unicorn Cotton Candy', 'Magical cotton candy milktea.', 139, 'Milktea', 'Signature Drinks', '{"Venti":139}', 4.8, 'Signature', '/images/menu/signature_milktea.png'],
    ['Oreo Creamcheese', 'Signature Oreo cream cheese blend.', 139, 'Milktea', 'Signature Drinks', '{"Venti":139}', 4.7, 'Signature', '/images/menu/signature_milktea.png'],
    ['Oreo Choco Crème', 'Chocolate crème with crushed Oreo.', 139, 'Milktea', 'Signature Drinks', '{"Venti":139}', 4.7, 'Signature', '/images/menu/signature_milktea.png'],
    ['Oreo Strawberry Crème', 'Strawberry crème with Oreo.', 139, 'Milktea', 'Signature Drinks', '{"Venti":139}', 4.8, 'Signature', '/images/menu/signature_milktea.png'],
  ];

  // ==========================================
  // MILKTEA — HOT MILKTEA (Grande 12oz = 70)
  // ==========================================
  const milkteaHot = [
    ['Hot Dark Choco', 'Warm dark chocolate milk tea.', 70, 'Milktea', 'Hot Milktea', '{"Grande":70}', 4.5, null, '/images/menu/hot_milktea.png'],
    ['Hot Matcha', 'Warm matcha milk tea.', 70, 'Milktea', 'Hot Milktea', '{"Grande":70}', 4.6, null, '/images/menu/hot_milktea.png'],
    ['Hot Okinawa', 'Warm Okinawa brown sugar milk tea.', 70, 'Milktea', 'Hot Milktea', '{"Grande":70}', 4.7, null, '/images/menu/hot_milktea.png'],
    ['Hot Salted Caramel', 'Warm salted caramel milk tea.', 70, 'Milktea', 'Hot Milktea', '{"Grande":70}', 4.5, null, '/images/menu/hot_milktea.png'],
    ['Hot Cappuccino', 'Warm cappuccino milk tea.', 70, 'Milktea', 'Hot Milktea', '{"Grande":70}', 4.4, null, '/images/menu/hot_milktea.png'],
    ['Hot Red Velvet', 'Warm red velvet milk tea.', 70, 'Milktea', 'Hot Milktea', '{"Grande":70}', 4.6, null, '/images/menu/hot_milktea.png'],
    ['Hot Java Chip', 'Warm java chip milk tea.', 70, 'Milktea', 'Hot Milktea', '{"Grande":70}', 4.3, null, '/images/menu/hot_milktea.png'],
    ['Hot Chocolate Mousse', 'Warm chocolate mousse milk tea.', 70, 'Milktea', 'Hot Milktea', '{"Grande":70}', 4.4, null, '/images/menu/hot_milktea.png'],
  ];

  // ==========================================
  // COFFEE — ESPRESSO COFFEE (Venti 22oz)
  // ==========================================
  const coffeeEspresso = [
    ['Iced Americano', 'Classic iced americano.', 135, 'Coffee', 'Espresso Coffee', '{"Venti":135}', 4.5, null, '/images/menu/iced_americano.png'],
    ['White Americano / Barista Drink', 'Smooth white americano.', 140, 'Coffee', 'Espresso Coffee', '{"Venti":140}', 4.4, null, '/images/menu/iced_americano.png'],
    ['Iced Café Latte', 'Espresso with cold milk over ice.', 148, 'Coffee', 'Espresso Coffee', '{"Venti":148}', 4.6, null, '/images/menu/iced_latte.png'],
    ['Iced Mocha', 'Espresso, chocolate, and milk.', 148, 'Coffee', 'Espresso Coffee', '{"Venti":148}', 4.7, 'Popular', '/images/menu/iced_latte.png'],
    ['Iced Spanish Latte', 'Sweetened condensed milk latte.', 148, 'Coffee', 'Espresso Coffee', '{"Venti":148}', 4.8, 'Bestseller', '/images/menu/iced_latte.png'],
    ['Iced Matcha Dark Latte', 'Matcha and espresso combined.', 158, 'Coffee', 'Espresso Coffee', '{"Venti":158}', 4.6, null, '/images/menu/iced_matcha_latte.png'],
    ['Iced Café Lapreza', 'Our special café lapreza.', 158, 'Coffee', 'Espresso Coffee', '{"Venti":158}', 4.5, null, '/images/menu/iced_latte.png'],
    ['Iced French Vanilla', 'French vanilla flavored latte.', 158, 'Coffee', 'Espresso Coffee', '{"Venti":158}', 4.6, null, '/images/menu/iced_latte.png'],
    ['Iced Caramel Macchiato', 'Layered caramel espresso drink.', 158, 'Coffee', 'Espresso Coffee', '{"Venti":158}', 4.8, 'Popular', '/images/menu/iced_latte.png'],
    ['Iced Salted Caramel Latte', 'Sweet and salty caramel latte.', 168, 'Coffee', 'Espresso Coffee', '{"Venti":168}', 4.7, null, '/images/menu/iced_latte.png'],
    ['Iced Coffee Jelly', 'Latte with coffee jelly bits.', 168, 'Coffee', 'Espresso Coffee', '{"Venti":168}', 4.5, null, '/images/menu/iced_latte.png'],
    ['Iced White Mocha', 'White chocolate mocha over ice.', 188, 'Coffee', 'Espresso Coffee', '{"Venti":188}', 4.6, null, '/images/menu/iced_latte.png'],
    ['Iced Dirty Matcha', 'Espresso poured over iced matcha.', 188, 'Coffee', 'Espresso Coffee', '{"Venti":188}', 4.7, null, '/images/menu/iced_matcha_latte.png'],
    ['Iced Dirty Ube Latte', 'Espresso with ube milk.', 188, 'Coffee', 'Espresso Coffee', '{"Venti":188}', 4.5, null, '/images/menu/iced_latte.png'],
    ['Iced Dirty Latte', 'Double-shot espresso latte.', 188, 'Coffee', 'Espresso Coffee', '{"Venti":188}', 4.4, null, '/images/menu/iced_latte.png'],
    ['Iced Biscoffee Latte', 'Biscoff cookie-flavored latte.', 188, 'Coffee', 'Espresso Coffee', '{"Venti":188}', 4.6, null, '/images/menu/iced_latte.png'],
  ];

  // ==========================================
  // COFFEE — ICED LATTE (NON-COFFEE) (Venti 22oz)
  // ==========================================
  const coffeeIcedLatte = [
    ['Signature Iced Chocolate', 'Rich iced chocolate drink.', 130, 'Coffee', 'Iced Latte (Non-Coffee)', '{"Venti":130}', 4.5, null, '/images/menu/iced_latte.png'],
    ['Iced Matcha Dark Latte', 'Non-coffee matcha dark latte.', 138, 'Coffee', 'Iced Latte (Non-Coffee)', '{"Venti":138}', 4.6, null, '/images/menu/iced_matcha_latte.png'],
    ['Ube Latte', 'Creamy purple ube latte.', 148, 'Coffee', 'Iced Latte (Non-Coffee)', '{"Venti":148}', 4.7, null, '/images/menu/iced_latte.png'],
    ['Matcha Latte', 'Classic iced matcha latte.', 148, 'Coffee', 'Iced Latte (Non-Coffee)', '{"Venti":148}', 4.8, 'Popular', '/images/menu/iced_matcha_latte.png'],
    ['Pink Drink', 'Refreshing strawberry coconut drink.', 148, 'Coffee', 'Iced Latte (Non-Coffee)', '{"Venti":148}', 4.6, 'New', '/images/menu/strawberry_milktea.png'],
    ['Ube Matcha Latte', 'Ube and matcha fusion.', 168, 'Coffee', 'Iced Latte (Non-Coffee)', '{"Venti":168}', 4.5, null, '/images/menu/iced_matcha_latte.png'],
  ];

  // ==========================================
  // COFFEE — FRAPPE COFFEE BASE (Venti 22oz)
  // ==========================================
  const coffeeFrappeCoffee = [
    ['Americanoccino', 'Blended americano frappe.', 148, 'Coffee', 'Frappe (Coffee Base)', '{"Venti":148}', 4.4, null, '/images/menu/coffee_frappe.png'],
    ['Frappuccino', 'Classic blended coffee frappe.', 168, 'Coffee', 'Frappe (Coffee Base)', '{"Venti":168}', 4.6, null, '/images/menu/coffee_frappe.png'],
    ['Caramel Macchiato Frappe', 'Blended caramel macchiato.', 188, 'Coffee', 'Frappe (Coffee Base)', '{"Venti":188}', 4.7, null, '/images/menu/coffee_frappe.png'],
    ['Dark Mochaccino Frappe', 'Dark mocha blended coffee.', 188, 'Coffee', 'Frappe (Coffee Base)', '{"Venti":188}', 4.6, null, '/images/menu/coffee_frappe.png'],
    ['Coffee Jelly Frappe', 'Blended coffee with jelly.', 188, 'Coffee', 'Frappe (Coffee Base)', '{"Venti":188}', 4.5, null, '/images/menu/coffee_frappe.png'],
    ['Java Chip Frappe', 'Chocolate chip blended coffee.', 195, 'Coffee', 'Frappe (Coffee Base)', '{"Venti":195}', 4.7, null, '/images/menu/coffee_frappe.png'],
    ['Biscoffee Frappe', 'Biscoff blended coffee.', 198, 'Coffee', 'Frappe (Coffee Base)', '{"Venti":198}', 4.6, null, '/images/menu/coffee_frappe.png'],
  ];

  // ==========================================
  // COFFEE — FRAPPE CREAM BASE (Venti 22oz)
  // ==========================================
  const coffeeFrappeCream = [
    ['Dark Choco Frappe', 'Creamy dark chocolate frappe.', 158, 'Coffee', 'Frappe (Cream Base)', '{"Venti":158,"B1T1":188}', 4.6, null, '/images/menu/cream_frappe.png'],
    ['Caramel Frappe', 'Creamy caramel blended frappe.', 158, 'Coffee', 'Frappe (Cream Base)', '{"Venti":158,"B1T1":188}', 4.5, null, '/images/menu/cream_frappe.png'],
    ['Taro Frappe', 'Purple taro blended frappe.', 158, 'Coffee', 'Frappe (Cream Base)', '{"Venti":158,"B1T1":188}', 4.7, null, '/images/menu/cream_frappe.png'],
    ['Oreo Cream Frappe', 'Oreo cookies & cream frappe.', 158, 'Coffee', 'Frappe (Cream Base)', '{"Venti":158,"B1T1":188}', 4.8, 'Popular', '/images/menu/cream_frappe.png'],
    ['Vanilla Frappe', 'Smooth vanilla cream frappe.', 158, 'Coffee', 'Frappe (Cream Base)', '{"Venti":158,"B1T1":188}', 4.4, null, '/images/menu/cream_frappe.png'],
    ['Matcha Frappe', 'Green tea cream frappe.', 168, 'Coffee', 'Frappe (Cream Base)', '{"Venti":168,"B1T1":188}', 4.6, null, '/images/menu/cream_frappe.png'],
    ['Blueberries & Cream Frappe', 'Blueberry cream frappe.', 168, 'Coffee', 'Frappe (Cream Base)', '{"Venti":168,"B1T1":188}', 4.5, null, '/images/menu/cream_frappe.png'],
    ['Strawberry Cream Frappe', 'Strawberry cream blended.', 168, 'Coffee', 'Frappe (Cream Base)', '{"Venti":168,"B1T1":188}', 4.7, null, '/images/menu/cream_frappe.png'],
    ['Red Velvet Cake Frappe', 'Red velvet cake cream frappe.', 168, 'Coffee', 'Frappe (Cream Base)', '{"Venti":168,"B1T1":198}', 4.8, 'New', '/images/menu/cream_frappe.png'],
    ['Biscoff Frappe', 'Biscoff cream frappe.', 168, 'Coffee', 'Frappe (Cream Base)', '{"Venti":168,"B1T1":198}', 4.6, null, '/images/menu/cream_frappe.png'],
  ];

  // ==========================================
  // COFFEE — HOT COFFEE (Grande 12oz)
  // ==========================================
  const coffeeHot = [
    ['Hot Americano', 'Classic hot americano.', 110, 'Coffee', 'Hot Coffee', '{"Grande":110}', 4.3, null, '/images/menu/hot_milktea.png'],
    ['Hot White Americano', 'Smooth hot white americano.', 130, 'Coffee', 'Hot Coffee', '{"Grande":130}', 4.4, null, '/images/menu/hot_milktea.png'],
    ['Hot Latte', 'Classic hot espresso latte.', 148, 'Coffee', 'Hot Coffee', '{"Grande":148}', 4.6, null, '/images/menu/hot_milktea.png'],
    ['Hot Matcha Latte (Non-Coffee)', 'Warm matcha milk latte.', 148, 'Coffee', 'Hot Coffee', '{"Grande":148}', 4.7, null, '/images/menu/hot_milktea.png'],
    ['Hot Spanish Latte', 'Sweet condensed milk hot latte.', 148, 'Coffee', 'Hot Coffee', '{"Grande":148}', 4.8, 'Popular', '/images/menu/hot_milktea.png'],
    ['Hot Cappuccino', 'Espresso with foamed milk.', 158, 'Coffee', 'Hot Coffee', '{"Grande":158}', 4.5, null, '/images/menu/hot_milktea.png'],
    ['Hot Mocha', 'Chocolate espresso hot drink.', 168, 'Coffee', 'Hot Coffee', '{"Grande":168}', 4.6, null, '/images/menu/hot_milktea.png'],
    ['Hot Salted Caramel', 'Hot salted caramel latte.', 168, 'Coffee', 'Hot Coffee', '{"Grande":168}', 4.5, null, '/images/menu/hot_milktea.png'],
    ['Hot Caramel Macchiato', 'Layered hot caramel macchiato.', 178, 'Coffee', 'Hot Coffee', '{"Grande":178}', 4.7, null, '/images/menu/hot_milktea.png'],
    ['Hot White Mocha', 'White chocolate hot mocha.', 188, 'Coffee', 'Hot Coffee', '{"Grande":188}', 4.6, null, '/images/menu/hot_milktea.png'],
    ['Hot Dirty Matcha (Coffee-Based)', 'Espresso shot in hot matcha.', 188, 'Coffee', 'Hot Coffee', '{"Grande":188}', 4.5, null, '/images/menu/hot_milktea.png'],
    ['Hot Matcha Dark Latte', 'Rich hot matcha espresso latte.', 188, 'Coffee', 'Hot Coffee', '{"Grande":188}', 4.6, null, '/images/menu/hot_milktea.png'],
  ];

  // ==========================================
  // ADD-ONS — MILKTEA
  // ==========================================
  const addonsMilktea = [
    ['Pearls', 'Classic tapioca pearls.', 10, 'Add-ons', 'Milktea Add-ons', null, null, null, '/images/menu/classic_milktea.png'],
    ['Nata', 'Coconut nata de coco.', 15, 'Add-ons', 'Milktea Add-ons', null, null, null, '/images/menu/classic_milktea.png'],
    ['Crushed Oreo', 'Crushed Oreo cookie bits.', 15, 'Add-ons', 'Milktea Add-ons', null, null, null, '/images/menu/premium_milktea.png'],
    ['Cream Cheese', 'Rich cream cheese foam topping.', 20, 'Add-ons', 'Milktea Add-ons', null, null, null, '/images/menu/cream_cheese_milktea.png'],
    ['Cream Puff', 'Cream puff topping.', 20, 'Add-ons', 'Milktea Add-ons', null, null, null, '/images/menu/cream_cheese_milktea.png'],
    ['Chocolate Chips', 'Chocolate chip pieces.', 25, 'Add-ons', 'Milktea Add-ons', null, null, null, '/images/menu/chocolate_milktea.png'],
    ['Coffee Jelly', 'Coffee-flavored jelly cubes.', 30, 'Add-ons', 'Milktea Add-ons', null, null, null, '/images/menu/caramel_milktea.png'],
  ];

  // ==========================================
  // ADD-ONS — COFFEE
  // ==========================================
  const addonsCoffee = [
    ['Milk (Coffee)', 'Extra milk.', 30, 'Add-ons', 'Coffee Add-ons', null, null, null, '/images/menu/iced_latte.png'],
    ['Chocolate Syrup', 'Chocolate syrup drizzle.', 30, 'Add-ons', 'Coffee Add-ons', null, null, null, '/images/menu/iced_latte.png'],
    ['Caramel Syrup', 'Caramel syrup drizzle.', 30, 'Add-ons', 'Coffee Add-ons', null, null, null, '/images/menu/iced_latte.png'],
    ['Strawberry Syrup', 'Strawberry syrup add-on.', 30, 'Add-ons', 'Coffee Add-ons', null, null, null, '/images/menu/cream_frappe.png'],
    ['Blueberry Syrup', 'Blueberry syrup add-on.', 30, 'Add-ons', 'Coffee Add-ons', null, null, null, '/images/menu/cream_frappe.png'],
    ['Whipped Cream', 'Fresh whipped cream topping.', 30, 'Add-ons', 'Coffee Add-ons', null, null, null, '/images/menu/coffee_frappe.png'],
    ['Espresso Shot', 'Extra shot of espresso.', 50, 'Add-ons', 'Coffee Add-ons', null, null, null, '/images/menu/iced_americano.png'],
  ];

  // Combine all categories
  const allProducts = [
    ...milkteaRegular, ...milkteaCreamCheese, ...milkteaPremium, ...milkteaSignature, ...milkteaHot,
    ...coffeeEspresso, ...coffeeIcedLatte, ...coffeeFrappeCoffee, ...coffeeFrappeCream, ...coffeeHot,
    ...addonsMilktea, ...addonsCoffee,
  ];

  const sql = 'INSERT INTO products (name, description, price, category, subcategory, sizes, rating, badge, image) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)';

  for (const product of allProducts) {
    await client.query(sql, product);
  }

  console.log(`Populated products table with ${allProducts.length} items.`);
}

async function backfillUids(client) {
  const result = await client.query('SELECT id FROM users WHERE uid IS NULL');
  const rows = result.rows;

  if (rows.length > 0) {
    console.log(`Found ${rows.length} users without UID. Backfilling...`);
    for (const row of rows) {
      await client.query('UPDATE users SET uid = $1 WHERE id = $2', [crypto.randomUUID(), row.id]);
    }
    console.log("Backfill complete.");
  }
}

async function seedAdmin(client) {
  const result = await client.query("SELECT id FROM users WHERE role = 'admin'");
  if (result.rows.length === 0) {
    console.log("No admin user found. Creating default admin...");
    const password = 'admin';
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    await client.query(
      `INSERT INTO users (uid, "fullName", email, password, role) VALUES ($1, $2, $3, $4, $5)`,
      [crypto.randomUUID(), 'Admin User', 'admin@insteag.com', hash, 'admin']
    );
    console.log("Default admin user created: admin@insteag.com / admin");
  } else {
    console.log("Admin user already exists.");
  }
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  calculateTier,
  TIERS,
};