// models/adminModel.js
const db = require('../../config/db');

// Admin login - since admins might be few, you can keep hardcoded or create a table.
// Here's an example of a simple function to verify admin credentials from a table called 'admins'

const getAdminByUsername = (username, callback) => {
  const sql = `SELECT * FROM admins WHERE username = ?`;
  db.get(sql, [username], (err, row) => {
    if (err) {
      return callback(err);
    }
    callback(null, row);
  });
};

// Alternatively, if you want to keep admins hardcoded:
const admins = [
  { username: 'admin', password: 'admin123' }
];

const validateAdmin = (username, password) => {
  return admins.some(admin => admin.username === username && admin.password === password);
};

module.exports = {
  getAdminByUsername,
  validateAdmin
};
