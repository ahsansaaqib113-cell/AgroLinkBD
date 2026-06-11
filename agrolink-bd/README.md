# AgroLink BD - AgriTech Marketplace

AgroLink BD is a responsive, production-ready full-stack AgriTech marketplace designed for Bangladesh. It directly connects local farmers with consumers, restaurants, retailers, and wholesalers—eliminating middlemen, offering fair price transparency, and giving buyers fresh crops.

## Key Features

- **Multi-Role Dashboards**: Specific views and privileges for Customers, Farmers, Business Buyers (Wholesale), and Administrators.
- **Fair Pricing Comparisons**: Direct comparisons of local middlemen rates vs transparent AgroLink rates.
- **Smart Agricultural Weather**: Weather alerts and tailored crop planting/harvesting tips per Bangladeshi district.
- **AI Crop Disease Diagnosis**: Simulated visual tissue scanner that isolates leaf symptoms (potato, tomato, rice) and advises organic/chemical treatments.
- **Secure Sandbox Checkout**: Interactive checkout using mock bKash verification screens, Nagad, and Credit Card portals.
- **Order split logistics**: Multi-farmer shopping carts are automatically divided into separate orders per farmer for independent logistics.
- **Bulk Tender Requests**: Wholesale buyers can publish bulk crop requests and receive competitive bids/proposals from local farmers.

---

## Tech Stack

- **Frontend**: React.js (Vite), Tailwind CSS, Lucide React, Axios, React Router.
- **Backend**: Node.js, Express.js, JWT Authentication.
- **Database**: MongoDB (Mongoose schemas).

---

## Folder Structure

```
agrolink-bd/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection
│   │   ├── controllers/     # Route logic handlers
│   │   ├── middleware/      # Auth & Role verification
│   │   ├── models/          # Mongoose schemas (User, Farmer, Product, Order, etc.)
│   │   └── routes/          # Express API route registrations
│   ├── seed.js              # Database seeder
│   ├── server.js            # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # UI widgets (Navbar, Footer, Weather, Pricing)
│   │   ├── context/         # React state contexts (Auth, Cart, Dark Theme)
│   │   ├── pages/           # Pages (Home, Marketplace, Crop Disease, Login/Register)
│   │   ├── services/        # Axios configurations
│   │   └── App.jsx          # Route mapping
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
└── README.md
```

---

## Mongoose Schemas (Database Models)

1. **User**: Credentials, addresses, status (active/suspended), and role (customer, farmer, business, admin).
2. **Farmer**: Connected to User; stores farm name, description, size in acres, focusing crop list, rating, and total earnings.
3. **Product**: Retail and wholesale prices, min wholesale quantity, units (kg, maund, piece, sack), stock, rating, and moderation state.
4. **Order**: Tracks buyer/farmer connections, billing, status (pending, processing, shipped, delivered), coupon discounts, and unique invoices.
5. **BulkRequest**: Allows wholesale buyers to submit tenders; includes a list of bidding proposals from farmers.
6. **Coupon**: Codes, active status, minimum order amount, and type (flat / percentage).
7. **Notification**: User-specific alerts for order statuses, payments, and system notices.

---

## API Routes Reference

### Authentication (`/api/auth`)
- `POST /register`: Registers user. Creates farmer profile if role is 'farmer'.
- `POST /login`: Logs in user and returns JWT.
- `GET /profile`: Fetch logged-in user profile.
- `PUT /profile`: Update profile fields.
- `GET /users`: (Admin) Lists all users.
- `PUT /users/:id/status`: (Admin) Suspends/Activates accounts.

### Products (`/api/products`)
- `GET /`: Get all products with keyword, category, price, and rating filters.
- `GET /categories`: Fetch all categories.
- `POST /`: (Farmer) Add a crop listing.
- `PUT /:id`: (Farmer/Admin) Update crop details.
- `DELETE /:id`: (Farmer/Admin) Remove crop listing.
- `PUT /:id/moderate`: (Admin) Approve/Reject crop listing.

### Orders (`/api/orders`)
- `POST /`: Create orders (groups cart items by farmer and creates independent orders).
- `GET /myorders`: Get customer's orders.
- `GET /farmer`: (Farmer) Get orders received.
- `PUT /:id/pay`: Confirm order payment.
- `PUT /:id/shipping`: (Farmer/Admin) Update shipping status (delivering adds earnings to farmer profile).
- `POST /coupons/validate`: Validate promo coupon code.

### Bulk Tender Requests (`/api/bulk`)
- `POST /`: (Business Buyer) Publish tender requests.
- `GET /`: List all active tenders.
- `GET /my`: (Business Buyer) List my tenders with bids.
- `POST /:id/proposals`: (Farmer) Submit a proposal/bid.
- `PUT /:id/proposals/:proposalId/accept`: (Business Buyer) Accept farmer's proposal.

### Smart Operations (`/api/smart`)
- `GET /weather`: Get district-specific weather parameters and agricultural planting advice.
- `GET /prices`: Get transparent commodity prices.
- `POST /crop-scan`: Run simulated crop tissue scans for potato, tomato, or rice diseases.

---

## Setup & Running Locally

### Prerequisites
- [Node.js](https://nodejs.org) (v18+)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally on port 27017.

### Installation Steps

1. **Clone and open the directory**:
   ```bash
   cd agrolink-bd
   ```

2. **Setup and run Express Backend**:
   ```bash
   cd backend
   npm install
   # Run DB seeder to populate categories, coupons, and test accounts
   npm run seed
   # Start server in dev mode (requires nodemon)
   npm run dev
   ```
   *The backend will run on `http://localhost:5000`.*

3. **Setup and run React Frontend**:
   ```bash
   cd ../frontend
   npm install
   # Run development server
   npm run dev
   ```
   *The frontend will run on `http://localhost:3000`.*

### Testing Accounts (Password: `password123`)
- **Admin**: `admin@agrolink.com`
- **Farmer**: `rahim@agrolink.com`
- **Business Buyer**: `restaurant@agrolink.com`
- **Customer**: `buyer@agrolink.com`

---

## Deployment Guide

### MongoDB Atlas Setup
1. Create a free cluster on MongoDB Atlas.
2. Under "Network Access", allow access from all IPs (`0.0.0.0/0`).
3. Under "Database Access", create a user and password.
4. Copy the connection string (URI) and replace the local MongoDB URI in the `.env` file:
   `MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/agrolink`

### Backend Deploy (e.g. Render / Heroku)
1. Link your GitHub repository to Render/Heroku.
2. Select Web Service, set Root Directory to `backend`.
3. Set build command to `npm install` and start command to `npm start`.
4. Configure Environment Variables in the service settings page:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `MONGODB_URI=your_mongodb_atlas_uri`
   - `JWT_SECRET=your_production_secret_key`

### Frontend Deploy (e.g. Vercel / Netlify)
1. In your frontend repository, configure the build settings.
2. Set Root Directory to `frontend`.
3. Set build command to `npm run build` and publish directory to `dist`.
4. In production environments, configure API routing or change the Axios base URL inside `api.js` to point directly to your deployed backend URL.
