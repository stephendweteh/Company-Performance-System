# Employee Performance Wins, Tasks & Reports Tracker

A comprehensive productivity and performance monitoring system that allows employers and employees to track work activities through tasks, daily reports, and achievements.

## Project Structure

```
├── backend/                 # Laravel PHP API
│   ├── app/
│   │   ├── Models/         # Database models
│   │   └── Http/
│   │       ├── Controllers/ # API controllers
│   │       └── Resources/  # API resources
│   ├── database/
│   │   ├── migrations/     # Database migrations
│   │   └── seeders/        # Database seeders
│   ├── routes/
│   │   └── api.php         # API routes
│   ├── config/
│   │   └── database.php    # Database configuration
│   ├── .env.example        # Environment template
│   └── composer.json       # PHP dependencies
│
├── frontend/                # React UI
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── context/        # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── App.jsx         # Main app component
│   │   ├── main.jsx        # Entry point
│   │   └── index.css       # Global styles
│   ├── package.json        # Node dependencies
│   ├── vite.config.js      # Vite configuration
│   ├── tailwind.config.js  # Tailwind CSS config
│   └── index.html          # HTML entry point
│
├── database/               # Database schemas & dumps
│   └── migrations/         # Migration files
│
└── docs/                   # Documentation
```

## Technology Stack

- **Frontend**: React 18 + Tailwind CSS + Vite
- **Backend**: Laravel 11 + PHP 8.2
- **Database**: MySQL 8.0+
- **Authentication**: Laravel Sanctum
- **API**: RESTful API with JSON responses

## Core Features

### 1. **Calendar-Based Dashboard**
- Monthly calendar view
- Date-based task and report management
- Easy navigation between dates

### 2. **Task Management**
- Employers create and assign tasks
- Tasks have status: Pending, In Progress, Completed
- Priority levels: Low, Medium, High, Critical
- Task accumulation until completion

### 3. **Daily Reports**
- Employees submit daily work reports
- Fields: Title, Work Done, Challenges, Wins, Attachments
- Employer review and approval workflow
- Report status tracking

### 4. **Achievements (Wins)**
- Track employee achievements
- Record win title and description
- Link wins to specific tasks
- Performance visibility

### 5. **Organization Management**
- Employer creates companies
- Company → Teams → Employees structure
- Manage employee assignments
- Team-based task assignments

### 6. **Performance Tracking**
- Completion rates
- Task metrics
- Report submissions
- Win tracking
- Analytics dashboard

### 7. **Notifications**
- Task assignments
- Deadline alerts
- Report submissions
- Win recordings
- Employer comments

## Setup Instructions

### Backend Setup (Laravel)

1. **Install dependencies**
   ```bash
   cd backend
   composer install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Database setup**
   ```bash
   # Create the database
   mysql -u root -p
   CREATE DATABASE performance_tracker;
   
   # Run migrations
   php artisan migrate
   ```

4. **Start the server**
   ```bash
   php artisan serve
   # Server runs at http://localhost:8000
   ```

### Frontend Setup (React)

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   # Server runs at http://localhost:3000
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

## API Endpoints

### Tasks
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/{id}` - Get task details
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

### Reports
- `GET /api/reports` - List reports
- `POST /api/reports` - Submit new report
- `GET /api/reports/{id}` - Get report details
- `PUT /api/reports/{id}/status` - Update report status

### Wins
- `GET /api/wins` - List achievements
- `POST /api/wins` - Record new win
- `GET /api/wins/{id}` - Get win details
- `DELETE /api/wins/{id}` - Delete win

### Companies
- `GET /api/companies` - List companies
- `POST /api/companies` - Create company
- `GET /api/companies/{id}` - Get company details
- `DELETE /api/companies/{id}` - Delete company

### Teams
- `GET /api/teams` - List teams
- `POST /api/teams` - Create team
- `GET /api/teams/{id}` - Get team details
- `DELETE /api/teams/{id}` - Delete team

### Notifications
- `GET /api/notifications` - List notifications
- `PUT /api/notifications/{id}/read` - Mark as read
- `PUT /api/notifications/mark-all-read` - Mark all as read

## System Roles

### Employer (Admin)
- Create companies and teams
- Assign tasks to employees
- Review employee reports
- Monitor employee progress
- View performance analytics

### Employee
- View assigned tasks
- Mark tasks as completed
- Submit daily reports
- Record achievements
- View performance metrics

## Database Schema

### Users Table
- id, name, email, password, role, company_id, team_id

### Companies Table
- id, company_name, owner_id

### Teams Table
- id, team_name, company_id

### Tasks Table
- id, title, description, assigned_to, created_by, team_id, start_date, due_date, status, priority

### Reports Table
- id, employee_id, report_date, title, work_done, challenges, wins, status, attachments

### Wins Table
- id, employee_id, title, description, date, task_id

### Notifications Table
- id, user_id, message, status, type, related_id

## Running the Application

### Option 1: Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
php artisan serve
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Then open http://localhost:3000

### Option 2: Using Docker (Optional)

Create `docker-compose.yml` for containerized deployment.

## Common Tasks

### Create Sample Data
```bash
cd backend
php artisan tinker

# Create employer
$employer = User::create([
    'name' => 'John Employer',
    'email' => 'employer@example.com',
    'password' => bcrypt('password'),
    'role' => 'employer'
])

# Create company
$company = Company::create([
    'company_name' => 'Acme Corp',
    'owner_id' => $employer->id
])
```

### Reset Database
```bash
cd backend
php artisan migrate:fresh --seed
```

## Troubleshooting

### CORS Issues
- Update `.env` file `SANCTUM_STATEFUL_DOMAINS` to match your frontend domain
- Ensure `SESSION_DOMAIN` is correctly set

### Database Connection Error
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists

### Frontend API Errors
- Check backend is running on correct port
- Verify API proxy configuration in `vite.config.js`
- Check browser console for error details

## Future Enhancements

- Mobile app (React Native)
- AI productivity insights
- Performance scoring system
- Payroll integration
- Slack/WhatsApp notifications
- Real-time notifications with WebSockets
- Advanced analytics dashboard
- File management system
- Employee feedback system

## Dependencies

### Backend (Laravel)
- laravel/framework
- laravel/sanctum
- laravel/tinker
- mysql (database)

### Frontend (React)
- react
- react-dom
- axios
- tailwindcss

## License

Private - All Rights Reserved

## Support

For issues or questions, please contact the development team.
