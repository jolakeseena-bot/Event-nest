# EventNest Feature Guide

## 🔐 Authentication Pages

### Login Page (`/login`)
- **Modern Design:** Dark gradient background with floating animated orbs
- **Features:**
  - Email/Password input fields with smooth focus animations
  - Show/hide password toggle
  - Remember me checkbox
  - Forgot password link
  - Sign up link at the bottom
  - Error/success alert messages
- **Styling:** Gradient cyan-to-blue buttons with glow effects on hover

### Register Page (`/register`)
- **Modern Design:** Matches login page aesthetic
- **Features:**
  - Full name, email, password fields
  - Password strength indicator with color-coded bar
  - Confirm password with visual match indicator
  - Terms & conditions agreement
  - Form validation with error messages
  - Sign in link for existing users
- **Password Strength Colors:**
  - 🔴 Very Weak (0-1 checks)
  - 🟠 Weak to Fair (2 checks)
  - 🟡 Good (3 checks)
  - 🟢 Strong to Very Strong (4-5 checks)

---

## 📌 Bookmarks Feature

### How to Bookmark an Event

1. **Navigate to Home Page** (`/`)
2. **View Event Cards** - See all available events with their details
3. **Find Bookmark Button:**
   - Located in **top-right corner** of each event card image
   - Icon: Bookmark symbol (📌)
4. **Click to Bookmark:**
   - **Outline icon** = Not bookmarked → Click to save
   - **Filled icon** = Bookmarked → Click to remove
5. **View Bookmarks:**
   - Go to **Bookmarks page** (in navigation)
   - See all your saved events
   - Click "Remove from bookmarks" to delete

### Bookmark Storage
- Bookmarks are saved in **browser's localStorage**
- Persist across browser sessions
- Format: Array of event IDs
- Storage key: `bookmarks`

---

## 👤 Profile Picture Upload

### How to Upload Profile Picture

1. **Go to Profile Page** (`/dashboard` → Click profile icon)
2. **Enter Edit Mode:**
   - Click "Edit Profile" button (top-right)
   - Button changes to "Cancel"
3. **Upload Picture:**
   - Hover over the profile avatar
   - Click the **camera icon** (📷) that appears
   - Select an image from your device
4. **Preview:**
   - Image displays immediately in the avatar circle
   - Shows in all profile displays
5. **Save:**
   - Image automatically saved to browser storage
   - Click "Save Changes" to finalize profile edits

### Image Requirements
- **Formats:** JPG, PNG, GIF, WebP, etc.
- **Size:** Recommended under 5MB
- **Aspect Ratio:** Works best as square (1:1)
- **Display:** Shows as circular avatar with 120px diameter

### Avatar Display
- **Default:** First letter of your name (animated gradient background)
- **With Picture:** Your uploaded image (rounded, centered, cropped)
- **Location:** Profile page, navbar (if logged in)

---

## 🎨 Theme Toggle

### Light/Dark Mode
- **Toggle Location:** Navbar (top-right corner)
- **Icon:** 🌙 Moon (dark mode) / ☀️ Sun (light mode)
- **Default:** Dark mode
- **Persistence:** Saved in browser localStorage

### Theme Colors

#### Dark Theme (Default)
```
Background: #0a0e27 to #2a2d3d
Text: #f5f5f7 (bright white)
Buttons: Cyan (#00d9ff) → Blue (#00a8ff) gradient
Accents: Lime, Pink, Orange available
```

#### Light Theme
```
Background: #ffffff to #f5f5f7
Text: #1d1d1f (dark gray)
Buttons: Blue (#0066ff) → Cyan (#00ccff) gradient
Accents: Adjusted for light backgrounds
```

---

## 🔍 Explore Events Button

### Location & Purpose
- **Page:** Bookmarks page (`/bookmarks`)
- **Scenario:** When no bookmarks exist
- **Purpose:** Navigate back to home to discover events
- **Styling:** Cyan-to-blue gradient with hover glow effect

### Features
- **Hover Effect:** Glows with cyan shadow, lifts up 2px
- **Icon:** Search/compass icon included
- **Text:** "Explore Events"
- **Action:** Links to home page `/`

---

## 📊 Profile Dashboard

### Available on Profile Page

1. **User Information Section:**
   - Profile picture (with upload capability)
   - Full name
   - User role badge

2. **Edit Profile Section:**
   - Full name field
   - Bio/Description (max 200 chars)
   - Event preferences (categories)
   - Notification settings (checkboxes)

3. **Activity Stats:**
   - Events Created: 0 (ready for backend integration)
   - Events Attended: 0 (ready for backend integration)
   - Friends: 0 (ready for backend integration)

4. **Event Preferences:**
   - Health, Environment, Education
   - Community, Technology, Other
   - Click to select/deselect interests

---

## 💾 Data Storage (Current)

All data stored in **browser's localStorage** (not backend):

| Key | Type | Example |
|-----|------|---------|
| `bookmarks` | Array | `["id1","id2","id3"]` |
| `userAvatar` | Base64 String | `data:image/png;base64,...` |
| `userName` | String | `"John Doe"` |
| `userBio` | String | `"Event enthusiast"` |
| `userPreferences` | Array | `["Health","Education"]` |
| `userId` | String | `"12345"` |

---

## ✨ Visual Effects

### Animations
- **Fade In:** Logo, hero section
- **Slide Up:** Forms, cards
- **Scale In:** Event cards on load
- **Glow:** On button hover
- **Pulse:** Avatar, logo
- **Bounce:** Interactive elements

### Hover Effects
- **Buttons:** Scale up, glow shadow
- **Cards:** Lift up, border color change
- **Links:** Color change, underline animation

### Smooth Transitions
- **Duration:** 200ms-300ms (fast/base)
- **Easing:** ease-out, ease-in-out
- **All Properties:** Smooth color, transform, shadow changes

---

## 🐛 Troubleshooting

### Bookmark Not Saving?
- Check browser localStorage is enabled
- Try clearing browser cache and refresh
- Open DevTools → Application → LocalStorage

### Profile Picture Not Uploading?
- Check file size (recommended < 5MB)
- Try different image format (JPG, PNG)
- Clear browser cache and refresh

### Theme Not Switching?
- Check localStorage for `theme` key
- Try refreshing the page
- Check browser console for errors

### Features Not Appearing?
- Ensure you're logged in for profile features
- Clear browser cache (Ctrl+Shift+Delete)
- Try a different browser
- Disable browser extensions

---

## 🚀 Upcoming Features

### Coming Soon (Backend Required)
- [ ] Comments/Reviews system
- [ ] 5-star event ratings
- [ ] Social features (friends, follow)
- [ ] Push notifications
- [ ] Event attendance tracking
- [ ] Persistent profile picture storage (cloud)
- [ ] Advanced search & filters
- [ ] Event recommendations

---

## 📱 Mobile Support

All features work on mobile devices:
- **Responsive design** for phones (320px+)
- **Touch-friendly** buttons and inputs
- **Optimized layouts** for small screens
- **Fast loading** on 3G/4G networks

---

**Last Updated:** October 23, 2025
**Version:** 1.0
