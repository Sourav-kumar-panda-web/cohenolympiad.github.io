const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;
const saltRounds = 10;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: true,
}));

// Database setup
const db = new sqlite3.Database("./database.db");

// Create tables if they don't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    dob TEXT,
    parent_name TEXT,
    parent_job TEXT,
    school_name TEXT,
    school_address TEXT,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_email TEXT,
    utr TEXT,
    status TEXT DEFAULT 'pending'
  )`);
});

// ========== STUDENT ROUTES ==========

// Registration route - hash password inside this function
app.post('/register', (req, res) => {
  const { name, email, phone, dob, parent_name, parent_job, school_name, school_address, password } = req.body;

  // Check if email already exists to prevent duplicates
  db.get("SELECT email FROM students WHERE email = ?", [email], (err, row) => {
    if (err) return res.status(500).send("Database error");

    if (row) {
      return res.status(400).send("Email already registered");
    }

    // Hash the password and save user
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) return res.status(500).send("Error hashing password");

      const stmt = db.prepare(`INSERT INTO students 
        (name, email, phone, dob, parent_name, parent_job, school_name, school_address, password) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      
      stmt.run(name, email, phone, dob, parent_name, parent_job, school_name, school_address, hash, function (err) {
        if (err) {
          console.error(err.message);
          return res.status(500).send("Error registering student");
        }
        res.redirect('/login.html');
      });

      stmt.finalize();
    });
  });
});

// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM students WHERE email = ?', [email], (err, row) => {
    if (err) return res.status(500).send('Internal error');
    if (!row) return res.send('Invalid login');

    bcrypt.compare(password, row.password, (err, result) => {
      if (err) return res.status(500).send('Internal error');

      if (result) {
        req.session.student = { id: row.id, email: row.email, name: row.name };
        res.redirect('/studentprofile.html');
      } else {
        res.send('Invalid login');
      }
    });
  });
});

// Submit UTR route
app.post("/submit-utr", (req, res) => {
  const student_email = req.session.student?.email;
  const utr = req.body.utr;

  if (!student_email) return res.send("Not logged in");

  db.run(`INSERT INTO payments (student_email, utr) VALUES (?, ?)`, [student_email, utr], (err) => {
    if (err) {
      res.send("Error submitting payment.");
    } else {
      res.send("Payment submitted successfully. Wait for admin approval.");
    }
  });
});

// ========== ADMIN ROUTES ==========

// Admin login (static credentials)
app.post("/admin-login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "admin123") {
    req.session.admin = true;
    res.redirect("/adminLogin.html");
  } else {
    res.send("Invalid admin credentials");
  }
});

// Middleware to protect admin routes
function isAdmin(req, res, next) {
  if (req.session.admin) return next();
  res.status(403).send("Unauthorized - Admins only");
}

// Admin users list page
app.get('/admin/users', isAdmin, (req, res) => {
  db.all("SELECT id, name, email, phone, dob, parent_name, school_name FROM students", [], (err, rows) => {
    if (err) return res.status(500).send("Database error");

    let html = `
      <h1>Registered Students</h1>
      <table border="1" cellpadding="5" cellspacing="0">
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>DOB</th><th>Parent Name</th><th>School Name</th>
          </tr>
        </thead>
        <tbody>
    `;

    rows.forEach(student => {
      html += `
        <tr>
          <td>${student.id}</td>
          <td>${student.name}</td>
          <td>${student.email}</td>
          <td>${student.phone}</td>
          <td>${student.dob}</td>
          <td>${student.parent_name}</td>
          <td>${student.school_name}</td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    res.send(html);
  });
});

// View all payments (admin only)
app.get("/payments", isAdmin, (req, res) => {
  db.all(`SELECT * FROM payments`, [], (err, rows) => {
    if (err) return res.status(500).send("Database error");
    res.json(rows);
  });
});

// Approve/reject payment (admin only)
app.post("/update-payment", isAdmin, (req, res) => {
  const { id, status } = req.body;
  db.run(`UPDATE payments SET status = ? WHERE id = ?`, [status, id], (err) => {
    if (err) return res.status(500).send("Error updating status");
    res.send("Payment status updated");
  });
});

// Start the server (only once at the end)
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// ======= Add your update student info route here =======
app.put('/admin/users/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  const { name, email, phone, dob, parent_name, parent_job, school_name, school_address } = req.body;

  const sql = `
    UPDATE students SET 
      name = ?, email = ?, phone = ?, dob = ?, parent_name = ?, parent_job = ?, school_name = ?, school_address = ?
    WHERE id = ?
  `;

  db.run(sql, [name, email, phone, dob, parent_name, parent_job, school_name, school_address, id], function(err) {
    if (err) return res.status(500).json({ error: "Database error updating student" });
    if (this.changes === 0) return res.status(404).json({ error: "Student not found" });
    res.json({ success: true, message: "Student updated successfully" });
  });
});

// ======= Add your delete student route here =======
app.delete('/admin/users/:id', isAdmin, (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM students WHERE id = ?", [id], function(err) {
    if (err) return res.status(500).json({ error: "Database error deleting student" });
    if (this.changes === 0) return res.status(404).json({ error: "Student not found" });
    res.json({ success: true, message: "Student deleted successfully" });
  });
});

// Other routes...

// Start the server (only once at the end)
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


