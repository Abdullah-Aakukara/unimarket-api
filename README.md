# 🛒 UniMarket API

A robust, multi-vendor e-commerce RESTful API built with the **PEN Stack** (PostgreSQL, Express, Node.js). 
Designed to handle complex data relationships, secure authentication, and file management for a campus marketplace.

## 🚀 Key Features

* **🔐 Stateless Authentication:** Secure user access using **JWT** (JSON Web Tokens) and `bcrypt` password hashing.
* **📦 Relational Data Modeling:** Raw SQL implementation of complex relationships (Users ↔ Products ↔ Categories) using `JOIN`s and Foreign Keys.
* **🛡️ Defense-in-Depth:**
    * **Rate Limiting:** Protection against Brute-Force and DDoS attacks using `express-rate-limit`.
    * **Input Validation:** Strict data integrity checks before database insertion.
* **📂 Asset Management:** Image upload functionality using `multer` with static asset serving.
* **⚡ Cascade Logic:** Automated data cleanup (e.g., deleting a User also removes their Products).

## 🛠️ Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** PostgreSQL 
* **Security:** `bcrypt`, `jsonwebtoken`, `express-rate-limit`, `cors`
* **File Handling:** `multer`

## 🔌 API Endpoints

### Auth
* `POST /api/auth/register` - Create a new account
* `POST /api/auth/login` - Login and receive JWT

### Products
* `GET /api/products` - Retrieve all products (supports filtering `?category_id=1`)
* `POST /api/products` - List a new product (Requires Auth + Image File)

## 🏃‍♂️ Run Locally

1.  **Clone the repo**
    ```bash
    git clone [https://github.com/Abdullah-Aakukara/unimarket-api.git](https://github.com/Abdullah-Aakukara/unimarket-api.git)
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
    DB_USER=your_postgres_user
    DB_PASSWORD=your_postgres_password
    DB_HOST=localhost
    DB_PORT=5432
    DB_NAME=unimarket_db
    JWT_SECRET=your_super_secret_key
    ```

4.  **Initialize Database**
    Run the queries in `schema.sql` to create tables and seed categories.

5.  **Start the Server**
    ```bash
    npm start
    ```