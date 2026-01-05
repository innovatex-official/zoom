# Firebase Setup Guide for Zoom Clone

## 🚀 Quick Setup (5 minutes)

Follow these steps to enable cross-device video calling:

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name (e.g., "zoom-clone")
4. Disable Google Analytics (optional)
5. Click **"Create project"**

### Step 2: Enable Realtime Database

1. In your Firebase project, click **"Realtime Database"** in the left sidebar
2. Click **"Create Database"**
3. Choose a location (closest to your users)
4. **IMPORTANT**: Select **"Start in test mode"** for now
5. Click **"Enable"**

### Step 3: Get Your Firebase Config

1. Click the **gear icon** (⚙️) next to "Project Overview"
2. Click **"Project settings"**
3. Scroll down to **"Your apps"**
4. Click the **web icon** (`</>`)
5. Register app with a nickname (e.g., "zoom-web")
6. Copy the `firebaseConfig` object

### Step 4: Update config.js

Open `config.js` and replace the placeholder values with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
};
```

### Step 5: Configure Database Rules (IMPORTANT for Production)

1. Go to **Realtime Database** → **Rules** tab
2. Replace the rules with this:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true,
        ".indexOn": ["timestamp"]
      }
    }
  }
}
```

3. Click **"Publish"**

**Note**: These rules allow anyone to read/write. For production, you should add authentication and more restrictive rules.

### Step 6: Deploy Your App

#### Option A: Firebase Hosting (Recommended)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Select:
# - Hosting
# - Use existing project (select your project)
# - Public directory: . (current directory)
# - Single-page app: No
# - Don't overwrite index.html

# Deploy
firebase deploy
```

Your app will be live at: `https://your-project-id.web.app`

#### Option B: Any Static Hosting

Upload these files to any static hosting service:

- index.html
- style.css
- script.js
- config.js

**Compatible hosts:**

- Netlify
- Vercel
- GitHub Pages
- Cloudflare Pages

### Step 7: Test Across Devices

1. Open the deployed URL on **Device 1** (e.g., your laptop)
2. Click **"New Meeting"**
3. Copy the 9-digit Room ID
4. Open the same URL on **Device 2** (e.g., your phone)
5. Enter the Room ID and click **"Join"**
6. Both devices should connect! 🎉

---

## 🔒 Security Best Practices (For Production)

### 1. Enable Firebase Authentication

```javascript
// Add to config.js after Firebase initialization
const auth = firebase.auth();

// Sign in anonymously
auth.signInAnonymously();
```

### 2. Update Database Rules

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": "auth != null",
        ".write": "auth != null",
        ".indexOn": ["timestamp"]
      }
    }
  }
}
```

### 3. Add Room Expiration

Rooms should auto-delete after some time. Add this to your database rules:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": "auth != null",
        ".write": "auth != null &&
                  (!data.exists() ||
                   data.child('timestamp').val() > now - 3600000)",
        ".validate": "newData.hasChildren(['offer', 'timestamp'])"
      }
    }
  }
}
```

---

## 🐛 Troubleshooting

### Issue: "Room not found"

- Make sure both devices are using the same deployed URL
- Check that Firebase Realtime Database is enabled
- Verify database rules allow read/write access

### Issue: "Failed to create meeting"

- Check browser console for errors
- Verify `config.js` has correct Firebase credentials
- Ensure camera/microphone permissions are granted

### Issue: Connection not establishing

- Check that both devices are on different networks (not localhost)
- Verify STUN servers are accessible
- Some corporate firewalls may block WebRTC

### Issue: "Permission denied" in Firebase

- Check database rules in Firebase Console
- Make sure rules allow public read/write (for testing)
- For production, implement authentication

---

## 📊 Firebase Free Tier Limits

- **Realtime Database**: 1 GB stored, 10 GB/month downloaded
- **Hosting**: 10 GB storage, 360 MB/day bandwidth
- **Perfect for**: Testing and small-scale deployments

For high traffic, consider upgrading to Firebase Blaze (pay-as-you-go).

---

## 🎯 What Changed?

### Before (localStorage)

- ❌ Only worked on same device
- ❌ Required manual polling
- ❌ No cross-device support

### After (Firebase)

- ✅ Works across any device
- ✅ Real-time updates
- ✅ Automatic synchronization
- ✅ Production-ready

---

## 📝 Next Steps

1. **Add Authentication**: Implement user accounts
2. **Add Chat**: Real-time text messaging
3. **Add Recording**: Save meetings to Firebase Storage
4. **Add Analytics**: Track usage with Firebase Analytics
5. **Add Notifications**: Notify users when someone joins

---

## 🆘 Need Help?

- Firebase Docs: https://firebase.google.com/docs
- WebRTC Docs: https://webrtc.org/getting-started/overview
- Open an issue if you encounter problems

---

**Created by:** Suryanshu Nabheet  
**Last Updated:** January 2026
