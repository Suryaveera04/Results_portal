# MITS Result Management System

Queue-based result portal that fetches results from MITS external portal.

## Quick Start

### Prerequisites
- Node.js (v16+)
- Redis (running on port 6379)

### Setup

1. **Install Backend**
```bash
cd backend
npm install
```

2. **Install Frontend**
```bash
cd frontend
npm install
```

3. **Start Redis**
```bash
redis-server
```

4. **Start Backend**
```bash
cd backend
npm start
```

5. **Start Frontend**
```bash
cd frontend
npm start
```

6. **Open Browser**
```
http://localhost:3000
```

## Test Credentials

- **Department:** Computer Science & Engineering – Networks (CSE-Networks)
- **Roll No:** 23691a4054
- **DOB:** 04-05-2005

## Features

- ✅ Pre-login queue system (500 concurrent users)
- ✅ Real-time queue updates via Socket.io
- ✅ Fetches results from MITS external portal
- ✅ 60-second login window
- ✅ 2-minute result viewing session
- ✅ PDF download
- ✅ Email result
- ✅ Auto-logout

## Configuration

Edit `backend/.env`:
- `CONCURRENT_SLOTS` - Number of concurrent users (default: 500)
- `SESSION_DURATION` - Result viewing time in seconds (default: 120)
- `LOGIN_WINDOW` - Login time limit in seconds (default: 60)

## Tech Stack

- **Frontend:** React + Socket.io
- **Backend:** Node.js + Express + Socket.io
- **Queue:** Redis
- **Result Source:** MITS External Portal

## License

MIT
