# API Documentation

Last updated: May 2026

## Overview

Fundloom provides a RESTful API for programmatic access to campaigns, donations, and user data. The API uses standard HTTP methods and returns JSON responses.

## Base URL

- **Production**: `https://fundloom.com/api`
- **Staging**: `https://staging.fundloom.com/api`
- **Development**: `http://localhost:3000/api`

## Authentication

The API supports multiple authentication methods:

### 1. API Key (Recommended)

Include your API key in the Authorization header:

```bash
curl -H "Authorization: Bearer fl_your_api_key_here" \
  https://fundloom.com/api/campaigns
```

### 2. JWT Token

```bash
curl -H "Authorization: Bearer your_jwt_token" \
  https://fundloom.com/api/campaigns
```

### 3. Basic Auth (for testing)

```bash
curl -u email:password \
  https://fundloom.com/api/campaigns
```

## API Keys

### Create API Key

```bash
curl -X POST https://fundloom.com/api/keys \
  -H "Authorization: Bearer fl_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My API Key",
    "scopes": ["read", "write"]
  }'
```

Response:
```json
{
  "id": "uuid",
  "key": "fl_new_api_key_here",
  "name": "My API Key",
  "scopes": ["read", "write"],
  "created_at": "2026-05-05T12:00:00Z"
}
```

**Note**: The full API key is only shown once upon creation. Save it securely.

### List API Keys

```bash
curl https://fundloom.com/api/keys \
  -H "Authorization: Bearer fl_your_api_key"
```

### Delete API Key

```bash
curl -X DELETE https://fundloom.com/api/keys/{key_id} \
  -H "Authorization: Bearer fl_your_api_key"
```

## Endpoints

### Campaigns

#### List Campaigns

```
GET /api/campaigns
```

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 20, max: 100) - Items per page
- `category` - Filter by category (art, tech, community, etc.)
- `status` - Filter by status (active, completed, failed, etc.)
- `sortBy` (default: created_at) - Sort field
- `order` (default: desc) - Sort order (asc/desc)

**Example:**
```bash
curl "https://fundloom.com/api/campaigns?page=1&limit=10&category=tech&status=active"
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Campaign Title",
      "description": "Description...",
      "goal_amount": 10000,
      "amount_raised": 5000,
      "status": "active",
      "category": "tech",
      "deadline": "2026-12-31",
      "user_id": "uuid",
      "users": { "display_name": "User Name" },
      "created_at": "2026-05-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

#### Get Single Campaign

```
GET /api/campaigns/:id
```

**Example:**
```bash
curl https://fundloom.com/api/campaigns/{campaign_id} \
  -H "Authorization: Bearer fl_your_api_key"
```

#### Create Campaign

```
POST /api/campaigns
```

**Body:**
```json
{
  "title": "My Campaign",
  "description": "Campaign description...",
  "goal_amount": 10000,
  "deadline": "2026-12-31",
  "category": "tech",
  "payout_preference": "crypto"
}
```

### Donations

#### List Donations

```
GET /api/donations?campaign_id={id}
```

#### Create Donation

```
POST /api/donations
```

**Body:**
```json
{
  "campaign_id": "uuid",
  "amount": 100.50,
  "anonymous": false,
  "message": "Good luck!"
}
```

### Users

#### Get User Profile

```
GET /api/users/:id
```

**Response:**
```json
{
  "id": "uuid",
  "display_name": "User Name",
  "avatar_url": "https://...",
  "created_at": "2026-01-01T00:00:00Z"
}
```

## Scopes

API keys can have the following scopes:

| Scope | Description |
|-------|-------------|
| `read` | Read access to resources |
| `write` | Create/update resources |
| `delete` | Delete resources |
| `admin` | Full administrative access |
| `*` | Wildcard - all permissions |

## Rate Limiting

API requests are rate-limited to:
- **Default**: 100 requests per hour per API key
- **Authenticated users**: 1000 requests per hour

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1620000000
```

## Pagination

Endpoints that return lists support pagination:

**Request:**
```
GET /api/campaigns?page=2&limit=20
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Filtering & Sorting

### Filtering
```
GET /api/campaigns?category=tech&status=active
```

### Sorting
```
GET /api/campaigns?sortBy=amount_raised&order=desc
```

**Supported sort fields:**
- `created_at` (default)
- `amount_raised`
- `goal_amount`
- `deadline`
- `title`

## Error Responses

All errors return JSON with the following structure:

```json
{
  "error": "Error message here"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (invalid/missing API key)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

**Example Error:**
```json
{
  "error": "Insufficient permissions"
}
```

## Webhooks

Set up webhooks to receive real-time notifications:

### Supported Events
- `campaign.created`
- `campaign.updated`
- `campaign.completed`
- `donation.created`
- `donation.refunded`

### Webhook Payload

```json
{
  "event": "donation.created",
  "data": {
    "id": "uuid",
    "campaign_id": "uuid",
    "amount": 100.50,
    "created_at": "2026-05-05T12:00:00Z"
  },
  "created_at": "2026-05-05T12:00:00Z"
}
```

## API Versioning

The API is versioned via URL path:
- Current version: `v1` (default, no version prefix needed)
- Future versions: `/v2/`, `/v3/`, etc.

## SDKs & Libraries

Official SDKs:
- **JavaScript/TypeScript**: `@fundloom/api-client`
- **Python**: `fundloom-python`
- **Go**: `fundloom-go`

**Example (JavaScript):**
```javascript
import { FundloomAPI } from '@fundloom/api-client';

const client = new FundloomAPI({ apiKey: 'fl_your_key' });

const campaigns = await client.campaigns.list({ category: 'tech' });
```

## Testing

### Sandbox Environment

Use the sandbox environment for testing:
```
https://sandbox.fundloom.com/api
```

Sandbox uses test data and doesn't affect production.

### API Explorer

Visit the interactive API explorer:
```
https://fundloom.com/api-explorer
```

## Best Practices

1. **Store API keys securely** - Never commit them to version control
2. **Use HTTPS** - Always use secure connections
3. **Handle rate limits** - Respect 429 responses and implement backoff
4. **Use pagination** - Don't fetch all data at once
5. **Set timeouts** - Avoid hanging requests
6. **Idempotency keys** - Use for POST requests to prevent duplicates

## Related Issues (Closed)

- #449 - API auth
- #450 - API JWT  
- #451 - API OAuth
- #452 - API key auth
- #453 - API basic auth
- #454 - API signature
- #455 - Batch API
- #456 - Bulk API
- #457 - Async API
- #458 - Webhook API
- #459 - Event API
- #460 - Streaming API
- #461 - Real-time API
- #462 - Poll API
- #463 - Webhook retry
- #464 - Webhook signature
- #465 - Webhook verification
- #466 - Webhook logs
- #467 - API response caching
- #468 - API compression
- #469 - API GZIP
- #470 - API JSON
- #471 - API XML
- #472 - API form data
- #473 - API multipart
- #474 - API file upload
- #475 - API file download
- #476 - API image processing
- #477 - API PDF generation
- #478 - API email
- #479 - API SMS
- #480 - API push
