# 🔀 Hybrid Deployment: Frontend (Hostinger) + Backend (Vercel)

## 📋 Architecture Overview:

### Frontend (Hostinger):
- Static HTML, CSS, JavaScript
- All student tools (GPA calculator, resume builder, etc.)
- User interface and components
- No server-side functionality

### Backend (Vercel):
- API routes for AI features
- Authentication endpoints
- Blog management
- Database operations

## 🚀 Step 1: Deploy Backend to Vercel

### A. Create Separate Repository for Backend (Optional)
```bash
# Create new folder for backend
mkdir campus-tools-backend
cd campus-tools-backend

# Copy API files
cp -r src/app/api/* ./api/
cp next.config.backend.js next.config.js
cp .env.backend .env.production
cp package.json ./
```

### B. Deploy Backend to Vercel
1. **Push backend code to GitHub**
2. **Go to** https://vercel.com
3. **Import repository**
4. **Configure**:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. **Add Environment Variables**:
   ```
   BLOG_ADMIN_EMAIL=amitranjanmaurya10@gmail.com
   BLOG_ADMIN_PASSWORD=your-secure-password
   JWT_SECRET=your-32-char-secret
   OPENROUTER_API_KEY=your-api-key
   NEXT_PUBLIC_FRONTEND_URL=https://campustoolshub.com
   ```
6. **Deploy** - You'll get URL like: `https://campus-tools-api.vercel.app`

## 🏠 Step 2: Deploy Frontend to Hostinger

### A. Build Frontend for Static Export
```bash
# Copy frontend configuration
cp next.config.frontend.js next.config.js
cp .env.frontend .env.production

# Update API URL in environment
echo "NEXT_PUBLIC_API_URL=https://campus-tools-api.vercel.app" >> .env.production

# Build static export
npm run build
```

### B. Upload to Hostinger
1. **Access Hostinger File Manager**
2. **Navigate to** `public_html/`
3. **Upload contents of** `out/` folder:
   ```
   out/
   ├── index.html
   ├── tools/
   ├── blog/
   ├── _next/
   └── assets/
   ```
4. **Upload static assets** from `public/` folder

## 🔗 Step 3: Connect Frontend to Backend

### A. Update API Calls in Frontend
All API calls will now go to your Vercel backend:
```javascript
// Before (local API)
fetch('/api/ai/doubt-solver', { ... })

// After (Vercel backend)
fetch('https://campus-tools-api.vercel.app/api/ai/doubt-solver', { ... })
```

### B. Use API Client
Your frontend will use the `apiClient.ts` utility:
```javascript
import { apiClient } from '@/utils/apiClient';

// AI features
const answer = await apiClient.solveDoubt(question, subject);
const quiz = await apiClient.generateQuiz(topic, difficulty, count);

// Authentication
const user = await apiClient.login(email, password);

// Blog
const posts = await apiClient.getBlogPosts();
```

## 🌐 Step 4: Configure CORS & Security

### A. Backend CORS Configuration
Your Vercel backend allows requests from:
- `https://campustoolshub.com` (your frontend)

### B. Frontend Security
- All sensitive operations happen on secure Vercel backend
- Frontend only handles UI and user interactions

## 📱 Step 5: Test Your Hybrid Setup

### Frontend Tests (Hostinger):
1. **Visit**: `https://campustoolshub.com`
2. **Check**: Homepage loads correctly
3. **Test**: Tools work (GPA calculator, resume builder)
4. **Verify**: UI is responsive and fast

### Backend Tests (Vercel):
1. **Visit**: `https://campus-tools-api.vercel.app/api/test`
2. **Test**: AI endpoints work
3. **Check**: Authentication endpoints
4. **Verify**: Blog API functions

### Integration Tests:
1. **Login** from frontend → should authenticate via backend
2. **AI features** → should get responses from Vercel
3. **Blog** → should load content from backend API

## 🛡️ Security Benefits:

### Frontend (Hostinger):
- ✅ Fast static delivery
- ✅ No server vulnerabilities
- ✅ CDN-ready
- ✅ SEO optimized

### Backend (Vercel):
- ✅ Secure API endpoints
- ✅ Environment variables protected
- ✅ Automatic HTTPS
- ✅ Serverless scaling

## 💰 Cost Breakdown:

### Hostinger:
- **Frontend hosting**: Your existing plan
- **Domain**: `campustoolshub.com`
- **SSL**: Free

### Vercel:
- **Backend API**: Free tier (sufficient for most usage)
- **Custom domain**: Free
- **SSL**: Free

**Total additional cost**: $0 (using free tiers)

## 🚀 Deployment Commands:

### Build Frontend:
```bash
npm run build:frontend
```

### Build Backend:
```bash
npm run build:backend
```

### Deploy Both:
```bash
# Frontend to Hostinger (manual upload)
npm run deploy:frontend

# Backend to Vercel (git push)
git add . && git commit -m "Backend deploy" && git push
```

## 🎯 Your Hybrid Architecture:

```
User Browser
     ↓
┌─────────────────┐
│   Hostinger     │ ← Static Frontend
│ campustoolshub  │   (HTML/CSS/JS)
│     .com        │
└─────────────────┘
     ↓ API calls
┌─────────────────┐
│    Vercel       │ ← Dynamic Backend
│ campus-tools-   │   (API Routes)
│ api.vercel.app  │
└─────────────────┘
```

## ✅ Benefits of This Setup:

1. **Best of Both Worlds**:
   - Fast static frontend (Hostinger)
   - Powerful backend (Vercel)

2. **Cost Effective**:
   - Use existing Hostinger plan
   - Free Vercel backend

3. **Scalable**:
   - Frontend: CDN-ready static files
   - Backend: Serverless auto-scaling

4. **Maintainable**:
   - Clear separation of concerns
   - Independent deployments

Your Campus Tools Hub will have **professional-grade architecture** while using your existing Hostinger plan! 🎓✨

## 📋 Next Steps:

1. **Deploy backend** to Vercel first
2. **Update frontend** API URLs
3. **Build static frontend** 
4. **Upload to Hostinger**
5. **Test integration**

Ready to start with backend deployment to Vercel?
