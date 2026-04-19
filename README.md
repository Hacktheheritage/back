# Bilge Backend API

This repository contains a simple Express backend for the Bilge frontend.
It exposes authentication and chat endpoints and stores data in a local JSON datastore.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

By default the API listens on `http://localhost:4000`.
The frontend can use `VITE_API_BASE_URL` to point to this backend.

## Endpoints

### POST /api/auth/login

Request body:

```json
{
  "username": "admin",
  "password": "admin123"
}
```

Success response (200):

```json
{
  "token": "<jwt-token>",
  "user": {
    "id": "...",
    "name": "Admin User",
    "email": "admin@bilge.app",
    "username": "admin",
    "role": "admin",
    "createdAt": "..."
  }
}
```

### POST /api/auth/register

Request body:

```json
{
  "name": "Jane Doe",
  "username": "janedoe",
  "email": "jane@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

Success response (201):

```json
{
  "token": "<jwt-token>",
  "user": {
    "id": "...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "username": "janedoe",
    "role": "user",
    "createdAt": "..."
  }
}
```

### GET /api/auth/me

Headers:

```
Authorization: Bearer <token>
```

Success response (200):

```json
{
  "user": {
    "id": "...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "username": "janedoe",
    "role": "user",
    "createdAt": "..."
  }
}
```

### POST /api/auth/logout

Headers:

```
Authorization: Bearer <token>
```

Success response (200):

```json
{
  "message": "Logged out successfully"
}
```

### POST /api/chat

Headers:

```
Authorization: Bearer <token>
```

### GET /api/health

This endpoint returns a simple success response when the backend is running.

Success response (200):

```json
{
  "status": "ok",
  "message": "Bilge backend is running",
  "timestamp": "2026-04-19T00:00:00.000Z"
}
```


Request body:

```json
{
  "message": "Hello, Bilge!",
  "conversationId": "conversation_123"
}
```

Success response (200):

```json
{
  "conversationId": "conversation_123",
  "reply": "Hello! How can I help you today?",
  "source": "bot"
}
```

If `conversationId` is omitted, the backend creates a new ID.

## Notes

- CORS is enabled to support frontend requests from other origins.
- User data is stored in `src/data/store.json`.
- A default admin user is seeded automatically on first run:
  - username: `admin`
  - password: `admin123`

## Environment

- `PORT` — optional, defaults to `4000`
- `JWT_SECRET` — optional signing secret, defaults to a built-in value
