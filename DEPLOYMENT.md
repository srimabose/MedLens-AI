# 🚀 MedLens AI Deployment Guide

## Render Deployment (Recommended)

### Prerequisites
- [Render](https://render.com) account
- [MongoDB Atlas](https://www.mongodb.com/atlas) account
- [Google AI Studio](https://makersuite.google.com/app/apikey) API key

### Step 1: Prepare Environment Variables

Create these environment variables in Render:

#### Backend Service Environment Variables:
```
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0
DATABASE_NAME=medlens_ai
SECRET_KEY=your_super_secure_jwt_secret_key_at_least_32_characters_long
ENVIRONMENT=production
GOOGLE_CLIENT_ID=your_google_client_id (optional)
GOOGLE_CLIENT_SECRET=your_google_client_secret (optional)
FACEBOOK_CLIENT_ID=your_facebook_client_id (optional)
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret (optional)
```

#### Frontend Service Environment Variables:
```
VITE_API_URL=https://your-backend-service.onrender.com
```

### Step 2: Deploy to Render

#### Option A: Using render.yaml (Recommended)
1. Fork/clone this repository
2. Connect your GitHub repository to Render
3. Render will automatically detect the `render.yaml` file
4. Set the environment variables in Render dashboard
5. Deploy both services

#### Option B: Manual Setup
1. **Backend Service:**
   - Create new Web Service
   - Connect your repository
   - Set build command: `cd backend && pip install -r requirements.txt`
   - Set start command: `cd backend && python -m uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Add environment variables

2. **Frontend Service:**
   - Create new Static Site
   - Connect your repository
   - Set build command: `cd frontend && npm install && npm run build`
   - Set publish directory: `frontend/dist`
   - Add environment variables

### Step 3: Configure Domain (Optional)
- Add custom domain in Render dashboard
- Update CORS origins in backend configuration
- Update OAuth redirect URIs

## Alternative Deployment Options

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build individual services
docker build -t medlens-backend ./backend
docker build -t medlens-frontend ./frontend
```

### Manual Server Deployment
```bash
# Backend
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000

# Frontend
cd frontend
npm install
npm run build
# Serve the dist folder with nginx or any static file server
```

## Environment Setup

### Development
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your credentials
pip install -r requirements.txt
python -m uvicorn main:app --reload

# Frontend
cd frontend
cp .env.example .env
# Edit .env with API URL
npm install
npm run dev
```

### Production Checklist
- [ ] Set strong SECRET_KEY (32+ characters)
- [ ] Use production MongoDB Atlas cluster
- [ ] Configure proper CORS origins
- [ ] Set up SSL/HTTPS
- [ ] Configure OAuth redirect URIs for production domain
- [ ] Set ENVIRONMENT=production
- [ ] Disable API docs in production (automatic)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy for MongoDB

## Security Considerations

### Environment Variables
- Never commit `.env` files to version control
- Use Render's environment variable management
- Rotate secrets regularly

### Database Security
- Use MongoDB Atlas with IP whitelisting
- Enable database authentication
- Regular security updates

### API Security
- Rate limiting implemented
- Input validation on all endpoints
- JWT token expiration (30 minutes)
- CORS properly configured

## Monitoring & Maintenance

### Health Checks
- Backend: `GET /` returns API status
- Database: Automatic MongoDB connection monitoring
- Frontend: Static file serving with nginx

### Logs
- Backend logs available in Render dashboard
- Monitor API usage and errors
- Set up alerts for critical issues

### Updates
- Update dependencies regularly
- Monitor Gemini API changes
- Keep MongoDB driver updated

## Troubleshooting

### Common Issues
1. **CORS Errors**: Check CORS_ORIGINS in backend config
2. **Database Connection**: Verify MONGODB_URL and network access
3. **API Key Issues**: Ensure GEMINI_API_KEY is valid and has quota
4. **Build Failures**: Check Node.js/Python versions
5. **OAuth Issues**: Verify redirect URIs match deployment URLs

### Support
- Check Render logs for detailed error messages
- Verify all environment variables are set correctly
- Test API endpoints individually
- Check MongoDB Atlas connection logs

---

**Last Updated**: December 2025
**Deployment Status**: Production Ready ✅