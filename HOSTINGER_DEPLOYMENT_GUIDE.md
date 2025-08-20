# 🚀 Hostinger Deployment Guide for Campus Tools Hub

## 📋 Pre-Deployment Overview

**Your Platform**: Student Tools Hub (campustoolshub.com)
**Hosting**: Hostinger
**Framework**: Next.js 14 with TypeScript
**Status**: ✅ Production build ready

---

## 🎯 Hostinger Deployment Options

### Option 1: Business/Premium Plan (Recommended)
- **Node.js Support**: ✅ Available
- **Custom Domain**: ✅ campustoolshub.com
- **SSL Certificate**: ✅ Free Let's Encrypt
- **Database**: MySQL/PostgreSQL available
- **Best for**: Full Next.js app with server features

### Option 2: Shared Hosting Plan
- **Static Export**: Required for shared hosting
- **Custom Domain**: ✅ Available
- **SSL Certificate**: ✅ Free
- **Limitations**: No server-side features
- **Best for**: Static version of your app

---

## 🔥 Method 1: Business Plan Deployment (Full Next.js)

### Step 1: Prepare Your Files
```bash
# Create production build
npm run build

# Create deployment package
npm run export  # If you want static export
```

### Step 2: Hostinger Setup
1. **Login to Hostinger Panel**
2. **Go to Hosting → Manage**
3. **Enable Node.js**:
   - Go to Advanced → Node.js
   - Select Node.js version 18.x or higher
   - Set startup file: `server.js` or `next start`

### Step 3: Upload Files via File Manager
1. **Access File Manager** in Hostinger panel
2. **Navigate to** `public_html/` directory
3. **Upload these folders/files**:
   ```
   ├── .next/           # Production build files
   ├── public/          # Static assets
   ├── src/             # Source code
   ├── package.json     # Dependencies
   ├── package-lock.json
   ├── next.config.js   # Next.js config
   └── .env.production  # Environment variables
   ```

### Step 4: Install Dependencies
1. **Access Terminal** in Hostinger panel (if available)
2. **Run installation**:
   ```bash
   cd public_html
   npm ci --production
   ```

### Step 5: Configure Environment Variables
Create `.env.production` in `public_html/`:
```env
NEXT_PUBLIC_BASE_URL=https://campustoolshub.com
NEXT_PUBLIC_CONTACT_EMAIL=contact@campustoolshub.com
BLOG_ADMIN_EMAIL=amitranjanmaurya10@gmail.com
BLOG_ADMIN_PASSWORD=your-secure-password
JWT_SECRET=your-production-jwt-secret-32-chars
OPENROUTER_API_KEY=your-openrouter-api-key
NODE_ENV=production
```

### Step 6: Start Application
1. **In Hostinger Node.js settings**:
   - Startup file: `server.js` or use `npm start`
   - Application root: `/public_html`
   - Application URL: `https://campustoolshub.com`

---

## 📦 Method 2: Shared Hosting (Static Export)

### Step 1: Create Static Export
Modify `next.config.js`:
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

### Step 2: Build Static Files
```bash
npm run build
```

### Step 3: Upload to Hostinger
1. **Go to File Manager**
2. **Navigate to** `public_html/`
3. **Upload contents of** `out/` folder (created by static export)
4. **Upload** `public/` folder contents

### Step 4: Configure Domain
1. **Domain → Manage Domain**
2. **Point to** your hosting account
3. **Enable SSL** (free with Hostinger)

---

## 🌐 Domain Configuration

### Step 1: DNS Setup
If domain is with Hostinger:
1. **Go to** Domain → DNS Zone
2. **Verify A record** points to Hostinger server IP
3. **Add CNAME** for www subdomain

If domain is external:
1. **Point nameservers** to Hostinger:
   - `ns1.dns-parking.com`
   - `ns2.dns-parking.com`
2. **Or set A record** to your server IP (provided by Hostinger)

### Step 2: SSL Certificate
1. **Go to** SSL → Manage
2. **Enable free SSL** (Let's Encrypt)
3. **Force HTTPS** redirect

---

## 📊 Hostinger-Specific Optimizations

### File Upload Tips:
```bash
# Compress files before upload (optional)
tar -czf student-tools.tar.gz .next/ public/ src/ package.json next.config.js

# Upload via FTP (faster for large files)
# Use FileZilla or similar FTP client
# Host: your-domain.com
# Port: 21 (FTP) or 22 (SFTP)
```

### Performance Settings:
1. **Enable Gzip Compression** in Hostinger panel
2. **Set Browser Caching** rules
3. **Use Hostinger CDN** if available

---

## 🔧 Troubleshooting Common Issues

### Issue 1: Node.js Not Available
**Solution**: Upgrade to Business plan or use static export method

### Issue 2: Files Not Uploading
**Solution**: 
- Use File Manager instead of FTP
- Upload folders one by one
- Check file size limits

### Issue 3: Environment Variables Not Working
**Solution**:
- Create `.env.production` in root directory
- Use Hostinger environment variables panel if available
- Restart Node.js application

### Issue 4: Domain Not Pointing
**Solution**:
- Wait 24-48 hours for DNS propagation
- Check nameservers are correct
- Clear browser cache

### Issue 5: SSL Not Working
**Solution**:
- Ensure domain is fully propagated first
- Try regenerating SSL certificate
- Contact Hostinger support if persistent

---

## 📱 Testing Your Live Site

### Functionality Checklist:
- [ ] Homepage loads: `https://campustoolshub.com`
- [ ] All tools work (GPA Calculator, Resume Builder, etc.)
- [ ] Authentication system functions
- [ ] Blog loads: `https://campustoolshub.com/blog`
- [ ] Contact form works
- [ ] Mobile responsive design
- [ ] PWA installation prompt appears

### Performance Tests:
- [ ] Google PageSpeed Insights score > 85
- [ ] All images load correctly
- [ ] No console errors
- [ ] Fast loading times

---

## 🎯 Quick Deployment Steps (Summary)

### For Business Plan:
1. **Upload** `.next/`, `public/`, `src/`, config files to `public_html/`
2. **Install** dependencies via terminal
3. **Configure** Node.js in Hostinger panel
4. **Set** environment variables
5. **Start** application

### For Shared Hosting:
1. **Build** static export: `npm run build`
2. **Upload** `out/` folder contents to `public_html/`
3. **Configure** domain and SSL
4. **Test** live site

---

## 📞 Support Resources

### Hostinger Support:
- **Live Chat**: Available 24/7
- **Knowledge Base**: help.hostinger.com
- **Video Tutorials**: YouTube Hostinger channel

### Your Application:
- **Admin Panel**: `https://campustoolshub.com/admin/blog`
- **Contact**: contact@campustoolshub.com
- **All Tools**: Available at root domain

---

## 🎉 Your Campus Tools Hub Features

Once live, your users will have access to:

### 🧮 Academic Tools:
- GPA Calculator (multiple systems)
- Unit Converter
- Scientific Calculator
- Grade Tracker

### 📝 Productivity Tools:
- Resume Builder with PDF export
- Study Timer (Pomodoro)
- Flashcard Creator
- Notes Organizer with Markdown
- Timetable Maker

### 🤖 AI-Powered Tools:
- AI Doubt Solver
- Quiz Generator
- Study Guide Creator
- Mind Map Generator
- Plagiarism Checker

### 💰 Life Tools:
- Budget Analyzer
- Lab Report Generator
- Blog with study tips

### 🔐 User Features:
- Account creation and login
- Personal dashboard
- Data persistence
- PWA installation

---

**Ready to deploy to Hostinger!** 🚀

Choose your deployment method based on your Hostinger plan and follow the steps above. Your student tools platform will be live and helping students succeed!
