const pool = require('../config/database');

const migrate = async () => {
  try {
    console.log('Starting database migration...');

    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        permission_level VARCHAR(50) DEFAULT 'read_write',
        visible_pages JSONB DEFAULT '["dashboard", "asset_inventory", "inventory_configuration"]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Asset Types
    await pool.query(`
      CREATE TABLE IF NOT EXISTS asset_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // OS Types
    await pool.query(`
      CREATE TABLE IF NOT EXISTS os_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // OS Versions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS os_versions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        os_type_id INTEGER REFERENCES os_types(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(name, os_type_id)
      )
    `);

    // Departments
    await pool.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Server Status
    await pool.query(`
      CREATE TABLE IF NOT EXISTS server_status (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Patching Schedule
    await pool.query(`
      CREATE TABLE IF NOT EXISTS patching_schedule (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Patching Type
    await pool.query(`
      CREATE TABLE IF NOT EXISTS patching_type (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Server Patch Type
    await pool.query(`
      CREATE TABLE IF NOT EXISTS server_patch_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Locations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Assets
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assets (
        id SERIAL PRIMARY KEY,
        vm_name VARCHAR(255),
        os_hostname VARCHAR(255),
        ip_address VARCHAR(15),
        asset_type_id INTEGER REFERENCES asset_types(id),
        os_type_id INTEGER REFERENCES os_types(id),
        os_version VARCHAR(100),
        assigned_user VARCHAR(255),
        user_password VARCHAR(255),
        department_id INTEGER REFERENCES departments(id),
        business_purpose TEXT,
        server_status_id INTEGER REFERENCES server_status(id),
        me_installed_status BOOLEAN DEFAULT false,
        tenable_installed_status BOOLEAN DEFAULT false,
        patching_schedule_id INTEGER REFERENCES patching_schedule(id),
        patching_type_id INTEGER REFERENCES patching_type(id),
        server_patch_type VARCHAR(100),
        location_id INTEGER REFERENCES locations(id),
        additional_remarks TEXT,
        serial_no VARCHAR(255),
        idrac_enabled BOOLEAN DEFAULT false,
        idrac_ip VARCHAR(15),
        eol_status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Settings
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Database migration failed:', err);
    process.exit(1);
  }
};

migrate();
