<h1 align="center">📚 VUVISA - E-commerce Platform Backend</h1>

<p align="center">
  <img src="https://github.com/user-attachments/assets/df434a1d-eea8-452f-ab19-60d814d17298" width="400" alt="VUVISA Logo" />
</p>




<p align="center">
  <b>Backend for a modern bookstore and office supply platform.</b><br>
  Inspired by <i>Fahasa</i> — with enhanced architecture and features.
</p>

---

## 🚀 Overview

VUVISA is a comprehensive e-commerce platform backend built with Spring Boot, designed to provide a robust API for online bookstores and office supply retailers. This project is a clone of Fahasa, a popular Vietnamese online bookstore, with enhanced features and modern architecture.

---

## 🌟 Features

### 🛍️ Product Management
- Book catalog with detailed metadata (authors, publishers, categories)
- Office supplies catalog
- Product images management
- Product reviews and ratings
- Product search and filtering

### 👤 User Management
- User registration and authentication
- JWT-based authentication with refresh tokens
- Role-based access control
- Social login integration (Google, Facebook)
- User profile management
- Address management

### 🛒 Shopping Experience
- Shopping cart functionality
- Order processing and management
- Favorites/wishlist management
- Discount and voucher system

### 🧠 Advanced Features
- AI-powered product recommendations
- Real-time chat support via WebSockets
- Notification system
- Calendar event management
- Rate limiting for API protection
- Retry mechanism for external API calls
- PDF generation for invoices and reports

### 💳 Payment Integration
- VNPay payment gateway integration

---

## 🧰 Technologies

### 🧩 Core
- Java 17
- Spring Boot 3.x
- Spring Security
- Spring Data JPA
- Spring WebFlux
- Spring Cloud OpenFeign
- Spring WebSocket

### 🗄️ Database
- MySQL
- Hibernate ORM
- JPA Auditing

### 🔐 Authentication & Security
- JWT
- OAuth2 (Google, Facebook)

### ☁️ Cloud Services
- AWS S3
- Cloudinary

### 🤖 AI & External APIs
- OpenAI API
- Cohere API

### 🔔 Messaging & Notifications
- WebSockets
- Email via Gmail SMTP

### 🛠️ Development Tools
- Gradle
- Lombok
- Thymeleaf

---

## 🧱 Architecture

The application follows a layered architecture:

1. **Controller Layer** – REST API endpoints  
2. **Service Layer** – Business logic  
3. **Repository Layer** – Data access  
4. **Entity Layer** – Data model  
5. **DTO Layer** – API request/response models  

Additional components:
- **Security Configuration**
- **Global Exception Handling**
- **Utility Services** (e.g., PDF generation)

---

## 📘 API Documentation

All APIs follow RESTful design:

- `GET /api/v1/books` – Manage books  
- `GET /api/v1/office-supplies` – Office supplies  
- `POST /api/v1/auth` – Authentication  
- `GET /api/v1/users` – User profiles  
- `POST /api/v1/orders` – Order management  
- `POST /api/v1/cart` – Shopping cart  
- `GET /api/v1/recommendations` – AI recommendations

---

## 🛠️ Setup and Installation

### 📋 Prerequisites

- Java 17+
- MySQL
- AWS account
- Cloudinary account
- OpenAI API key
- VNPay merchant account

### 🔐 Configuration

Add your config to `.env` or system environment variables:

<details>
<summary>Click to view configuration</summary>

```properties
# Database
DB_URL=jdbc:mysql://your-db-host:3306/vuvisa
DB_PASSWORD=your-db-password

# JWT
JWT_SIGNER_KEY=your-jwt-secret-key

# AWS
AWS_ACCESS_KEY=your-aws-access-key
AWS_SECRET_KEY=your-aws-secret-key

# Email
GMAIL_PASSWORD=your-gmail-app-password

# OAuth2
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AI APIs
OPENAI_API_URL=https://api.openai.com/v1
OPENAI_API_KEY=your-openai-api-key
COHERE_API_KEY=your-cohere-api-key

# Cloudinary
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Rate Limiter
RATE_LIMIT_API_KEY=your-rate-limit-api-key
