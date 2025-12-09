# 🏥 MedLens AI

**AI-Powered Medical Report Analyzer & Comprehensive Health Assistant**

Transform complex medical reports into patient-friendly insights using Google Gemini 2.5 Flash AI. MedLens AI makes healthcare accessible by providing intelligent analysis, risk assessment, and personalized health guidance in 16+ languages.


## 🌟 Live Demo

🚀 **[Try MedLens AI Live](https://medlens-ai.onrender.com)** *(Deploy your own using the guide below)*

📂 **[GitHub Repository](https://github.com/srimabose/MedLens-AI)**


## 🎯 Problem & Solution

**Problem**: Patients receive complex medical reports but struggle to understand them without clear explanations from healthcare professionals.

**Solution**: MedLens AI democratizes healthcare understanding by providing:
- 🤖 **AI-Powered Analysis** - Intelligent interpretation of medical documents
- 🌍 **Global Accessibility** - Support for 16+ languages with cultural adaptation
- 🚦 **Smart Risk Assessment** - Automated health risk flagging and alerts
- 💬 **Interactive Assistance** - Voice-enabled Q&A for deeper understanding
- 📊 **Comprehensive Insights** - Personalized recommendations and trend analysis

## Quick Start

### Backend Setup
1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file with your credentials:
```env
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URL=your_mongodb_connection_string
DATABASE_NAME=medlens_ai
```

4. Start the server:
```bash
python -m uvicorn main:app --reload
```

Backend will run on `http://localhost:8000`

### Frontend Setup
1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## ✨ Core Features

### 📄 Document Analysis
- **Multimodal Upload Support**: PDF documents, images (JPEG/PNG), X-rays, lab reports
- **Advanced Image Processing**: Enhanced parsing for user-taken photos with shadows/poor lighting
- **AI-Powered Extraction**: Automatic extraction of lab values, medications, diagnoses, and vital signs
- **Smart Text Recognition**: OCR capabilities for handwritten and printed medical documents

### 🧠 Intelligent Health Assessment
- **Risk Flagging System**: 🟢 Normal, 🟡 Caution, 🔴 Critical health indicators
- **Patient-Friendly Explanations**: Complex medical terms translated to simple language
- **Comprehensive Analysis**: Detailed breakdown of each lab parameter with normal ranges
- **Health Condition Detection**: Automatic identification of potential health issues

### 💬 Interactive Communication
- **AI Chat Assistant**: Ask follow-up questions about your medical reports
- **Voice Chat Integration**: Speak questions and receive audio responses
- **Multi-turn Conversations**: Context-aware discussions about your health data
- **Real-time Translation**: Switch languages during conversations

### 🌍 Global Accessibility
- **16+ Language Support**: English, Spanish, French, German, Hindi, Bengali, Tamil, Telugu, Marathi, Chinese, Japanese, Korean, Arabic, Portuguese, Russian, Italian
- **Voice Recognition**: Language-specific speech-to-text in all supported languages
- **Text-to-Speech**: Natural voice synthesis for AI responses
- **Cultural Adaptation**: Culturally appropriate health advice and dietary recommendations

### 📊 Personalized Health Guidance
- **Diet Recommendations**: Specific foods and nutritional advice based on health conditions
- **Lifestyle Modifications**: Targeted exercise and wellness suggestions with duration/frequency
- **Follow-up Test Recommendations**: Suggested medical tests with appropriate timelines
- **Doctor Consultation Prep**: Key questions to ask your healthcare provider

## 🚀 Advanced Features

### 📈 Health Trend Analysis
- **Multi-Report Comparison**: Upload 2-10 reports to track health parameter changes over time
- **Chronological Analysis**: Automatic date extraction and timeline creation
- **Trend Visualization**: Clear indicators showing improvement, stability, or decline
- **Predictive Insights**: Early warning system for potential health issues
- **Progress Tracking**: Monitor treatment effectiveness and recovery progress

### 💊 Medication Management
- **Drug Interaction Checker**: Comprehensive analysis of 2+ medications
- **Severity Assessment**: Critical, moderate, and minor interaction warnings
- **Alternative Suggestions**: Safer medication alternatives when interactions detected
- **Dosage Guidance**: Timing and administration recommendations
- **Side Effect Monitoring**: Common adverse reactions and warning signs

### 🥗 Personalized Nutrition Planning
- **7-Day Meal Plans**: Customized meal planning based on health conditions
- **Dietary Restrictions**: Accommodates diabetes, hypertension, kidney disease, etc.
- **Cuisine Preferences**: Indian, Mediterranean, Asian, Western meal options
- **Nutritional Analysis**: Calorie, macro, and micronutrient breakdowns
- **Shopping Lists**: Ingredient lists for easy meal preparation

### 🩺 Symptom Analysis
- **Symptom Correlation**: Match reported symptoms with lab results
- **Urgency Assessment**: Immediate, routine, or monitoring recommendations
- **Differential Analysis**: Possible causes and related conditions
- **Action Plans**: Step-by-step guidance for symptom management
- **Emergency Detection**: Automatic identification of critical symptoms requiring immediate care

## 🔐 Authentication & Security
- **User Authentication**: Secure email/password registration and login
- **OAuth Integration**: Google and Facebook social login (configurable)
- **JWT Token Security**: Secure session management with automatic expiration
- **Data Privacy**: Encrypted storage and secure API communications
- **User Profiles**: Personalized dashboards and history tracking


## 🛠️ Technology Stack

### Frontend Technologies
- **React 18** - Modern UI framework with hooks and context
- **Vite** - Lightning-fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **Axios** - HTTP client for API communications
- **js-cookie** - Client-side cookie management for authentication
- **Web Speech API** - Browser-native voice recognition and text-to-speech

### Backend Technologies
- **FastAPI** - High-performance Python web framework with automatic API documentation
- **Google Gemini 2.5 Flash** - Advanced multimodal AI model for medical document analysis
- **MongoDB Atlas** - Cloud-native NoSQL database with global distribution
- **Motor** - Asynchronous MongoDB driver for Python
- **Pydantic** - Data validation and serialization with type hints
- **Python-JOSE** - JWT token creation and validation
- **bcrypt** - Secure password hashing
- **Authlib** - OAuth 2.0 implementation for social login
- **httpx** - Async HTTP client for external API calls
- **Pillow (PIL)** - Image processing and enhancement
- **NumPy** - Numerical computing for image preprocessing

### AI & Machine Learning
- **Google Gemini 2.5 Flash** - Multimodal AI model supporting text, images, and documents
- **Advanced Prompt Engineering** - Specialized medical analysis prompts
- **Image Preprocessing Pipeline** - Contrast, brightness, and sharpness enhancement
- **Multilingual AI Processing** - Context-aware translation and cultural adaptation

### Database & Storage
- **MongoDB Atlas** - Cloud database with automatic scaling
- **Collections**: 
  - `users` - User authentication and profile data
  - `reports` - Medical report analysis results
  - `chat_history` - Conversation logs and context

### Security & Authentication
- **JWT (JSON Web Tokens)** - Stateless authentication
- **bcrypt** - Password hashing with salt
- **OAuth 2.0** - Google and Facebook social login
- **CORS** - Cross-origin resource sharing configuration
- **Environment Variables** - Secure credential management

## 📁 Project Structure

```
MedLens-AI/
├── 📂 backend/                          # FastAPI Backend Server
│   ├── 📂 app/                          # Application Core
│   │   ├── 🔧 config.py                 # Application configuration & settings
│   │   ├── 🗄️ database.py              # MongoDB Atlas connection & client
│   │   ├── 📋 models.py                 # Database document models
│   │   ├── 📝 schemas.py                # Pydantic request/response schemas
│   │   ├── 🔄 crud.py                   # Database CRUD operations
│   │   ├── 🤖 gemini_client.py          # Google Gemini AI integration
│   │   ├── 🔐 auth_models.py            # Authentication data models
│   │   ├── 🛡️ auth_utils.py             # JWT & password utilities
│   │   ├── 👤 auth_crud.py              # User database operations
│   │   ├── 🔑 auth_dependencies.py      # FastAPI auth dependencies
│   │   ├── 🌐 oauth.py                  # Google/Facebook OAuth handlers
│   │   ├── 🛣️ auth_routes.py            # Authentication API endpoints
│   │   └── 📄 __init__.py               # Package initialization
│   ├── 🚀 main.py                       # FastAPI application entry point
│   ├── 📦 requirements.txt              # Python dependencies
│   ├── 🔒 .env                          # Environment variables (secrets)
│   └── 📋 .env.example                  # Environment template
│
├── 📂 frontend/                         # React Frontend Application
│   ├── 📂 src/                          # Source Code
│   │   ├── 📂 components/               # Reusable React Components
│   │   │   ├── 📤 UploadPanel.jsx       # File upload interface
│   │   │   ├── 📊 ResultView.jsx        # Analysis results display
│   │   │   ├── 💬 ChatPanel.jsx         # Interactive chat interface
│   │   │   ├── 🎤 VoiceChat.jsx         # Voice interaction component
│   │   │   ├── 🌐 LanguageSelector.jsx  # Language selection dropdown
│   │   │   ├── 📱 Sidebar.jsx           # Navigation sidebar with history
│   │   │   ├── 🔄 Loader.jsx            # Loading animations
│   │   │   ├── 🧭 FeatureNavigation.jsx # Cross-page navigation
│   │   │   ├── 👤 Login.jsx             # User login form
│   │   │   ├── 📝 Register.jsx          # User registration form
│   │   │   ├── 🔗 OAuthCallback.jsx     # OAuth callback handler
│   │   │   ├── 👨‍💼 UserProfile.jsx        # User profile dropdown
│   │   │   └── 🦶 Footer.jsx            # Copyright footer
│   │   ├── 📂 pages/                    # Feature Pages
│   │   │   ├── 📈 HealthTrends.jsx      # Multi-report trend analysis
│   │   │   ├── 💊 MedicationChecker.jsx # Drug interaction checker
│   │   │   ├── 🥗 DietPlanner.jsx       # Personalized meal planning
│   │   │   └── 🩺 SymptomChecker.jsx    # Symptom analysis tool
│   │   ├── 📂 contexts/                 # React Context Providers
│   │   │   └── 🔐 AuthContext.jsx       # Authentication state management
│   │   ├── 📂 lib/                      # Utility Libraries
│   │   │   ├── 🌐 api.js                # API client functions
│   │   │   └── 🔑 auth.js               # Authentication API calls
│   │   ├── 🎨 index.css                 # Global styles & Tailwind imports
│   │   ├── 📱 App.jsx                   # Main application component
│   │   └── 🚀 main.jsx                  # React application entry point
│   ├── 📄 index.html                    # HTML template
│   ├── 📦 package.json                  # Node.js dependencies & scripts
│   ├── 📦 package-lock.json             # Dependency lock file
│   ├── ⚙️ vite.config.js               # Vite build configuration
│   ├── 🎨 tailwind.config.cjs          # Tailwind CSS configuration
│   ├── 🔧 postcss.config.cjs           # PostCSS configuration
│   ├── 🔒 .env                          # Frontend environment variables
│   └── 📋 .env.example                  # Environment template
│
├── 📂 .vscode/                          # VS Code Configuration
└── 📖 README.md                         # Project documentation
```

### 🏗️ Architecture Overview

#### Backend Architecture (FastAPI)
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │───▶│   FastAPI        │───▶│   MongoDB       │
│   (React)       │    │   Backend        │    │   Atlas         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   Google Gemini  │
                       │   2.5 Flash AI   │
                       └──────────────────┘
```

#### Component Hierarchy (Frontend)
```
App.jsx
├── AuthProvider (Context)
├── Sidebar.jsx
├── Header (Navigation)
├── Main Content
│   ├── UploadPanel.jsx
│   ├── ResultView.jsx
│   ├── ChatPanel.jsx
│   └── Feature Pages
│       ├── HealthTrends.jsx
│       ├── MedicationChecker.jsx
│       ├── DietPlanner.jsx
│       └── SymptomChecker.jsx
└── Footer.jsx
```

#### Database Schema (MongoDB)
```
📊 Collections:
├── 👥 users
│   ├── _id (ObjectId)
│   ├── email (String)
│   ├── full_name (String)
│   ├── password_hash (String)
│   ├── provider (String: "email"|"google"|"facebook")
│   ├── provider_id (String)
│   ├── avatar_url (String)
│   ├── is_active (Boolean)
│   ├── created_at (Date)
│   ├── updated_at (Date)
│   └── last_login (Date)
│
├── 📄 reports
│   ├── _id (ObjectId)
│   ├── user_id (ObjectId, optional)
│   ├── filename (String)
│   ├── file_type (String)
│   ├── file_size (Number)
│   ├── language (String)
│   ├── analysis_result (Object)
│   ├── created_at (Date)
│   └── updated_at (Date)
│
└── 💬 chat_history
    ├── _id (ObjectId)
    ├── report_id (ObjectId)
    ├── role (String: "user"|"ai")
    ├── message (String)
    └── timestamp (Date)
```

## ⚙️ Environment Setup

### 🔑 Required Environment Variables

#### Backend (.env)
```env
# 🤖 AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# 🗄️ Database Configuration  
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0
DATABASE_NAME=medlens_ai

# 🔐 Security
SECRET_KEY=your-super-secret-jwt-key-change-this-in-production-make-it-long-and-random

# 🌐 URLs
FRONTEND_URL=http://localhost:5173

# 🔗 OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

### 🛠️ Setup Guides

<details>
<summary><b>📋 Get Google Gemini API Key</b></summary>

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key to your `.env` file
5. **Free tier**: 20 requests/day

</details>

<details>
<summary><b>🗄️ Setup MongoDB Atlas</b></summary>

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (free M0 tier available)
3. Create database user with read/write permissions
4. Get connection string: Cluster → Connect → Connect your application
5. Replace `<username>` and `<password>` with your credentials
6. Add your IP to Network Access (or use 0.0.0.0/0 for development)

</details>

<details>
<summary><b>🔗 OAuth Setup (Optional)</b></summary>

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - Development: `http://localhost:5173/auth/google/callback`
   - Production: `https://your-domain.com/auth/google/callback`

**Facebook OAuth:**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create new app
3. Add Facebook Login product
4. Configure OAuth redirect URIs:
   - Development: `http://localhost:5173/auth/facebook/callback`
   - Production: `https://your-domain.com/auth/facebook/callback`

</details>


## 🤝 Contributing

We welcome contributions! Here's how to get started:

## 📄 License & Legal

### License
MIT License

### Medical Disclaimer
⚠️ **Important Medical Disclaimer**: 

MedLens AI is an educational and informational tool designed to help patients better understand their medical reports. This application:

- **IS NOT** a substitute for professional medical advice, diagnosis, or treatment
- **SHOULD NOT** be used for medical emergencies or urgent health decisions
- **CANNOT** replace consultation with qualified healthcare professionals
- **MAY CONTAIN** errors or inaccuracies in AI-generated interpretations

**Always consult with your doctor or other qualified healthcare provider** before making any healthcare decisions or for guidance about a specific medical condition.

### Privacy & Data Security
- **Data Encryption**: All data transmitted using HTTPS/TLS
- **Secure Storage**: MongoDB Atlas with encryption at rest
- **No PHI Storage**: Personal health information is processed but not permanently stored
- **User Control**: Users can delete their data at any time
- **GDPR Compliance**: Designed with privacy regulations in mind

### Third-Party Services
- **Google Gemini AI**: Subject to Google's AI usage policies
- **MongoDB Atlas**: Subject to MongoDB's privacy policy
- **OAuth Providers**: Subject to Google/Facebook privacy policies


<div align="center">

**⭐ Star this repository if you find it helpful!**

**© 2025 MedLens AI. Created by [Srima Bose](https://github.com/srimabose). All rights reserved.**

*Empowering patients worldwide with AI-driven healthcare insights for better health outcomes.*

</div>
