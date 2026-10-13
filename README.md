# MyCart Bliss — E-Commerce Application

A modern, full-stack e-commerce web application featuring user authentication, product cataloging, interactive shopping cart management, and a simulated payment gateway.

---

## 🚀 Live Demo

- **Application URL:** [https://mycart-bliss.vercel.app/](https://mycart-bliss.vercel.app/)

---

## 🔑 Test Credentials (For Recruiters / Testers)

You can use the following test user account to sign in and test the application features:

- **Email:** `john@gmail.com`
- **Password:** `johnDoe123**`

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Vite
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (Hosted on NeonDB)
- **API Integration:** DummyJSON API (Product catalog)

---

## ⚙️ Environment Variables Template (`.env`)


### 1. Frontend (`client/.env`)
```env
VITE_APP_BASE_URL=https://dummyjson.com
# For local development:
VITE_SERVER_URL=http://localhost:5000/api
```

### 2. Backend (`server/.env`)
```env
PORT=5000
DATABASE_URL=your_postgresql_neon_db_url
JWT_SECRET=your_jwt_secret_key
Gmail_USER=your_email@gmail.com
Gmail_SeCRET=your_gmail_app_password
```

---

## 💻 Local Setup & Development Instructions

To run **MyCart Bliss** locally on your machine, follow these steps:

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

---

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd e-commerce_website
```

---

### Step 2: Configure and Start the Backend Server

1. Navigate to the backend directory:
   ```bash
   cd ecommerce_backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `ecommerce_backend` directory and add the backend environment variables as shown above.
4. Start the backend development server:
   ```bash
   npm run dev
   # or
   node index.js
   ```
   The backend server will run on `http://localhost:5000`.

---

### Step 3: Configure and Start the Frontend Application

1. Open a new terminal tab/window and navigate to the frontend directory:
   ```bash
   cd e-commerce_website
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `e-commerce_website` directory and ensure `VITE_SERVER_URL` points to your local backend (`http://localhost:5000/api`):
   ```env
   VITE_APP_BASE_URL=https://dummyjson.com
   VITE_SERVER_URL=http://localhost:5000/api
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to the local URL provided by Vite (usually `http://localhost:5173`).
