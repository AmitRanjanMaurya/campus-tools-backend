# 📁 Files to Upload to Hostinger

## Required Files for Deployment:

### 1. Production Build Files:
- `.next/` folder (entire folder with all contents)
- `package.json`
- `package-lock.json` 
- `next.config.js`
- `src/` folder (entire source code)
- `public/` folder (static assets)

### 2. Environment Configuration:
Create `.env.production` with:
```
NEXT_PUBLIC_BASE_URL=https://campustoolshub.com
NEXT_PUBLIC_CONTACT_EMAIL=contact@campustoolshub.com
BLOG_ADMIN_EMAIL=amitranjanmaurya10@gmail.com
BLOG_ADMIN_PASSWORD=your-secure-admin-password
JWT_SECRET=your-32-character-jwt-secret-here
OPENROUTER_API_KEY=your-openrouter-api-key
NODE_ENV=production
```

## 🚀 Hostinger Upload Steps:

### Step 1: Access Hostinger
1. Login to your Hostinger account
2. Go to Hosting → Manage 
3. Open File Manager

### Step 2: Upload Files
1. Navigate to `public_html/` directory
2. Upload the following folders:
   - `.next/` (entire folder)
   - `src/` (entire folder) 
   - `public/` (entire folder)
3. Upload these files:
   - `package.json`
   - `package-lock.json`
   - `next.config.js`
   - `.env.production` (create this)

### Step 3: Configure Node.js (Business Plan)
1. Go to Advanced → Node.js in Hostinger panel
2. Select Node.js version 18.x or higher
3. Set Application Root: `/public_html`
4. Set Startup File: Leave default or set to `server.js`
5. Click "Create Application"

### Step 4: Install Dependencies
1. Open Terminal in Hostinger (if available)
2. Run: `npm ci --production`
3. Start application through Node.js panel

### Step 5: Configure Domain
1. Go to Domain section
2. Point campustoolshub.com to your hosting
3. Enable SSL certificate (free)

## 📱 Alternative: Static Export (Shared Hosting)

If you have shared hosting, create static version:

### Modify next.config.js:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}
module.exports = nextConfig
```

### Build and Upload:
1. Run `npm run build` 
2. Upload contents of `out/` folder to `public_html/`
3. Upload `public/` folder contents

## ✅ Your Site Features:

Once live at campustoolshub.com, users will have:

### Academic Tools:
- GPA Calculator (4-point, 10-point, percentage)
- Scientific Calculator 
- Unit Converter
- Grade Tracker

### Productivity Tools:
- Resume Builder with PDF export
- Study Timer (Pomodoro technique)
- Flashcard Creator
- Notes Organizer (Markdown support)
- Timetable Maker

### AI-Powered Features:
- AI Doubt Solver
- Quiz Generator  
- Mind Map Generator
- Study Guide Creator
- Plagiarism Checker

### Additional Features:
- Budget Analyzer
- Lab Report Generator
- Blog with study tips
- User accounts and dashboard
- Mobile-responsive design
- PWA installation

## 🎯 Next Steps:

1. **Choose your upload method** (Node.js or static)
2. **Upload files to Hostinger** 
3. **Configure domain and SSL**
4. **Test your live site**

Your Campus Tools Hub is production-ready! 🚀
