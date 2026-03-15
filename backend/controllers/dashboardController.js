const pool = require('../config/database');

const getDashboardSummary = async (req, res) => {
  try {
    const summaryQuery = `
      SELECT
        COUNT(*) as total_assets,
        SUM(CASE WHEN asset_type_id = (SELECT id FROM asset_types WHERE name = 'VM' LIMIT 1) THEN 1 ELSE 0 END) as vm_count,
        SUM(CASE WHEN asset_type_id = (SELECT id FROM asset_types WHERE name = 'Physical Server' LIMIT 1) THEN 1 ELSE 0 END) as physical_server_count,
        SUM(CASE WHEN me_installed_status = true THEN 1 ELSE 0 END) as me_installed_count,
        SUM(CASE WHEN tenable_installed_status = true THEN 1 ELSE 0 END) as tenable_installed_count,
        SUM(CASE WHEN patching_type_id = (SELECT id FROM patching_type WHERE name = 'Auto' LIMIT 1) THEN 1 ELSE 0 END) as auto_patch_count,
        SUM(CASE WHEN patching_type_id = (SELECT id FROM patching_type WHERE name = 'Manual' LIMIT 1) THEN 1 ELSE 0 END) as manual_patch_count,
        SUM(CASE WHEN server_status_id = (SELECT id FROM server_status WHERE name = 'Alive' LIMIT 1) THEN 1 ELSE 0 END) as alive_servers,
        SUM(CASE WHEN server_status_id = (SELECT id FROM server_status WHERE name = 'Powered Off' LIMIT 1) THEN 1 ELSE 0 END) as powered_off_servers,
        SUM(CASE WHEN server_status_id = (SELECT id FROM server_status WHERE name = 'Not Alive' LIMIT 1) THEN 1 ELSE 0 END) as not_alive_servers
      FROM assets
    `;

    const locationQuery = `
      SELECT l.name as location, COUNT(*) as count
      FROM assets a
      LEFT JOIN locations l ON a.location_id = l.id
      GROUP BY l.name
      ORDER BY count DESC
    `;

    const summaryResult = await pool.query(summaryQuery);
    const locationResult = await pool.query(locationQuery);

    const summary = summaryResult.rows[0];
    const locationDistribution = locationResult.rows;

    res.json({
      total_assets: parseInt(summary.total_assets) || 0,
      vm_count: parseInt(summary.vm_count) || 0,
      physical_server_count: parseInt(summary.physical_server_count) || 0,
      me_installed_count: parseInt(summary.me_installed_count) || 0,
      tenable_installed_count: parseInt(summary.tenable_installed_count) || 0,
      auto_patch_count: parseInt(summary.auto_patch_count) || 0,
      manual_patch_count: parseInt(summary.manual_patch_count) || 0,
      alive_servers: parseInt(summary.alive_servers) || 0,
      powered_off_servers: parseInt(summary.powered_off_servers) || 0,
      not_alive_servers: parseInt(summary.not_alive_servers) || 0,
      location_distribution: locationDistribution
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard data', details: err.message });
  }
};

module.exports = {
  getDashboardSummary
};
