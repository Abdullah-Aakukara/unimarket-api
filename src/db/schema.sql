CREATE TABLE app_users (
    id SERIAL PRIMARY KEY, 
    username VARCHAR(50) UNIQUE NOT NULL, 
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
); 

CREATE TABLE categories (
    id SERIAL PRIMARY KEY, 
    name VARCHAR(40) NOT NULL
    );

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    title VARCHAR(80) NOT NULL, 
    description TEXT,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    price INTEGER NOT NULL, 
    condition VARCHAR(20) NOT NULL,
    is_defect BOOLEAN DEFAULT FALSE,
    image_url TEXT NOT NULL,
    user_id INTEGER REFERENCES app_users(id) ON DELETE CASCADE
);