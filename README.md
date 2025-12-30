# OiChat web panel

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/alfabotmz-gmailcoms-projects/v0-oi-chat-web-panel)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/gfJCwMszoPy)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/alfabotmz-gmailcoms-projects/v0-oi-chat-web-panel](https://vercel.com/alfabotmz-gmailcoms-projects/v0-oi-chat-web-panel)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/gfJCwMszoPy](https://v0.app/chat/gfJCwMszoPy)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## API Documentation

This section documents the backend endpoints consumed by the frontend.

### Business Form

**Endpoint:** `/api/business-form`
**Method:** `POST`
**Description:** Submits the business plan interest form. Forwards data to an n8n webhook.

**Request Body:**
\`\`\`json
{
  "name": "string",
  "businessName": "string",
  "employees": "string",
  "budget": "string"
}
\`\`\`

**Response:**
- Success: `{ "success": true }`
- Error: `{ "error": "Internal Server Error" }` (Status 500)

---

### Payments

**Endpoint:** `/api/payments/process`
**Method:** `POST`
**Description:** Processes payments via PayMoz, updates Supabase records, and sends a confirmation email.

**Request Body:**
\`\`\`json
{
  "metodo": "mpesa" | "emola",
  "numero_celular": "string"
}
\`\`\`

**Response:**
- Success:
\`\`\`json
{
  "success": true,
  "message": "string",
  "plan_end_date": "ISO8601 Date String"
}
\`\`\`
- Error: `{ "success": false, "error": "string" }` (Status 400/500)

---

### Profile

**Endpoint:** `/api/profile/update`
**Method:** `POST`
**Description:** Updates the user's profile information in Supabase.

**Request Body:**
\`\`\`json
{
  "businessName": "string",
  "whatsapp": "string",
  "companySize": "string",
  "goal": "string",
  "source": "string"
}
\`\`\`

**Response:**
- Success: `{ "success": true }`
- Error: `{ "success": false, "error": "string" }` (Status 401/500)

---

### Onboarding

**Endpoint:** `/api/onboarding/n8n`
**Method:** `POST`
**Description:** Forwards onboarding survey data to an n8n webhook, appending user ID and email.

**Request Body:**
\`\`\`json
{
  // Any data from the onboarding survey
  ...
}
\`\`\`

**Response:**
- Success: `{ "success": true }`
- Error: `{ "success": false, "error": "string" }` (Status 401/500)

---

### Agents

#### Create Agent
**Endpoint:** `/api/agents/create`
**Method:** `POST`
**Description:** Creates a new agent. Attempts to create via n8n webhook first; falls back to local Supabase creation if n8n fails.

**Request Body:**
\`\`\`json
{
  "nome": "string",
  "prompt": "string",
  "phone_number": "string" | null
}
\`\`\`

**Response:**
- Success:
\`\`\`json
{
  "success": true,
  "message": "string",
  "agent": { ... },
  "warning": "string" // Optional
}
\`\`\`
- Error: `{ "success": false, "error": "string" }` (Status 400/403/500)

#### Connect WhatsApp
**Endpoint:** `/api/agents/connect-whatsapp`
**Method:** `POST`
**Description:** Requests a QR code from n8n to connect an agent to WhatsApp.

**Request Body:**
\`\`\`json
{
  "agent_id": "string"
}
\`\`\`

**Response:**
- Success:
\`\`\`json
{
  "success": true,
  "qr": "string", // Base64 image or data string
  "status": "string",
  "message": "string"
}
\`\`\`
- Error: `{ "success": false, "error": "string" }` (Status 400/401/404/500)

#### Check Agent Status
**Endpoint:** `/api/agents/[id]/status`
**Method:** `GET`
**Description:** Checks the connection status of an agent via n8n.

**Response:**
- Success:
\`\`\`json
{
  "success": true,
  "status": "connected" | "disconnected" | "pending",
  "connected": boolean,
  "message": "string"
}
\`\`\`
- Error: `{ "success": false, "status": "disconnected", "connected": false, "error": "string" }` (Status 400/401/404/500)

#### Delete Agent
**Endpoint:** `/api/agents/[id]/delete`
**Method:** `DELETE`
**Description:** Deletes an agent via n8n and removes it from Supabase.

**Response:**
- Success: `{ "success": true, "message": "string" }`
- Error: `{ "success": false, "error": "string" }` (Status 400/401/404/500)
