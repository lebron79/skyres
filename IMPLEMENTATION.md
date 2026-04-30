# SkyRes - Project Structure & Implementation

## 📁 Project Layout

```
skyres/
├── back/                          # Spring Boot Backend
│   └── src/main/java/com/skyres/
│       ├── config/
│       │   └── SecurityConfig.java    # JWT + CORS + Auth
│       ├── controller/
│       │   ├── AuthController.java    # Login/Register endpoints
│       │   ├── UserController.java    # Profile CRUD endpoints
│       │   └── FileUploadController.java  # Image upload
│       ├── service/
│       │   └── impl/UserServiceImpl.java   # Business logic
│       ├── security/
│       │   ├── JwtUtil.java           # JWT token generation
│       │   ├── JwtFilter.java         # JWT validation
│       │   └── UserDetailsServiceImpl.java
│       ├── dto/
│       │   ├── request/               # Input DTOs
│       │   │   ├── RegisterRequest.java
│       │   │   ├── LoginRequest.java
│       │   │   ├── UpdateUserRequest.java
│       │   │   └── ChangePasswordRequest.java
│       │   └── response/
│       │       ├── AuthResponse.java  # Login response
│       │       └── UserProfileResponse.java
│       └── model/
│           └── entity/User.java       # User database model
│
├── front/src/                     # React Frontend
│   ├── App.jsx                    # Main router
│   ├── App.css                    # Landing page styles
│   ├── Login.jsx                  # Login/Register form
│   ├── Login.css                  # Form styling
│   ├── AuthContext.jsx            # Global auth state
│   ├── UserMenu.jsx               # User dropdown
│   ├── Settings.jsx               # Profile management
│   ├── Settings.css               # Settings modal
│   └── main.jsx                   # Entry point
│
├── uploads/profiles/              # Profile images (created at runtime)
│   └── {userId}_{uuid}.{ext}
│
└── *.md files                     # Documentation
```

---

## 🔄 How Data Flows

### Registration Flow
```
User fills form
    ↓
Frontend validates all fields
    ↓
POST /api/auth/register
    ↓
Backend creates user + hashes password
    ↓
Returns JWT token + full user profile
    ↓
Frontend stores token in localStorage + AuthContext
    ↓
Auto-login → Landing page
```

### Login Flow
```
User enters credentials
    ↓
POST /api/auth/login
    ↓
Backend validates password
    ↓
Returns JWT token + full user profile
    ↓
Frontend stores token + user data
    ↓
Auto-redirect → Landing page
```

### Profile Image Upload
```
User selects image
    ↓
Frontend validates (type, size)
    ↓
POST /api/upload/profile-image (with JWT)
    ↓
Backend saves file to uploads/profiles/
    ↓
Updates user.photoUrl in database
    ↓
Frontend displays image in avatar
    ↓
Image persists across sessions
```

### Change Password
```
User enters passwords
    ↓
Frontend validates (8+ chars, match)
    ↓
POST /api/users/{id}/change-password
    ↓
Backend verifies current password
    ↓
Hashes new password and saves
    ↓
Frontend shows success message
```

---

## 🔑 Key Files to Know

**Critical Backend Files**
- `SecurityConfig.java` - JWT configuration, CORS, authentication
- `AuthController.java` - Register/Login endpoints
- `UserServiceImpl.java` - Business logic for profile management
- `FileUploadController.java` - Image upload/download

**Critical Frontend Files**
- `AuthContext.jsx` - State management for authentication
- `Login.jsx` - Registration and login forms with validation
- `Settings.jsx` - Profile management modal
- `main.jsx` - Wraps app with AuthProvider

---

## 🚀 Build & Run

### Prerequisites
- Java 17+
- Node.js 20+
- MySQL with database `skyres`

### Commands
```bash
# Backend
cd back && mvn spring-boot:run

# Frontend (in new terminal)
cd front && npm run dev
```

### URLs
- Frontend: http://localhost:5173
- Backend: http://localhost:8080
- Swagger API Docs: http://localhost:8080/swagger-ui/index.html

---

## 📦 Dependencies

**Backend (Maven)**
- Spring Boot 3.3.4
- Spring Security
- Spring Data JPA
- MySQL Connector
- JWT (io.jsonwebtoken)
- Lombok
- Swagger/OpenAPI

**Frontend (npm)**
- React 19
- No external dependencies needed (uses vanilla CSS)

---

## 💾 Database Schema

```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL (hashed),
  phone VARCHAR(30),
  photo_url VARCHAR(255),
  bio TEXT,
  role ENUM('TOURIST', 'GUIDE', 'ADMIN') DEFAULT 'TOURIST',
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## ✅ Validation Rules

| Field | Rules |
|-------|-------|
| First Name | Required, 2-100 chars |
| Last Name | Required, 2-100 chars |
| Email | Required, valid format, unique |
| Phone | Optional, 5-30 chars |
| Password | Required, 8+ chars |
| Photo | Optional, max 5MB, image only |
| Bio | Optional, max 1000 chars |

---

## 🔐 Security Measures

- Passwords hashed with BCrypt (not reversible)
- JWT tokens for stateless authentication
- CORS limited to localhost:5173
- File upload validation (type + size)
- Email uniqueness validation
- SQL injection prevention (prepared statements)

---

## 📞 Support

Check these files for more info:
- `QUICK_START.md` - How to run
- `FEATURES_AND_TESTING.md` - All features + test scenarios
- `README.md` - Original project overview
