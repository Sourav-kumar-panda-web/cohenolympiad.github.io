const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;
const path = require('path');

// Temporary admin credentials (use env vars in production)
const ADMIN_USERNAME = 'admin';

// Enable CORS if frontend is separate
app.use(cors({
  origin: 'http://localhost:5500', // change as needed
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

// Serve static frontend files from 'public'
app.use(express.static('public'));

// Serve static files from the root directory
app.use(express.static(__dirname));

// Database setup
const db = new sqlite3.Database('school.db');

// Create tables if not exist
db.serialize(() => {
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      password TEXT,
      address TEXT,
      phone TEXT,
      school TEXT,
      class TEXT,
      division TEXT,
      percentage REAL,
      subjects TEXT,
      hobbies TEXT,
      parent_phone TEXT,
      utr TEXT        -- ✅ Add this line
    )
  `);
});

db.run(`
  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    amount REAL,
    date TEXT,
    utr TEXT
  )
`);
// db.run(`ALTER TABLE payments ADD COLUMN utr TEXT`);

  db.run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT
  )`);

});


// ================== MIDDLEWARE ==================
function isAdmin(req, res, next) {
  if (req.session && req.session.admin) {
    return next();
  }
  return res.status(401).send('Unauthorized');
}

// ================== STUDENT ROUTES ==================

// Save initial student data
app.post('/save-details', (req, res) => {
  const { address, phone } = req.body;
  db.run(`INSERT INTO students (address, phone) VALUES (?, ?)`, [address, phone], function (err) {
    if (err) return res.status(500).send('Database error');
    res.status(200).json({ studentId: this.lastID });
  });
});

// Update student after OTP
app.post('/update-student', (req, res) => {
  const {
    id, name, email, school, class: studentClass, division, percentage,
    subjects, hobbies, parent_phone
  } = req.body;

  db.run(`UPDATE students SET 
    name=?, email=?, school=?, class=?, division=?, 
    percentage=?, subjects=?, hobbies=?, parent_phone=? 
    WHERE id=?`,
    [name, email, school, studentClass, division, percentage, subjects, hobbies, parent_phone, id],
    function (err) {
      if (err) return res.status(500).send('Update failed');
      res.status(200).send('Student updated');
    });
});

// ================== ADMIN ROUTES ==================

// Admin login
app.post('/admin-login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM admins WHERE username = ?', [username], async (err, admin) => {
    if (err) return res.status(500).send('Database error');
    if (!admin) return res.status(401).json({ error: 'Admin not found' });

    const match = await bcrypt.compare(password, admin.password);
    if (match) {
      req.session.admin = true;
      res.sendStatus(200);
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  });
});
// Admin dashboard 
app.get('/admin-dashboard', (req, res) => {
  db.all(`
    SELECT students.*, payments.utr
    FROM students
    LEFT JOIN payments ON students.id = payments.student_id
  `, [], (err, rows) => {
    if (err) {
      console.error("DB error:", err.message);
      return res.status(500).send("Failed to retrieve student data");
    }
    res.json(rows);
  });
});



// Admin logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/adminLogin.html'));
});

// Get all students (protected)
app.get('/admin/users', isAdmin, (req, res) => {
  db.all('SELECT * FROM students', (err, rows) => {
    if (err) return res.status(500).send('Database error');
    res.json(rows);
  });
});

// Delete student (protected)
app.delete('/admin/users/:id', isAdmin, (req, res) => {
  db.run('DELETE FROM students WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).send('Delete failed');
    res.json({ success: true });
  });
});

// Get payments (protected)
app.get('/admin/payments', isAdmin, (req, res) => {
  db.all('SELECT * FROM payments', (err, rows) => {
    if (err) return res.status(500).send('Payment query failed');
    res.json(rows);
  });
});



// ================== START SERVER ==================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/register', async (req, res) => {
  const {
    address, phone, name, email, password,
    school, class: studentClass, division, percentage,
    subjects, hobbies, parent_phone
  } = req.body;

  // Debugging log
  console.log('Received registration data:', req.body);

  // Check required fields
  if (!password || !email || !name) {
    return res.status(400).send('Missing required fields');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(`
      INSERT INTO students (address, phone, name, email, password, school, class, division, percentage, subjects, hobbies, parent_phone)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

    `, [
      address, phone, name, email, hashedPassword,
      school, studentClass, division, percentage, subjects, hobbies, parent_phone
    ], function (err) {
      if (err) {
        console.error('Database insert error:', err);
        return res.status(500).send('Registration failed');
      }

      console.log(`✅ Student registered with ID: ${this.lastID}`);
      res.redirect('/login.html'); // Redirect to login page
    });

  } catch (error) {
    console.error('Hashing error:', error);
    res.status(500).send('Server error');
  }
});



app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM students WHERE email = ?', [email], async (err, student) => {
    if (err) return res.status(500).send('Database error');
    if (!student) return res.status(401).send('Student not found');

    const match = await bcrypt.compare(password, student.password);
    if (!match) return res.status(401).send('Invalid password');

    req.session.studentId = student.id;
    res.redirect('/studentprofile.html'); // or wherever you want to show student data
  });
});
app.get('/students', (req, res) => {
  db.all('SELECT * FROM students', (err, rows) => {
    if (err) {
      console.error('DB error:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve students' });
    }
    res.json(rows);
  });
});
app.post('/admin/update-utr', (req, res) => {
  const { id, utr } = req.body;
  db.run('UPDATE students SET utr = ? WHERE id = ?', [utr, id], function (err) {
    if (err) return res.status(500).send('Failed to update UTR');
    res.sendStatus(200);
  });
});
