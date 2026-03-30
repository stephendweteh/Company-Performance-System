# Backend Setup Guide

## Requirements

- PHP 8.2 or higher
- Composer
- MySQL 8.0 or higher
- Node.js 16+ (for frontend compilation if needed)

## Installation Steps

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
composer install
```

### 3. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=performance_tracker
DB_USERNAME=root
DB_PASSWORD=your_password
```

### 4. Generate Application Key
```bash
php artisan key:generate
```

### 5. Create Database
```bash
mysql -u root -p
CREATE DATABASE performance_tracker;
EXIT;
```

### 6. Run Migrations
```bash
php artisan migrate
```

### 7. (Optional) Seed Database
```bash
php artisan db:seed
```

### 8. Start Laravel Server
```bash
php artisan serve
```

The API will be available at `http://localhost:8000`

## API Routes

All routes are in `/routes/api.php` and require authentication via Sanctum tokens.

### Authentication Endpoints
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `POST /api/logout` - User logout

### Resource Endpoints
- `/api/tasks` - Task management
- `/api/reports` - Report management
- `/api/wins` - Win/Achievement management
- `/api/companies` - Company management
- `/api/teams` - Team management
- `/api/notifications` - Notification management

## Key Features

### Models
- User (with roles: admin, employer, employee)
- Company
- Team
- Task
- Report
- Win
- Notification

### Controllers
- TaskController
- ReportController
- WinController
- CompanyController
- TeamController
- NotificationController

### Database Migrations
All database tables are automatically created via migrations.

## Troubleshooting

### "Class 'Illuminate\Support\Facades\Schema' not found"
```bash
composer dump-autoload
php artisan key:generate
```

### "SQLSTATE[HY000]: General error: 1366 Incorrect string value"
Ensure MySQL is set to UTF-8MB4 collation.

### "Route [login] not defined"
Make sure all migrations have completed successfully:
```bash
php artisan migrate:reset
php artisan migrate
```

## Development Tips

- Use `php artisan tinker` for quick database queries and testing
- Enable `APP_DEBUG=true` in `.env` for detailed error messages
- Use `php artisan make:model ModelName -m` to create new models and migrations
- Check `storage/logs/laravel.log` for error details

## Production Deployment

Before deploying to production:

1. Set `APP_ENV=production`
2. Set `APP_DEBUG=false`
3. Set a strong `APP_KEY`
4. Configure appropriate database credentials
5. Run `php artisan config:cache`
6. Run `php artisan route:cache`
7. Ensure proper file permissions on `storage/` and `bootstrap/cache/`
