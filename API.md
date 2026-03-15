# API Documentation

Complete REST API documentation for Infrastructure Inventory Management System.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints (except `/auth/login` and `/auth/register`) require JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Authentication Endpoints

### Login
**Endpoint**: `POST /auth/login`

**Request**:
```json
{
  "email": "admin@infra.local",
  "password": "admin1234"
}
```

**Response** (200):
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "admin@infra.local",
    "name": "Admin User",
    "role": "admin",
    "permission_level": "read_write"
  }
}
```

### Register
**Endpoint**: `POST /auth/register`

**Request**:
```json
{
  "email": "user@company.com",
  "password": "secure_password",
  "name": "John Doe"
}
```

**Response** (201):
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 2,
    "email": "user@company.com",
    "name": "John Doe",
    "role": "user",
    "permission_level": "read_write"
  }
}
```

---

## Asset Endpoints

### List Assets
**Endpoint**: `GET /assets`

**Query Parameters**:
- `search` (string) - Search by hostname, IP address, or assigned user
- `location` (number) - Filter by location ID
- `department` (number) - Filter by department ID
- `status` (number) - Filter by server status ID
- `asset_type` (number) - Filter by asset type ID
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 10)

**Example**:
```
GET /assets?search=web-01&location=1&page=1&limit=20
```

**Response** (200):
```json
{
  "data": [
    {
      "id": 1,
      "vm_name": "WEB-APP-01",
      "os_hostname": "web-app-01.infra.local",
      "ip_address": "192.168.1.100",
      "asset_type_id": 1,
      "asset_type_name": "VM",
      "os_type_id": 1,
      "os_type_name": "Linux",
      "os_version": "Ubuntu 20.04",
      "assigned_user": "john.doe@company.com",
      "user_password": "encrypted_pass",
      "department_id": 1,
      "department_name": "IT",
      "business_purpose": "Web Application Server",
      "server_status_id": 1,
      "server_status_name": "Alive",
      "me_installed_status": true,
      "tenable_installed_status": true,
      "patching_schedule_id": 1,
      "patching_schedule_name": "Monthly",
      "patching_type_id": 1,
      "patching_type_name": "Auto",
      "server_patch_type": "Critical",
      "location_id": 1,
      "location_name": "DC1",
      "additional_remarks": "Production server",
      "serial_no": "SN-001",
      "idrac_enabled": true,
      "idrac_ip": "192.168.1.151",
      "eol_status": "InSupport",
      "created_at": "2026-03-14T10:30:00Z",
      "updated_at": "2026-03-14T10:30:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

### Get Single Asset
**Endpoint**: `GET /assets/:id`

**Response** (200):
```json
{
  "id": 1,
  "vm_name": "WEB-APP-01",
  // ... full asset object
}
```

### Create Asset
**Endpoint**: `POST /assets`

**Request**:
```json
{
  "vm_name": "APP-SERVER-01",
  "os_hostname": "app-server-01.local",
  "ip_address": "192.168.1.102",
  "asset_type_id": 1,
  "os_type_id": 1,
  "os_version": "Ubuntu 22.04",
  "assigned_user": "mark.wilson@company.com",
  "user_password": "secure_password",
  "department_id": 2,
  "business_purpose": "Application Server",
  "server_status_id": 1,
  "me_installed_status": true,
  "tenable_installed_status": false,
  "patching_schedule_id": 1,
  "patching_type_id": 1,
  "server_patch_type": "Critical",
  "location_id": 2,
  "additional_remarks": "Production server",
  "serial_no": "SN-003",
  "idrac_enabled": false,
  "idrac_ip": null,
  "eol_status": "InSupport"
}
```

**Response** (201):
```json
{
  "message": "Asset created successfully",
  "data": {
    "id": 5,
    // ... full asset object
  }
}
```

### Update Asset
**Endpoint**: `PUT /assets/:id`

**Request**: Same as create (only fields provided will be updated)

**Response** (200):
```json
{
  "message": "Asset updated successfully",
  "data": {
    "id": 1,
    // ... updated asset object
  }
}
```

### Delete Asset
**Endpoint**: `DELETE /assets/:id`

**Response** (200):
```json
{
  "message": "Asset deleted successfully"
}
```

### Bulk Import Assets
**Endpoint**: `POST /assets/bulk/import`

**Request**:
```json
{
  "assets": [
    {
      "vm_name": "VM-01",
      "os_hostname": "vm-01.local",
      "ip_address": "192.168.1.101",
      // ... other fields
    },
    {
      "vm_name": "VM-02",
      "os_hostname": "vm-02.local",
      "ip_address": "192.168.1.102",
      // ... other fields
    }
  ]
}
```

**Response** (201):
```json
{
  "message": "2 assets imported successfully",
  "data": [
    { "id": 10, "vm_name": "VM-01", ... },
    { "id": 11, "vm_name": "VM-02", ... }
  ]
}
```

---

## Configuration Endpoints

### Get Available Tables
**Endpoint**: `GET /config`

**Response** (200):
```json
{
  "tables": [
    "asset_types",
    "os_types",
    "os_versions",
    "departments",
    "server_status",
    "patching_schedule",
    "patching_type",
    "server_patch_types",
    "locations"
  ]
}
```

### Get Configuration Items
**Endpoint**: `GET /config/:table`

**Example**: `GET /config/asset_types`

**Response** (200):
```json
[
  {
    "id": 1,
    "name": "VM",
    "created_at": "2026-03-14T10:00:00Z",
    "updated_at": "2026-03-14T10:00:00Z"
  },
  {
    "id": 2,
    "name": "Physical Server",
    "created_at": "2026-03-14T10:00:00Z",
    "updated_at": "2026-03-14T10:00:00Z"
  }
]
```

### Add Configuration Item
**Endpoint**: `POST /config/:table` (Admin only)

**Request**:
```json
{
  "name": "New Asset Type"
}
```

**For OS Versions** (requires parent_id):
```json
{
  "name": "Ubuntu 24.04",
  "parent_id": 1
}
```

**Response** (201):
```json
{
  "message": "Item added successfully",
  "data": {
    "id": 3,
    "name": "New Asset Type",
    "created_at": "2026-03-14T10:30:00Z"
  }
}
```

### Update Configuration Item
**Endpoint**: `PUT /config/:table/:id` (Admin only)

**Request**:
```json
{
  "name": "Updated Name"
}
```

**Response** (200):
```json
{
  "message": "Item updated successfully",
  "data": {
    "id": 3,
    "name": "Updated Name",
    "updated_at": "2026-03-14T10:35:00Z"
  }
}
```

### Delete Configuration Item
**Endpoint**: `DELETE /config/:table/:id` (Admin only)

**Response** (200):
```json
{
  "message": "Item deleted successfully"
}
```

---

## Dashboard Endpoints

### Get Dashboard Summary
**Endpoint**: `GET /dashboard/summary`

**Response** (200):
```json
{
  "total_assets": 4,
  "vm_count": 2,
  "physical_server_count": 2,
  "me_installed_count": 3,
  "tenable_installed_count": 2,
  "auto_patch_count": 2,
  "manual_patch_count": 2,
  "alive_servers": 3,
  "powered_off_servers": 1,
  "not_alive_servers": 0,
  "location_distribution": [
    {
      "location": "DC1",
      "count": 2
    },
    {
      "location": "DC2",
      "count": 2
    }
  ]
}
```

---

## User Endpoints (Admin Only)

### Get All Users
**Endpoint**: `GET /users`

**Response** (200):
```json
[
  {
    "id": 1,
    "email": "admin@infra.local",
    "name": "Admin User",
    "role": "admin",
    "permission_level": "read_write",
    "created_at": "2026-03-14T10:00:00Z"
  },
  {
    "id": 2,
    "email": "user@company.com",
    "name": "John Doe",
    "role": "user",
    "permission_level": "read_only",
    "created_at": "2026-03-14T10:15:00Z"
  }
]
```

### Update User Permission
**Endpoint**: `PUT /users/:id/permission`

**Request**:
```json
{
  "permission_level": "read_only"
}
```

**Valid values**: `read_only`, `read_write`

**Response** (200):
```json
{
  "message": "User permission updated successfully",
  "data": {
    "id": 2,
    "email": "user@company.com",
    "name": "John Doe",
    "role": "user",
    "permission_level": "read_only"
  }
}
```

### Update User Page Visibility
**Endpoint**: `PUT /users/:id/page-visibility`

**Request**:
```json
{
  "visible_pages": ["dashboard", "asset_inventory"]
}
```

**Available pages**: `dashboard`, `asset_inventory`, `inventory_configuration`

**Response** (200):
```json
{
  "message": "User page visibility updated successfully",
  "data": {
    "id": 2,
    "email": "user@company.com",
    "visible_pages": ["dashboard", "asset_inventory"]
  }
}
```

---

## Settings Endpoints (Admin Only)

### Get All Settings
**Endpoint**: `GET /settings`

**Response** (200):
```json
{
  "company_name": "Infrastructure Team",
  "company_logo": "https://via.placeholder.com/40",
  "password_visibility": "false",
  "db_host": "localhost",
  "db_port": "5432",
  "db_name": "infrastructure_inventory",
  "db_user": "postgres"
}
```

### Update Setting
**Endpoint**: `POST /settings/update`

**Request**:
```json
{
  "key": "company_name",
  "value": "New Company Name"
}
```

**Response** (200):
```json
{
  "message": "Setting updated successfully",
  "data": {
    "id": 1,
    "key": "company_name",
    "value": "New Company Name",
    "updated_at": "2026-03-14T10:40:00Z"
  }
}
```

### Update Database Configuration
**Endpoint**: `POST /settings/database`

**Request**:
```json
{
  "db_host": "localhost",
  "db_port": 5432,
  "db_name": "infrastructure_inventory",
  "db_user": "postgres",
  "db_password": "new_password"
}
```

**Response** (200):
```json
{
  "message": "Database configuration updated successfully"
}
```

### Update Company Settings
**Endpoint**: `POST /settings/company`

**Request**:
```json
{
  "logoUrl": "https://via.placeholder.com/50",
  "companyName": "My Company"
}
```

**Response** (200):
```json
{
  "message": "Company settings updated successfully"
}
```

### Get Password Visibility
**Endpoint**: `GET /settings/password-visibility`

**Response** (200):
```json
{
  "password_visibility": false
}
```

### Update Password Visibility
**Endpoint**: `POST /settings/password-visibility`

**Request**:
```json
{
  "visible": true
}
```

**Response** (200):
```json
{
  "message": "Password visibility updated successfully"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid table name"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "error": "Admin access required"
}
```

### 404 Not Found
```json
{
  "error": "Asset not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to fetch assets",
  "details": "Connection timeout"
}
```

---

## HTTP Status Codes

- `200` - OK (Success)
- `201` - Created (Resource created)
- `400` - Bad Request (Invalid input)
- `401` - Unauthorized (No/Invalid token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found (Resource not found)
- `500` - Internal Server Error

---

## Rate Limiting

Currently not implemented. Can be added using express-rate-limit middleware.

## CORS

CORS is enabled for all origins in development. In production, specify allowed origins in `server.js`.

## JWT Token

- **Expiry**: 24 hours
- **Secret**: Configured in `.env` as `JWT_SECRET`
- **Algorithm**: HS256

---

## Testing

Use curl or Postman to test endpoints:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@infra.local","password":"admin1234"}'

# Get all assets (replace TOKEN with actual JWT)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/assets

# Create asset
curl -X POST http://localhost:5000/api/assets \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...asset data...}'
```

---

**API Version**: 1.0.0  
**Last Updated**: March 14, 2026
