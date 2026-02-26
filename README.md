<div align="center">

# 🎓 MITS Result Management System

### Smart Queue-Based Result Portal for MITS Students

[![Node.js](https://img.shields.io/badge/Node.js-16+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Redis](https://img.shields.io/badge/Redis-7+-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4+-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**A modern, scalable result portal that handles high traffic with intelligent queue management**

[Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Configuration](#-configuration) • [Deployment](#-deployment)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Architecture](#-architecture)
- [Configuration](#-configuration)
- [Test Credentials](#-test-credentials)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

MITS Result Management System is a **queue-based result portal** designed to handle high traffic during result announcements. It fetches results from the MITS external portal while managing concurrent users efficiently through a Redis-powered queue system.

### Why This System?

- **🚀 Handles High Traffic**: Manages 500+ concurrent users without server overload
- **⏱️ Fair Access**: Queue system ensures everyone gets their turn
- **🔄 Real-time Updates**: Live queue position updates via WebSocket
- **📱 Responsive Design**: Works seamlessly on desktop and mobile
- **🔒 Secure Sessions**: Time-limited access with automatic logout

---

## ✨ Features

### Core Features
- ✅ **Pre-login Queue System** - Manages 500 concurrent users
- ✅ **Real-time Queue Updates** - Live position tracking via Socket.io
- ✅ **Automatic Result Fetching** - Pulls data from MITS external portal
- ✅ **Time-bound Sessions** - 30-minute login window, 2-minute viewing session
- ✅ **PDF Download** - Save results as PDF
- ✅ **Email Results** - Send results directly to email
- ✅ **Auto-logout** - Automatic session cleanup
- ✅ **Multi-program Support** - UG (B.Tech) and PG (MCA, MBA, M.Tech)

### User Experience
- 🎯 Clean, intuitive interface
- 📊 Real-time queue position display
- ⏳ Session timer with visual countdown
- 🔔 Notifications for queue status changes
- 📱 Mobile-responsive design

### Technical Features
- 🔄 Redis-based queue management
- 🌐 WebSocket for real-time communication
- 🛡️ Session-based authentication
- 📈 Scalable architecture
- 🔧 Configurable concurrency limits

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **CSS3** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - WebSocket server
- **Redis** - Queue management & session storage
- **Axios** - External API calls
- **Cheerio** - HTML parsing

### Infrastructure
- **Redis Server** - In-memory data store
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment configuration

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

| Software | Version | Download |
|----------|---------|----------|
| **Node.js** | v16.0.0 or higher | [Download](https://nodejs.org/) |
| **npm** | v7.0.0 or higher | Comes with Node.js |
| **Redis** | v6.0.0 or higher | [Download](https://redis.io/download) |
| **Git** | Latest | [Download](https://git-scm.com/) |

### Verify Installation

```bash
node --version    # Should show v16+
npm --version     # Should show v7+
redis-server --version  # Should show v6+
```

---

## 🚀 Quick Start

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/mits-results.git
cd mits-results
```

### 2️⃣ Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

### 3️⃣ Configure Environment

**Backend** (`backend/.env`):
```env
PORT=5000
REDIS_HOST=localhost
REDIS_PORT=6379
CONCURRENT_SLOTS=500
SESSION_DURATION=120
LOGIN_WINDOW=1800
CORS_ORIGIN=http://localhost:3000
```

**Frontend** (`frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 4️⃣ Start Redis Server

**Windows:**
```bash
redis-server
```

**Linux/Mac:**
```bash
sudo service redis-server start
# or
redis-server
```

### 5️⃣ Start the Application

**Option A: Start Separately**

Terminal 1 (Backend):
```bash
cd backend
npm start
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

**Option B: Use Start Script (Windows)**
```bash
start-all.bat
```

### 6️⃣ Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Landing    │  │    Queue     │  │    Result    │      │
│  │     Page     │→ │   Waiting    │→ │     View     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │ Socket.io + REST API
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js/Express)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Queue     │  │     Auth     │  │    Result    │      │
│  │   Manager    │  │  Controller  │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                      Redis (Queue & Cache)                   │
│  • User Queue  • Session Data  • Rate Limiting              │
└─────────────────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                   MITS External Portal                       │
│              (Result Data Source)                            │
└─────────────────────────────────────────────────────────────┘
```

### Flow Diagram

```
User Access → Join Queue → Wait in Queue → Login Window Opens
                                                    ↓
                                          Enter Credentials
                                                    ↓
                                          Fetch from MITS Portal
                                                    ↓
                                          Display Result (2 min)
                                                    ↓
                                    Download PDF / Email / Auto-logout
```

---

## ⚙️ Configuration

### Backend Configuration (`backend/.env`)

| Variable | Description | Default | Range |
|----------|-------------|---------|-------|
| `PORT` | Backend server port | `5000` | 1024-65535 |
| `REDIS_HOST` | Redis server host | `localhost` | - |
| `REDIS_PORT` | Redis server port | `6379` | 1024-65535 |
| `CONCURRENT_SLOTS` | Max concurrent users | `500` | 1-10000 |
| `SESSION_DURATION` | Result viewing time (seconds) | `120` | 60-600 |
| `LOGIN_WINDOW` | Login time limit (seconds) | `1800` | 300-3600 |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:3000` | - |

### Frontend Configuration (`frontend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:5000` |
| `REACT_APP_SOCKET_URL` | Socket.io server URL | `http://localhost:5000` |

---

## 🧪 Test Credentials

Use these credentials to test the system:

### 🎓 UG (B.Tech)
```
Department: Computer Science & Engineering – Networks (CSE-Networks)
Roll No:    23691a4054
DOB:        04-05-2005
```

### 🎓 PG (MCA)
```
Department: Master of Computer Applications (MCA)
Roll No:    24691F00E6
DOB:        12-05-2003
```

### 🎓 PG (MBA)
```
Department: Master of Business Administration (MBA)
Roll No:    [Contact Admin]
DOB:        [Contact Admin]
```

---

## 🌐 Deployment

### Deploy on Render (Backend)

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
4. Add environment variables from `backend/.env`
5. Add Redis addon or use external Redis service

### Deploy on Netlify (Frontend)

1. Create a new site on [Netlify](https://netlify.com)
2. Connect your GitHub repository
3. Configure:
   - **Build Command:** `cd frontend && npm run build`
   - **Publish Directory:** `frontend/build`
4. Add environment variables from `frontend/.env`

### Using Docker (Coming Soon)

```bash
docker-compose up -d
```

---

## 📚 API Documentation

### REST Endpoints

#### Queue Management
```http
POST /api/queue/join
GET  /api/queue/status/:userId
POST /api/queue/leave
```

#### Authentication
```http
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/verify
```

#### Results
```http
GET  /api/result/fetch
GET  /api/result/download
POST /api/result/email
```

### WebSocket Events

#### Client → Server
- `join-queue` - Join the waiting queue
- `leave-queue` - Leave the queue
- `check-status` - Check queue position

#### Server → Client
- `queue-update` - Queue position update
- `login-ready` - Login window opened
- `session-expired` - Session timeout

---

## 🐛 Troubleshooting

### Redis Connection Error
```bash
Error: Redis connection failed
```
**Solution:** Ensure Redis server is running
```bash
redis-server
```

### Port Already in Use
```bash
Error: Port 5000 is already in use
```
**Solution:** Change port in `backend/.env` or kill the process
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### CORS Error
```bash
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:** Update `CORS_ORIGIN` in `backend/.env` to match frontend URL

### Queue Not Moving
**Solution:** Check Redis connection and restart backend server

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Developed with ❤️ for MITS Students**

---

## 🙏 Acknowledgments

- MITS External Portal for result data
- Redis for queue management
- Socket.io for real-time communication
- React community for amazing tools

---

<div align="center">

### ⭐ Star this repo if you find it helpful!

**Made with ❤️ by MITS Students, for MITS Students**

</div>
