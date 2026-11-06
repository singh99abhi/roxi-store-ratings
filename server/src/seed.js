const bcrypt = require('bcryptjs');
const { initSchema, query } = require('./config/db');

async function seed() {
  console.log('[Seed] Initializing database schema...');
  await initSchema();

  console.log('[Seed] Checking for existing users...');
  const existingUsers = await query('SELECT COUNT(*) as count FROM users');
  const userCount = parseInt(existingUsers.rows[0].count, 10);

  if (userCount > 0) {
    console.log('[Seed] Database already contains records. Skipping seed.');
    return;
  }

  console.log('[Seed] Inserting initial seed records...');

  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash('Admin@123', salt);
  const ownerPass = await bcrypt.hash('Owner@123', salt);
  const userPass = await bcrypt.hash('User@123', salt);

  // 1. Admin
  await query(
    `INSERT INTO users (name, email, password_hash, address, role)
     VALUES (?, ?, ?, ?, ?)`,
    [
      'Administrator Account User',
      'admin@storehub.com',
      adminPass,
      '100 Corporate Plaza, Executive Tower, Suite 500, New York, NY 10001',
      'ADMIN'
    ]
  );

  // 2. Store Owners
  await query(
    `INSERT INTO users (name, email, password_hash, address, role)
     VALUES (?, ?, ?, ?, ?)`,
    [
      'Store Owner Robert Miller',
      'owner.robert@storehub.com',
      ownerPass,
      '450 Market Street, Downtown District, San Francisco, CA 94105',
      'STORE_OWNER'
    ]
  );

  await query(
    `INSERT INTO users (name, email, password_hash, address, role)
     VALUES (?, ?, ?, ?, ?)`,
    [
      'Store Owner Sophia Turner',
      'owner.sophia@storehub.com',
      ownerPass,
      '789 Tech Boulevard, Innovation Corridor, Austin, TX 78701',
      'STORE_OWNER'
    ]
  );

  // 3. Normal Users
  await query(
    `INSERT INTO users (name, email, password_hash, address, role)
     VALUES (?, ?, ?, ?, ?)`,
    [
      'Normal Customer Benjamin Davis',
      'user.benjamin@storehub.com',
      userPass,
      '234 Elm Street, Green Valley Neighborhood, Seattle, WA 98101',
      'USER'
    ]
  );

  await query(
    `INSERT INTO users (name, email, password_hash, address, role)
     VALUES (?, ?, ?, ?, ?)`,
    [
      'Normal Customer Jessica Brown',
      'user.jessica@storehub.com',
      userPass,
      '567 Oak Avenue, Sunset Heights Park, Denver, CO 80202',
      'USER'
    ]
  );

  await query(
    `INSERT INTO users (name, email, password_hash, address, role)
     VALUES (?, ?, ?, ?, ?)`,
    [
      'Normal Customer Lucas Anderson',
      'user.lucas@storehub.com',
      userPass,
      '890 Pine Road, Northwood Hills, Portland, OR 97201',
      'USER'
    ]
  );

  // Fetch created users to associate with stores & ratings
  const usersRes = await query('SELECT id, email FROM users');
  const userMap = {};
  usersRes.rows.forEach(u => {
    userMap[u.email] = u.id;
  });

  // 4. Stores
  await query(
    `INSERT INTO stores (name, email, address, owner_id)
     VALUES (?, ?, ?, ?)`,
    [
      'Downtown Organic Grocery Market',
      'contact@downtowngrocery.com',
      '1200 Central Avenue, Suite 10, San Francisco, CA 94103',
      userMap['owner.robert@storehub.com']
    ]
  );

  await query(
    `INSERT INTO stores (name, email, address, owner_id)
     VALUES (?, ?, ?, ?)`,
    [
      'Northside Tech & Electronics Depot',
      'support@northsidetech.com',
      '350 Silicon Way, Building B, Austin, TX 78759',
      userMap['owner.sophia@storehub.com']
    ]
  );

  await query(
    `INSERT INTO stores (name, email, address, owner_id)
     VALUES (?, ?, ?, ?)`,
    [
      'Westwood Fresh Artisan Bakery',
      'hello@westwoodbakery.com',
      '88 Flour Boulevard, West End, Seattle, WA 98109',
      null
    ]
  );

  // Fetch stores
  const storesRes = await query('SELECT id, name FROM stores');
  const storeMap = {};
  storesRes.rows.forEach(s => {
    storeMap[s.name] = s.id;
  });

  // 5. Ratings
  // Store 1 (Downtown Organic Grocery Market)
  await query(
    `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)`,
    [userMap['user.benjamin@storehub.com'], storeMap['Downtown Organic Grocery Market'], 5]
  );
  await query(
    `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)`,
    [userMap['user.jessica@storehub.com'], storeMap['Downtown Organic Grocery Market'], 4]
  );
  await query(
    `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)`,
    [userMap['user.lucas@storehub.com'], storeMap['Downtown Organic Grocery Market'], 5]
  );

  // Store 2 (Northside Tech & Electronics Depot)
  await query(
    `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)`,
    [userMap['user.benjamin@storehub.com'], storeMap['Northside Tech & Electronics Depot'], 4]
  );
  await query(
    `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)`,
    [userMap['user.jessica@storehub.com'], storeMap['Northside Tech & Electronics Depot'], 5]
  );

  // Store 3 (Westwood Fresh Artisan Bakery)
  await query(
    `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)`,
    [userMap['user.lucas@storehub.com'], storeMap['Westwood Fresh Artisan Bakery'], 4]
  );

  console.log('[Seed] Database successfully populated with initial data!');
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('[Seed Error]', err);
      process.exit(1);
    });
}

module.exports = seed;
