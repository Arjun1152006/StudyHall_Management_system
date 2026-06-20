# StudyHall_Management_system
Study Hall Management System developed with React, Spring Boot, and MySQL. Provides student registration, fee management, hall allocation, reporting, and dashboard analytics through a modern full-stack web application.
# 🚀 Study Hall Management System

A Full Stack Study Hall Management System built using **React, Spring Boot, REST APIs, and MySQL** to efficiently manage students, study halls, fee collection, and administrative operations.

## 📌 Features

### 👨‍🎓 Student Management

* Add, update, and delete students
* View student details
* Manage active/inactive students

### 🏢 Study Hall Management

* Add and manage study halls
* Allocate cabins and seats
* Monitor occupancy

### 💰 Fee Management

* Monthly fee tracking
* Paid and pending fee status
* Fee due calculations
* Upcoming fee reminders

### 📊 Dashboard & Reports

* Student statistics
* Fee collection reports
* Study hall analytics
* Real-time dashboard overview

### 🔍 Additional Features

* Search and filtering
* Responsive UI
* REST API integration
* Cloud database ready

---

## 🛠️ Tech Stack

### Frontend

* React.js
* JavaScript
* Axios
* HTML5
* CSS3

### Backend

* Spring Boot
* Spring Data JPA
* REST APIs
* Java

### Database

* MySQL

---

## 📂 Project Structure

```text
StudyHallManagementSystem
│
├── frontend (React)
│
├── backend (Spring Boot)
│
├── src
│   ├── controller
│   ├── service
│   ├── repository
│   ├── entity
│   └── dto
│
└── database (MySQL)
```

---

## ⚙️ Installation & Setup

### Clone Repository

```bash
git clone https://github.com/Arjun1152006/StudyHall_Management_system.git
```

### Backend Setup

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 API Endpoints

### Students

```http
GET    /api/students
POST   /api/students
PUT    /api/students/{id}
DELETE /api/students/{id}
```

### Study Halls

```http
GET    /api/study-halls
POST   /api/study-halls
PUT    /api/study-halls/{id}
DELETE /api/study-halls/{id}
```

### Dashboard

```http
GET /api/dashboard
```

### Reports

```http
GET /api/reports/fee-collection
```

---

## 🎯 Learning Outcomes

This project helped me gain practical experience in:

* Full Stack Development
* React Development
* Spring Boot Application Development
* REST API Design
* Database Management
* Frontend-Backend Integration
* CRUD Operations
* Project Deployment Workflow

---

## 🚀 Future Enhancements

* JWT Authentication
* Role-Based Access Control
* Email Notifications
* Payment Gateway Integration
* Cloud Deployment
* Advanced Analytics Dashboard

---

## 👨‍💻 Author

**Arjun Peddi**

B.Tech – Artificial Intelligence & Machine Learning

Passionate about Full Stack Development, Java, Spring Boot, React, and Problem Solving.

⭐ If you like this project, consider giving it a star!
