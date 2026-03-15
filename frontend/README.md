# Infrastructure Inventory Management - Frontend

React-based frontend for the Infrastructure Inventory Management Web Application with TailwindCSS styling and Recharts for data visualization.

## Features

- Modern, responsive React interface with TailwindCSS
- JWT-based authentication with login page
- Dashboard with real-time statistics and charts
- Asset inventory management (add, view, edit, delete)
- Bulk asset import via CSV
- Dropdown configuration management
- Custom asset field configuration (Admin only)
- Settings management (Admin only)
- User permission management (Admin only)
- Database connection configuration (Admin only)
- Password visibility toggle
- Page visibility control per user
- Multi-page navigation with role-based access

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running on http://localhost:5000

## Installation

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## Configuration

Create a `.env` file in the frontend directory (optional):

```
REACT_APP_API_URL=http://localhost:5000/api
```

If not set, defaults to `http://localhost:5000/api`

## Available Scripts

### Start Development Server
```bash
npm start
```

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm test
```

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/        # Reusable React components
│   │   ├── Header.js      # Top navigation bar
│   │   └── Sidebar.js     # Left navigation menu
│   ├── context/           # React Context (Auth)
│   │   └── AuthContext.js
│   ├── pages/             # Page components
│   │   ├── LoginPage.js
│   │   ├── DashboardPage.js
│   │   ├── AddAssetPage.js
│   │   ├── AssetInventoryPage.js
│   │   ├── InventoryConfigPage.js
│   │   ├── FieldConfigPage.js
│   │   └── SettingsPage.js
│   ├── services/          # API service layer
│   │   └── api.js
│   ├── utils/             # Utility functions
│   │   └── helpers.js
│   ├── App.js             # Main App component
│   ├── index.js           # Application entry point
│   └── index.css          # Global styles
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## Key Components

### Authentication (AuthContext)
- User login/registration
- Token management
- Protected routes
- Auto-logout on token expiry

### Dashboard
- Asset statistics cards
- Charts showing:
  - Asset type distribution (VM vs Physical)
  - Patching type distribution
  - Server status overview
  - Location-wise distribution
- Auto-refresh every 30 seconds

### Asset Management
- Add new assets with all details
- View assets in paginated table with sorting and filtering
- Edit existing assets
- Delete assets
- Bulk import from CSV
- CSV template download

### Configuration Management
- Manage all dropdown values
- Add/edit/delete configuration items
- OS Version management linked to OS Type
- Custom field creation for assets

### User Management (Admin only)
- View all users
- Update user permission levels (read-only vs read & write)
- Control page visibility per user

### Settings (Admin only)
- Company name and logo configuration
- Database connection settings
- Password visibility toggle for entire system
- User permission management

## Default Login Credentials

```
Email: admin@infra.local
Password: admin1234
```

## API Integration

All API calls go through the `services/api.js` file with axios. Requests are automatically authenticated with JWT tokens stored in localStorage.

Key endpoints:
- `/api/auth/login` - User login
- `/api/auth/register` - User registration
- `/api/assets` - Asset CRUD operations
- `/api/config/{table}` - Configuration management
- `/api/dashboard/summary` - Dashboard statistics
- `/api/users` - User management
- `/api/settings` - System settings

## Styling

Built with TailwindCSS for responsive, modern UI:
- Mobile-first design
- Responsive grid layouts
- Dark mode ready (can be extended)
- Custom color scheme for status indicators

## Charts

Uses Recharts for data visualization:
- Pie charts for distribution
- Bar charts for counts
- Tooltip and legend support
- Responsive container sizing

## Deployment

### Production Build
```bash
npm run build
```

Creates optimized build in `build/` directory

### Serve with HTTP Server
```bash
npx serve -s build
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Code splitting with React Router
- Lazy loading of pages
- Context API for state management
- Optimized re-renders
- Responsive image loading

## Security

- JWT token-based authentication
- Secure token storage in localStorage
- Protected API endpoints
- Password field masking (toggle)
- Role-based access control
- CORS enabled on backend

## Troubleshooting

### API Connection Issues
- Verify backend is running on port 5000
- Check `.env` file for correct API URL
- Check browser console for CORS errors

### Login Issues
- Clear browser cache and localStorage
- Verify demo credentials
- Check backend is accessible

### Chart Display Issues
- Ensure Recharts is properly installed
- Check browser console for errors
- Verify data is being fetched correctly

## License

Proprietary - Infrastructure Team

## Support

For issues or questions, contact the infrastructure team.
