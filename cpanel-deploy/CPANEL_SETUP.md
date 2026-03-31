# cPanel Deployment Guide — Daddy Ash Ltd

## Files in this folder
| File | Purpose |
|------|---------|
| `performance_tracker.sql` | Full MySQL database dump (import this first) |
| `frontend-dist.zip` | Built React app — goes into `public_html` |
| `backend.zip` | Laravel API — goes **outside** `public_html` |

---

## Step 1 — Import the Database

1. In cPanel → **MySQL Databases**, create a new database, user, and grant all privileges.
2. Open **phpMyAdmin**, select the new database, click **Import**, and upload `performance_tracker.sql`.

---

## Step 2 — Deploy the Backend (Laravel)

1. Upload and extract `backend.zip` to a folder **outside** `public_html`, e.g. `/home/<user>/daddyash_api/`.
2. In cPanel → **Terminal** (or SSH), run:

```bash
cd ~/daddyash_api

# Install production dependencies
composer install --no-dev --optimize-autoloader

# Copy and edit the environment file
cp .env.example .env
```

3. Edit `.env` with your cPanel values:

```dotenv
APP_NAME="Daddy Ash Ltd"
APP_ENV=production
APP_KEY=                        # generated in next step
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

DB_CONNECTION=mysql
DB_HOST=localhost               # always localhost on cPanel
DB_PORT=3306
DB_DATABASE=<cpanel_db_name>
DB_USERNAME=<cpanel_db_user>
DB_PASSWORD=<cpanel_db_password>

SANCTUM_STATEFUL_DOMAINS=yourdomain.com
SESSION_DOMAIN=.yourdomain.com

# Leave MAIL/SMS blank — credentials are stored in the DB
```

4. Finish setup:

```bash
php artisan key:generate
php artisan storage:link
php artisan migrate --force   # skip if you imported the SQL dump
php artisan config:cache
php artisan route:cache
```

5. **Point the Laravel public folder to cPanel's `public_html`** — two options:
   - **Subdomain API** (recommended): Create a subdomain `api.yourdomain.com` and set its document root to `~/daddyash_api/public`.
   - **Symlink**: `ln -s ~/daddyash_api/public ~/public_html/api`

6. Add a cPanel **Cron Job** for scheduled notifications:
   ```
   * * * * * /usr/local/bin/php /home/<user>/daddyash_api/artisan schedule:run >> /dev/null 2>&1
   ```

---

## Step 3 — Deploy the Frontend (React/Vite)

1. Upload and extract `frontend-dist.zip` into `public_html` (or a subdirectory).
   - The `index.html` and `assets/` folder should sit directly inside `public_html`.
2. If the API lives at a different URL than the frontend, update `VITE_API_URL` **before** rebuilding, or edit the deployed JS (not ideal) — best to rebuild with the correct `.env`.
3. Create/edit `public_html/.htaccess` to enable React Router:

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

---

## Step 4 — CORS

In `backend/config/cors.php`, make sure `allowed_origins` includes your frontend domain:

```php
'allowed_origins' => ['https://yourdomain.com'],
```

Then re-run `php artisan config:cache`.

---

## Step 5 — Storage Permissions

```bash
chmod -R 775 ~/daddyash_api/storage
chmod -R 775 ~/daddyash_api/bootstrap/cache
```

---

## Quick Checklist

- [ ] Database imported
- [ ] `.env` updated with cPanel DB credentials
- [ ] `php artisan key:generate` run
- [ ] `php artisan storage:link` run
- [ ] Subdomain/document root pointing to `public/`
- [ ] Cron job added for scheduler
- [ ] Frontend extracted to `public_html`
- [ ] `.htaccess` added for React Router
- [ ] CORS updated with live domain
