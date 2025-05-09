// Get form elements
const loginForm = document.getElementById("login-form");
const loginBtn = document.getElementById("login-btn");
const loginPhone = document.getElementById("login-phone");
const loginDob = document.getElementById("login-dob");
const loginError = document.getElementById("login-error");

// Handle login form submission
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent default form submission

  const phone = loginPhone.value;
  const dob = loginDob.value;

  // Query database to check if user exists with matching phone and dob
  try {
    const userSnapshot = await db.collection("students")
      .where("phone", "==", phone)
      .where("dob", "==", dob)
      .get();

    if (userSnapshot.empty) {
      // If no matching user is found, show an error
      loginError.style.display = "block";
    } else {
      // If a matching user is found, log the user in
      const user = userSnapshot.docs[0].data();
      alert("Login successful!");

      // Redirect to home page after successful login
      window.location.href = "home.html"; // Replace with the URL of the page you want to redirect to
    }
  } catch (error) {
    alert("Error during login: " + error.message);
  }
});
alert("Login Successful!");
localStorage.setItem("loggedIn", "true"); // store login status
window.location.href = "home.html"; // go to home page
// When login is successful
localStorage.setItem('isLoggedIn', 'true');

// Redirect to saved course (if any)
const redirectCourse = localStorage.getItem('redirectAfterLogin');
if (redirectCourse) {
  localStorage.removeItem('redirectAfterLogin');
  window.location.href = redirectCourse;
} else {
  // Otherwise, go to default homepage
  window.location.href = 'home.html';
}
