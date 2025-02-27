# Express PostgreSQL CRUD + Authentication API

## 📌 Instalasi

### 1️⃣ Clone Repository

```sh
git clone https://github.com/HanMwehe/BackEndSql.git
cd backend
```

### 2️⃣ Install Dependencies

```sh
npm install
```

### 3️⃣ Setup PostgreSQL

- Pastikan PostgreSQL sudah terinstall dan berjalan.
- Buat database:
  ```sql
  CREATE DATABASE mydatabase;
  ```
- Buat tabel:
  ```sql
  CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password TEXT NOT NULL
  );

  CREATE TABLE posts (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
  );
  ```

### 4️⃣ Jalankan Server

```sh
node index.js
```

## 🚀 API Endpoints

### **1️⃣ Register User**

**Endpoint:** `POST /register` **Body:**

```json
{
  "name": "John Doe",
  "email": "johndoe@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "johndoe@example.com"
}
```

---

### **2️⃣ Login User**

**Endpoint:** `POST /login` **Body:**

```json
{
  "email": "johndoe@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1..."
}
```

---

### **3️⃣ Get Semua User + Post** *(Protected)*

**Endpoint:** `GET /users` **Headers:**

```
Authorization: Bearer <TOKEN>
```

**Response:**

```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "johndoe@example.com",
    "posts": [
      {
        "id": 1,
        "title": "Post Pertama",
        "content": "Ini konten post pertama"
      }
    ]
  }
]
```

---

### **4️⃣ Buat Post Baru** *(Protected)*

**Endpoint:** `POST /posts` **Headers:**

```
Authorization: Bearer <TOKEN>
```

**Body:**

```json
{
  "title": "Post Pertama",
  "content": "Ini konten post pertama"
}
```

**Response:**

```json
{
  "id": 1,
  "title": "Post Pertama",
  "content": "Ini konten post pertama",
  "user_id": 1
}
```

---

### **5️⃣ Get Semua Post**

**Endpoint:** `GET /posts` **Response:**

```json
[
  {
    "id": 1,
    "title": "Post Pertama",
    "content": "Ini konten post pertama",
    "author": "John Doe"
  }
]
```

---

### **6️⃣ Update Post** *(Hanya Pemilik)*

**Endpoint:** `PUT /posts/:id` **Headers:**

```
Authorization: Bearer <TOKEN>
```

**Body:**

```json
{
  "title": "Post Pertama (Edited)",
  "content": "Konten post pertama yang sudah diubah"
}
```

**Response:**

```json
{
  "id": 1,
  "title": "Post Pertama (Edited)",
  "content": "Konten post pertama yang sudah diubah",
  "user_id": 1
}
```

---

### **7️⃣ Delete Post** *(Hanya Pemilik)*

**Endpoint:** `DELETE /posts/:id` **Headers:**

```
Authorization: Bearer <TOKEN>
```

**Response:**

```json
{
  "message": "Post deleted"
}
```

## 🛠 Tools & Dependencies

- **Express.js** - Backend framework
- **PostgreSQL** - Relational Database
- **pg (node-postgres)** - PostgreSQL Client for Node.js
- **bcrypt** - Hashing password
- **jsonwebtoken (JWT)** - Authentication
- **cors & morgan** - Middleware

🔥 **Siap dipakai! Jangan lupa testing di Insomnia/Postman! 🚀**

