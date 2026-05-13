# Firebase Test Phone Numbers Setup

## Quick Start (1 minute)

### Step 1: Open Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **examai-dbdc3**
3. Navigate: **Authentication** → **Phone**

### Step 2: Add Test Phone Numbers
1. Look for **"Test Numbers"** section
2. Click **"Add test number"** button
3. Enter test numbers:

| Phone Number | OTP Code | Purpose |
|---|---|---|
| **+16505551234** | 123456 | Student login testing |
| **+19165550123** | 123456 | Alternative testing |
| **+919876543210** | 123456 | India format testing |

### Step 3: Save
- Click **"Save"** or **"Add"**
- Numbers now work on localhost automatically

---

## How It Works

### Before (Real Production):
```
User enters: +919876543210
  ↓
Firebase sends real SMS to phone
  ↓
User enters 6-digit code from SMS
  ↓
Verified ✓
```

### Now (Test Numbers):
```
User enters: +16505551234 (test number)
  ↓
Firebase auto-verifies (NO SMS sent)
  ↓
User enters: 123456 (test code)
  ↓
Instantly verified ✓ (no waiting for SMS)
```

---

## Testing Checklist

### ✅ Test Student Login:
1. Open app on `http://localhost:5173`
2. Click **"Student Login"**
3. Enter phone: **+16505551234**
4. Click "Send OTP"
   - ✅ Should show OTP input screen (no SMS needed)
5. Enter code: **123456**
6. Click "Verify OTP"
   - ✅ New user? Should ask for Name + Exam
   - ✅ Enter name, pick exam, save
   - ✅ Dashboard loads ✓

### ✅ Test Returning User:
1. Same number again
2. Enter **+16505551234**
3. Enter code: **123456**
   - ✅ Should skip to dashboard (no profile form)

### ✅ Test Admin Login (unchanged):
1. Email: `shashikantchaudhary100@gmail.com`
2. Password: `Shashikant@1`

---

## Troubleshooting

### "Phone number not recognized"
- ✅ Make sure test number is added in Firebase Console
- ✅ Refresh browser after adding
- ✅ Exact format: **+16505551234** (with +)

### "Invalid OTP code"
- ✅ Use exactly: **123456** (what you configured)
- ✅ Don't change the code

### "reCAPTCHA error"
- ✅ This is fine during testing
- ✅ Test numbers work regardless

### "Still wants SMS on real phone"
- ✅ Number not added to test list
- ✅ Verify in Firebase Console → Phone → Test Numbers

---

## Switching to Production

When ready to deploy:

1. **Remove test numbers** from Firebase Console
2. **Deploy to real domain** (e.g., examai.com)
3. **Real SMS will work automatically** (Firebase handles it)
4. Users enter real numbers → Get real SMS codes

No code changes needed! 🎉

---

## Files Updated for Test Support
- ✅ `authService.js` - Works with test numbers
- ✅ `LoginScreen.jsx` - No changes needed
- ✅ `index.html` - reCAPTCHA optional for tests

