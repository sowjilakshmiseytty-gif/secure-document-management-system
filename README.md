
# 🔐 TrustVault – Secure Document Management System

TrustVault is a secure document management platform that allows users to upload, manage, download, and share PDF documents with controlled access permissions.

The system provides authentication, role-based access control, secure file storage, and audit logging to improve document security.

## 🚀 Features

- User Registration and Login
- JWT Authentication
- Role-Based Access Control
- Secure PDF Document Upload
- Document Management
- Document Sharing
- View and Download Permissions
- Protected Document Downloads
- Audit Trail and Activity Tracking
- Admin User Management
- Login Rate Limiting

## 🛠️ Technologies Used

**Frontend**
- React.js
- Vite
- HTML
- CSS
- JavaScript

**Backend**
- Node.js
- Express.js
- REST API

**Database**
- PostgreSQL

**Security**
- JSON Web Token (JWT)
- Multer File Upload
- Role-Based Authorization
- PDF File Validation

**Tools**
- Visual Studio Code
- Git
- GitHub
- PowerShell

## 📁 Project Structure

```text
secure-document-management-system/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   └── server.js
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── private_uploads/
├── .env
├── .gitignore
├── package.json
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/sowjilakshmiseysetty-gif/secure-document-management-system.git
```

### 2. Navigate to the Project

```bash
cd secure-document-management-system
```

### 3. Install Backend Dependencies

```bash
npm install
```

### 4. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 5. Configure Environment Variables

Create a `.env` file in the project root directory.

Configure the required database connection variables and JWT secret according to the backend configuration.

**Important:** Never upload `.env` or actual secret values to GitHub.

### 6. Configure PostgreSQL

- Install and start PostgreSQL.
- Create a database named `trustvault_db`.
- Configure the database connection in `.env`.
- Apply the required database tables and schema.

### 7. Start the Backend

Open a terminal:

```bash
cd backend
node server.js
```

Backend URL:

`http://localhost:5000`

### 8. Start the Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

Frontend URL:

`http://localhost:5173`

## 👥 User Roles

| Role | Description |
|---|---|
| Admin | Manages users and administrative operations |
| Owner | Uploads and shares documents |
| Recipient | Accesses documents shared with them according to permissions |

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Permission-based document sharing
- PDF file validation
- Private document storage
- Protected downloads
- Login rate limiting
- Audit logging

## 🧪 Testing Status

Successfully tested:
- User registration
- User login
- Dashboard access
- PDF document upload
- PDF document download
- Upload audit logging
- Download audit logging

Document sharing and recipient permission testing are currently in progress.

## 🎯 Project Objective

To develop a secure and user