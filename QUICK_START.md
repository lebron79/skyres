# SkyRes Auth & Users - Quick Start

## ⚡ Start in 2 Steps

### Step 1: Backend
```bash
cd back
mvn spring-boot:run
```
Runs on `http://localhost:8080`

### Step 2: Frontend
```bash
cd front
npm run dev
```
Runs on `http://localhost:5173`

---

## 🎯 First Time User Flow

1. **Open browser** → `http://localhost:5173`
2. **See Login page** with clean teal design
3. **Click "Create one"** to register
4. **Fill registration form:**
   - First Name, Last Name (required)
   - Email (required)
   - Phone (optional)
   - Password 8+ chars (required)
   - Confirm Password (required)
   - Accept Terms (required)
5. **Click "Create account"** → Auto-login + Landing page
6. **Click avatar** in top right → User menu appears
7. **Click Settings** → Manage profile & upload image

---

## 📋 What Works

| Feature | Status |
|---------|--------|
| Register with validation | ✅ Complete |
| Login with JWT | ✅ Complete |
| User profile edit | ✅ Complete |
| Profile image upload | ✅ Complete |
| Change password | ✅ Complete |
| Role display (TOURIST) | ✅ Complete |
| Session persistence | ✅ Complete |

---

## 🔒 Demo Credentials

After first registration, use the same email/password to login again.

---

## ❌ Not Yet Implemented

- Google OAuth (needs provider setup)
- Email verification (needs email service)
- Password reset (needs email service)

---

**Both backend and frontend build successfully.** Ready to test! ✅
