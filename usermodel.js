// models/userModel.js
const db = require('../../config/db');

// Register a new user (student)
const createUser = (userData, callback) => {
  const {
    name,
    phone,
    dob,
    parent_name,
    parent_job,
    school_name,
    school_address
  } = userData;

  const sql = `
    INSERT INTO students (name, phone, dob, parent_name, parent_job, school_name, school_address)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [name, phone, dob, parent_name, parent_job, school_name, school_address], function(err) {
    if (err) {
      return callback(err);
    }
    callback(null, { id: this.lastID });
  });
};

// Find a user by phone and dob (used for login)
const findUserByPhoneAndDob = (phone, dob, callback) => {
  const sql = `SELECT * FROM students WHERE phone = ? AND dob = ?`;
  db.get(sql, [phone, dob], (err, row) => {
    if (err) {
      return callback(err);
    }
    callback(null, row);
  });
};

// Get user by ID
const findUserById = (id, callback) => {
  const sql = `SELECT * FROM students WHERE id = ?`;
  db.get(sql, [id], (err, row) => {
    if (err) {
      return callback(err);
    }
    callback(null, row);
  });
};

module.exports = {
  createUser,
  findUserByPhoneAndDob,
  findUserById
};
