const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const seed = async () => {
  try {
    console.log('Starting database seeding...');

    // Create default admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin1234', salt);

    await pool.query(
      `INSERT INTO users (email, password, name, role, permission_level) 
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      ['admin@infra.local', hashedPassword, 'Admin User', 'admin', 'read_write']
    );

    // Asset Types
    const assetTypes = ['VM', 'Physical Server'];
    for (const type of assetTypes) {
      await pool.query(
        `INSERT INTO asset_types (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`,
        [type]
      );
    }

    // OS Types
    const osTypes = ['Linux', 'Windows', 'ESXi'];
    for (const osType of osTypes) {
      await pool.query(
        `INSERT INTO os_types (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`,
        [osType]
      );
    }

    // OS Versions for Linux
    const linuxVersions = ['Ubuntu 20.04', 'Ubuntu 22.04', 'CentOS 7', 'CentOS 8', 'RHEL 7', 'RHEL 8', 'Debian 10', 'Debian 11'];
    const linuxId = (await pool.query('SELECT id FROM os_types WHERE name = $1', ['Linux'])).rows[0].id;
    for (const version of linuxVersions) {
      await pool.query(
        `INSERT INTO os_versions (name, os_type_id) VALUES ($1, $2) ON CONFLICT (name, os_type_id) DO NOTHING`,
        [version, linuxId]
      );
    }

    // OS Versions for Windows
    const windowsVersions = ['Windows Server 2016', 'Windows Server 2019', 'Windows Server 2022', 'Windows 10', 'Windows 11'];
    const windowsId = (await pool.query('SELECT id FROM os_types WHERE name = $1', ['Windows'])).rows[0].id;
    for (const version of windowsVersions) {
      await pool.query(
        `INSERT INTO os_versions (name, os_type_id) VALUES ($1, $2) ON CONFLICT (name, os_type_id) DO NOTHING`,
        [version, windowsId]
      );
    }

    // OS Versions for ESXi
    const esxiVersions = ['ESXi 6.7', 'ESXi 7.0', 'ESXi 8.0'];
    const esxiId = (await pool.query('SELECT id FROM os_types WHERE name = $1', ['ESXi'])).rows[0].id;
    for (const version of esxiVersions) {
      await pool.query(
        `INSERT INTO os_versions (name, os_type_id) VALUES ($1, $2) ON CONFLICT (name, os_type_id) DO NOTHING`,
        [version, esxiId]
      );
    }

    // Departments
    const departments = ['IT', 'DevOps', 'Security', 'Application Team'];
    for (const dept of departments) {
      await pool.query(
        `INSERT INTO departments (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`,
        [dept]
      );
    }

    // Server Status
    const serverStatus = ['Alive', 'Powered Off', 'Not Alive'];
    for (const status of serverStatus) {
      await pool.query(
        `INSERT INTO server_status (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`,
        [status]
      );
    }

    // Patching Schedule
    const patchingSchedules = ['Weekly', 'Monthly'];
    for (const schedule of patchingSchedules) {
      await pool.query(
        `INSERT INTO patching_schedule (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`,
        [schedule]
      );
    }

    // Patching Type
    const patchingTypes = ['Auto', 'Manual'];
    for (const type of patchingTypes) {
      await pool.query(
        `INSERT INTO patching_type (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`,
        [type]
      );
    }

    // Server Patch Type
    const serverPatchTypes = ['Critical', 'Non-Critical', 'Test'];
    for (const type of serverPatchTypes) {
      await pool.query(
        `INSERT INTO server_patch_types (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`,
        [type]
      );
    }

    // Locations
    const locations = ['DC1', 'DC2', 'Azure', 'AWS', 'Branch Office'];
    for (const loc of locations) {
      await pool.query(
        `INSERT INTO locations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`,
        [loc]
      );
    }

    // Insert sample assets
    const vmTypeId = (await pool.query('SELECT id FROM asset_types WHERE name = $1', ['VM'])).rows[0].id;
    const physicalTypeId = (await pool.query('SELECT id FROM asset_types WHERE name = $1', ['Physical Server'])).rows[0].id;
    const linuxOsId = (await pool.query('SELECT id FROM os_types WHERE name = $1', ['Linux'])).rows[0].id;
    const windowsOsId = (await pool.query('SELECT id FROM os_types WHERE name = $1', ['Windows'])).rows[0].id;
    const itDeptId = (await pool.query('SELECT id FROM departments WHERE name = $1', ['IT'])).rows[0].id;
    const devopsDeptId = (await pool.query('SELECT id FROM departments WHERE name = $1', ['DevOps'])).rows[0].id;
    const aliveId = (await pool.query('SELECT id FROM server_status WHERE name = $1', ['Alive'])).rows[0].id;
    const poweredOffId = (await pool.query('SELECT id FROM server_status WHERE name = $1', ['Powered Off'])).rows[0].id;
    const monthlyId = (await pool.query('SELECT id FROM patching_schedule WHERE name = $1', ['Monthly'])).rows[0].id;
    const autoId = (await pool.query('SELECT id FROM patching_type WHERE name = $1', ['Auto'])).rows[0].id;
    const manualId = (await pool.query('SELECT id FROM patching_type WHERE name = $1', ['Manual'])).rows[0].id;
    const dc1Id = (await pool.query('SELECT id FROM locations WHERE name = $1', ['DC1'])).rows[0].id;
    const dc2Id = (await pool.query('SELECT id FROM locations WHERE name = $1', ['DC2'])).rows[0].id;
    const ubuntuId = (await pool.query('SELECT id FROM os_versions WHERE name = $1', ['Ubuntu 20.04'])).rows[0].id;
    const serverWinId = (await pool.query('SELECT id FROM os_versions WHERE name = $1', ['Windows Server 2019'])).rows[0].id;

    const sampleAssets = [
      {
        vm_name: 'WEB-APP-01',
        os_hostname: 'web-app-01.infra.local',
        ip_address: '192.168.1.100',
        asset_type_id: vmTypeId,
        os_type_id: linuxOsId,
        os_version: 'Ubuntu 20.04',
        assigned_user: 'john.doe@company.com',
        user_password: 'encrypted_pass_1',
        department_id: devopsDeptId,
        business_purpose: 'Web Application Server',
        server_status_id: aliveId,
        me_installed_status: true,
        tenable_installed_status: true,
        patching_schedule_id: monthlyId,
        patching_type_id: autoId,
        server_patch_type: 'Critical',
        location_id: dc1Id,
        additional_remarks: 'Production web server',
        serial_no: 'SN-001',
        idrac_enabled: false,
        idrac_ip: null,
        eol_status: 'InSupport'
      },
      {
        vm_name: 'DB-PRIMARY-01',
        os_hostname: 'db-primary-01.infra.local',
        ip_address: '192.168.1.101',
        asset_type_id: physicalTypeId,
        os_type_id: linuxOsId,
        os_version: 'CentOS 7',
        assigned_user: 'jane.smith@company.com',
        user_password: 'encrypted_pass_2',
        department_id: itDeptId,
        business_purpose: 'Primary Database Server',
        server_status_id: aliveId,
        me_installed_status: true,
        tenable_installed_status: false,
        patching_schedule_id: monthlyId,
        patching_type_id: manualId,
        server_patch_type: 'Non-Critical',
        location_id: dc1Id,
        additional_remarks: 'Critical database',
        serial_no: 'SN-002',
        idrac_enabled: true,
        idrac_ip: '192.168.1.151',
        eol_status: 'InSupport'
      },
      {
        vm_name: 'APP-SERVER-02',
        os_hostname: 'app-server-02.infra.local',
        ip_address: '192.168.1.102',
        asset_type_id: vmTypeId,
        os_type_id: windowsOsId,
        os_version: 'Windows Server 2019',
        assigned_user: 'mark.wilson@company.com',
        user_password: 'encrypted_pass_3',
        department_id: devopsDeptId,
        business_purpose: 'Application Server',
        server_status_id: aliveId,
        me_installed_status: false,
        tenable_installed_status: true,
        patching_schedule_id: monthlyId,
        patching_type_id: autoId,
        server_patch_type: 'Critical',
        location_id: dc2Id,
        additional_remarks: 'Secondary app server',
        serial_no: 'SN-003',
        idrac_enabled: false,
        idrac_ip: null,
        eol_status: 'InSupport'
      },
      {
        vm_name: 'BACKUP-SERVER-01',
        os_hostname: 'backup-server-01.infra.local',
        ip_address: '192.168.1.103',
        asset_type_id: physicalTypeId,
        os_type_id: linuxOsId,
        os_version: 'Ubuntu 22.04',
        assigned_user: 'sarah.johnson@company.com',
        user_password: 'encrypted_pass_4',
        department_id: itDeptId,
        business_purpose: 'Backup and Archive',
        server_status_id: poweredOffId,
        me_installed_status: false,
        tenable_installed_status: false,
        patching_schedule_id: monthlyId,
        patching_type_id: manualId,
        server_patch_type: 'Test',
        location_id: dc2Id,
        additional_remarks: 'Backup server',
        serial_no: 'SN-004',
        idrac_enabled: true,
        idrac_ip: '192.168.1.154',
        eol_status: 'EOL'
      }
    ];

    for (const asset of sampleAssets) {
      await pool.query(
        `INSERT INTO assets (
          vm_name, os_hostname, ip_address, asset_type_id, os_type_id, os_version,
          assigned_user, user_password, department_id, business_purpose, server_status_id,
          me_installed_status, tenable_installed_status, patching_schedule_id, patching_type_id,
          server_patch_type, location_id, additional_remarks, serial_no, idrac_enabled, idrac_ip, eol_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
        [
          asset.vm_name, asset.os_hostname, asset.ip_address, asset.asset_type_id,
          asset.os_type_id, asset.os_version, asset.assigned_user, asset.user_password,
          asset.department_id, asset.business_purpose, asset.server_status_id,
          asset.me_installed_status, asset.tenable_installed_status, asset.patching_schedule_id,
          asset.patching_type_id, asset.server_patch_type, asset.location_id, asset.additional_remarks,
          asset.serial_no, asset.idrac_enabled, asset.idrac_ip, asset.eol_status
        ]
      );
    }

    // Insert default settings
    await pool.query(`INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`, ['company_name', 'Infrastructure Team']);
    await pool.query(`INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`, ['company_logo', 'https://via.placeholder.com/40']);
    await pool.query(`INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`, ['password_visibility', 'false']);
    await pool.query(`INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`, ['db_host', 'localhost']);
    await pool.query(`INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`, ['db_port', '5432']);

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Database seeding failed:', err);
    process.exit(1);
  }
};

seed();
