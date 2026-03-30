# Frontend Setup Guide

## Requirements

- Node.js 16 or higher
- npm or yarn
- Modern web browser

## Installation Steps

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 4. Build for Production
```bash
npm run build
```

The optimized build will be in the `dist/` directory.

### 5. Preview Production Build
```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── CalendarDashboard.jsx
│   ├── TaskList.jsx
│   ├── ReportSubmission.jsx
│   ├── WinsRecorder.jsx
│   ├── CompanyManagement.jsx
│   └── Notifications.jsx
├── context/            # React Context for state management
│   └── AuthContext.jsx
├── services/           # API service layer
│   └── api.js
├── pages/              # Page components (for routing)
├── hooks/              # Custom React hooks
├── App.jsx             # Main app component
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## Key Components

### CalendarDashboard
- Monthly calendar view
- Date selection
- Navigation between months

### TaskList
- Display tasks for selected date
- Task status management
- Priority display
- Filtering and sorting

### ReportSubmission
- Daily report form
- File attachments
- Submission tracking

### WinsRecorder
- Achievement recording
- Task linking
- Date-based tracking

### CompanyManagement
- Company CRUD operations
- Team management
- Employee assignment

### Notifications
- Real-time notification display
- Mark as read functionality
- Auto-refresh

## Authentication

The app uses JWT tokens stored in localStorage. The AuthContext provides:
- `login(email, password)` - Authenticate user
- `logout()` - Clear authentication
- `user` - Current user object
- `token` - JWT token
- `loading` - Loading state

## API Integration

All API calls use axios with interceptors that automatically:
- Add JWT token to headers
- Set correct Content-Type
- Handle errors

API endpoint: `http://localhost:8000/api`

## Tailwind CSS

This project uses Tailwind CSS for styling. Key config files:
- `tailwind.config.js` - Tailwind configuration
- `postcss.config.js` - PostCSS configuration
- `src/index.css` - Global styles with Tailwind directives

## Development Features

- **HMR (Hot Module Replacement)** - Changes reflect immediately
- **Fast Build** - Vite provides lightning-fast development experience
- **Tailwind Utilities** - Full utility-first CSS framework
- **ES6+ Support** - Modern JavaScript syntax

## Environment Variables

Create a `.env.local` file for environment-specific settings:

```
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME="Performance Tracker"
```

Access in code via `import.meta.env.VITE_*`

## Deployment

### Netlify
```bash
npm run build
# Deploy the dist/ folder
```

### Vercel
```bash
npm run build
# Connect your repository and set build command to: npm run build
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Tailwind Styles Not Applied
```bash
# Rebuild CSS
npm run dev
```

### CORS Errors
- Ensure backend is running on correct port
- Check CORS configuration in Laravel backend
- Verify proxy in vite.config.js

### Build Failures
```bash
npm run build --verbose
# Check for missing dependencies or syntax errors
```

## Performance Tips

- Use code splitting for large components
- Implement lazy loading for routes
- Optimize images
- Use production builds for testing before deployment
- Monitor bundle size with `vite-plugin-analyze`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Next Steps

1. Complete backend setup
2. Configure API endpoints
3. Set up database
4. Run migrations
5. Create sample data
6. Test authentication flow
7. Deploy to production
