# Employee Database Management Dashboard

A dynamic employee management system that allows organizations to manage, view, add, edit, and delete employee records in real time. This web-based dashboard offers a clean interface, responsive design, and full CRUD functionality using a live backend hosted on Render.

## Features

- View a list of all employees
- Search employees by full name
- View detailed employee profiles
- Add new employees via modal form
- Edit employee information with confirmation
- Delete employee records with confirmation
- Fully responsive and user-friendly UI
- Real-time data persistence via a RESTful API

## Live Demo

[View the Live App Here](https://austine-john.github.io/database_management/)  
> ⚠️ Ensure the backend is active to avoid fetch errors due to Render's server sleep mode.

## Getting Started

No installation required!  
Just download the project or visit the live demo.

To run locally:
1. Clone the repository.
2. Open `index.html` in your browser.
3. Make sure your API server is running or use the deployed Render endpoint.

## Usage

1. Click the “Add Employee” button to open the modal and input new employee data.
2. Use the search bar to find employees by name.
3. Click on any employee to view full details.
4. Use “Edit” or “Delete” within the detail view to modify records.

## Technologies Used

- HTML5, CSS3, JavaScript (Vanilla)
- Fetch API for HTTP requests
- `json-server` as a mock RESTful API
- Backend hosted on [Render](https://render.com)
- Modal-based UI with dynamic DOM manipulation

## API Endpoint

**Base URL:**  
`https://database-management-dashboard-api.onrender.com/employees`

> All requests are routed through this endpoint for fetching, posting, updating, and deleting employee data.

## Contributing

Contributions are welcome!  
Feel free to fork the project, open issues, or submit pull requests to improve features or fix bugs.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

- [json-server](https://github.com/typicode/json-server) – For enabling quick API prototyping  
- [Render](https://render.com) – For free hosting of the backend service  
- [Google Fonts](https://fonts.google.com) – For typography  
- [Font Awesome](https://fontawesome.com) – For icons used in modals and buttons
