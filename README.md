# FlowTrack - Project & Task Management Platform

A modern, full-stack project and task management application built with the MERN stack. FlowTrack enables teams to collaborate efficiently with role-based access control, real-time updates, and comprehensive project analytics.

![FlowTrack](https://img.shields.io/badge/MERN-Stack-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Active-brightgreen)

## 🚀 Live Demo

- **Frontend:** [https://flow-track-red.vercel.app](https://flow-track-red.vercel.app)
- **Backend API:** [https://flowtrack-akpt.onrender.com](https://flowtrack-akpt.onrender.com)

### Demo Credentials
```
Email: nishant@flowtrack.com
Password: Admin@123
```

---

## ✨ Features

### Core Functionality
- ✅ **User Authentication** - Secure JWT-based authentication with bcrypt password hashing
- ✅ **Role-Based Access Control** - Admin and Member roles with permission management
- ✅ **Project Management** - Create, update, and manage projects with team members
- ✅ **Task Management** - Assign tasks, track status, set priorities and due dates
- ✅ **Dashboard Analytics** - Visual overview of project metrics and task statistics
- ✅ **Team Collaboration** - Manage team members and their project assignments
- ✅ **Real-time Notifications** - Toast notifications for user actions and feedback

### Technical Features
- 🔐 JWT token-based authentication with automatic refresh
- 🛡️ CORS security with production-ready configuration
- 📊 MongoDB Atlas integration for cloud database
- 🎨 Responsive design with Tailwind CSS and Headless UI
- ⚡ Vite for fast frontend builds
- 🔄 Express middleware for error handling and validation
- 📈 Recharts for data visualization

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite 8** - Build tool and dev server
- **Tailwind CSS 4** - Utility-first CSS framework
- **Headless UI** - Unstyled, accessible components
- **React Router v7** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Framer Motion** - Animation library
- **Recharts** - Data visualization
- **lucide-react** - Icon library
- **react-hot-toast** - Notifications
- **@hello-pangea/dnd** - Drag and drop

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM (Object Data Modeling)
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **CORS** - Cross-origin request handling
- **dotenv** - Environment variables

### Deployment
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **MongoDB Atlas** - Cloud database

---

## 📋 Prerequisites

Before running FlowTrack locally, ensure you have:

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (local or Atlas connection string)
- **Git** version control

---

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Nishant28-sh/FlowTrack-.git
cd "Flow Track"
```

### 2. Backend Setup

```bash
# Install dependencies
npm install

# Create .env file in root directory
cat > .env << EOF
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/flowtrack
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRE=7d
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
EOF

# Start the backend server
npm run dev
```

**Backend runs on:** `http://localhost:5000`

### 3. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start the development server
npm run dev
```

**Frontend runs on:** `http://localhost:5173`

### 4. Database Seeding (Optional)

Populate the database with sample data:

```bash
# From root directory
npm run seed
```

This creates:
- 5 sample users (1 admin, 4 members)
- 4 sample projects
- 13 sample tasks with various statuses

---

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client && npm run dev
```

### Production Build

**Frontend Build:**
```bash
cd client && npm run build
```

**Preview Production Build:**
```bash
cd client && npm run preview
```

---

## 📁 Project Structure

```
FlowTrack/
├── server.js                 # Express server entry point
├── package.json              # Backend dependencies
├── .env                      # Environment variables
├── seed.js                   # Database seeding script
│
├── config/
│   └── db.js                 # MongoDB connection
│
├── models/
│   ├── User.js              # User schema
│   ├── Project.js           # Project schema
│   └── Task.js              # Task schema
│
├── controllers/
│   ├── authController.js    # Auth logic
│   ├── projectController.js # Project logic
│   ├── taskController.js    # Task logic
│   ├── userController.js    # User management
│   └── dashboardController.js # Analytics
│
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── projectRoutes.js     # Project endpoints
│   ├── taskRoutes.js        # Task endpoints
│   ├── userRoutes.js        # User endpoints
│   └── dashboardRoutes.js   # Dashboard endpoints
│
├── middleware/
│   ├── auth.js              # JWT verification
│   ├── errorHandler.js      # Error handling
│   └── validate.js          # Input validation
│
└── client/
    ├── package.json          # Frontend dependencies
    ├── vite.config.js        # Vite configuration
    ├── vercel.json           # Vercel deployment config
    ├── index.html            # HTML entry point
    │
    └── src/
        ├── main.jsx          # React entry point
        ├── App.jsx           # Main app component
        ├── App.css           # Global styles
        │
        ├── api/
        │   └── axios.js      # Axios instance with interceptors
        │
        ├── context/
        │   └── AuthContext.jsx # Global auth state
        │
        ├── components/
        │   ├── Layout.jsx     # Main layout wrapper
        │   ├── Sidebar.jsx    # Navigation sidebar
        │   └── ProtectedRoute.jsx # Route guards
        │
        └── pages/
            ├── Login.jsx      # Login page
            ├── Signup.jsx     # Registration page
            ├── Dashboard.jsx  # Analytics dashboard
            ├── Projects.jsx   # Projects listing
            ├── ProjectDetail.jsx # Project details
            ├── Tasks.jsx      # Tasks management
            └── Users.jsx      # User management (admin)
```

---

## 🔐 Environment Variables

### Backend (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://username:password@cluster.a76qhn7.mongodb.net/flowtrack

# JWT
JWT_SECRET=your_secure_secret_key_min_32_characters
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:5173,https://flow-track-red.vercel.app
CORS_ALLOW_VERCEL_PREVIEWS=true
```

### Frontend (.env / Vercel)

```env
VITE_API_URL=https://flowtrack-akpt.onrender.com/api
```

---

## 📚 API Documentation

### Authentication Endpoints

**POST** `/api/auth/signup`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "member"
}
```

**POST** `/api/auth/login`
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**GET** `/api/auth/me` (Protected)
- Returns current authenticated user

### Project Endpoints

**GET** `/api/projects` (Protected)
- Fetch all projects (admins see all, members see assigned)

**POST** `/api/projects` (Admin only)
- Create a new project

**GET** `/api/projects/:id` (Protected)
- Get project details

**PUT** `/api/projects/:id` (Admin only)
- Update project

**DELETE** `/api/projects/:id` (Admin only)
- Delete project

### Task Endpoints

**GET** `/api/tasks` (Protected)
- Fetch all tasks

**POST** `/api/tasks` (Admin only)
- Create new task

**GET** `/api/tasks/:id` (Protected)
- Get task details

**PUT** `/api/tasks/:id` (Protected)
- Update task

**DELETE** `/api/tasks/:id` (Admin only)
- Delete task

### Dashboard Endpoints

**GET** `/api/dashboard` (Protected)
- Get dashboard statistics

---

## 🌐 Deployment

### Deploy Backend to Render

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Set environment variables (see above)
5. Deploy

**Build Command:** `npm install`
**Start Command:** `npm start`

### Deploy Frontend to Vercel

1. Connect GitHub repository
2. Set Root Directory to `client`
3. Set environment variables
4. Deploy

---

## 🔄 User Roles & Permissions

### Admin
- ✅ Create/Update/Delete projects
- ✅ Create/Delete tasks
- ✅ Manage team members
- ✅ View all users
- ✅ Access analytics dashboard

### Member
- ✅ View assigned projects
- ✅ Update assigned tasks
- ✅ View dashboard
- ❌ Cannot create/delete projects
- ❌ Cannot manage users

---

## 🐛 Troubleshooting

### Login Failed Error

**Solution:**
1. Ensure backend environment variables are set correctly
2. Verify `CORS_ORIGIN` includes your frontend URL
3. Check MongoDB connection string
4. Verify JWT_SECRET is set

### 404 on Page Refresh (Vercel)

**Solution:**
- Ensure `client/vercel.json` exists with rewrite rules
- This has been configured in the project

### MongoDB Connection Error

**Solution:**
- Check MongoDB Atlas connection string
- Verify IP whitelist includes your server IP (0.0.0.0 for development)
- Ensure database name is correct

---

## 📝 Available Scripts

### Backend

```bash
npm start          # Run production server
npm run dev        # Run with hot reload (requires nodemon)
npm run seed       # Populate database with sample data
```

### Frontend

```bash
npm run dev        # Start dev server with hot module reload
npm run build      # Create production build
npm run lint       # Run ESLint
npm run preview    # Preview production build locally
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Use consistent indentation (2 spaces)
- Follow React hooks best practices
- Add meaningful commit messages
- Document complex functions

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author

**Nishant Kumar**
- GitHub: [@Nishant28-sh](https://github.com/Nishant28-sh)
- Email: nishant.dev.tech@gmail.com

---

## 🙏 Acknowledgments

- **MERN Community** for excellent documentation
- **Tailwind CSS** for beautiful utility-first styling
- **MongoDB** for reliable cloud database
- **Render & Vercel** for seamless deployment

---

## 📞 Support

For support, open an issue on [GitHub Issues](https://github.com/Nishant28-sh/FlowTrack-/issues) or contact the author.

---

## 📊 Project Stats

- **Total Files:** 50+
- **Lines of Code:** 10,000+
- **MongoDB Collections:** 3 (Users, Projects, Tasks)
- **API Endpoints:** 20+
- **React Components:** 8
- **Deployment Platforms:** 2 (Vercel + Render)

---

**Last Updated:** April 30, 2026  
**Version:** 1.0.0

---

Made with ❤️ by [Nishant Kumar](https://github.com/Nishant28-sh)
