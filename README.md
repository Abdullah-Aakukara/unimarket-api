# 🛒 UniMarket API
**Live Demo:** [https://unimarket-d7nz.onrender.com](https://unimarket-d7nz.onrender.com)  
**Status:** Production-Ready 

UniMarket is a **multi-vendor e-commerce backend** built with the **PEN stack (PostgreSQL, Express, Node.js)**.  
It is designed with a **layered architecture** to support scalability, security, performance optimization, and real-world production deployment.

---

## 🚀 Key Features

### 🔐 Authentication & Security
- Stateless authentication using **JWT** with secure password hashing (`bcrypt`)
- **Rate limiting** to protect against brute-force and spam attacks
- Strict **request validation** before database writes

### 🧱 Clean Architecture
- Layered design using **Routes → Controllers → Services**
- Clear separation of concerns for maintainability and scalability

### ⚡ Performance Optimization
- **Redis caching** implemented using the **Cache-Aside pattern**
- Automatic cache invalidation on write operations (create/update/delete)
- Reduced database load for read-heavy endpoints

### 🗄️ Data Management
- PostgreSQL relational data modeling (Users ↔ Products ↔ Categories)
- Raw SQL queries with joins and foreign keys
- Cascade delete logic for automated data cleanup

### 📂 File & Asset Handling
- Product image uploads using **Multer**
- Static asset serving for public image access

### 📊 Observability
- **Production-grade logging** using **Winston**
- Structured JSON logs with timestamps
- Centralized global error-handling middleware

---

## 🛠️ Tech Stack

- **Runtime:** Node.js  
- **Framework:** Express.js  
- **Database:** PostgreSQL (Supabase in production)  
- **Caching:** Redis  
- **Security:** JWT, bcrypt, express-rate-limit  
- **Logging:** Winston  
- **File Uploads:** Multer  

---

## 🧪 API Documentation

The API is fully documented and testable via Postman:

👉 https://documenter.getpostman.com/view/48552920/2sBXVbGDJs

---

## 🏃‍♂️ Run Locally

1.  **Clone the repo**
    ```bash
    git clone https://github.com/Abdullah-Aakukara/unimarket-api.git
    cd unimarket-api
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables**
    Create a `.env` file in the root and add:
    ```env
    PORT=3000

    # Database
    DB_HOST=localhost
    DB_PORT=5432
    DB_USER=postgres
    DB_PASSWORD=your_password
    DB_NAME=unimarket_db

    # Auth
    JWT_SECRET=your_secret_key

    # Redis
    REDIS_URL=your_redis_url

    # Environment
    NODE_ENV=development
    ```

4.  **Initialize Database**
    Run the queries in `schema.sql` to create tables and seed categories.

5.  **Start the Server**
    ```bash
    npm start
    ```

---

🌍 Deployment
-------------

*   Backend deployed on **Render**
    
*   **Supabase PostgreSQL** used for production database
    
*   **Managed Redis** for caching
    
*   Environment-based configuration for development and production
