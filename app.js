// app.js (use this instead of your old version)
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const dbPath = path.join(__dirname, 'school.db');
const db = new sqlite3.Database(dbPath);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname)); // serve static files like HTML, CSS

// Create student table if it doesn't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    dob TEXT,
    parent_name TEXT,
    parent_job TEXT,
    school_name TEXT,
    school_address TEXT
  )`);
});

// Route to register student
app.post('/register', (req, res) => {
  const { name, phone, dob, parent_name, parent_job, school_name, school_address } = req.body;
  const sql = `INSERT INTO students (name, phone, dob, parent_name, parent_job, school_name, school_address)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.run(sql, [name, phone, dob, parent_name, parent_job, school_name, school_address], function(err) {
    if (err) {
      return res.status(500).send('Error saving student data');
    }
    res.send('Student registered successfully with ID: ' + this.lastID);
  });
});

// Route to list all students (optional for admin panel)
app.get('/students', (req, res) => {
  db.all('SELECT * FROM students', (err, rows) => {
    if (err) {
      return res.status(500).send('Failed to fetch students');
    }
    res.json(rows);
  });
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});









  
  