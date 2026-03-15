const pool = require('../config/database');

const getAssets = async (req, res) => {
  try {
    const { search, location, department, status, asset_type, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT a.*, 
        at.name as asset_type_name, ot.name as os_type_name, 
        d.name as department_name, ss.name as server_status_name,
        ps.name as patching_schedule_name, pt.name as patching_type_name, l.name as location_name
      FROM assets a
      LEFT JOIN asset_types at ON a.asset_type_id = at.id
      LEFT JOIN os_types ot ON a.os_type_id = ot.id
      LEFT JOIN departments d ON a.department_id = d.id
      LEFT JOIN server_status ss ON a.server_status_id = ss.id
      LEFT JOIN patching_schedule ps ON a.patching_schedule_id = ps.id
      LEFT JOIN patching_type pt ON a.patching_type_id = pt.id
      LEFT JOIN locations l ON a.location_id = l.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (a.os_hostname ILIKE $${paramCount} OR a.ip_address ILIKE $${paramCount} OR a.assigned_user ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (location) {
      query += ` AND a.location_id = $${paramCount}`;
      params.push(location);
      paramCount++;
    }

    if (department) {
      query += ` AND a.department_id = $${paramCount}`;
      params.push(department);
      paramCount++;
    }

    if (status) {
      query += ` AND a.server_status_id = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (asset_type) {
      query += ` AND a.asset_type_id = $${paramCount}`;
      params.push(asset_type);
      paramCount++;
    }

    const countResult = await pool.query(
      query.replace('SELECT a.*, \n        at.name as asset_type_name, ot.name as os_type_name,', 'SELECT COUNT(*) as count FROM assets a LEFT JOIN asset_types at ON a.asset_type_id = at.id LEFT JOIN os_types ot ON a.os_type_id = ot.id LEFT JOIN departments d ON a.department_id = d.id LEFT JOIN server_status ss ON a.server_status_id = ss.id LEFT JOIN patching_schedule ps ON a.patching_schedule_id = ps.id LEFT JOIN patching_type pt ON a.patching_type_id = pt.id LEFT JOIN locations l ON a.location_id = l.id WHERE 1=1'),
      params
    );

    query += ` ORDER BY a.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      data: result.rows,
      total: countResult.rows[0].count,
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch assets', details: err.message });
  }
};

const getAssetById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT a.*, 
        at.name as asset_type_name, ot.name as os_type_name, 
        d.name as department_name, ss.name as server_status_name,
        ps.name as patching_schedule_name, pt.name as patching_type_name, l.name as location_name
      FROM assets a
      LEFT JOIN asset_types at ON a.asset_type_id = at.id
      LEFT JOIN os_types ot ON a.os_type_id = ot.id
      LEFT JOIN departments d ON a.department_id = d.id
      LEFT JOIN server_status ss ON a.server_status_id = ss.id
      LEFT JOIN patching_schedule ps ON a.patching_schedule_id = ps.id
      LEFT JOIN patching_type pt ON a.patching_type_id = pt.id
      LEFT JOIN locations l ON a.location_id = l.id
      WHERE a.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch asset', details: err.message });
  }
};

const createAsset = async (req, res) => {
  try {
    const {
      vm_name, os_hostname, ip_address, asset_type_id, os_type_id, os_version,
      assigned_user, user_password, department_id, business_purpose, server_status_id,
      me_installed_status, tenable_installed_status, patching_schedule_id, patching_type_id,
      server_patch_type, location_id, additional_remarks, serial_no, idrac_enabled, idrac_ip, eol_status
    } = req.body;

    const result = await pool.query(
      `INSERT INTO assets (
        vm_name, os_hostname, ip_address, asset_type_id, os_type_id, os_version, 
        assigned_user, user_password, department_id, business_purpose, server_status_id,
        me_installed_status, tenable_installed_status, patching_schedule_id, patching_type_id,
        server_patch_type, location_id, additional_remarks, serial_no, idrac_enabled, idrac_ip, eol_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING *`,
      [
        vm_name, os_hostname, ip_address, asset_type_id, os_type_id, os_version,
        assigned_user, user_password, department_id, business_purpose, server_status_id,
        me_installed_status, tenable_installed_status, patching_schedule_id, patching_type_id,
        server_patch_type, location_id, additional_remarks, serial_no, idrac_enabled, idrac_ip, eol_status
      ]
    );

    res.status(201).json({
      message: 'Asset created successfully',
      data: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create asset', details: err.message });
  }
};

const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      vm_name, os_hostname, ip_address, asset_type_id, os_type_id, os_version,
      assigned_user, user_password, department_id, business_purpose, server_status_id,
      me_installed_status, tenable_installed_status, patching_schedule_id, patching_type_id,
      server_patch_type, location_id, additional_remarks, serial_no, idrac_enabled, idrac_ip, eol_status
    } = req.body;

    const result = await pool.query(
      `UPDATE assets SET
        vm_name = $1, os_hostname = $2, ip_address = $3, asset_type_id = $4, os_type_id = $5, 
        os_version = $6, assigned_user = $7, user_password = $8, department_id = $9, 
        business_purpose = $10, server_status_id = $11, me_installed_status = $12, 
        tenable_installed_status = $13, patching_schedule_id = $14, patching_type_id = $15,
        server_patch_type = $16, location_id = $17, additional_remarks = $18, serial_no = $19,
        idrac_enabled = $20, idrac_ip = $21, eol_status = $22, updated_at = NOW()
      WHERE id = $23
      RETURNING *`,
      [
        vm_name, os_hostname, ip_address, asset_type_id, os_type_id, os_version,
        assigned_user, user_password, department_id, business_purpose, server_status_id,
        me_installed_status, tenable_installed_status, patching_schedule_id, patching_type_id,
        server_patch_type, location_id, additional_remarks, serial_no, idrac_enabled, idrac_ip, eol_status, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    res.json({
      message: 'Asset updated successfully',
      data: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update asset', details: err.message });
  }
};

const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM assets WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    res.json({ message: 'Asset deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete asset', details: err.message });
  }
};

const bulkImportAssets = async (req, res) => {
  try {
    const assets = req.body.assets;
    const insertedAssets = [];

    for (const asset of assets) {
      const {
        vm_name, os_hostname, ip_address, asset_type_id, os_type_id, os_version,
        assigned_user, user_password, department_id, business_purpose, server_status_id,
        me_installed_status, tenable_installed_status, patching_schedule_id, patching_type_id,
        server_patch_type, location_id, additional_remarks, serial_no, idrac_enabled, idrac_ip, eol_status
      } = asset;

      const result = await pool.query(
        `INSERT INTO assets (
          vm_name, os_hostname, ip_address, asset_type_id, os_type_id, os_version, 
          assigned_user, user_password, department_id, business_purpose, server_status_id,
          me_installed_status, tenable_installed_status, patching_schedule_id, patching_type_id,
          server_patch_type, location_id, additional_remarks, serial_no, idrac_enabled, idrac_ip, eol_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
        RETURNING *`,
        [
          vm_name, os_hostname, ip_address, asset_type_id, os_type_id, os_version,
          assigned_user, user_password, department_id, business_purpose, server_status_id,
          me_installed_status, tenable_installed_status, patching_schedule_id, patching_type_id,
          server_patch_type, location_id, additional_remarks, serial_no, idrac_enabled, idrac_ip, eol_status
        ]
      );

      insertedAssets.push(result.rows[0]);
    }

    res.status(201).json({
      message: `${insertedAssets.length} assets imported successfully`,
      data: insertedAssets
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to import assets', details: err.message });
  }
};

module.exports = {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  bulkImportAssets
};
