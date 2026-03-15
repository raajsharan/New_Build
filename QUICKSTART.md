# Quick Start Guide

## Prerequisites
- Node.js (v14+)
- PostgreSQL (v12+)
- npm or yarn

## Step 1: Install All Dependencies
```bash
npm run install-all
```

## Step 2: Setup PostgreSQL
```bash
# Create database
createdb infrastructure_inventory

# Or if using PostgreSQL command line:
psql -U postgres -c "CREATE DATABASE infrastructure_inventory;"
```

## Step 3: Configure Backend
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=infrastructure_inventory
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=super_secret_key_change_in_production
```

## Step 4: Run Database Setup
```bash
# From backend directory
npm run migrate    # Creates all tables
npm run seed       # Seeds sample data
```

## Step 5: Start Both Servers
```bash
# From project root
npm run dev
```

This will start:
- Backend on http://localhost:5000
- Frontend on http://localhost:3000

## Step 6: Login
Open browser to `http://localhost:3000`

**Default credentials:**
- Email: `admin@infra.local`
- Password: `admin1234`

## Individual Server Startup
```bash
# Terminal 1 - Backend only
npm run backend

# Terminal 2 - Frontend only
npm run frontend
```

## Build for Production
```bash
npm run build
```

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check database name, user, password in backend/.env
- Run: `psql -U postgres -l` to list databases

### Port Already in Use
- Backend: Change PORT in backend/.env
- Frontend: Set PORT environment variable

### Module Not Found
```bash
cd backend && npm install
cd ../frontend && npm install
```

### Database Migration Failed
```bash
cd backend
npm run migrate
```

## File Structure
```
new-kk/
├── backend/        # Express.js API
├── frontend/       # React application
├── package.json    # Root package (use for concurrent dev)
└── README.md       # Full documentation
```

## API Testing
Use Postman or curl to test API:
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@infra.local","password":"admin1234"}'

# Get Assets (use token from login)
curl -X GET http://localhost:5000/api/assets \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Production Deployment

For deploying on **Ubuntu 24.04 with Nginx**, see [DEPLOYMENT_UBUNTU.md](DEPLOYMENT_UBUNTU.md) for comprehensive setup and configuration guide including:
- PostgreSQL installation and setup
- Node.js installation
- Nginx reverse proxy configuration
- SSL/TLS with Let's Encrypt
- PM2 process management
- Monitoring and maintenance
- Security best practices

## Next Steps
1. Review backend README.md for API documentation
2. Review frontend README.md for UI components
3. Explore each page in the application
4. Customize configuration values
5. Add your own assets

## Support
See README.md in root and individual backend/frontend directories for detailed information.
