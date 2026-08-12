# GRC3 Frontend - Complete API Reference

## 📋 Table of Contents
1. [Configuration](#configuration)
2. [Authentication APIs](#authentication)
3. [Asset Management](#asset-management)
4. [Incident Management](#incident-management)
5. [Breach Management](#breach-management)
6. [Compliance & Controls](#compliance--controls)
7. [Data Flow & Classifications](#data-flow--classifications)
8. [TPRM/Vendor Management](#tprmvendor-management)
9. [RBI Tracking](#rbi-tracking)
10. [Adobe Sign Integration](#adobe-sign-integration)

---

## Configuration

### Environment Variables
```javascript
// API Base URLs
NEXT_PUBLIC_API_BASE_URL = "http://localhost:5000"
NEXT_PUBLIC_SCAN_API_BASE_URL = "http://192.168.1.43:8006"  // Data scanning
NEXT_PUBLIC_WS_BASE_URL = "ws://..."                         // WebSocket

// API Prefixes
NEXT_PUBLIC_Dev = "apiv2"  // Dynamic prefix (configurable)
NEXT_PUBLIC_PRODUCTION = "true" or "false"
```

### Base URLs
```javascript
// Main API
baseurl = "http://localhost:5000"
initURL = "apiv2"  // or configurable prefix

// Control APIs
CONTROL_BASE_URL = "http://192.168.1.7:8080"
```

---

## Authentication APIs

### Authentication Configuration
- **Storage**: sessionStorage / localStorage
- **Headers**: 
  - `Authorization: Bearer {access_token}`
  - `x-refresh-token: {refresh_token}`
  - `x-tenant-id: {tenant_id}`

### Token Refresh
```javascript
GET ${baseurl}/${initURL}/apiv1/token/refresh
Headers: { "x-refresh-token": refreshToken }
```

---

## Asset Management

**Base URL**: `${baseurl}/${initURL}/asset-management`

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all assets |
| GET | `/:id` | Get asset by ID |
| POST | `/` | Create new asset |
| POST | `/bulk` | Bulk create assets |
| PATCH | `/:id` | Update asset |
| DELETE | `/:id` | Delete asset |

**Service File**: [src/services/assetService.js](src/services/assetService.js)

---

## Incident Management

**Base URL**: `${baseurl}/${initURL}/incident-management`

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all incidents |
| GET | `/:id` | Get incident by ID |
| POST | `/` | Create incident |
| PUT | `/:id` | Update incident |
| DELETE | `/:id` | Delete incident |

**Service File**: [src/services/incidentService.js](src/services/incidentService.js)

---

## Breach Management

**Base URL**: `${baseurl}/${initURL}/breach-management`

### Core Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create breach |
| GET | `/` | Get all breaches |
| GET | `/:id` | Get breach by ID |
| PUT | `/:id` | Update breach |
| DELETE | `/:id` | Delete breach |

### Sub-Resources
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/:id/knowledge-base` | Add knowledge base item |
| DELETE | `/:id/knowledge-base/:index` | Remove knowledge base item |
| POST | `/:id/communication-plan` | Add communication plan |
| DELETE | `/:id/communication-plan/:index` | Remove communication plan |
| PATCH | `/:id/communication-plan/:index` | Update communication plan |

**Service File**: [src/services/breachService.js](src/services/breachService.js)

---

## Compliance & Controls

### Compliance Management
**Base URL**: `${baseurl}/${initURL}/compliance`

**Routes**: `/compliance`, `/compliance/frameworks`, `/compliance/controls`, `/compliance/monitoring`, `/compliance/reports`

### Controls APIs

**Endpoints**:
- `${CONTROL_BASE_URL}/api/controls` - Dashboard/List
- `${CONTROL_BASE_URL}/api/controls/extract` - Extract controls
- `${CONTROL_BASE_URL}/api/controls/compare/one` - Compare single control
- `${CONTROL_BASE_URL}/api/controls/compare/all` - Compare all controls
- `${CONTROL_BASE_URL}/api/controls/add` - Add control
- `${CONTROL_BASE_URL}/api/controls/update/:id` - Update control

**Service Files**: [src/services/api/API_CONSTANT.js](src/services/api/API_CONSTANT.js)

---

## Data Flow & Classifications

**Base URLs**:
- `${baseurl}/${initURL}/dataflow/categories`
- `${baseurl}/${initURL}/dataflow/classifications`
- `${baseurl}/${initURL}/dataflow/subject-types`
- `${baseurl}/${initURL}/dataflow/elements`
- `${baseurl}/${initURL}/dataflow/purposes`

### Classification Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/classifications` | Get all classifications |
| GET | `/classifications/:id` | Get classification details |
| POST | `/classifications` | Create classification |
| PATCH | `/classifications/:id` | Update classification |

**Note**: Perfect for your Data Governance Dashboard (PII, Confidential, Private, Public classifications)

---

## TPRM/Vendor Management

**Base URL**: `${baseurl}/${initURL}/TPRM/vendor-management`

### Vendor Endpoints
- **GET** `/vendor` - List vendors
- **POST** `/vendor` - Create vendor
- **PATCH** `/vendor/:id` - Update vendor

### Findings
**Base URL**: `${baseurl}/${initURL}/TPRM/vendor/findings`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/findings` | Get all findings |
| GET | `/action-items` | Get action items |
| POST | `/findings` | Create finding |
| POST | `/findings/:id/action-items` | Add action item |
| PATCH | `/findings/:id` | Update finding |
| PATCH | `/findings/:id/action-items/:itemId` | Update action item |

### Issues
**Base URL**: `${baseurl}/${initURL}/TPRM/vendor/issues`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/issues` | Get issues with filters |
| POST | `/issues` | Create issue |
| PATCH | `/issues/:id` | Update issue |
| PATCH | `/issues/:id/status` | Update issue status |

### Engagements
**Base URL**: `${baseurl}/${initURL}/TPRM/vendor/engagements`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all engagements |
| GET | `/:id` | Get engagement details |
| POST | `/` | Create engagement |
| PATCH | `/:id` | Update engagement |

### Audit Reports
**Base URL**: `${baseurl}/${initURL}/TPRM/vendor/audit-report`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload audit report |
| GET | `/:vendorId` | Get vendor reports |
| DELETE | `/:vendorId/:docId` | Delete report |

**Service Files**: 
- [src/services/tprm/vendor/findings.js](src/services/tprm/vendor/findings.js)
- [src/services/tprm/vendor/issues.js](src/services/tprm/vendor/issues.js)
- [src/services/tprm/vendor/engagements.js](src/services/tprm/vendor/engagements.js)
- [src/services/tprm/vendor/auditReportApi.js](src/services/tprm/vendor/auditReportApi.js)

---

## RBI Tracking

**Base URL**: `${baseurl}/${initURL}/rbi-tracking`

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/fetchall-bank-details` | Get all bank details |
| PATCH | `/bank-details` | Update bank details |
| GET | `/fetchall-department-details` | Get department details |
| PATCH | `/department-details` | Update department details |
| POST | `/bank-details` | Create bank details |
| POST | `/department-details` | Create department details |

**Use Case**: Bank statements, account management, banking compliance tracking

---

## Adobe Sign Integration

**Base URL**: `${baseurl}/${initURL}/adobe-sign`

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload document for signing |
| POST | `/create-and-send-digital` | Create & send digital agreement |
| GET | `/agreements/:agreementId` | Get agreement status/details |

**Page**: [src/pages/AcrobatSignFlow/index.js](src/pages/AcrobatSignFlow/index.js)

---

## Additional Services

### AI/Gemini Integration
```javascript
// Google Gemini API (for content generation)
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${NEXT_PUBLIC_GEMINI_API_KEY}
```

### Tenant Management (Admin)
**Base URL**: `/access/tenants`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List tenants |
| GET | `/current` | Get current tenant |
| GET | `/current/users` | Get tenant users |
| POST | `/` | Create tenant |
| POST | `/:id/assign-roles` | Assign roles |
| POST | `/current/assign-roles` | Assign roles to current tenant |

### Access Control
**Base URL**: `/access`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/roles` | Get available roles |
| GET | `/catalog` | Get access catalog |

---

## HTTP Client Setup

### Custom Axios Configuration
The app uses a custom Axios instance with:
- ✅ Automatic token injection
- ✅ Refresh token handling (auto-retry on 401)
- ✅ Tenant ID header support
- ✅ Credentials enabled (withCredentials: true)

**Import**:
```javascript
import CustomAxios from "@/globalcomponents/CustomAxios";
```

**Usage**:
```javascript
// GET request
const response = await CustomAxios.get(`${baseurl}/${initURL}/endpoint`);

// POST request
const response = await CustomAxios.post(`${baseurl}/${initURL}/endpoint`, payload);

// PATCH request
const response = await CustomAxios.patch(`${baseurl}/${initURL}/endpoint/:id`, payload);

// DELETE request
await CustomAxios.delete(`${baseurl}/${initURL}/endpoint/:id`);
```

---

## For Your Data Governance Dashboard

### Recommended APIs to Use:

1. **Data Classifications** - For PII, Confidential, Private, Public data types
   - `GET /dataflow/classifications`
   - `GET /dataflow/categories`

2. **Asset Management** - For tracking where sensitive data is stored
   - `GET /asset-management`

3. **Incident Management** - For compliance violations and breaches
   - `GET /incident-management`

4. **Breach Management** - For data breach incidents
   - `GET /breach-management`

5. **RBI Tracking** - For bank-related data (bank statements, accounts)
   - `GET /rbi-tracking/fetchall-bank-details`

6. **TPRM Findings** - For risk/vulnerability tracking
   - `GET /TPRM/vendor/findings`

---

## Quick Reference: Error Handling

```javascript
try {
  const response = await CustomAxios.get(endpoint);
  return response.data;
} catch (error) {
  if (error.response?.status === 401) {
    // Token expired - auto-handled by interceptor
  }
  console.error('API Error:', error.message);
  throw error;
}
```

---

## Notes
- All timestamps use ISO 8601 format
- Pagination typically uses `skip` and `limit` query parameters
- Tenant ID is required for multi-tenant operations
- All endpoints require authentication unless specified otherwise
