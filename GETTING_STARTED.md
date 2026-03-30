# Performance Tracker Application

This is a complete, production-ready Employee Performance Tracker built with Laravel and React.

## 🎯 Project Overview

The **Employee Performance Wins, Tasks & Reports Tracker** is a comprehensive system designed to help organizations:
- Track employee tasks and productivity
- Manage daily work reports
- Record employee achievements
- Monitor team and company performance
- Provide role-based access control

## 📋 Checklist

### ✅ Completed Backend Structure
- [x] Database Models (User, Company, Team, Task, Report, Win, Notification)
- [x] API Controllers for all entities
- [x] Database Migrations
- [x] RESTful API routes
- [x] Authentication setup (Sanctum)
- [x] Environment configuration
- [x] Composer dependencies

### ✅ Completed Frontend Structure
- [x] React components (Calendar, Tasks, Reports, Wins, Notifications, Management)
- [x] Tailwind CSS styling
- [x] API service layer with Axios
- [x] Authentication context
- [x] Vite configuration
- [x] NPM dependencies
- [x] Responsive UI

### ✅ Completed Documentation
- [x] Comprehensive README
- [x] Backend setup guide
- [x] Frontend setup guide
- [x] Docker compose configuration
- [x] Docker files for both services

### ✅ Completed Configuration Files
- [x] Laravel .env template
- [x] Vite config
- [x] Tailwind config
- [x] PostCSS config
- [x] Git ignore files

## 🚀 Quick Start

### Clone/Navigate to Project
```bash
cd /Users/stephenoware-dweteh/Documents/Daddy\ Ash\ NEW
```

### Setup Backend
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Create database: performance_tracker
php artisan migrate
php artisan serve
```

### Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### Or Use Docker
```bash
docker-compose up -d
```

Then access at: http://localhost:3000

## 📦 What's Included

### Backend (Laravel API)
- 7 Database Models with relationships
- 6 API Controllers with CRUD operations
- 7 Database migrations
- Complete API routes
- Authentication with Sanctum
- Sample .env configuration

### Frontend (React)
- 6 Core components
- Authentication context
- API service layer
- Tailwind CSS styling
- Responsive dashboard
- Calendar interface
- Task management UI
- Report submission forms
- Win recording forms
- Notification panel

### Infrastructure
- Docker Compose for full stack deployment
- Dockerfiles for both services
- Development-ready configurations
- Complete documentation

## 🌍 Environment Variables

### Backend (.env)
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=performance_tracker
DB_USERNAME=root
DB_PASSWORD=
SANCTUM_STATEFUL_DOMAINS=localhost:3000
```

### Frontend (vite.config.js)
```
Server proxy configured for /api routes
Proxy target: http://localhost:8000
```

## 📚 Documentation Files

- **README.md** - Complete project documentation
- **SETUP.md** - Quick setup summary
- **docs/BACKEND_SETUP.md** - Detailed backend configuration
- **docs/FRONTEND_SETUP.md** - Detailed frontend configuration

## 🔐 Security Features

- Laravel Sanctum authentication
- JWT token-based API security
- Role-based access control (Employer/Employee)
- Protected API routes
- Secure password hashing

## 📊 Database Tables

1. **users** - Employee and employer accounts
2. **companies** - Organization structure
3. **teams** - Team grouping within companies
4. **tasks** - Work assignments with status tracking
5. **reports** - Daily work reports with approval workflow
6. **wins** - Employee achievements and milestones
7. **notifications** - System notifications for all users

## 🎨 UI Features

- Clean, modern interface with Tailwind CSS
- Responsive design (mobile-friendly)
- Calendar-based date selection
- Data tables with sorting
- Form validation
- Status indicators
- Real-time notifications
- Dark mode ready (can be added)

## 🔄 API Response Format

All endpoints return JSON:
```json
{
  "id": 1,
  "title": "Example",
  "status": "active",
  "created_at": "2024-01-01"
}
```

## 🛠️ Development Tools

- Vite for fast frontend builds
- Laravel Artisan CLI
- MySQL database
- Composer for PHP dependencies
- npm for JavaScript dependencies

## 📱 Features by Role

### Employer
- Create companies and teams
- Assign tasks to employees
- Review and approve reports
- Monitor employee progress
- View performance metrics

### Employee
- View assigned tasks
- Update task status
- Submit daily reports
- Record achievements
- View personal notifications

## 🎓 Learning Resources

- Laravel Documentation: https://laravel.com/docs
- React Documentation: https://react.dev
- Tailwind CSS: https://tailwindcss.com
- MySQL: https://dev.mysql.com

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure MySQL is running
- Verify credentials in .env
- Check database exists

### Frontend API Errors
- Ensure backend is running on :8000
- Check vite proxy configuration
- Verify CORS settings

### Missing Dependencies
- Run `composer install` in backend
- Run `npm install` in frontend
- Clear caches and rebuild

## 🚢 Deployment

Ready for deployment to:
- AWS (EC2/RDS)
- Heroku
- DigitalOcean
- Azure
- Docker containers

## 📞 Support

For issues or questions, refer to:
1. Individual setup guides in docs/
2. Laravel documentation
3. React documentation
4. Console error messages

## ✨ Future Enhancements

- Mobile app (React Native)
- Real-time WebSocket notifications
- Advanced analytics dashboard
- File management system
- Performance scoring algorithm
- Payroll integration
- Slack/Teams integration

## 📄 License

Private Project - All Rights Reserved

---

**Status: ✅ Ready for Development**

Start developing by following the Quick Start section above!
