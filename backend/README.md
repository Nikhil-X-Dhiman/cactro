# Event Booking System - Backend

## Overview

This is the backend for an Event Booking System, built with Node.js, Express, PostgreSQL, and BullMQ. It handles user authentication, event management, and ticket booking with concurrency handling and background processing.

## Design Decisions

### 1. Architecture

- **Layered Architecture**: The application is structured into distinct layers:
  - **Controllers** (`src/controllers`): Handle HTTP requests, parsing bodies, and sending responses.
  - **Services** (`src/services`): Contain all business logic and interact with the database.
  - **Routes** (`src/routes`): Define API endpoints and map them to controllers.
  - **Middlewares** (`src/middlewares`): Handle cross-cutting concerns like authentication, error handling, and authorization.
- **Separation of Concerns**: This structure ensures that each file has a single responsibility, making the codebase easier to maintain, test, and scale.

### 2. Technology Stack

- **Node.js & Express**: Chosen for their non-blocking I/O and rich ecosystem.
- **TypeScript**: Used throughout for robust type safety, reducing runtime errors and improving developer experience.
- **PostgreSQL**: Relational database for structured data integrity.
- **Prisma ORM**: Provides a type-safe interface to the database and simplifies schema management.
- **Redis & BullMQ**: Used for asynchronous background processing to offload heavy tasks (emails, notifications) from the main request-response cycle.

### 3. Database Design

- **Schema**:
  - `User`: Stores authentication info and role (`ORGANIZER` vs `CUSTOMER`).
  - `Event`: Stores event details (`totalTickets`, `availableTickets`, etc.).
  - `Booking`: Links `User` and `Event` to track ticket purchases.
- **Transactions**: Central to the booking logic. When a user books a ticket:
  1.  A transaction is started.
  2.  The event is fetched to check `availableTickets`.
  3.  If available, the booking is created AND `availableTickets` is decremented atomically.
  4.  This prevents race conditions where multiple users might book the last ticket simultaneously.

### 4. Authentication & Security

- **JWT (JSON Web Tokens)**: Stateless authentication. Upon login, a token is issued which must be sent in the `Authorization` header (`Bearer <token>`) for protected routes.
- **RBAC (Role-Based Access Control)**:
  - `ORGANIZER`: Can create, update, and delete events.
  - `CUSTOMER`: Can view events and book tickets.
  - Protected routes verify the user's role before granting access.
- **Password Hashing**: `bcryptjs` is used to securely hash passwords before storage.
- **Helmet**: Middleware used to set secure HTTP headers (e.g., hiding `X-Powered-By`).

### 5. Background Processing

- **BullMQ**: Handles "fire-and-forget" tasks.
  - `email-queue`: Simulates sending a confirmation email after a successful booking.
  - `notification-queue`: Simulates sending updates to attendees when an event is updated.
- **Benefit**: This ensures the API remains fast and responsive, as the user doesn't wait for the email to be sent before getting a response.

### 6. Error Handling

- **Global Error Middleware**: A centralized error handler (`error.middleware.ts`) catches all errors passed to `next(error)`. It standardizes the error response format (`{ message: string, status?: number }`) and logs the error, ensuring consistent API behavior.

---

## API Documentation

**Base URL**: `http://localhost:4000/api`

### 1. Authentication

#### Register

- **Method**: `POST`
- **Endpoint**: `/auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securePass123",
    "role": "ORGANIZER" // "ORGANIZER" or "CUSTOMER"
  }
  ```
- **Response (201)**:
  ```json
  {
    "message": "User registered successfully",
    "user": { "id": 1, "email": "...", "role": "..." }
  }
  ```

#### Login

- **Method**: `POST`
- **Endpoint**: `/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securePass123"
  }
  ```
- **Response (200)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": { "id": 1, "email": "...", "role": "..." }
  }
  ```
  _Note: Copy the `token` for authenticated requests._

### 2. Events

#### Create Event

- **Method**: `POST`
- **Endpoint**: `/events`
- **Access**: `ORGANIZER` only
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "title": "Tech Conf 2024",
    "description": "Annual tech meetup",
    "date": "2024-12-01T10:00:00Z",
    "location": "Convention Center",
    "totalTickets": 100
  }
  ```
- **Response (201)**: Event object.

#### List Events

- **Method**: `GET`
- **Endpoint**: `/events`
- **Access**: Public
- **Response (200)**: Array of Event objects.

#### Update Event

- **Method**: `PUT`
- **Endpoint**: `/events/:id`
- **Access**: `ORGANIZER` only
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: (Partial fields)
  ```json
  {
    "location": "New Venue Hall B"
  }
  ```
- **Response (200)**: Updated Event object.

#### Delete Event

- **Method**: `DELETE`
- **Endpoint**: `/events/:id`
- **Access**: `ORGANIZER` only
- **Headers**: `Authorization: Bearer <token>`
- **Response (204)**: No content.

### 3. Bookings

#### Book Tickets

- **Method**: `POST`
- **Endpoint**: `/bookings`
- **Access**: `CUSTOMER` only
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "eventId": 1,
    "ticketsCount": 2
  }
  ```
- **Response (201)**: Booking object (including Event details).

#### Get My Bookings

- **Method**: `GET`
- **Endpoint**: `/bookings/my-bookings`
- **Access**: Authenticated User
- **Headers**: `Authorization: Bearer <token>`
- **Response (200)**: Array of Booking objects (including Event details).

---

## Setup & Run

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Infrastructure**: Ensure PostgreSQL (5432) and Redis (6379) are running.
3.  **Environment**: Create a `.env` file (copied from `.env.example` if available) with:
    ```env
    DATABASE_URL="postgresql://user:pass@localhost:5432/db_name"
    JWT_SECRET="your_secret"
    REDIS_HOST="localhost"
    REDIS_PORT="6379"
    PORT="4000"
    ```
4.  **Database Migration**:
    ```bash
    npx prisma migrate dev --name init
    ```
5.  **Start Server**:
    ```bash
    npm run dev
    ```
    Server runs on `http://localhost:4000`.
