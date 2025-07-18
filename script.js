document.addEventListener("DOMContentLoaded", function () {
  injectEditModal();
  injectConfirmModal();
  injectDeleteConfirmModal();
  injectAddEmployeeModal();
  fetchEmployees();
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", function () {
  const query = this.value.toLowerCase();
  const filtered = allEmployees.filter(employee => {
    const fullName = employee["Basic Information"]["Full Name"].toLowerCase();
    return fullName.includes(query);
  });
  displayEmployees(filtered);
});

  setTimeout(setupModalListeners, 100);
});

let allEmployees = [];
let pendingEditEmployee = null;
let pendingDeleteEmployee = null;

function fetchEmployees() {
  fetch("https://database-management-dashboard-api.onrender.com")
    .then(res => res.json())
    .then(data => {
      allEmployees = data;
      displayEmployees(data);
    })
    .catch(error => console.error("Error fetching employees:", error));
}

function getInitials(name) {
  return name
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase();
}

const employeeList = document.getElementById("employees");
const detailsContainer = document.getElementById("details-content");

function displayEmployees(employees) {
  employeeList.innerHTML = '';
  employees.forEach(employee => {
    const li = document.createElement('li');
    const fullName = employee["Basic Information"]["Full Name"];
    li.innerHTML = `
      <div class="avatar">${getInitials(fullName)}</div>
      ${fullName}
    `;
    li.addEventListener('click', () => displayEmployeeDetails(employee));
    employeeList.appendChild(li);
  });
}

function displayEmployeeDetails(employee) {
  const basic = employee["Basic Information"];
  const contact = employee["Contact Info"];
  const employment = employee["Employment Details"];

  if (!basic || !contact || !employment) {
    detailsContainer.innerHTML = "<p>Missing employee data.</p>";
    return;
  }

  detailsContainer.innerHTML = `
    <div class="details-card">
      <h3>${basic["Full Name"]}</h3>
      <div class="detail-group"><strong>Employee ID:</strong> ${basic["employee id"]}</div>
      <div class="detail-group"><strong>Department:</strong> ${basic["department"]}</div>
      <div class="detail-group"><strong>Position:</strong> ${basic["position"]}</div>
      <div class="detail-group"><strong>Manager:</strong> ${basic["Manager"]}</div>

      <div class="detail-group"><strong>Email:</strong> ${contact["email"]}</div>
      <div class="detail-group"><strong>Phone:</strong> ${contact["phone"]}</div>
      <div class="detail-group"><strong>Address:</strong> ${contact["Address"]}</div>

      <div class="detail-group"><strong>Hire Date:</strong> ${employment["Hire Date"]}</div>
      <div class="detail-group"><strong>Salary:</strong> KES ${employment["Salary"]}</div>
      <div class="detail-group"><strong>Years of Service:</strong> ${employment["Years Of Service"]}</div>

      <div class="button-group">
        <button class="btn edit-btn" data-id="${employee.id}">Edit <br> Employee</button>
        <button class="btn delete-btn" data-id="${employee.id}">Delete <br> Employee</button>
      </div>
    </div>
  `;
}

function findEmployeeById(id) {
  return allEmployees.find(emp => emp.id == id);
}

detailsContainer.addEventListener("click", function (event) {
  const id = event.target.dataset.id;
  const employee = findEmployeeById(id);

  if (event.target.classList.contains("edit-btn")) {
    pendingEditEmployee = employee;
    document.getElementById("confirmModal").style.display = "flex";
  }

  if (event.target.classList.contains("delete-btn")) {
    pendingDeleteEmployee = employee;
    document.getElementById("confirmDeleteModal").style.display = "flex";
  }
});

function setupModalListeners() {
  const modal = document.getElementById("editModal");
  const modalForm = document.getElementById("editForm");
  const closeModalBtn = document.getElementById("closeModal");

  // Add Employee Modal Elements
  const addModal = document.getElementById("addEmployeeModal");
  const addModalForm = document.getElementById("addEmployeeForm");
  const closeAddModalBtn = document.getElementById("closeAddModal");

  closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  closeAddModalBtn.addEventListener("click", () => {
    addModal.style.display = "none";
  });

  // Add Employee Button Event Listener
  const addEmployeeBtn = document.getElementById("addEmployeeBtn");
  if (addEmployeeBtn) {
    addEmployeeBtn.addEventListener("click", () => {
      addModal.style.display = "flex";
    });
  }

  // Add Employee Form Submit
  addModalForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const newEmployee = {
      "Basic Information": {
        "Full Name": addModalForm.fullName.value,
        "employee id": addModalForm.employeeId.value,
        "department": addModalForm.department.value,
        "position": addModalForm.position.value,
        "Manager": addModalForm.manager.value,
      },
      "Contact Info": {
        "email": addModalForm.email.value,
        "phone": addModalForm.phone.value,
        "Address": addModalForm.address.value
      },
      "Employment Details": {
        "Hire Date": addModalForm.hireDate.value,
        "Salary": addModalForm.salary.value,
        "Years Of Service": calculateYearsOfService(addModalForm.hireDate.value)
      }
    };

    fetch("https://database-management-dashboard-api.onrender.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newEmployee)
    })
      .then(res => res.json())
      .then((createdEmployee) => {
        addModalForm.reset();
        addModal.style.display = "none";
        
        // Add the new employee to the local array
        allEmployees.push(createdEmployee);
        
        // Update the employee list display
        displayEmployees(allEmployees);
        
        // Show success message
        alert("Employee added successfully!");
      })
      .catch(err => console.error("Add employee failed:", err));
  });

  modalForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const id = modalForm.dataset.id;
    const employee = findEmployeeById(id);
    if (!employee) return;

    const updatedEmployee = {
      ...employee,
      "Basic Information": {
        ...employee["Basic Information"],
        "Full Name": modalForm.fullName.value,
        "department": modalForm.department.value,
        "position": modalForm.position.value,
        "Manager": modalForm.manager.value,
      },
      "Contact Info": {
        ...employee["Contact Info"],
        "email": modalForm.email.value,
        "phone": modalForm.phone.value,
        "Address": modalForm.address.value
      },
      "Employment Details": {
        ...employee["Employment Details"],
        "Salary": modalForm.salary.value
      }
    };

    fetch(`https://database-management-dashboard-api.onrender.com/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedEmployee)
    })
      .then(res => res.json())
      .then(() => {
        modalForm.reset();
        modal.style.display = "none";
        
        // Update the employee in the local array
        const employeeIndex = allEmployees.findIndex(emp => emp.id == id);
        if (employeeIndex !== -1) {
          allEmployees[employeeIndex] = updatedEmployee;
        }
        
        // Update the employee list display
        displayEmployees(allEmployees);
        
        // Update the details view if this employee is currently displayed
        displayEmployeeDetails(updatedEmployee);
      })
      .catch(err => console.error("Update failed:", err));
  });

  document.getElementById("confirmEditBtn").addEventListener("click", () => {
    if (pendingEditEmployee) {
      document.getElementById("confirmModal").style.display = "none";
      openEditModal(pendingEditEmployee);
      pendingEditEmployee = null;
    }
  });

  document.getElementById("confirmDeleteBtn").addEventListener("click", () => {
    if (pendingDeleteEmployee) {
      fetch(`https://database-management-dashboard-api.onrender.com/${pendingDeleteEmployee.id}`, {
        method: "DELETE"
      })
        .then(() => {
          alert("Deleted successfully");
          fetchEmployees();
          detailsContainer.innerHTML = "";
          pendingDeleteEmployee = null;
          document.getElementById("confirmDeleteModal").style.display = "none";
        })
        .catch(err => console.error("Delete failed:", err));
    }
  });

  document.getElementById("cancelDeleteBtn").addEventListener("click", () => {
    document.getElementById("confirmDeleteModal").style.display = "none";
    pendingDeleteEmployee = null;
  });

  document.getElementById("cancelEditBtn").addEventListener("click", () => {
    document.getElementById("confirmModal").style.display = "none";
    pendingEditEmployee = null;
  });
}

function openEditModal(employee) {
  const modal = document.getElementById("editModal");
  const modalForm = document.getElementById("editForm");

  const basic = employee["Basic Information"];
  const contact = employee["Contact Info"];
  const employment = employee["Employment Details"];

  modalForm.dataset.id = employee.id;
  modalForm.fullName.value = basic["Full Name"];
  modalForm.email.value = contact["email"];
  modalForm.phone.value = contact["phone"];
  modalForm.address.value = contact["Address"];
  modalForm.department.value = basic["department"];
  modalForm.position.value = basic["position"];
  modalForm.manager.value = basic["Manager"];
  modalForm.salary.value = employment["Salary"];

  modal.style.display = "flex";
}

function calculateYearsOfService(hireDate) {
  const today = new Date();
  const hire = new Date(hireDate);
  const diffTime = Math.abs(today - hire);
  const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
  return diffYears;
}

function injectAddEmployeeModal() {
  const modalHTML = `
    <div id="addEmployeeModal" class="modal" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.4); backdrop-filter: blur(4px); align-items:center; justify-content:center; z-index:1000;">
      <div class="modal-content" style="background: rgba(255,255,255,0.95); padding: 30px; border-radius: 15px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #2c3e50;">Add New Employee</h2>
          <button id="closeAddModal" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">&times;</button>
        </div>
        
        <form id="addEmployeeForm">
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #34495e;">Full Name:</label>
            <input type="text" name="fullName" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #34495e;">Employee ID:</label>
            <input type="text" name="employeeId" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #34495e;">Email:</label>
            <input type="email" name="email" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #34495e;">Phone:</label>
            <input type="tel" name="phone" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #34495e;">Address:</label>
            <textarea name="address" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; min-height: 60px; resize: vertical;"></textarea>
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #34495e;">Department:</label>
            <input type="text" name="department" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #34495e;">Position:</label>
            <input type="text" name="position" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #34495e;">Manager:</label>
            <input type="text" name="manager" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #34495e;">Hire Date:</label>
            <input type="date" name="hireDate" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #34495e;">Salary:</label>
            <input type="number" name="salary" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
          </div>
          
          <div style="text-align: right;">
            <button type="submit" style="padding: 12px 24px; background: #27ae60; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;">Add Employee</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);
}

function injectEditModal() {
  const modalHTML = `
    <div id="editModal" class="modal" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.4); backdrop-filter: blur(4px); align-items:center; justify-content:center; z-index:1000;">
      <div class="modal-content" style="background: rgba(255,255,255,0.95); padding: 30px; border-radius: 15px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2 style="margin: 0;">Edit Employee</h2>
          <button id="closeModal" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">&times;</button>
        </div>
        
        <form id="editForm">
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Full Name:</label>
            <input type="text" name="fullName" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Email:</label>
            <input type="email" name="email" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Phone:</label>
            <input type="tel" name="phone" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Address:</label>
            <textarea name="address" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; min-height: 60px; resize: vertical;"></textarea>
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Department:</label>
            <input type="text" name="department" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Position:</label>
            <input type="text" name="position" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Manager:</label>
            <input type="text" name="manager" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Salary:</label>
            <input type="number" name="salary" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
          </div>
          
          <div style="text-align: right;">
            <button type="submit" style="padding: 12px 24px; background: #27ae60; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);
}

function injectConfirmModal() {
  const modalHTML = `
    <div id="confirmModal" class="modal" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.4); backdrop-filter: blur(4px); align-items:center; justify-content:center; z-index:1000;">
      <div class="modal-content" style="background: rgba(255,255,255,0.95); padding: 30px; border-radius: 15px; max-width: 400px; text-align:center; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
        <h2>Confirm Edit</h2>
        <p>Are you sure you want to edit this employee?</p>
        <div style="margin-top: 20px;">
          <button id="cancelEditBtn" style="margin-right: 10px; padding: 10px 20px; background: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer;">Cancel</button>
          <button id="confirmEditBtn" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 8px; cursor: pointer;">Edit</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);
}

function injectDeleteConfirmModal() {
  const modalHTML = `
    <div id="confirmDeleteModal" class="modal" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.4); backdrop-filter: blur(4px); align-items:center; justify-content:center; z-index:1000;">
      <div class="modal-content" style="background: rgba(255,255,255,0.95); padding: 30px; border-radius: 15px; max-width: 400px; text-align:center; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
        <h2>Confirm Delete</h2>
        <p>Are you sure you want to delete this employee?</p>
        <div style="margin-top: 20px;">
          <button id="cancelDeleteBtn" style="margin-right: 10px; padding: 10px 20px; background: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer;">Cancel</button>
          <button id="confirmDeleteBtn" style="padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 8px; cursor: pointer;">Delete</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);
}