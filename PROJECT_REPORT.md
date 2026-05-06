# Project Report: AI-Powered Workforce Intelligence Platform (EMS)

## 1. Executive Summary
The **Employee Management System (EMS)** is a high-fidelity, enterprise-grade workforce management platform. It combines modern web technologies with AI-driven analytics to streamline HR operations, automate payroll, manage real-time attendance, and provide predictive insights into employee attrition.

---

## 2. Technical Stack

### **Frontend (Neural UI)**
*   **Framework**: [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (using the latest JIT engine)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/) for premium, fluid transitions
*   **State Management**: [Zustand](https://github.com/pmndrs/zustand) for lightweight, global state
*   **Data Visualization**: [Recharts](https://recharts.org/) for interactive dashboards
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Reporting**: [jsPDF](https://github.com/parallax/jsPDF) & [autoTable](https://github.com/simonbengtsson/jsPDF-autotable) for payslip/report generation

### **Backend (Core API)**
*   **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
*   **Framework**: [Express.js](https://expressjs.com/)
*   **Database**: [MongoDB](https://www.mongodb.com/) (ODM: Mongoose)
*   **Real-time Communication**: [Socket.io](https://socket.io/) for live attendance and notifications
*   **Background Tasks**: [BullMQ](https://docs.bullmq.io/) with [Redis](https://redis.io/) for asynchronous payroll processing
*   **Security**: 
    *   [JWT](https://jwt.io/) (JSON Web Tokens) for authentication
    *   [BcryptJS](https://github.com/dcodeIO/bcrypt.js) for password hashing
    *   [Helmet](https://helmetjs.github.io/) for HTTP header security
    *   [Express Rate Limit](https://github.com/n67/express-rate-limit) for DDoS protection

### **AI Microservice**
*   **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
*   **Processing**: [NumPy](https://numpy.org/) & [Pydantic](https://docs.pydantic.dev/)
*   **Capabilities**:
    *   **Attrition Risk Prediction**: Rule-based logic (extendable to Scikit-Learn models)
    *   **Resume Parser**: Automated skill extraction from text
    *   **HR Chatbot**: NLP-based automated responses for leave and payroll queries

### **Infrastructure & DevOps**
*   **Containerization**: [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
*   **Logging**: [Winston](https://github.com/winstonjs/winston) & [Morgan](https://github.com/expressjs/morgan)
*   **Validation**: [Joi](https://joi.dev/) for schema validation

---

## 3. Project Architecture

The system follows a **Microservices-ready Monolith** architecture for the backend, while separating the AI logic into a standalone service to handle compute-intensive tasks independently.

### **Directory Structure**
```text
EMS/
├── frontend/          # React + Vite application (Neural UI)
├── backend/           # Node.js Express API
│   ├── modules/       # Domain-driven modules (Auth, Employee, etc.)
│   ├── config/        # DB and Redis configurations
│   ├── middleware/    # Security and Error handling
│   └── scripts/       # Seeding and utility scripts
├── ai-service/        # Python FastAPI service
├── assets/            # Global CSS tokens and Design System
└── docker-compose.yml # Orchestration for all services
```

---

## 4. Key Functional Modules

### **4.1. Authentication & RBAC**
*   Secure login with JWT persistence.
*   **Admin Role**: Full system access, employee management, and system-wide settings.
*   **Employee Role**: Access to personal dashboard, attendance logs, and payroll history.

### **4.2. Employee Lifecycle Management**
*   Multi-step hiring form with validation.
*   Mandatory documentation (Aadhaar, PAN) integrated into the profile.
*   Status tracking: ACTIVE, ON_LEAVE, TERMINATED.

### **4.3. Real-time Attendance**
*   WebSocket-powered check-in/check-out system.
*   Live presence tracking on the Admin Dashboard.
*   Automatic calculation of working hours.

### **4.4. Automated Payroll**
*   One-click salary generation for the entire workforce.
*   Background processing via BullMQ to prevent server timeouts.
*   PDF Payslip generation with breakdown of Basic, Allowances, and Deductions.

### **4.5. AI Insights (The "Neural" Layer)**
*   **Attrition Dashboard**: Visualizes high-risk employees based on satisfaction and workload.
*   **HR Bot**: Instant answers to common employee questions.
*   **Resume Intelligence**: Speeds up the hiring process by auto-parsing candidate data.

---

### **Default Admin Credentials**
- **Username**: `admin@lems.com`
- **Password**: `admin12@lems.com`

### **Staff Credentials**
- **Identity Key (User ID)**: Aadhaar Card Number (e.g., `1234 5678 9012`). Spaces are handled automatically.
- **Access Pass (Password)**: PAN Card Number (e.g., `ABCDE1234F`). Case-insensitive.
- **Support**: Employees can also log in using their registered Email or Employee ID.

---

## 6. Security Measures
1.  **Environment Isolation**: Sensitive keys managed via `.env` files.
2.  **Rate Limiting**: Prevents brute-force attacks on Auth endpoints.
3.  **Data Sanitization**: Protects against NoSQL injection via `express-mongo-sanitize`.
4.  **CORS Policy**: Restricts API access to authorized frontend origins.

---

## 7. Setup and Deployment

### **Prerequisites**
*   Node.js v18+
*   Python 3.9+
*   MongoDB Atlas or Local Instance
*   Redis Server

### **Database Initialization**
The system is configured to start with a clean state. To initialize your database with the primary Admin account (and clear any existing mock data):
```bash
cd backend
node seed.js --force
```
All employee data added after this will be persisted in your MongoDB Atlas/Local instance.

### **Docker Deployment**
```bash
docker-compose up --build -d
```

---

## 7. Conclusion
The EMS Project is a robust, scalable solution for modern enterprise needs. Its focus on **Visual Excellence** (Neural UI) and **Functional Intelligence** (AI Service) sets it apart from traditional HR software, providing a futuristic approach to workforce management.
