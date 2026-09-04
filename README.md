# Appointment Management Web Application

A full-stack appointment management web application built with **Node.js, Express, MySQL, HTML, CSS, and Vanilla JavaScript**.

The application provides an admin interface for managing patient appointments and is deployed on **AWS** using Amazon EC2, Application Load Balancer, and Amazon RDS for MySQL.

## Features

* Dashboard with appointment summary cards
* Create, read, update, and delete appointments (CRUD)
* Search and filtering by patient, doctor, status, and date
* Appointment status management
* Responsive admin interface
* MySQL-backed data persistence
* RESTful API
* Health check endpoint for AWS load balancer monitoring
* Production deployment on AWS
* Multiple EC2 instances behind an Application Load Balancer

## Architecture

```text
                         ┌──────────────────┐
                         │      Users       │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │     Netlify      │
                         │    Frontend      │
                         └────────┬─────────┘
                                  │
                                  │ API Requests
                                  ▼
                    ┌──────────────────────────┐
                    │ Application Load Balancer│
                    │          (ALB)           │
                    └────────────┬─────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
          ┌──────────┐     ┌──────────┐     ┌──────────┐
          │   EC2    │     │   EC2    │     │   EC2    │
          │ Instance │     │ Instance │     │ Instance │
          │ Node.js  │     │ Node.js  │     │ Node.js  │
          │ Express  │     │ Express  │     │ Express  │
          └────┬─────┘     └────┬─────┘     └────┬─────┘
               │                │                │
               └────────────────┼────────────────┘
                                │
                         ┌──────▼───────┐
                         │   EC2 #4     │
                         │ Node.js /    │
                         │   Express    │
                         └──────┬───────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   Amazon RDS     │
                       │      MySQL       │
                       └──────────────────┘
```

## AWS Services Used

* **Amazon EC2** — Hosts the Node.js/Express application across 4 instances
* **Application Load Balancer (ALB)** — Distributes incoming requests across the EC2 instances
* **Target Group** — Registers and monitors the EC2 instances
* **Amazon RDS for MySQL** — Provides persistent database storage
* **Amazon VPC** — Provides the AWS networking environment
* **Security Groups** — Controls network traffic between AWS resources
* **NAT Gateway** — Provides outbound internet connectivity for private resources
* **Netlify** — Hosts the frontend and handles API request routing

## Project Structure

```text
appointment-management-system/
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
└── README.md
```

## Prerequisites

* Node.js 18+
* MySQL 8+
* A MySQL database server running locally or remotely

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

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

> Never commit real database credentials to GitHub or any public repository.

### 3. Create the MySQL Database and Table

Run the provided SQL schema:

```bash
mysql -u root -p < schema.sql
```

Or log in to MySQL and execute the SQL statements from `schema.sql`.

### 4. Start the Application

```bash
npm start
```

For development with automatic reloading:

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

## API Endpoints

### Appointments

| Method | Endpoint                | Description              |
| ------ | ----------------------- | ------------------------ |
| GET    | `/api/appointments`     | Get all appointments     |
| GET    | `/api/appointments/:id` | Get an appointment by ID |
| POST   | `/api/appointments`     | Create a new appointment |
| PUT    | `/api/appointments/:id` | Update an appointment    |
| DELETE | `/api/appointments/:id` | Delete an appointment    |

### Dashboard

```text
GET /api/dashboard/stats
```

Returns dashboard summary values.

### Health Check

```text
GET /health
```

Returns:

```json
{
  "status": "healthy"
}
```

The health check endpoint is used by the AWS Application Load Balancer to verify that the EC2 application instances are healthy.

## AWS Deployment

The application is **deployed and running on AWS**.

The production architecture uses multiple EC2 instances behind an Application Load Balancer, with Amazon RDS MySQL used as the persistent database.

### Production Request Flow

```text
User
  │
  ▼
Netlify
  │
  │ API Request
  ▼
Application Load Balancer
  │
  ▼
Target Group
  │
  ├──► EC2 Instance 1
  ├──► EC2 Instance 2
  ├──► EC2 Instance 3
  └──► EC2 Instance 4
           │
           ▼
     Node.js / Express
           │
           ▼
      Amazon RDS
         MySQL
```

The Application Load Balancer distributes incoming application traffic across the four EC2 instances.

The Target Group uses the `/health` endpoint to monitor instance health.

## AWS Networking

The application is deployed inside an Amazon VPC using AWS networking components.

* **Application Load Balancer** receives incoming HTTP traffic.
* **Target Group** connects the ALB to the EC2 instances.
* **Four EC2 instances** run the Node.js/Express backend.
* **Amazon RDS MySQL** stores appointment data persistently.
* **Security Groups** control communication between the application components.
* **Private subnets** are used for resources that should not receive direct internet traffic.
* **NAT Gateway** provides outbound internet access for private resources.

## Database

The application uses **MySQL** for persistent appointment data.

The database stores information such as:

* Patient details
* Doctor information
* Appointment date and time
* Appointment status
* Additional appointment information

Database credentials are provided through environment variables and are **not stored in the GitHub repository**.

## Technologies Used

### Frontend

* HTML5
* CSS3
* Vanilla JavaScript

### Backend

* Node.js
* Express.js
* REST API

### Database

* MySQL
* Amazon RDS

### Cloud & Infrastructure

* Amazon EC2
* Application Load Balancer
* Target Groups
* Amazon VPC
* Security Groups
* NAT Gateway

### Frontend Deployment

* Netlify

## What I Learned

This project was built as a hands-on AWS and full-stack development project.

Through this project, I gained practical experience with:

* Building a REST API using Node.js and Express
* Implementing CRUD operations
* Connecting a Node.js application to MySQL
* Deploying a backend application on Amazon EC2
* Running multiple EC2 instances
* Configuring an Application Load Balancer
* Creating and configuring Target Groups
* Implementing health checks
* Connecting an application to Amazon RDS
* Configuring AWS VPC networking
* Working with public and private subnets
* Configuring Security Groups
* Using a NAT Gateway
* Connecting a frontend hosted on Netlify to an AWS backend
* Testing application requests through the production infrastructure

## Project Status

**Deployed and Running on AWS**

The application has been tested through the production environment.

The deployment includes:

* 4 EC2 instances
* Application Load Balancer
* Target Group with health checks
* Node.js/Express backend
* Amazon RDS MySQL database
* Netlify frontend

## Security

Sensitive configuration values are stored using environment variables.

The following files should never contain real credentials:

```text
.env
```

The `.env` file is excluded from version control using `.gitignore`.

Only `.env.example` is included in the repository as a template.

## Future Improvements

Possible future improvements include:

* User authentication and authorization
* Role-based access control
* Automated deployment using CI/CD
* HTTPS using an SSL/TLS certificate
* Custom domain configuration
* Monitoring and logging using Amazon CloudWatch
* Automated database backups and recovery strategies
* Auto Scaling for EC2 instances

## Author

Built as a hands-on **AWS Cloud and Full-Stack Development Project**.

