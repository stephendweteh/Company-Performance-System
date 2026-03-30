# Project Setup Summary

This project is a complete **Employee Performance Wins, Tasks & Reports Tracker** application.

## Quick Start

### Backend (Laravel API)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

Backend runs on: **http://localhost:8000**

### Frontend (React App)
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: **http://localhost:3000**

## 📋 Project Features

✅ **Calendar-based Dashboard** - Monthly calendar for date navigation
✅ **Task Management** - Create, assign, and track tasks
✅ **Daily Reports** - Submit work reports with status tracking
✅ **Achievements** - Record wins and key accomplishments
✅ **Company/Team Management** - Organize employees into companies and teams
✅ **Notifications** - Real-time alerts for important events
✅ **Role-based Access** - Employer and Employee roles with specific permissions

## 📁 File Structure

```
├── backend/
│   ├── app/Models/           [Database models]
│   ├── app/Http/Controllers/ [API endpoints]
│   ├── database/migrations/  [Database schema]
│   ├── routes/api.php        [API routes]
│   └── composer.json         [Dependencies]
│
├── frontend/
│   ├── src/components/       [React components]
│   ├── src/context/          [Auth & state management]
│   ├── src/services/         [API integration]
│   ├── src/App.jsx           [Main component]
│   └── package.json          [Dependencies]
│
├── database/
│   └── migrations/           [Migration files]
│
└── docs/
    ├── BACKEND_SETUP.md
    ├── FRONTEND_SETUP.md
    └── API_DOCUMENTATION.md
```

## 🔧 Tech Stack

**Frontend:**
- React 18
- Tailwind CSS
- Vite
- Axios

**Backend:**
- Laravel 11
- PHP 8.2
- MySQL

## 📊 Database Schema

**Available Tables:**
- users (employees, employers)
- companies
- teams
- tasks
- reports
- wins
- notifications

## 🚀 Next Steps

1. **Install Backend Dependencies**
   ```bash
   cd backend && composer install
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend && npm install
   ```

3. **Setup Database**
   - Create MySQL database named `performance_tracker`
   - Configure credentials in `backend/.env`

4. **Run Migrations**
   ```bash
   cd backend && php artisan migrate
   ```

5. **Start Both Servers**
   - Backend: `php artisan serve` (port 8000)
   - Frontend: `npm run dev` (port 3000)

6. **Access Application**
   - Open http://localhost:3000 in browser

## 📚 Documentation

- [Backend Setup Guide](./docs/BACKEND_SETUP.md)
- [Frontend Setup Guide](./docs/FRONTEND_SETUP.md)

## 🔐 Authentication

- Uses Laravel Sanctum for API authentication
- JWT tokens stored in browser localStorage
- Roles: admin, employer, employee

## 🎯 Core API Endpoints

- `POST /api/login` - User authentication
- `GET/POST /api/tasks` - Task management
- `GET/POST /api/reports` - Report management
- `GET/POST /api/wins` - Achievement tracking
- `GET/POST /api/companies` - Company management
- `GET/POST /api/teams` - Team management
- `GET /api/notifications` - Notifications

## ⚙️ Configuration Files

- **Backend**: `.env` (copy from `.env.example`)
- **Frontend**: `vite.config.js`, `tailwind.config.js`

## 💡 Development Tips

- Use `php artisan tinker` for quick database testing
- Frontend changes auto-reload with Vite HMR
- Check `storage/logs/laravel.log` for backend errors
- Use browser DevTools for frontend debugging

## 📞 Support

For setup help, refer to the individual setup guides or check the console logs for specific error messages.

---

**Status:** Ready for development 🚀
