# Payment Integration

A payment integration project with a React frontend and Node.js backend.

## Project Structure

- `frontend/` - React and Vite client application
- `backend/` - Express API for payment processing

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB, if required by the backend configuration

## Frontend Setup

```powershell
cd frontend
npm install
npm run dev
```

Frontend checks:

```powershell
npm run lint
npm run build
```

## Backend Setup

Create `backend/.env` with the required backend configuration, then run:

```powershell
cd backend
npm install
npm start
```

For development with automatic restarts:

```powershell
npm run dev
```

## Environment Variables

Environment files are intentionally excluded from Git. Keep credentials and payment keys in local `.env` files and never commit them.

## Repository

The frontend and backend are maintained together in the `main` branch.
