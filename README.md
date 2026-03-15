# Infrastructure Inventory Management System

A professional infrastructure inventory management web application for system administrators to manually manage server and VM assets. This is a complete full-stack solution built with React, Node.js/Express, and PostgreSQL.

## Overview

**InfraIMMS** (Infrastructure Inventory Management System) is an enterprise-grade web application designed for infrastructure teams to maintain a comprehensive inventory of servers, virtual machines, and related assets. All asset data is manually maintained through an intuitive web interface with no automated scanning or external integrations required.

## Key Features

### Dashboard
- Real-time infrastructure statistics
- Asset count overview
- Installed agents tracking (Manage Engine, Tenable)
- Patching status distribution
- Server status overview (Alive, Powered Off, Not Alive)
- Location-wise server distribution
- Auto-refresh every 30 seconds

### Asset Management
- **Add Assets**: Single form to enter all asset details
- **View Assets**: Paginated table with search and filtering
- **Edit Assets**: Modify existing asset information
- **Delete Assets**: Remove assets from inventory
- **Bulk Import**: CSV-based bulk asset import with template
- **Password Management**: Optional password storage with visibility toggle

### Asset Fields
- VM Name / OS Hostname
- IP Address
- Asset Type (VM, Physical Server)
- OS Type (Linux, Windows, ESXi) with version picker
- Assigned User
- User Password (with visibility control)
- Department
- Business Purpose
- Server Status (Alive, Powered Off, Not Alive)
- Manage Engine Installed (Toggle)
- Tenable Installed (Toggle)
- Patching Schedule (Weekly, Monthly)
- Patching Type (Auto, Manual)
- Server Patch Type (Critical, Non-Critical, Test)
- Location
- Serial Number
- IDRAC Status (with IP address capture)
- EOL Status (InSupport, EOL, Decommissioned)
- Additional Remarks

### Configuration Management
- **Dropdown Management**: Add, edit, delete dropdown values
- **Manageable Dropdowns**:
  - Asset Types
  - OS Types
  - OS Versions (linked to OS Type)
  - Departments
  - Server Status
  - Patching Schedule
  - Patching Type
  - Server Patch Type
  - Locations
- **Custom Field Configuration**: Admin-only interface to add custom fields

### User Management (Admin Only)
- User registration (self-signup)
- Permission levels: Read-Only, Read & Write
- Page visibility control per user
- Admin user administration

### Settings (Admin Only)
- Company name and logo configuration
- Database connection settings (localhost support)
- Password visibility toggle (system-wide)
- User permission management

## Tech Stack

### Frontend
- **React 18** - UI framework
- **React Router v6** - Navigation
- **TailwindCSS** - Styling
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Lucide React** - Icons
- **PapaParse** - CSV parsing

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                       │
│  (Dashboard, Assets, Config, Settings, Users)          │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST API
┌─────────────────────────────────────────────────────────┐
│                 Express.js Backend                      │
│           (API Routes, Auth, Controllers)               │
└────────────────────┬────────────────────────────────────┘
                     │ SQL
┌─────────────────────────────────────────────────────────┐
│              PostgreSQL Database                        │
│     (Assets, Users, Config, Settings, Logs)            │
└─────────────────────────────────────────────────────────┘
```

## Database Schema

### Main Tables
- **users** - User accounts with authentication credentials
- **assets** - Infrastructure asset inventory
- **settings** - System configuration

### Lookup Tables
- **asset_types** - VM, Physical Server
- **os_types** - Linux, Windows, ESXi
- **os_versions** - OS version list (linked to os_types)
- **departments** - IT, DevOps, Security, etc.
- **server_status** - Alive, Powered Off, Not Alive
- **patching_schedule** - Weekly, Monthly
- **patching_type** - Auto, Manual
- **server_patch_types** - Critical, Non-Critical, Test
- **locations** - DC1, DC2, Azure, AWS, Branch Office

## Installation & Setup

### Prerequisites
- Node.js (v14+)
- PostgreSQL (v12+)
- Git
- npm or yarn

### Backend Setup

1. Clone and navigate to backend:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=infrastructure_inventory
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
```

4. Create PostgreSQL database:
```bash
createdb infrastructure_inventory
```

5. Run database migration:
```bash
npm run migrate
```

6. Seed initial data:
```bash
npm run seed
```

7. Start backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm start
```

Frontend will open at `http://localhost:3000`

## Default Credentials

After seeding, use these to login:
- **Email**: `admin@infra.local`
- **Password**: `admin1234`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Assets
- `GET /api/assets` - List assets (with pagination & filters)
- `GET /api/assets/:id` - Get single asset
- `POST /api/assets` - Create asset
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset
- `POST /api/assets/bulk/import` - Bulk import assets

### Configuration
- `GET /api/config` - List available tables
- `GET /api/config/:table` - Get config items
- `POST /api/config/:table` - Add config item (admin)
- `PUT /api/config/:table/:id` - Update config (admin)
- `DELETE /api/config/:table/:id` - Delete config (admin)

### Dashboard
- `GET /api/dashboard/summary` - Get dashboard statistics

### Users (Admin Only)
- `GET /api/users` - List all users
- `PUT /api/users/:id/permission` - Update user permission
- `PUT /api/users/:id/page-visibility` - Update user page visibility

### Settings (Admin Only)
- `GET /api/settings` - Get all settings
- `POST /api/settings/update` - Update a setting
- `POST /api/settings/database` - Update database config
- `POST /api/settings/company` - Update company info
- `GET /api/settings/password-visibility` - Get password visibility
- `POST /api/settings/password-visibility` - Update password visibility

## Bulk Import Format

CSV template with required headers:

```csv
vm_name,os_hostname,ip_address,asset_type_id,os_type_id,os_version,assigned_user,user_password,department_id,business_purpose,server_status_id,me_installed_status,tenable_installed_status,patching_schedule_id,patching_type_id,server_patch_type,location_id,additional_remarks,serial_no,idrac_enabled,idrac_ip,eol_status
```

Download template from the Add Asset page.

## Deployment

### Ubuntu 24.04 + Nginx

For complete deployment instructions on Ubuntu 24.04 with Nginx, PostgreSQL, and PM2, see **[DEPLOYMENT_UBUNTU.md](DEPLOYMENT_UBUNTU.md)**.

This comprehensive guide includes:
- ✅ PostgreSQL installation and database setup
- ✅ Node.js 18.x installation
- ✅ PM2 process manager configuration
- ✅ Nginx reverse proxy setup
- ✅ SSL/TLS with Let's Encrypt
- ✅ Firewall and security configuration
- ✅ Monitoring and maintenance procedures
- ✅ Database backup and restore
- ✅ Troubleshooting guide
- ✅ Performance optimization

**Quick Start for Ubuntu 24.04:**
```bash
# 1. Follow DEPLOYMENT_UBUNTU.md for step-by-step instructions
# 2. The guide covers all prerequisites and configurations
# 3. Automated setup and monitoring scripts included
```

## Performance Optimization

- Pagination with configurable page size
- Search and filter on server-side
- Chart auto-refresh every 30 seconds
- Lazy loading of React components
- Optimized database queries

## Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- CORS protection
- Input validation
- Role-based access control
- Secure token storage
- Password visibility toggle

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Verify PostgreSQL is running
- Check credentials in `.env`
- Ensure database exists

**API Not Responding**
- Check backend is running on port 5000
- Verify network connectivity
- Check firewall rules

**Login Issues**
- Clear browser cache
- Verify demo credentials
- Check JWT secret in `.env`

**CSV Import Fails**
- Verify CSV format matches template
- Ensure all required columns present
- Check data types match database schema

## Project Statistics

- **Backend**: ~500 lines of code
- **Frontend**: ~2000 lines of code
- **Database**: 11 tables with relationships
- **API Endpoints**: 20+ endpoints
- **Features**: 50+ features and configurations

## Future Enhancements

- [ ] Export assets to Excel
- [ ] Asset audit history
- [ ] Scheduled reports
- [ ] Automated health checks
- [ ] Mobile app
- [ ] LDAP integration
- [ ] Webhook notifications
- [ ] API documentation (Swagger)

## Contributing

Internal use only - Infrastructure Team

## License

Proprietary - Infrastructure Team

## Support

For questions or issues, contact the infrastructure team.

---

**Version**: 1.0.0  
**Last Updated**: March 14, 2026  
**Status**: Production Ready
