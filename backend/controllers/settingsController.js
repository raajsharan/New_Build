const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

const getSettings = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM settings');
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch settings', details: err.message });
  }
};

const updateSetting = async (req, res) => {
  try {
    const { key, value } = req.body;

    const existingSetting = await pool.query('SELECT * FROM settings WHERE key = $1', [key]);

    let result;
    if (existingSetting.rows.length > 0) {
      result = await pool.query(
        'UPDATE settings SET value = $1, updated_at = NOW() WHERE key = $2 RETURNING *',
        [value, key]
      );
    } else {
      result = await pool.query(
        'INSERT INTO settings (key, value) VALUES ($1, $2) RETURNING *',
        [key, value]
      );
    }

    res.json({
      message: 'Setting updated successfully',
      data: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update setting', details: err.message });
  }
};

const updateDatabaseConfig = async (req, res) => {
  try {
    const { db_host, db_port, db_name, db_user, db_password } = req.body;

    await pool.query(
      'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
      ['db_host', db_host]
    );
    await pool.query(
      'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
      ['db_port', db_port.toString()]
    );
    await pool.query(
      'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
      ['db_name', db_name]
    );
    await pool.query(
      'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
      ['db_user', db_user]
    );
    await pool.query(
      'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
      ['db_password', db_password]
    );

    res.json({ message: 'Database configuration updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update database configuration', details: err.message });
  }
};

const updateCompanyLogo = async (req, res) => {
  try {
    const { logoUrl, companyName } = req.body;

    await pool.query(
      'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
      ['company_logo', logoUrl]
    );
    await pool.query(
      'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
      ['company_name', companyName]
    );

    res.json({ message: 'Company settings updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update company settings', details: err.message });
  }
};

const getPasswordVisibility = async (req, res) => {
  try {
    const result = await pool.query('SELECT value FROM settings WHERE key = $1', ['password_visibility']);
    const visibility = result.rows.length > 0 ? result.rows[0].value === 'true' : false;
    res.json({ password_visibility: visibility });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch password visibility', details: err.message });
  }
};

const updatePasswordVisibility = async (req, res) => {
  try {
    const { visible } = req.body;

    await pool.query(
      'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
      ['password_visibility', visible.toString()]
    );

    res.json({ message: 'Password visibility updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update password visibility', details: err.message });
  }
};

module.exports = {
  getSettings,
  updateSetting,
  updateDatabaseConfig,
  updateCompanyLogo,
  getPasswordVisibility,
  updatePasswordVisibility
};
