# EventNest Backend – Complete Documentation

## 🔧 Backend Setup & Architecture

### Overview
The EventNest backend is built with **Node.js + Express.js** and provides a RESTful API for:
- User authentication with JWT
- Event CRUD operations
- RSVP management
- Feedback and ratings
- Advanced filtering and search

---

## 📦 Installation

```bash
cd eventnest-backend
npm install
```

### Dependencies

```json
{
  "express": "^4.18.0",
  "mongoose": "^6.x.x",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.0",
  "cors": "^2.8.5",
  "dotenv": "^16.0.0"
}
```

---

## 🗂️ Project Structure

```
eventnest-backend/
├── models/
│   ├── Event.js         # Event schema
│   └── User.js          # User schema
├── controllers/
│   ├── eventController.js  # Event CRUD logic
│   ├── userController.js   # User profile logic
│   └── authController.js   # Auth logic (register, login)
├── routes/
│   ├── events.js        # Event routes
│   ├── users.js         # User routes
│   └── auth.js          # Auth routes
├── middleware/
│   ├── auth.js          # JWT verification
│   └── async.js         # Async error wrapper
├── utils/
│   └── errorResponse.js # Error handling
├── .env                 # Environment variables
├── server.js            # Express app setup
└── package.json
```

---

## 🔐 Authentication Flow

### JWT Token Generation

```javascript
// In authController.js
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRE
});
```

### Protected Route Usage

```javascript
// Middleware: auth.js
router.post('/events', protect, createEvent);

// protect middleware verifies JWT from Authorization header
// Format: Authorization: Bearer <token>
```

---

## 📊 Database Models

### User Model

```javascript
// models/User.js
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: String,
  profileImage: String,
  preferences: {
    categories: [String],
    notifications: { type: Boolean, default: true }
  },
  createdAt: { type: Date, default: Date.now }
});

// Password hashing before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Password comparison method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
```

### Event Model

```javascript
// models/Event.js
const eventSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  location: String,
  date: Date,
  organizer: String,
  category: {
    type: String,
    enum: ['Health', 'Environment', 'Education', 'Community']
  },
  capacity: Number,
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  tags: [String],
  isVirtual: Boolean,
  meetingLink: String,
  feedback: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});
```

---

## 🔌 API Endpoints

### Authentication Routes

#### 1. Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response: { success: true, token: "jwt_token" }
```

#### 2. Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: { success: true, token: "jwt_token" }
```

#### 3. Update Password
```
PUT /api/auth/updatepassword
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}

Response: { success: true, token: "new_jwt_token" }
```

### Event Routes

#### 1. Get All Events (Public)
```
GET /api/events?page=1&limit=10&category=Environment&location=Park&search=plantation

Response:
{
  "success": true,
  "count": 10,
  "pagination": {
    "next": { "page": 2, "limit": 10 }
  },
  "data": [...]
}
```

#### 2. Get Single Event (Public)
```
GET /api/events/:id

Response:
{
  "success": true,
  "data": {
    "_id": "507f...",
    "title": "Tree Plantation",
    "participants": ["user1", "user2"],
    "avgRating": 4.5,
    ...
  }
}
```

#### 3. Create Event (Protected)
```
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Tree Plantation Drive",
  "description": "Join us...",
  "location": "City Park",
  "date": "2025-11-15T09:00:00Z",
  "category": "Environment",
  "organizer": "GreenEarth NGO"
}

Response: { success: true, data: { _id: "...", ... } }
```

#### 4. Update Event (Protected)
```
PUT /api/events/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description"
}

Response: { success: true, data: { ... } }
```

#### 5. Delete Event (Protected)
```
DELETE /api/events/:id
Authorization: Bearer <token>

Response: { success: true, data: {} }
```

#### 6. RSVP for Event (Protected)
```
POST /api/events/:id/rsvp
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_id_optional"
}

Response: { success: true, data: { participants: [...], ... } }
```

#### 7. Add Feedback (Protected)
```
POST /api/events/:id/feedback
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "comment": "Amazing event!"
}

Response: { success: true, data: { ... } }
```

### User Routes

#### 1. Get Current User Profile (Protected)
```
GET /api/users/me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "bio": "...",
    ...
  }
}
```

#### 2. Update User Profile (Protected)
```
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "bio": "Community volunteer",
  "preferences": { "categories": ["Environment", "Health"] }
}

Response: { success: true, data: { ... } }
```

---

## 🛡️ Middleware

### Auth Middleware

```javascript
// middleware/auth.js
exports.protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Token invalid' });
  }
};
```

### Async Error Wrapper

```javascript
// middleware/async.js
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage in controller:
exports.getEvents = asyncHandler(async (req, res) => {
  // No try-catch needed, errors automatically caught
});
```

---

## 🔍 Query Features

### Search
```
GET /api/events?search=plantation
Searches in: title, description, organizer
```

### Filter by Category
```
GET /api/events?category=Environment
```

### Filter by Location
```
GET /api/events?location=Park
```

### Pagination
```
GET /api/events?page=2&limit=10
```

### Combine Filters
```
GET /api/events?search=tree&category=Environment&location=Park&page=1&limit=10
```

---

## ✅ Input Validation

### Event Creation Validation

```javascript
// In controller
if (!title || !location || !date) {
  return next(new ErrorResponse('Required fields missing', 400));
}

if (new Date(date) < new Date()) {
  return next(new ErrorResponse('Date cannot be in the past', 400));
}

if (!['Health', 'Environment', 'Education', 'Community'].includes(category)) {
  return next(new ErrorResponse('Invalid category', 400));
}
```

### User Registration Validation

```javascript
// Check email format
if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
  return next(new ErrorResponse('Invalid email format', 400));
}

// Check password strength
if (password.length < 6) {
  return next(new ErrorResponse('Password too short', 400));
}

// Check if user exists
const user = await User.findOne({ email });
if (user) {
  return next(new ErrorResponse('Email already registered', 400));
}
```

---

## 🧪 Testing with cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123456"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# Get events
curl http://localhost:5000/api/events

# Create event (requires token)
curl -X POST http://localhost:5000/api/events \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Event","description":"Desc",
    "location":"Place","date":"2025-11-15T09:00:00Z",
    "category":"Health","organizer":"Org"
  }'
```

---

## 🚀 Environment Setup

Create `.env` file:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eventnest?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRE=7d
NODE_ENV=development
```

---

## 📈 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| CORS error | Ensure `app.use(cors())` in server.js |
| MongoDB connection fails | Check MONGODB_URI in .env |
| JWT error | Verify JWT_SECRET matches in .env |
| Port already in use | `lsof -i :5000` (Mac/Linux) or `netstat -ano | findstr :5000` (Windows) |
| Routes not found | Ensure route files are mounted in server.js |

---

## 🔄 Sample Workflow

1. **User registers** → `POST /api/auth/register`
2. **Receive JWT token** → Store in frontend
3. **Browse events** → `GET /api/events`
4. **Create event** → `POST /api/events` (with token)
5. **RSVP for event** → `POST /api/events/:id/rsvp` (with token)
6. **Add feedback** → `POST /api/events/:id/feedback` (with token)
7. **Get profile** → `GET /api/users/me` (with token)

---

## 📚 Further Reading

- [Express.js Handbook](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Handbook](https://auth0.com/resources/ebooks/jwt-handbook)
- [RESTful API Best Practices](https://restfulapi.net/)
