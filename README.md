# Construction Management System (CMS) - Backend API

This repository houses the server-side RESTful API that handles business logic, security authentication, database management, and status triggers for the Construction Management System.

## 🛠️ Tech Stack

* **Runtime/Framework:** Node.js with Express.js (or Python with Django/FastAPI)
* **Database:** PostgreSQL (Relational structure for relational tables like Budgets, Materials, Logs)
* **ORM:** Prisma / Sequelize (or Django ORM)
* **Security:** JSON Web Tokens (JWT) & bcrypt hashing
* **Validation:** Zod / Joi

## 📂 Core API Architecture & Routes

The API enforces strict Role-Based Access Control (RBAC). Below are the core accessible routes:

### Authentication
* `POST /api/v1/auth/register` - Create a user profile.
* `POST /api/v1/auth/login` - Authenticate user and return a token session.

### Projects & Milestones
* `GET /api/v1/projects` - Fetch all projects assigned to the requester.
* `POST /api/v1/projects/:id/milestones` - Append building phases (Manager only).

### Materials & Site Inventory
* `GET /api/v1/inventory` - Review global inventory lists.
* `PATCH /api/v1/inventory/deduct` - Log daily raw material usage from the field.

### Daily Work Logs
* `POST /api/v1/logs` - Submit daily contractor site documentation.

## ⚙️ Getting Started

### Prerequisites
* Node.js installed locally.
* A live instance of PostgreSQL (Dockerized or hosted on Supabase/Neon).

### Installation & Run

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Configure your Environment Variables:
   Create a `.env` file in the root of this folder:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://user:password@localhost:5432/cms_db?schema=public
   JWT_SECRET=your_jwt_signing_secret_string
   ```

4. Run Database Migrations:
   ```bash
   npx prisma migrate dev  # If using Prisma
   ```

5. Spin up the server:
   ```bash
   npm run dev
   ```
   The backend API will initialize at [http://localhost:5000](http://localhost:5000).
