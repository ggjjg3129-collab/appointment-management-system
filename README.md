# Appointment Management Web Application

A beginner-friendly appointment management system built with Node.js, Express, MySQL, HTML, CSS, and vanilla JavaScript.

## Features

- Dashboard with summary cards
- CRUD appointment management
- Search and filtering by patient, doctor, status, and date
- Appointment status updates
- Responsive admin interface
- MySQL-backed persistence
- Health check endpoint for AWS load balancers

## Project Structure

```text
project/
├── public/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── routes/
│   └── appointments.js
├── controllers/
│   └── appointmentController.js
├── config/
│   └── database.js
├── server.js
├── schema.sql
├── package.json
├── .env.example
├── .gitignore
├── README.md
└── .env
```

## Prerequisites

- Node.js 18+
- MySQL 8+
- A MySQL database server running locally or remotely

## 1) Install Dependencies

```bash
npm install
```

## 2) Configure Environment Variables

Create a `.env` file in the project root based on `.env.example`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=appointment_db
DB_PORT=3306
PORT=3000
NODE_ENV=development
```

> Never commit real database credentials to version control.

## 3) Create the MySQL Database and Table

You can run the SQL file manually in MySQL:

```bash
mysql -u root -p < schema.sql
```

Or log in to MySQL and run the SQL in the file.

## 4) Start the Application

```bash
npm start
```

For development with auto-reloading:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## 5) API Endpoints

### Appointments

- `GET /api/appointments` — Get all appointments
- `GET /api/appointments/:id` — Get one appointment by ID
- `POST /api/appointments` — Create an appointment
- `PUT /api/appointments/:id` — Update an appointment
- `DELETE /api/appointments/:id` — Delete an appointment

### Dashboard

- `GET /api/dashboard/stats` — Get dashboard summary values

### Health Check

- `GET /health` — Returns `{"status":"healthy"}`

## AWS Deployment Notes

This app is structured for later deployment to AWS EC2 + RDS MySQL:

- Binds to `0.0.0.0`
- Uses `PORT` environment variable
- Defaults to port `80` in production if `PORT` is missing
- Uses MySQL connection settings from environment variables
- Includes a health endpoint for target groups
- Does not depend on localhost-only assumptions for production

## Notes

The frontend is served from the Express app, and the API endpoints are available under `/api`.

## License

MIT
