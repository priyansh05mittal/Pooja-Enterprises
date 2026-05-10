# ShopElite — Full-Stack E-Commerce Platform

A production-ready, multi-category e-commerce application built with React + Vite (frontend) and Node.js + Express + MongoDB (backend).

---

## 📦 Project Structure

```
ecommerce/
├── backend/               # Node.js + Express API
│   ├── config/            # Cloudinary config
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Auth middleware
│   ├── models/            # Mongoose schemas
│   ├── routes/            # Express routes
│   ├── utils/             # Email helpers
│   ├── server.js          # Entry point
│   └── .env.example       # Environment template
│
├── frontend/              # React + Vite SPA
│   ├── src/
│   │   ├── api/           # Axios instance
│   │   ├── components/    # Reusable components
│   │   │   ├── common/    # ProductCard, LoadingScreen
│   │   │   └── layout/    # Navbar, Footer, AdminLayout
│   │   ├── context/       # AuthContext, CartContext
│   │   ├── pages/
│   │   │   ├── user/      # Home, Products, Cart, etc.
│   │   │   └── admin/     # Dashboard, Products, Orders, etc.
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
└── README.md
```

---

## 🚀 Tech Stack

### Frontend
| Package | Purpose |
|---|---|
| React 18 + Vite | UI framework & build tool |
| Tailwind CSS | Utility-first styling |
| React Router DOM | Client-side routing |
| TanStack Query | Server state management |
| Framer Motion | Animations & transitions |
| Lucide React | Icon library |
| React Hot Toast | Notification toasts |
| Swiper | Banner carousel |
| Recharts | Admin analytics charts |
| Socket.io Client | Real-time notifications |
| Axios | HTTP client |

### Backend
| Package | Purpose |
|---|---|
| Express.js | Web framework |
| MongoDB + Mongoose | Database |
| JWT + bcryptjs | Authentication |
| Cloudinary + Multer | Image uploads |
| Nodemailer | OTP emails |
| Razorpay | Payment gateway |
| Socket.io | Real-time events |
| Helmet, HPP, CORS | Security headers |
| Express Rate Limit | Rate limiting |
| Morgan | HTTP logging |
| Slugify | URL-friendly slugs |

---

## ⚙️ Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB Atlas account
- Cloudinary account
- Razorpay account (test mode)
- Gmail app password (for SMTP)
- Google Cloud Console project (for OAuth)

---

## 🔧 Backend Setup

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create your `.env` file
```bash
cp .env.example .env
```

### 4. Fill in all environment variables (see below)

### 5. Start the backend
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The API will run at `http://localhost:5000`

---

## 🖥️ Frontend Setup

### 1. Navigate to frontend directory
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create your `.env` file
```bash
cp .env.example .env
```

### 4. Start the frontend
```bash
# Development
npm run dev

# Production build
npm run build
npm run preview
```

The app will run at `http://localhost:5173`

---

## 🔐 Environment Variables

### Backend `.env`

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ecommerce
# Get from: https://cloud.mongodb.com → Connect → Drivers

# JWT Auth
JWT_SECRET=your_super_secret_key_at_least_32_chars_long
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Session
SESSION_SECRET=another_secret_key_for_sessions

# Cloudinary (image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
# Get from: https://cloudinary.com → Dashboard

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_gmail@gmail.com
SMTP_PASSWORD=your_16_char_app_password
FROM_EMAIL=your_gmail@gmail.com
FROM_NAME=ShopElite
# Gmail: Settings → Security → 2FA → App Passwords → Generate

# Razorpay (payments)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
# Get from: https://dashboard.razorpay.com → Settings → API Keys

# Google OAuth
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
# Get from: https://console.cloud.google.com → APIs → OAuth 2.0

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

---

## 🌐 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google+ API** and **Google Identity**
4. Go to **Credentials → Create Credentials → OAuth 2.0 Client ID**
5. Set Authorized JavaScript origins: `http://localhost:5173`
6. Set Authorized redirect URIs: `http://localhost:5173`
7. Copy **Client ID** → `GOOGLE_CLIENT_ID` in backend `.env` and `VITE_GOOGLE_CLIENT_ID` in frontend `.env`
8. Add Google Sign-In button in Login.jsx:

```jsx
// In Login.jsx, add in useEffect:
useEffect(() => {
  if (window.google) {
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        const { data } = await api.post('/auth/google', { credential: response.credential });
        login(data.user, data.token);
        navigate('/');
      }
    });
    window.google.accounts.id.renderButton(
      document.getElementById('googleSignInDiv'),
      { theme: 'filled_black', size: 'large', width: '100%' }
    );
  }
}, []);
```

9. Add Google script to `index.html`:
```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

---

## 💳 Razorpay Setup

1. Create account at [Razorpay](https://razorpay.com)
2. Go to **Settings → API Keys → Generate Test Key**
3. Copy **Key ID** and **Key Secret** into your backend `.env`
4. Test cards: `4111 1111 1111 1111` (Visa), CVV: any 3 digits, Expiry: any future date

---

## 📧 Gmail SMTP Setup

1. Enable 2-Factor Authentication on your Gmail
2. Go to **Google Account → Security → App passwords**
3. Select **Mail** and **Windows Computer**
4. Copy the 16-character password to `SMTP_PASSWORD` in your `.env`

---

## 🗄️ MongoDB Atlas Setup

1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free M0 cluster
3. Add your IP to the whitelist (or use `0.0.0.0/0` for dev)
4. Create a database user
5. Get connection string → replace in `MONGODB_URI`

---

## 🛠️ Creating the First Admin User

After registering a user normally, update their role in MongoDB:

```javascript
// In MongoDB Atlas → Collections → users
// Find your user and update:
{ $set: { role: "admin", isVerified: true } }
```

Or use MongoDB Compass / Atlas Data Explorer to set `role: "admin"`.

---

## 🏗️ Production Deployment

### Backend (Railway / Render / VPS)
```bash
# Set NODE_ENV=production in your environment
# Set all .env variables in your host's dashboard
npm start
```

### Frontend (Vercel / Netlify)
```bash
npm run build
# Deploy the /dist folder
# Set VITE_API_URL to your production API URL
```

### Nginx Config (if self-hosting)
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    location / {
        root /var/www/ecommerce/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register with name/email/password |
| POST | `/api/auth/verify-otp` | Verify email OTP |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/google` | Google OAuth login |
| POST | `/api/auth/forgot-password` | Send reset OTP |
| POST | `/api/auth/reset-password` | Reset with OTP |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| POST | `/api/auth/address` | Add address |

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | List with filters |
| GET | `/api/products/:slug` | Product detail |
| POST | `/api/products` | Create (admin) |
| PUT | `/api/products/:id` | Update (admin) |
| DELETE | `/api/products/:id` | Delete (admin) |
| POST | `/api/products/:id/review` | Add review |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/orders` | Create order |
| POST | `/api/orders/verify-payment` | Verify Razorpay |
| GET | `/api/orders/my` | User orders |
| GET | `/api/orders/:id` | Order detail |
| GET | `/api/orders` | All orders (admin) |
| PUT | `/api/orders/:id/status` | Update status (admin) |

### Cart & Wishlist
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/cart` | Get cart |
| POST | `/api/cart/add` | Add to cart |
| PUT | `/api/cart/item/:id` | Update quantity |
| DELETE | `/api/cart/item/:id` | Remove item |
| GET | `/api/wishlist` | Get wishlist |
| POST | `/api/wishlist/toggle` | Toggle wishlist item |

---

## ✨ Features Implemented

### User Side
- ✅ Email OTP registration & verification
- ✅ Login / Logout with JWT
- ✅ Forgot & Reset password via OTP
- ✅ Google OAuth 2.0 integration
- ✅ Dynamic banner slider (Swiper)
- ✅ Featured products section
- ✅ Multi-level category browsing
- ✅ Product listing with filters (category, price, rating, sort)
- ✅ Full-text product search
- ✅ Product detail with dynamic attributes & features
- ✅ Image gallery with thumbnail switcher
- ✅ Star ratings & customer reviews
- ✅ Cart with quantity control (no page redirect on add)
- ✅ Cart badge counter with real-time update
- ✅ Wishlist with add/remove and "Move to Cart"
- ✅ Checkout with address selection (max 5 addresses)
- ✅ COD & Razorpay payment integration
- ✅ Order history with status badges
- ✅ Order detail with visual tracking timeline
- ✅ User profile with address management
- ✅ Real-time order notifications via Socket.io

### Admin Panel
- ✅ Dashboard with KPI stats
- ✅ Revenue & orders charts (Recharts)
- ✅ Product CRUD with dynamic attributes, features, Cloudinary images
- ✅ Multi-level category management
- ✅ Banner management with scheduling & click tracking
- ✅ Order management with status updates
- ✅ User management with block/unblock
- ✅ Full analytics page with stock analysis

---

## 🔒 Security

- JWT stored in httpOnly cookies + localStorage fallback
- Bcrypt password hashing (12 rounds)
- Rate limiting on all `/api` routes (100/15min) and stricter on `/api/auth` (20/15min)
- Helmet for secure HTTP headers
- HPP for HTTP parameter pollution prevention
- CORS restricted to CLIENT_URL origin
- Input validation with express-validator
- MongoDB injection prevention via Mongoose
- Razorpay signature verification for payments

---

## 📄 License

MIT License — free to use, modify, and distribute.