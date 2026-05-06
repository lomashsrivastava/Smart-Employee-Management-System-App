# LEMS: Smart Employee Management System

![LEMS Logo](images/logo.png)

## 🚀 Overview
**LEMS (Lomash Employee Management System)** is a high-fidelity, enterprise-grade workforce management platform. It combines modern web technologies with AI-driven analytics to streamline HR operations, automate payroll, manage real-time attendance, and provide predictive insights into employee attrition.

Designed with a **Neural UI** aesthetic, the platform offers a futuristic, glassmorphic interface that is as functional as it is beautiful.

---

## 📸 Screenshots

### 🖥️ Admin Control Terminal
The central hub for managing global operations, tracking staff counts, and viewing live attendance.
![Admin Dashboard](images/dashboard.png)

### 📊 Clean State (Ready for Data)
The system initializes in a clean state, ready for your custom data entry via the Admin Panel.
![Clean Dashboard](images/clean_dashboard.png)

---

## ✨ Key Features
- **Neural UI/UX**: Premium design with glassmorphism, fluid animations, and dark-mode optimization.
- **AI Insights**:
    - **Attrition Prediction**: Identifies high-risk employees based on workload and satisfaction.
    - **Resume Intelligence**: Auto-parses candidate skills and experience.
    - **HR Chatbot**: NLP-powered assistant for automated query resolution.
- **Real-time Operations**: WebSocket-driven live attendance tracking (Check-in/Check-out).
- **Automated Payroll**: One-click salary generation with PDF payslip exports, processed via background queues (BullMQ/Redis).
- **Security**: JWT Authentication, RBAC (Admin/Staff), Rate Limiting, and Data Sanitization.

---

## 🛠️ Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion, Zustand, Recharts.
- **Backend**: Node.js (ESM), Express.js, MongoDB (Mongoose), Socket.io.
- **AI Service**: Python FastAPI, NumPy, Pydantic.
- **Infrasctructure**: Docker, Docker Compose, Nginx (Reverse Proxy), Redis.

---

## 🚀 Quick Start (Local Docker)

### 1. Prerequisites
- Docker & Docker Compose installed.
- MongoDB Atlas account (or use the local container included).

### 2. Configuration
Create a `.env` file from the template:
```bash
cp .env.example .env
```

### 3. Launch
```bash
docker-compose up -d --build
```

### 4. Initialize Database
Create the primary admin account:
```bash
docker-compose exec backend node seed.js --force
```

### 🔑 Credentials
- **Admin Email**: `admin@lems.com`
- **Admin Password**: `admin12@lems.com`

---

## ☁️ Deployment (Render)

This project is **Render-ready** using the `render.yaml` (Blueprint) specification.

1. **Fork/Push** this repository to your GitHub.
2. Log in to [Render.com](https://render.com/).
3. Click **"New"** -> **"Blueprint"**.
4. Connect your GitHub repository.
5. Render will automatically detect the `render.yaml` and provision 5 services: `ems-nginx`, `ems-frontend`, `ems-backend`, `ems-ai-service`, and `ems-redis`.
6. **Environment Variables**: In the Render Dashboard, go to the `ems-backend` service settings and manually add your `MONGO_URI` (from MongoDB Atlas) and `JWT_SECRET`.


---

## 👨‍💻 Author
**Lomash Srivastava**

## 📄 License
MIT License
