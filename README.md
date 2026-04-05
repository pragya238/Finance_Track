# 💰 Smart Finance Tracker Dashboard

A production-style full-stack finance tracker with role-based access control, JWT authentication, and a clean React frontend.

---

## 🏗️ Project Structure

```
smart-finance-tracker/
├── backend/
│   ├── controllers/        # Route handlers (thin layer, calls services)
│   │   ├── authController.js
│   │   ├── transactionController.js
│   │   ├── dashboardController.js
│   │   └── userController.js
│   ├── routes/             # Express route definitions
│   │   ├── authRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── userRoutes.js
│   ├── models/             # Mongoose schemas
│   │   ├── User.js
│   │   └── Transaction.js
│   ├── middleware/         # Express middleware
│   │   ├── authMiddleware.js     # JWT protect + authorize(roles)
│   │   ├── validationMiddleware.js
│   │   └── errorHandler.js
│   ├── services/           # Business logic (keep controllers thin)
│   │   ├── authService.js
│   │   ├── transactionService.js
│   │   └── dashboardService.js
│   ├── utils/
│   │   ├── db.js           # MongoDB connection
│   │   ├── jwtHelper.js    # Token generation/verification
│   │   └── responseHelper.js   # Consistent API responses
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── context/
        │   └── AuthContext.js   # Global auth state (React Context)
        ├── services/
        │   └── api.js           # Axios instance + all API calls
        ├── components/
        │   ├── Sidebar.js
        │   └── AddTransactionModal.js
        ├── pages/
        │   ├── LoginPage.js
        │   ├── RegisterPage.js
        │   ├── DashboardPage.js
        │   ├── TransactionsPage.js
        │   ├── InsightsPage.js
        │   └── UsersPage.js
        ├── App.js
        ├── index.js
        └── index.css
```

---

## ⚙️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB + Mongoose                  |
| Auth       | JWT + bcryptjs                      |
| Validation | express-validator                   |
| Frontend   | React 18, Axios                     |

---

## 🚀 Running Locally

### Prerequisites
- Node.js v18+ installed
- MongoDB running locally on port 27017 (or a MongoDB Atlas URI)

---

### Step 1 — Clone / set up the project

```bash
# If using this as a folder, navigate into it
cd smart-finance-tracker
```

---

### Step 2 — Set up the Backend

```bash
cd backend

# Install dependencies
npm install

# Create your .env file from the example
cp .env.example .env
```

Edit `.env` with your values:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart-finance-tracker
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=7d
```

```bash
# Start the backend (development mode with auto-reload)
npm run dev

# Or in production mode
npm start
```

The API will be running at: **http://localhost:5001**

---

### Step 3 — Set up the Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Start the React dev server
npm start
```

The app will open at: **http://localhost:3000**

> The `"proxy": "http://localhost:5000"` in `frontend/package.json` routes all `/api/...` calls to the backend automatically.

---

## 👥 Role Permissions

| Action                      | Viewer | Analyst | Admin |
|-----------------------------|--------|---------|-------|
| View dashboard              | ✅     | ✅      | ✅    |
| View transactions           | ✅     | ✅      | ✅    |
| Create transactions         | ❌     | ✅      | ✅    |
| Update transactions         | ❌     | ✅      | ✅    |
| Delete transactions         | ❌     | ❌      | ✅    |
| View insights               | ❌     | ✅      | ✅    |
| Manage users (CRUD)         | ❌     | ❌      | ✅    |

---

## 📦 MongoDB Schema Design

### User
```js
{
  name:      String (required, max 50)
  email:     String (required, unique, lowercase)
  password:  String (required, hashed, min 6)
  role:      String (enum: viewer | analyst | admin, default: viewer)
  isActive:  Boolean (default: true)
  createdAt: Date
  updatedAt: Date
}
```

### Transaction
```js
{
  user:        ObjectId → ref: User
  amount:      Number (required, min 0.01)
  type:        String (enum: income | expense)
  category:    String (enum: salary | food | transport | ...)
  description: String (optional, max 200)
  date:        Date (required)
  createdAt:   Date
  updatedAt:   Date
}
```

---

## 🔗 API Endpoints

### Auth
| Method | Endpoint              | Access      | Description         |
|--------|-----------------------|-------------|---------------------|
| POST   | `/api/auth/register`  | Public      | Register new user   |
| POST   | `/api/auth/login`     | Public      | Login, get JWT      |
| GET    | `/api/auth/me`        | All users   | Get own profile     |

### Transactions
| Method | Endpoint                  | Access           | Description               |
|--------|---------------------------|------------------|---------------------------|
| GET    | `/api/transactions`       | All users        | List (filter by params)   |
| POST   | `/api/transactions`       | Analyst + Admin  | Create transaction        |
| GET    | `/api/transactions/:id`   | All users        | Get single transaction    |
| PUT    | `/api/transactions/:id`   | Analyst + Admin  | Update transaction        |
| DELETE | `/api/transactions/:id`   | Admin only       | Delete transaction        |

### Dashboard
| Method | Endpoint                    | Access           | Description              |
|--------|-----------------------------|------------------|--------------------------|
| GET    | `/api/dashboard`            | All users        | Summary stats            |
| GET    | `/api/dashboard/insights`   | Analyst + Admin  | Deep category insights   |

### Users (Admin only)
| Method | Endpoint          | Access     | Description       |
|--------|-------------------|------------|-------------------|
| GET    | `/api/users`      | Admin only | List all users    |
| GET    | `/api/users/:id`  | Admin only | Get user by ID    |
| PUT    | `/api/users/:id`  | Admin only | Update role/status|
| DELETE | `/api/users/:id`  | Admin only | Delete user       |

---

## 🔍 Transaction Filter Query Params

```
GET /api/transactions?type=expense&category=food&startDate=2024-01-01&endDate=2024-12-31&limit=20
```

| Param       | Example              | Description                |
|-------------|----------------------|----------------------------|
| `type`      | `income` / `expense` | Filter by type             |
| `category`  | `food`               | Filter by category         |
| `startDate` | `2024-01-01`         | From date (ISO)            |
| `endDate`   | `2024-12-31`         | To date (ISO)              |
| `limit`     | `20`                 | Max results (default 100)  |

---

## 🔐 Authentication

All protected routes require:
```
Authorization: Bearer <your_jwt_token>
```

The JWT is returned from `/api/auth/register` and `/api/auth/login`.

---

## ✅ Architecture Decisions

- **MVC Pattern**: Routes → Controllers → Services → Models. Controllers are thin — all business logic lives in services.
- **Middleware chain**: `protect` verifies JWT → `authorize(roles)` checks role → `validateX` validates body → controller runs.
- **Consistent responses**: All endpoints return `{ success, message, data }` via `responseHelper.js`.
- **Password security**: bcrypt with salt rounds of 12. Password field excluded from queries by default (`select: false`).
- **MongoDB indexes**: Transactions indexed on `(user, date)`, `(user, type)`, `(user, category)` for fast dashboard aggregations.
