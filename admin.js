document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.querySelector('#students-table tbody');

  function fetchStudents() {
    fetch('/admin/users')
      .then(res => res.json())
      .then(students => {
        tbody.innerHTML = '';
        if (students.length === 0) {
          tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No registered students found.</td></tr>';
          return;
        }

        students.forEach(student => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${student.id}</td>
            <td><input type="text" value="${student.name}" data-field="name" data-id="${student.id}"></td>
            <td><input type="email" value="${student.email}" data-field="email" data-id="${student.id}"></td>
            <td><input type="text" value="${student.phone}" data-field="phone" data-id="${student.id}"></td>
            <td><input type="date" value="${student.dob}" data-field="dob" data-id="${student.id}"></td>
            <td><input type="text" value="${student.parent_name}" data-field="parent_name" data-id="${student.id}"></td>
            <td><input type="text" value="${student.school_name}" data-field="school_name" data-id="${student.id}"></td>
            <td>
              <button class="save-btn" data-id="${student.id}">Save</button>
              <button class="delete-btn" data-id="${student.id}">Delete</button>
            </td>
          `;
          tbody.appendChild(tr);
        });

        // Attach event listeners for save and delete buttons
        document.querySelectorAll('.save-btn').forEach(button => {
          button.addEventListener('click', () => {
            const id = button.dataset.id;
            const row = button.closest('tr');

            const updatedData = {
              name: row.querySelector('input[data-field="name"]').value,
              email: row.querySelector('input[data-field="email"]').value,
              phone: row.querySelector('input[data-field="phone"]').value,
              dob: row.querySelector('input[data-field="dob"]').value,
              parent_name: row.querySelector('input[data-field="parent_name"]').value,
              parent_job: "",  // You can add parent_job and school_address fields similarly if you want
              school_name: row.querySelector('input[data-field="school_name"]').value,
              school_address: ""
            };

            fetch(`/admin/users/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedData)
            })
              .then(res => res.json())
              .then(data => {
                alert(data.message || 'Updated');
                fetchStudents(); // Refresh table
              })
              .catch(err => alert('Error updating student'));
          });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
          button.addEventListener('click', () => {
            if (!confirm('Are you sure you want to delete this student?')) return;

            const id = button.dataset.id;
            fetch(`/admin/users/${id}`, {
              method: 'DELETE'
            })
              .then(res => res.json())
              .then(data => {
                alert(data.message || 'Deleted');
                fetchStudents(); // Refresh table
              })
              .catch(err => alert('Error deleting student'));
          });
        });
      })
      .catch(() => {
        tbody.innerHTML = `<tr><td colspan="8" style="color:red; text-align:center;">Error loading data</td></tr>`;
      });
  }

  fetchStudents();
});


