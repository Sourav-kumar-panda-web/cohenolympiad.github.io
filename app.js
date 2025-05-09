document.getElementById('register-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const data = {
    fullName: document.getElementById('fullName').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    dob: document.getElementById('dob').value,
    parentName: document.getElementById('parentName').value,
    parentJob: document.getElementById('parentJob').value,
    school: document.getElementById('school').value,
    schoolAddress: document.getElementById('schoolAddress').value
  };

  try {
    const res = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    if (res.ok) {
      alert('Registration successful!');
      window.location.href = 'login.html';
    } else {
      alert('Error: ' + result.message);
    }
  } catch (err) {
    alert('Network error: ' + err.message);
  }
});
// Redirect to login if not logged in
document.querySelectorAll('.join-now-button').forEach(button => {
  button.addEventListener('click', (e) => {
    e.preventDefault();
    const courseLink = e.target.getAttribute('data-course');

    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (isLoggedIn === 'true') {
      // If logged in, go to the course
      window.location.href = courseLink;
    } else {
      // Save course to redirect after login
      localStorage.setItem('redirectAfterLogin', courseLink);
      // Redirect to login page
      window.location.href = 'login.html';
    }
  });
});
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'index.html'; // or wherever you want
  });
}







  
  