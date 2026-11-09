# TrustVault – Secure Document Management System

TrustVault is a secure document management web application that allows users to upload, manage, download, and share PDF documents with controlled access permissions.

It uses JWT authentication, role-based authorization, protected document access, and audit logging to improve document security.

## Features

- User registration and login
- JWT-based authentication
- Role-based access control
- Secure PDF document uploads
- Document management
- Document sharing between users
- View and download permissions
- Protected document downloads
- Audit trail and activity tracking
- Admin-only user management API
- Login rate limiting
- PDF file validation

## Technologies Used

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
- bcrypt password hashing
- Multer file uploads
- Role-based authorization
- PDF validation
- Helmet security middleware

**Development Tools**
- Visual Studio Code
- Git
- GitHub
- PowerShell

## Project Structure

```text
secure-document-management-system/
|
|-- backend/
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- routes/
|   |-- services/
|   |-- server.js
|
|-- frontend/
|   |-- src/
|   |-- public/
|   |-- package.json
|
|-- private_uploads/
|-- .env
|-- .gitignore
|-- package.json
|-- README.md
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/sowjilakshmiseytty-gif/secure-document-management-system.git
```

### 2. Open the Project

```bash
cd secure-document-management-system
```

### 3. Install Backend Dependencies

Run this command in the project root:

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

Add your own PostgreSQL and JWT configuration:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_database_username
DB_PASSWORD=your_database_password
DB_NAME=trustvault_db
JWT_SECRET=your_long_random_secret
```

Never upload actual passwords, JWT secrets, or `.env` files to GitHub.

### 6. Configure PostgreSQL

- Install and start PostgreSQL.
- Create a database named `trustvault_db`.
- Configure the database connection in `.env`.
- Create the required database tables according to the application schema.

### 7. Start the Backend

Open a PowerShell terminal in the project root:

```powershell
cd backend
node server.js
```

Backend URL:

`http://localhost:5000`

### 8. Start the Frontend

Open another PowerShell terminal in the project root:

```powershell
cd frontend
npm run dev
```

Open the local URL displayed by Vite in your browser. The default port is `5173`; Vite may select another available port if it is occupied.

## User Roles

| Role | Permissions |
|---|---|
| Admin | Access administrative user management API |
| Owner | Upload, manage, and share documents |
| Recipient | Access documents shared according to permissions |

## Security Features

- JWT authentication
- Password hashing using bcrypt
- Authentication middleware
- Admin role verification
- Permission-based document sharing
- Protected document downloads
- PDF file validation
- Private document storage
- Login rate limiting
- Audit logging

## Testing Status

The following functionality has been tested:

- User login
- Dashboard access
- PDF document upload
- PDF document sharing
- Recipient document access
- Document download
- Audit trail entries
- Unauthenticated admin API request – HTTP 401
- Normal user admin API request – HTTP 403

## Project Objective

The objective of TrustVault is to develop a secure and user-friendly document management platform that protects important PDF documents through authentication, access permissions, secure storage, and activity monitoring.

## GitHub Repository

https://github.com/sowjilakshmiseytty-gif/secure-document-management-system

