const pool = require('../config/database');

const getTables = async (req, res) => {
  try {
    const tables = [
      'asset_types', 'os_types', 'departments', 'server_status',
      'patching_schedule', 'patching_type', 'locations', 'os_versions', 'server_patch_types'
    ];
    res.json({ tables });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tables', details: err.message });
  }
};

const getConfigData = async (req, res) => {
  try {
    const { table } = req.params;

    const validTables = [
      'asset_types', 'os_types', 'departments', 'server_status',
      'patching_schedule', 'patching_type', 'locations', 'os_versions', 'server_patch_types'
    ];

    if (!validTables.includes(table)) {
      return res.status(400).json({ error: 'Invalid table name' });
    }

    const result = await pool.query(`SELECT * FROM ${table} ORDER BY id ASC`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch data', details: err.message });
  }
};

const addConfigData = async (req, res) => {
  try {
    const { table } = req.params;
    const { name, parent_id } = req.body;

    const validTables = [
      'asset_types', 'os_types', 'departments', 'server_status',
      'patching_schedule', 'patching_type', 'locations', 'os_versions', 'server_patch_types'
    ];

    if (!validTables.includes(table)) {
      return res.status(400).json({ error: 'Invalid table name' });
    }

    let result;
    if (table === 'os_versions') {
      result = await pool.query(
        `INSERT INTO ${table} (name, os_type_id) VALUES ($1, $2) RETURNING *`,
        [name, parent_id]
      );
    } else {
      result = await pool.query(
        `INSERT INTO ${table} (name) VALUES ($1) RETURNING *`,
        [name]
      );
    }

    res.status(201).json({
      message: 'Data added successfully',
      data: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add data', details: err.message });
  }
};

const updateConfigData = async (req, res) => {
  try {
    const { table, id } = req.params;
    const { name, parent_id } = req.body;

    const validTables = [
      'asset_types', 'os_types', 'departments', 'server_status',
      'patching_schedule', 'patching_type', 'locations', 'os_versions', 'server_patch_types'
    ];

    if (!validTables.includes(table)) {
      return res.status(400).json({ error: 'Invalid table name' });
    }

    let result;
    if (table === 'os_versions') {
      result = await pool.query(
        `UPDATE ${table} SET name = $1, os_type_id = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
        [name, parent_id, id]
      );
    } else {
      result = await pool.query(
        `UPDATE ${table} SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [name, id]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }

    res.json({
      message: 'Data updated successfully',
      data: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update data', details: err.message });
  }
};

const deleteConfigData = async (req, res) => {
  try {
    const { table, id } = req.params;

    const validTables = [
      'asset_types', 'os_types', 'departments', 'server_status',
      'patching_schedule', 'patching_type', 'locations', 'os_versions', 'server_patch_types'
    ];

    if (!validTables.includes(table)) {
      return res.status(400).json({ error: 'Invalid table name' });
    }

    const result = await pool.query(`DELETE FROM ${table} WHERE id = $1 RETURNING id`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }

    res.json({ message: 'Data deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete data', details: err.message });
  }
};

module.exports = {
  getTables,
  getConfigData,
  addConfigData,
  updateConfigData,
  deleteConfigData
};
