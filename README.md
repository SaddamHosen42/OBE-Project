# OBE Desktop Software

Outcome-Based Education (OBE) Management System - A desktop application for managing educational outcomes and assessments.

## Technology Stack

- **Backend:** Node.js with Express.js (MVC Pattern)
- **Database:** MySQL with mysql2
- **Frontend:** Electron.js, React.js, Tailwind CSS
- **State Management:** Zustand
- **Data Fetching:** React Query
- **Forms:** React Hook Form
- **Charts:** Chart.js

## Project Structure

```
obe-system/
├── backend/                 # Node.js Express API (MVC)
│   ├── config/             # Configuration files
│   ├── controllers/        # Request handlers
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middlewares/        # Custom middleware
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   └── app.js              # Main application file
├── frontend/                # Electron + React
│   ├── electron/           # Electron main process
│   ├── public/             # Static assets
│   ├── src/                # React source code
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # State management
│   │   └── styles/         # CSS files
│   └── package.json
└── database/
    └── migrations/         # Database migrations

```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher recommended)
- MySQL Server
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies (already done in Phase 1):
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=obe_system
   JWT_SECRET=your_jwt_secret_key
   ```

4. Run the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies (already done in Phase 1):
   ```bash
   npm install
   ```

3. Run in development mode:
   ```bash
   # Terminal 1 - Start Vite dev server
   npm run dev
   
   # Terminal 2 - Start Electron
   npm run electron:dev
   ```

4. Build for production:
   ```bash
   npm run electron:build
   ```

### Database Setup

1. Create MySQL database:
   ```sql
   CREATE DATABASE obe_system;
   ```

2. Run migrations (to be implemented in Phase 2)

## Development Status

### ✅ Phase 1: Project Setup & Infrastructure (COMPLETED)
- [x] Step 1.1: Initialize Project Root
- [x] Step 1.2: Backend Folder Structure
- [x] Step 1.3: Install Backend Dependencies
- [x] Step 1.4: Frontend Folder Structure
- [x] Step 1.5: Install Frontend Dependencies

### 🔄 Phase 2: Database Implementation (Coming Next)
- [ ] Core User Tables
- [ ] Personal Information Tables
- [ ] Academic Structure Tables
- [ ] Course Tables
- [ ] OBE Framework Tables
- [ ] Assessment Tables
- [ ] Results & Grades Tables
- [ ] OBE Attainment Tables

## Scripts

### Backend Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

### Frontend Scripts
- `npm run dev` - Start Vite development server
- `npm run electron:dev` - Start Electron in development mode
- `npm run build` - Build React app for production
- `npm run electron:build` - Build Electron app for distribution

## License

ISC
