import express from "express";
import pg from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const { Pool } = pg;
const app = express();
app.use(express.json());

// 🔗 Koneksi PostgreSQL
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "mydb",
  password: "mypassword",
  port: 5432,
});

// 📌 Middleware JWT
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ message: "No token provided" });

  jwt.verify(token.split(" ")[1], "SECRET", (err, decoded) => {
    if (err) return res.status(401).json({ message: "Unauthorized" });
    req.userId = decoded.id;
    next();
  });
};

// 🔧 Buat tabel users & posts kalau belum ada
const createTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT
    );

    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      title TEXT,
      content TEXT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  console.log("Tables 'users' & 'posts' ready!");
};
createTables();

// 📝 Register User
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashedPassword]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error registering user", error: err.message });
  }
});

// 🔐 Login User + JWT
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, "SECRET", { expiresIn: "1h" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
});

// 📂 Get All Users + Posts (Protected)
app.get("/users", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT users.id, users.name, users.email, 
        json_agg(json_build_object('id', posts.id, 'title', posts.title, 'content', posts.content)) AS posts
      FROM users
      LEFT JOIN posts ON users.id = posts.user_id
      GROUP BY users.id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
});

// 📝 Create Post (Protected)
app.post("/posts", verifyToken, async (req, res) => {
  const { title, content } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO posts (title, content, user_id) VALUES ($1, $2, $3) RETURNING *",
      [title, content, req.userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error creating post", error: err.message });
  }
});

// 📂 Get All Posts (Public)
app.get("/posts", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT posts.id, posts.title, posts.content, users.name AS author 
      FROM posts
      JOIN users ON posts.user_id = users.id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching posts", error: err.message });
  }
});

// ✏️ Update Post (Protected)
app.put("/posts/:id", verifyToken, async (req, res) => {
  const { title, content } = req.body;

  try {
    const result = await pool.query(
      "UPDATE posts SET title = $1, content = $2 WHERE id = $3 AND user_id = $4 RETURNING *",
      [title, content, req.params.id, req.userId]
    );

    if (result.rowCount === 0) return res.status(403).json({ message: "Unauthorized or Post not found" });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error updating post", error: err.message });
  }
});

// 🗑️ Delete Post (Protected)
app.delete("/posts/:id", verifyToken, async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM posts WHERE id = $1 AND user_id = $2", [
      req.params.id,
      req.userId,
    ]);

    if (result.rowCount === 0) return res.status(403).json({ message: "Unauthorized or Post not found" });

    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting post", error: err.message });
  }
});

// 🚀 Start Server
app.listen(3000, () => console.log("Server running on port 3000"));
