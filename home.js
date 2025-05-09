
// Hamburger Menu Toggle
function toggleMenu() {
  const navLinks = document.getElementById('navLinks');
  navLinks.classList.toggle('active');
}

// Get references to the buttons
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');

// Check if the user is logged in using sessionStorage
let isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

// Function to update the button states based on the login status
function updateAuthButtons() {
  if (isLoggedIn) {
    // If logged in, show logout button, hide login and register buttons
    loginBtn.style.display = 'none';
    registerBtn.style.display = 'none';
    logoutBtn.style.display = 'block';
  } else {
    // If not logged in, show login and register buttons, hide logout button
    loginBtn.style.display = 'block';
    registerBtn.style.display = 'block';
    logoutBtn.style.display = 'none';
  }
}

// Call the function to update buttons based on initial login state
updateAuthButtons();

// Event listener for the login button
loginBtn.addEventListener('click', () => {
  // Prompt for username and password
  const username = prompt("Enter Username:");
  const password = prompt("Enter Password:");

  // Simple hard-coded validation (replace with your actual validation)
  if (username === "user" && password === "password123") {
    // Successful login
    isLoggedIn = true;
    sessionStorage.setItem('isLoggedIn', 'true'); // Save login state in sessionStorage
    updateAuthButtons(); // Update the button visibility
    alert("Login successful!");
  } else {
    alert("Incorrect login credentials.");
  }
});

// Event listener for the register button (you can replace this with actual registration logic)
registerBtn.addEventListener('click', () => {
  alert("Redirecting to Registration...");
  // You can add actual registration page redirection here
});

// Event listener for the logout button
logoutBtn.addEventListener('click', () => {
  // Log out the user
  isLoggedIn = false;
  sessionStorage.setItem('isLoggedIn', 'false'); // Remove login state from sessionStorage
  updateAuthButtons(); // Update the button visibility
  alert("Logged out successfully.");
});
document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('isLoggedIn');
  window.location.href = 'index.html';
});
