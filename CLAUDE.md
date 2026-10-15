# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

OfferGrid (job-tracker) is a full-stack job application tracking app. Users track job applications through a status pipeline (Applied → Interviewing → Offered → Rejected). Admins manage users and status definitions. The app is branded as "OfferGrid."

## Repo structure

```
admin-panel/    Next.js 16 (React 19, Tailwind CSS v4, TypeScript) — BFF + UI
backend/        Express 5 (Node.js, Mongoose, CommonJS) — REST API
```

## Common commands

```bash
# Backend
cd backend && npm run dev      # Start with nodemon (default port 5002)
cd backend && npm start        # Start without watch

# Frontend
cd admin-panel && npm run dev  # Next.js dev server (default port 3000)
cd admin-panel && npm run build
cd admin-panel && npm run lint
```

Both servers must run concurrently for local development. The backend needs a MongoDB instance — set `MONGO_URI` in `backend/.env`.

## Architecture

### Auth flow

- Backend issues JWT tokens in httpOnly cookies (`/api/user/login`, `/api/user/register`). The `protect` middleware (`backend/middleware/auth.js`) reads the cookie and attaches `req.user`. The `admin` middleware gates admin-only routes.
- Frontend Next.js API routes in `admin-panel/app/api/` act as a **BFF proxy** to the Express backend. They forward the cookie from the browser to the backend and relay the response back.
- The Next.js middleware (`admin-panel/middleware.ts`) redirects unauthenticated users away from `/dashboard` and `/admin` routes, and authenticated users away from `/login` and `/register`.
- User session (name, email, role) is stored in `sessionStorage` on login. It's read on every page load; if missing, the user is redirected to `/login`.

### Cookie forwarding (critical)

Every Next.js API route that calls the backend MUST forward the browser's cookie header:

```typescript
const response = await apiFetch(`${backendUrl}/job`, {
  headers: { Cookie: request.headers.get('cookie') || '' },
});
```

The `apiFetch` helper (`admin-panel/lib/api.ts`) injects `credentials: 'include'` and handles 401 responses by clearing session storage and redirecting to `/login`.

For login specifically, the backend's `Set-Cookie` header is extracted and forwarded to the browser. In production, `SameSite=Strict` is rewritten to `SameSite=Lax` because frontend and backend are on different domains (Vercel + Render).

### Data models

- **User** (`backend/models/User.js`): name, email, hashed password (`select: false`), role (`user`|`admin`), verification/password-reset token fields.
- **Job** (`backend/models/Job.js`): belongs to a User, references a Status via ObjectId. Tracks company, role, location, salary, dates, contacts, notes, link. Has a `statusHistory` array of `{ status: ObjectId, date }` entries.
- **Status** (`backend/models/Status.js`): label (unique) + color hex. Jobs reference statuses by ObjectId, not by label string.

### Route map

**Backend Express routes:**
| Mount path | File | Auth |
|---|---|---|
| `/api/auth` | `routes/auth.js` | Public (verify, forgot/reset password) |
| `/api/job` | `routes/job.js` | `protect` (all user-scoped CRUD) |
| `/api/status` | `routes/status.js` | GET public; POST/PUT/PATCH/DELETE require `protect` + `admin` |
| `/api/user` | `routes/user.js` | Register/public; login/public; profile requires `protect`; list/create/update/delete require `protect` + `admin` |

**Frontend Next.js pages:**
| Path | Purpose |
|---|---|
| `/` | Landing page |
| `/login`, `/register`, `/forgot-password`, `/reset-password/[token]`, `/verify-email` | Auth pages |
| `/dashboard` | User dashboard with stats, recharts bar chart, recent applications |
| `/dashboard/jobs` | List/add/edit job applications |
| `/dashboard/profile` | Edit own profile |
| `/admin/dashboard` | Admin overview |
| `/admin/job` | Admin manages all jobs |
| `/admin/status` | Admin CRUD for status labels/colors |
| `/admin/user` | Admin manages users |
| `/admin/profile` | Admin edits own profile |

**Frontend API route files** (`app/api/`) proxy to backend. Each file exports HTTP-method-named functions (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).

### Shared types

`admin-panel/types/index.ts` defines TypeScript interfaces for `Status`, `User`, `Job`, API response wrappers, and form data types. The backend is plain JS (CommonJS, no types).

### Email

`backend/utils/sendEmail.js` uses Nodemailer with SMTP credentials from env vars. Templates for verification and password reset emails are in the same file. The `resend` package is in `package.json` but the current sendEmail implementation uses Nodemailer.

### Styling

Tailwind CSS v4 with CSS modules (`.module.css` files) for component/page-specific styles. The dashboard sidebar and landing page use CSS modules heavily.
