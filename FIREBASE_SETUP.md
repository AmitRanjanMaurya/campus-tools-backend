# Firebase Setup Instructions

## 🔥 Firebase Authentication Setup

Your student tools platform now has Firebase authentication integrated! Follow these steps to complete the setup:

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter your project name (e.g., "Student Tools Platform")
4. Enable Google Analytics (optional)
5. Create the project

### 2. Enable Authentication

1. In your Firebase project, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** authentication
3. Click **Save**

### 3. Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click **Web app** icon (`</>`)
4. Register your app with a nickname
5. Copy the `firebaseConfig` object

### 4. Update Environment Variables

Update your `.env.local` file with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_actual_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_actual_app_id
```

### 5. Switch to Firebase Authentication

Once you've configured Firebase, replace the authentication pages:

```bash
# Replace login page
mv src/app/login/firebase-page.tsx src/app/login/page.tsx

# Replace signup page  
mv src/app/signup/firebase-page.tsx src/app/signup/page.tsx

# Replace reset password page
mv src/app/reset-password/firebase-page.tsx src/app/reset-password/page.tsx
```

### 6. Test Your Setup

1. Restart your development server: `npm run dev`
2. Go to `/signup` and create a new account
3. Check Firebase Console > Authentication > Users to see the new user
4. Try logging in with the new account

## ✨ Features Included

- ✅ **Email/Password Authentication**
- ✅ **User Registration with Validation**
- ✅ **Secure Login System**
- ✅ **Password Reset via Email**
- ✅ **Real-time Authentication State**
- ✅ **Route Protection**
- ✅ **Profile Management**

## 🛡️ Security Features

- Password validation (minimum 6 characters)
- Email verification support
- Secure token-based authentication
- Automatic session management
- Protected routes with middleware

## 🔧 Alternative: Keep Local Authentication

If you prefer to keep using the localStorage-based authentication system, you can continue using the current setup. The Firebase integration is ready when you want to upgrade to cloud-based authentication.

## 📱 Optional: Add Social Login

You can also enable Google, Facebook, or other social login providers in Firebase Authentication for easier user registration.

---

**Need help?** Check the Firebase documentation or ask for assistance with specific configuration steps!
