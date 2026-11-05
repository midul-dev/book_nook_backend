<div align="center">

# 📚 BookNook Backend API

**A robust RESTful API backend for the BookNook book-sharing and library management platform.**

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5.3.0-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Native_Driver-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/Jose-JWKS_Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://github.com/panva/jose)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=for-the-badge)](https://opensource.org/licenses/ISC)

</div>

---

## 📖 Overview

The **BookNook Backend** is an Express.js API designed to handle all core operations for the BookNook ecosystem. It powers book inventory management, borrowing workflows with real-time copy tracking, user-specific collection filtering, and remote JWKS-based JWT authentication.

---

## ✨ Features

- **📖 Book Catalog Management**: Add, update, delete, view, and retrieve latest or individual books.
- **🔄 Dynamic Inventory Tracking**: Automatically decrements book copies upon borrowing and restores stock upon return.
- **🛡️ Secure Authentication**: Protected routes verified via Remote JWKS (`jose`) against client-provided JWT tokens.
- **👤 User Collections**: Filter books and active borrow lists by authenticated user email.
- **⚡ Serverless-Ready**: Fully configured with `vercel.json` for seamless deployment to Vercel.
- **🌐 Cross-Origin Support**: Pre-configured CORS middleware for secure frontend communication.

---

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Web Framework**: [Express.js 5](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via official `mongodb` native driver
- **Authentication**: Remote JWKS token validation with [`jose`](https://github.com/panva/jose)
- **Environment Management**: [`dotenv`](https://github.com/motdotla/dotenv)
- **Deployment**: [Vercel](https://vercel.com/) (Serverless Functions)

---

## 📁 Project Structure

```text
book_nook_backend/
├── .env.example        # Environment variable template
├── .gitignore          # Ignored files (node_modules, .env, .vercel)
├── index.js            # Main server file, middleware, and route handlers
├── package.json        # Dependencies, metadata, and run scripts
├── package-lock.json   # Exact dependency lockfile
├── vercel.json         # Vercel deployment configuration
└── README.md           # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18.x or higher recommended)
- [npm](https://www.npmjs.com/) (bundled with Node.js)
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster or local MongoDB instance

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/midul-dev/book_nook_backend.git
   cd book_nook_backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your actual credentials:
   ```env
   PORT=5000
   DB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
   CLIENT_URL=http://localhost:3000
   ```

4. **Run the server:**
   - **Development mode** (with auto-reload on file changes):
     ```bash
     npm run dev
     ```
   - **Production mode**:
     ```bash
     npm start
     ```

5. The API will be live at `http://localhost:5000`.

---

## 🔐 Environment Variables

| Variable | Required | Description |
| :--- | :---: | :--- |
| `DB_URI` | **Yes** | MongoDB connection string (e.g., MongoDB Atlas URI). |
| `CLIENT_URL` | **Yes** | Base URL of the client application providing the JWKS endpoint (`${CLIENT_URL}/api/auth/jwks`). |
| `PORT` | No | Port on which the Express server listens (defaults to `5000`). |

---

## 📡 API Reference

All protected endpoints require a valid JWT Bearer token passed via the Authorization header:
```http
Authorization: Bearer <your_jwt_token>
```

### 🔹 Health Check

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/` | No | Server status / welcome message. |

---

### 🔹 Books Endpoints

#### 1. Add a Book
- **Endpoint**: `POST /add-books`
- **Auth**: Required
- **Request Body**:
  ```json
  {
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "image": "https://example.com/cover.jpg",
    "description": "A handbook of agile software craftsmanship.",
    "category": "Technology",
    "copies": 5,
    "userEmail": "user@example.com"
  }
  ```
- **Responses**:
  - `200 OK`: Book added successfully.
  - `400 Bad Request`: Book with this title already added by the user.

#### 2. Get All Books
- **Endpoint**: `GET /all-books`
- **Auth**: No
- **Response**: `200 OK` with an array of all books.

#### 3. Get Latest Books
- **Endpoint**: `GET /latest-books`
- **Auth**: No
- **Description**: Returns the top 6 most recently added books.

#### 4. Get Single Book by ID
- **Endpoint**: `GET /all-books/:id`
- **Auth**: Required
- **Response**: `200 OK` with book details, or `404 Not Found`.

#### 5. Get User's Books
- **Endpoint**: `GET /my-books?email=user@example.com`
- **Auth**: Required
- **Response**: `200 OK` with books created by the specified email.

#### 6. Update Book
- **Endpoint**: `PATCH /update-book/:id`
- **Auth**: Required
- **Request Body**:
  ```json
  {
    "title": "Updated Title",
    "author": "Updated Author",
    "category": "Technology",
    "copies": 3,
    "description": "Updated Description",
    "image": "https://example.com/new-cover.jpg"
  }
  ```
- **Response**: `200 OK` on success, or `404 Not Found`.

#### 7. Delete Book
- **Endpoint**: `DELETE /delete-book/:id`
- **Auth**: Required
- **Response**: `200 OK` on deletion, or `404 Not Found`.

---

### 🔹 Borrowing Endpoints

#### 1. Borrow a Book
- **Endpoint**: `POST /add-borrow`
- **Auth**: Required
- **Behavior**:
  - Verifies user hasn't already borrowed the same book.
  - Ensures available copies (`copies > 0`) and automatically decrements copies by `1`.
  - Creates a borrow record in the `borrows` collection.
- **Request Body**:
  ```json
  {
    "bookId": "651f...",
    "userEmail": "user@example.com",
    "borrowDate": "2026-11-05",
    "returnDate": "2026-11-20"
  }
  ```
- **Responses**:
  - `200 OK`: Borrow successful.
  - `400 Bad Request`: Already borrowed, or book is out of stock.

#### 2. Return a Book
- **Endpoint**: `DELETE /return-book/:id`
- **Auth**: Required
- **Behavior**: Removes borrow record by ID and increments book copies by `1`.
- **Response**: `200 OK` on return, or `404 Not Found`.

#### 3. Get User's Borrowed Books
- **Endpoint**: `GET /my-borrows?email=user@example.com`
- **Auth**: Required
- **Response**: `200 OK` with array of borrow records.

#### 4. Get Total Borrow Count
- **Endpoint**: `GET /borrow-count?email=user@example.com`
- **Auth**: No
- **Response**:
  ```json
  {
    "count": 3
  }
  ```

---

## 🗄️ Database Collections

The application connects to the `book_nook` MongoDB database with two primary collections:

1. **`books`**: Stores book catalog data:
   - `title` (String)
   - `author` (String)
   - `image` (String)
   - `description` (String)
   - `category` (String)
   - `copies` (Number)
   - `userEmail` (String)
   - `createdAt` (Date)
2. **`borrows`**: Stores active borrow transactions:
   - `bookId` (String / ObjectId)
   - `userEmail` (String)
   - Additional borrow metadata (e.g., return dates)

---

## 🚢 Deployment

### Deploying to Vercel

This repository includes a [`vercel.json`](./vercel.json) build specification. To deploy:

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Link and deploy:
   ```bash
   vercel
   ```
3. Set the required Environment Variables in the Vercel Dashboard:
   - `DB_URI`
   - `CLIENT_URL`
4. Deploy to production:
   ```bash
   vercel --prod
   ```

---

## 🔒 Security Practices

- **Token Authentication**: Route verification via JWT using JWKS remote keyset validation.
- **Duplicate Prevention**: Safeguards against redundant entries and duplicate active borrows.
- **Input Sanitization**: Strings trimmed before insertion to prevent whitespace discrepancies.
- **Environment Isolation**: Sensitive configuration values are managed strictly through environment variables.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
