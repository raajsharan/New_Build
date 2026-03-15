# Ubuntu 24.04 + Nginx Deployment Guide

Complete guide for deploying the Infrastructure Inventory Management System on Ubuntu 24.04 with Nginx and PM2.

---

## Prerequisites

- Ubuntu 24.04 LTS server
- Root or sudo access
- Domain name (optional, can use IP)
- PostgreSQL installed and running
- At least 2GB RAM and 10GB disk space

---

## Step 1: Update System

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl wget git build-essential
```

---

## Step 2: Install PostgreSQL

```bash
# Install PostgreSQL 15
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create custom PostgreSQL user and database
sudo sudo -u postgres psql << EOF
CREATE DATABASE infrastructure_inventory;
ALTER USER postgres WITH PASSWORD 'Password@1234';
\q
EOF

# Verify database creation
sudo -u postgres psql -l | grep infrastructure_inventory
```

---

## Step 3: Install Node.js (v18+)

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

---

## Step 4: Install Nginx

```bash
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify installation
nginx -v
```

---

## Step 5: Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

---

## Step 6: Setup Application Directory

```bash
# Create application directory
sudo mkdir -p /var/www/infrastructure-inventory
sudo chown $USER:$USER /var/www/infrastructure-inventory

# Clone or copy your application
# (Replace with your git URL or copy method)
cd /var/www/infrastructure-inventory
# git clone your-repo-url .

# Or copy your project files
# cp -r /path/to/project/* /var/www/infrastructure-inventory/
```

---

## Step 7: Setup Backend

```bash
cd /var/www/infrastructure-inventory/backend

# Install dependencies
npm install --production

# Create .env file
cp .env.example .env

# Edit .env with your settings
nano .env
```

### .env Configuration

```env
NODE_ENV=production
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=infrastructure_inventory
DB_USER=postgres
DB_PASSWORD=Password@1234

# JWT Secret (Change this to a secure random string)
JWT_SECRET=your_super_secret_jwt_key_here_min_32_characters_long

# Optional: Enable CORS for specific domain
CORS_ORIGIN=https://your_domain.com
```

**Generate secure JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 8: Run Database Migrations

```bash
cd /var/www/infrastructure-inventory/backend

# Run migrations
npm run migrate

# Seed initial data
npm run seed

# Verify database tables
sudo -u postgres psql -d infrastructure_inventory -c "\dt"
```

---

## Step 9: Setup Backend with PM2

```bash
cd /var/www/infrastructure-inventory/backend

# Start backend with PM2
pm2 start server.js --name "infra-api" --env production

# Verify it's running
pm2 list

# View logs
pm2 logs infra-api

# Setup PM2 startup
pm2 startup
# (Follow the instructions provided)
pm2 save
```

---

## Step 10: Setup Frontend

```bash
cd /var/www/infrastructure-inventory/frontend

# Install dependencies (including build tools)
npm install

# Build React app
npm run build

# Verify build succeeded
ls -la build/
ls build/index.html
```

### Option A: Express.js Server (Recommended)

Create a simple Node.js Express server to serve the built frontend:

```bash
# Create frontend server at /var/www/infrastructure-inventory/frontend-server.js
cat > /var/www/infrastructure-inventory/frontend-server.js << 'EOF'
const express = require('express');
const path = require('path');
const app = express();

// Serve static files from build directory
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Fallback to index.html for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build/index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✓ Frontend server running on port ${PORT}`);
});
EOF

# Start with PM2
cd /var/www/infrastructure-inventory
pm2 start frontend-server.js --name "infra-web"
```

### Option B: Node Serve Package (If Option A has issues)

```bash
cd /var/www/infrastructure-inventory/frontend

# Ensure serve is installed locally (already in package.json)
npm install

# Start with PM2 using npx
pm2 start "npx serve -s build -p 3000" --name "infra-web"
```

### Verify Frontend is Running

```bash
# Check process status
pm2 list

# View frontend logs
pm2 logs infra-web

# Test frontend is accessible
curl http://localhost:3000
```

---

## Step 11: Configure Nginx

### Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/infrastructure-inventory
```

### Paste Configuration

```nginx
upstream backend {
    server localhost:5000;
    keepalive 32;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    listen [::]:80;
    server_name your_domain.com www.your_domain.com;

    # Redirect HTTP to HTTPS (optional, enable after SSL setup)
    # return 301 https://$server_name$request_uri;

    # Serve static frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Enable Configuration

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/infrastructure-inventory /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## Step 12: Setup SSL/TLS (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate (interactive)
sudo certbot --nginx -d your_domain.com -d www.your_domain.com

# Verify automatic renewal
sudo certbot renew --dry-run

# Check certificates
sudo certbot certificates
```

### Update Nginx for HTTPS

Your Let's Encrypt setup will automatically update nginx configuration. Verify:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 13: Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

---

## Step 14: Verify Installation

```bash
# Check all processes
pm2 list

# Check Nginx status
sudo systemctl status nginx

# Test application endpoints
curl http://localhost:5000/health
curl http://localhost:3000

# Test with domain
curl https://your_domain.com
curl https://your_domain.com/api/health
```

---

## Monitoring & Maintenance

### Monitor Processes

```bash
# View real-time PM2 logs
pm2 monit

# View specific process logs
pm2 logs infra-api
pm2 logs infra-web

# View error logs
pm2 logs infra-api --err
```

### Restart Processes

```bash
# Restart specific process
pm2 restart infra-api
pm2 restart infra-web

# Restart all
pm2 restart all

# Stop all
pm2 stop all

# Delete from PM2
pm2 delete infra-api
```

### Database Backups

```bash
# Backup database
sudo -u postgres pg_dump infrastructure_inventory > backup-$(date +%Y%m%d).sql

# Restore database
sudo -u postgres psql infrastructure_inventory < backup-20240314.sql

# Scheduled backup (add to crontab)
# 0 2 * * * sudo -u postgres pg_dump infrastructure_inventory > /backups/backup-$(date +\%Y\%m\%d).sql
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :5000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

### Nginx 502 Bad Gateway

```bash
# Check backend is running
pm2 list

# Check backend logs
pm2 logs infra-api

# Verify Nginx config
sudo nginx -t

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Database Connection Error

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -U postgres -h localhost -d infrastructure_inventory

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Permission Issues

```bash
# Fix directory permissions
sudo chown -R $USER:$USER /var/www/infrastructure-inventory
sudo chmod -R 755 /var/www/infrastructure-inventory

# Fix database permissions
sudo chown postgres:postgres /var/lib/postgresql -R
```

---

## Performance Optimization

### Nginx Caching

```nginx
# Add to server block
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### Node.js Clustering

For high-traffic deployments, use PM2 cluster mode:

```bash
pm2 start server.js -i max --name "infra-api"
```

### Database Connection Pooling

Already configured in `config/database.js` with connection pool of 10 connections.

---

## Security Best Practices

✅ **Implemented:**
- JWT authentication
- Password hashing (bcryptjs)
- HTTPS/TLS encryption
- CORS security headers
- Database password protected

**Additional Recommendations:**

```bash
# 1. Secure .env file
chmod 600 /var/www/infrastructure-inventory/backend/.env

# 2. Enable Nginx rate limiting
# Add to server block:
# limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
# limit_req zone=api burst=20 nodelay;

# 3. Add security headers
# Add to Nginx server block:
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

# 4. Monitor logs regularly
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 5. Keep system updated
sudo apt update && sudo apt upgrade -y
```

---

## Updating Application

```bash
# Stop processes
pm2 stop all

# Pull latest code
cd /var/www/infrastructure-inventory
git pull origin main

# Install dependencies
cd backend && npm install --production
cd ../frontend && npm install --production

# Build frontend
npm run build

# Run migrations (if schema changes)
cd ../backend && npm run migrate

# Restart processes
pm2 start all
```

---

## Common Deployment Issues & Solutions

### Issue: npm install fails with "jsonwebtoken not found"

**Error:** `npm error notarget No matching version found for jsonwebtoken@^9.1.0`

**Solution:** Update backend/package.json to use correct version:
```json
{
  "dependencies": {
    "jsonwebtoken": "^9.0.0"  // NOT 9.1.0
  }
}
```

Then reinstall:
```bash
cd backend
rm -rf node_modules package-lock.json
npm install --omit=dev
```

---

### Issue: React build fails with "react-scripts: not found"

**Error:** `react-scripts build: sh: 1: react-scripts: not found`

**Solution:** react-scripts must be in `dependencies`, not `devDependencies` in frontend/package.json:
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-scripts": "5.0.1",  // MUST be here, not devDependencies
    "serve": "^14.1.2"
  },
  "devDependencies": {}
}
```

Then rebuild:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

### Issue: API calls fail from frontend

**Error:** `Frontend can't reach backend, login fails`

**Root Cause:** Frontend API URL hardcoded to `http://localhost:5000/api` which doesn't work through nginx proxy.

**Solution:** Frontend src/services/api.js must use relative paths:
```javascript
// ✅ CORRECT - uses nginx proxy
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// ❌ WRONG - hardcoded localhost
const API_BASE_URL = 'http://localhost:5000/api';
```

After fixing, rebuild:
```bash
cd frontend
npm run build
pm2 restart infra-web
```

---

### Issue: serve command not found globally

**Error:** `serve: command not found`

**Solution:** Use Express.js server (Option A in Step 10) or use npx:
```bash
# Option 1: Express server (recommended)
pm2 start frontend-server.js --name "infra-web"

# Option 2: Use npx for local package
pm2 start "npx serve -s build -p 3000" --name "infra-web"
```

---

### Issue: Login fails even though backend API works

**Diagnostic Steps:**
```bash
# 1. Test backend directly
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@infra.local","password":"admin1234"}'

# Should return JWT token if working

# 2. Check frontend logs in browser (F12 → Console)
# Look for CORS errors or network errors

# 3. Verify nginx is routing correctly
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@infra.local","password":"admin1234"}'

# 4. Rebuild frontend after any code changes
cd frontend && npm run build && pm2 restart infra-web
```

---

### Issue: Files not being served by frontend

**Diagnostic Steps:**
```bash
# Check frontend build directory exists
ls -la /var/www/infrastructure-inventory/frontend/build/

# Check frontend process is running
pm2 list

# Check if port 3000 is listening
netstat -tlnp | grep 3000

# View frontend logs
pm2 logs infra-web --lines 50
```

---

## Database Setup Verification

```bash
# Connect to database as postgres user
sudo -u postgres psql -d infrastructure_inventory

# Check tables were created
\dt

# Verify admin user exists
SELECT email, role FROM users;

# Check has sample data
SELECT COUNT(*) FROM assets;
SELECT COUNT(*) FROM asset_types;

# If needed, re-seed
\q
npm run seed
```

---

## Testing the Complete Deployment

```bash
# 1. Verify all processes running
pm2 list

# Should show:
# - infra-api (running)
# - infra-web (running)

# 2. Test backend directly
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@infra.local","password":"admin1234"}'

# 3. Open in browser
# http://YOUR_IP_ADDRESS
# or
# https://your-domain.com (if SSL configured)

# 4. Login with credentials
# Email: admin@infra.local
# Password: admin1234

# 5. Check browser console for any errors (F12)
```

---

## Post-Deployment Checklist

- [ ] All processes running: `pm2 list`
- [ ] Backend API responds: `curl http://localhost:5000/api/auth/login`
- [ ] Database has tables: `psql -c "\dt"`
- [ ] Admin user exists: `psql -c "SELECT * FROM users"`
- [ ] Frontend builds: `npm run build` (no errors)
- [ ] Can access via IP: `http://YOUR_IP`
- [ ] Frontend loads: Check browser (F12 → Network that files load)
- [ ] Login works: Username `admin@infra.local`, Password `admin1234`
- [ ] Dashboard loads with data
- [ ] Nginx is routing correctly: `curl http://localhost/api/...`
- [ ] SSL/TLS working (if configured): `https://your-domain.com`

---

## Version Reference

These versions have been tested and verified working:

```
Node.js:          18.x
npm:              9.x+
PostgreSQL:       15
Nginx:            1.24
PM2:              5.x
React:            18.2.0
Express:          4.18.2
jsonwebtoken:     9.0.0  (NOT 9.1.0)
react-scripts:    5.0.1
```

**Important Package Versions:**
- `@backend/package.json`: jsonwebtoken@^9.0.0 (verify exactly)
- `@frontend/package.json`: react-scripts must be in dependencies, not devDependencies
- `@frontend/src/services/api.js`: API_BASE_URL must be '/api' (not hardcoded localhost)

---

## System Information

**Tested On:**
- Ubuntu 24.04 LTS
- Node.js 18.x
- PostgreSQL 15
- Nginx 1.24.x
- PM2 5.x

**Resource Requirements:**
- CPU: 2 cores minimum
- RAM: 2GB minimum (4GB recommended)
- Disk: 20GB minimum
- Network: 1Mbps minimum

---

## Support & Logs

### Key Log Files

```
# Nginx
/var/log/nginx/error.log
/var/log/nginx/access.log

# PM2
pm2 logs infra-api
pm2 logs infra-web

# PostgreSQL
/var/log/postgresql/

# System
/var/log/syslog
```

### Quick Status Check

```bash
#!/bin/bash
echo "=== System Status ==="
echo "PostgreSQL:" $(sudo systemctl is-active postgresql)
echo "Nginx:" $(sudo systemctl is-active nginx)
echo "PM2 Processes:" $(pm2 list | grep -c "online")
echo ""
echo "=== Disk Usage ==="
df -h /var/www/infrastructure-inventory
echo ""
echo "=== Database Size ==="
sudo -u postgres psql -d infrastructure_inventory -c "SELECT pg_size_pretty(pg_database_size('infrastructure_inventory'));"
```

---

**🎉 Your Infrastructure Inventory Management System is now running on Ubuntu 24.04 with Nginx!**

For issues, check logs and troubleshooting section above.
