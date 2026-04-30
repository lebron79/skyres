# SkyRes Auth - Complete Features & Testing

## ✅ All Implemented Features

### 1. Registration
- **Fields**: First Name, Last Name, Email, Phone (optional), Password, Terms
- **Validation**: All fields checked, clear error messages
- **Result**: Auto-login after successful registration
- **Data Saved**: name, email, password (hashed), phone, role=TOURIST

### 2. Login
- **Fields**: Email, Password
- **Features**: Remember login via JWT token
- **Result**: Auto-redirect to landing page
- **Token Storage**: localStorage (auto-login on page reload)

### 3. User Menu (Top Right)
- **Shows**: User avatar with profile image
- **Role Badge**: "TOURIST" displayed
- **Options**: Settings, Logout
- **Profile Image**: Shows if uploaded, otherwise initials

### 4. Settings - Profile Tab
- **Edit**: First Name, Last Name, Phone, Bio
- **Upload**: Profile image (JPEG/PNG/GIF/WebP, max 5MB)
- **View**: Email, Role, Join Date
- **Save**: All changes persist in database

### 5. Settings - Security Tab
- **Change Password**: Current → New → Confirm
- **Validation**: Password 8+ chars, confirmation match
- **Feedback**: Success/error messages
- **Result**: Next login uses new password

### 6. Profile Image Upload
- **Upload Location**: Settings → Profile tab
- **Storage**: Backend saves to `uploads/profiles/`
- **Display**: Shows in avatar everywhere
- **Persistence**: Saved in database, loads on every login
- **Size Limit**: 5MB max
- **Format**: JPEG, PNG, GIF, WebP

---

## 🧪 Test Scenarios

### Scenario 1: Complete Registration ✅
```
Register: john@example.com / SecurePass123
Phone: +1 (555) 123-4567
Expected: Login success, show landing page
Verify: Avatar shows in top right
```

### Scenario 2: Upload Profile Image ✅
```
Settings → Profile → Upload image
Select: Any image file (max 5MB)
Save Changes
Expected: Image shows in avatar
Logout/Login: Image persists
```

### Scenario 3: Change Password ✅
```
Settings → Security
Enter: Current password
New: NewPassword456
Confirm: NewPassword456
Expected: "✓ Password changed successfully!"
Next login: Use NewPassword456
```

### Scenario 4: Edit Profile ✅
```
Settings → Profile
Edit: Phone, Bio fields
Save Changes
Expected: Fields update
Reload: Changes persist
```

### Scenario 5: Validation Errors ✅
```
Leave First Name empty → Error shown
Email: "invalid" → Error shown
Password < 8 chars → Error shown
Passwords don't match → Error shown
```

---

## 🔧 API Endpoints

### Authentication
```
POST /api/auth/register
Body: {firstName, lastName, email, password, phone}
Response: {token, id, firstName, lastName, email, phone, role, createdAt}

POST /api/auth/login
Body: {email, password}
Response: {token, id, firstName, lastName, email, phone, role, createdAt}
```

### User Profile
```
GET /api/users/me
Headers: Authorization: Bearer {token}
Response: Full user profile

PUT /api/users/{id}
Headers: Authorization: Bearer {token}
Body: {firstName, lastName, phone, photoUrl, bio}
Response: Updated user profile

POST /api/users/{id}/change-password
Headers: Authorization: Bearer {token}
Body: {currentPassword, newPassword}
Response: Success message
```

### File Upload
```
POST /api/upload/profile-image
Headers: Authorization: Bearer {token}, multipart/form-data
Body: file (image)
Response: {url, message}

GET /api/upload/profile-image/{filename}
Response: Image file
```

---

## 📊 User Data Structure

```javascript
{
  id: 1,
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  phone: "+1 (555) 123-4567",
  photoUrl: "/api/upload/profile-image/user_1_abc123.jpg",
  bio: "Travel enthusiast",
  role: "TOURIST",
  createdAt: "2026-04-30T19:00:00"
}
```

---

## ⚙️ Technology Stack

**Backend**
- Spring Boot 3.3
- Spring Security + JWT
- MySQL Database
- BCrypt Password Hashing

**Frontend**
- React 19
- Context API for state
- Vite bundler

---

## 🔐 Security Features

- ✅ JWT token-based authentication
- ✅ BCrypt password hashing (not reversible)
- ✅ CORS configured for localhost:5173
- ✅ File type validation (images only)
- ✅ File size limit (5MB)
- ✅ Email uniqueness validation
- ✅ Password minimum 8 characters

---

## ✨ Status

- ✅ All features working
- ✅ Backend builds successfully
- ✅ Frontend builds successfully
- ✅ Ready for production testing
