const pool = require('../config/database');

const getUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, name, role, permission_level, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users', details: err.message });
  }
};

const updateUserPermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { permission_level } = req.body;

    const result = await pool.query(
      'UPDATE users SET permission_level = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, name, role, permission_level',
      [permission_level, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User permission updated successfully',
      data: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user', details: err.message });
  }
};

const updateUserPageVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { visible_pages } = req.body;

    const result = await pool.query(
      'UPDATE users SET visible_pages = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, name, role, permission_level, visible_pages',
      [JSON.stringify(visible_pages), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User page visibility updated successfully',
      data: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user', details: err.message });
  }
};

module.exports = {
  getUsers,
  updateUserPermission,
  updateUserPageVisibility
};
