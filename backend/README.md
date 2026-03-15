# Infrastructure Inventory Management - Backend

This is the Node.js/Express backend API for the Infrastructure Inventory Management Web Application.

## Features

- RESTful API with JWT authentication
- PostgreSQL database with comprehensive schema
- Asset management (create, read, update, delete)
- Dropdown configuration management
- Dashboard with statistics
- User management with role-based permissions
- Settings management
- Bulk asset import
- CSV template support

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your PostgreSQL credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=infrastructure_inventory
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

## Database Setup

1. Create PostgreSQL database:
```bash
createdb infrastructure_inventory
```

2. Run migrations:
```bash
npm run migrate
```

3. Seed initial data (optional):
```bash
npm run seed
```

This will create:
- Default admin user (admin@infra.local / admin1234)
- Sample asset types, OS types, departments, locations, etc.
- 4 sample assets for demonstration

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on the port specified in `.env` (default: 5000)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Assets
- `GET /api/assets` - Get all assets (paginated, filterable)
- `GET /api/assets/:id` - Get single asset
- `POST /api/assets` - Create new asset
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset
- `POST /api/assets/bulk/import` - Bulk import assets

### Configuration
- `GET /api/config` - Get available dropdown tables
- `GET /api/config/:table` - Get dropdown values for a table
- `POST /api/config/:table` - Add new dropdown value (admin only)
- `PUT /api/config/:table/:id` - Update dropdown value (admin only)
- `DELETE /api/config/:table/:id` - Delete dropdown value (admin only)

### Dashboard
- `GET /api/dashboard/summary` - Get dashboard statistics

### Users (Admin only)
- `GET /api/users` - Get all users
- `PUT /api/users/:id/permission` - Update user permission level
- `PUT /api/users/:id/page-visibility` - Update user page visibility

### Settings (Admin only)
- `GET /api/settings` - Get all settings
- `POST /api/settings/update` - Update a setting
- `POST /api/settings/database` - Update database configuration
- `POST /api/settings/company` - Update company logo and name
- `GET /api/settings/password-visibility` - Get password visibility setting
- `POST /api/settings/password-visibility` - Update password visibility

## Database Schema

### Main Tables
- **users** - User accounts with authentication
- **assets** - Infrastructure assets (servers, VMs)

### Lookup Tables
- **asset_types** - VM, Physical Server, etc.
- **os_types** - Linux, Windows, ESXi, etc.
- **os_versions** - Specific OS versions (linked to os_types)
- **departments** - IT, DevOps, Security, etc.
- **server_status** - Alive, Powered Off, Not Alive
- **patching_schedule** - Weekly, Monthly
- **patching_type** - Auto, Manual
- **server_patch_types** - Critical, Non-Critical, Test
- **locations** - DC1, DC2, Azure, AWS, etc.
- **settings** - Application settings

## Environment Variables

```
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=infrastructure_inventory
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key_change_in_production
```

## Default Credentials

After seeding:
- Email: `admin@infra.local`
- Password: `admin1234`

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check credentials in `.env`
- Ensure database exists: `createdb infrastructure_inventory`

### Migration Errors
- Run migrations manually: `npm run migrate`
- Check database logs for specific errors

### Port Already in Use
- Change PORT in `.env`
- Or kill process using the port

## Architecture

```
backend/
├── config/          # Database configuration
├── controllers/     # Route handlers
├── middleware/      # Authentication, error handling
├── routes/          # API route definitions
├── scripts/         # Database migration and seeding
├── utils/           # Utility functions
├── server.js        # Main Express app
└── package.json
```

## License

Proprietary - Infrastructure Team

## Support

For issues or questions, contact the infrastructure team.
