# Easy Mart

A modern e-commerce application built with Laravel and React.

## Pushing to GitHub

Your `.env` file is in `.gitignore`, so **it will not be pushed** — only `.env.example` (no secrets) is committed.

1. Create a new repository on GitHub (do **not** add a README or .gitignore).
2. From your project folder:

```bash
git init
git add .
git commit -m "Initial commit: EasyMart e-commerce"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your GitHub username and repo name.  
Anyone who clones the repo will copy `.env.example` to `.env` and add their own keys (database, Stripe, etc.).

## Tech Stack

- **Backend**: Laravel 12 (PHP 8.2+)
- **Frontend**: React 19 with Inertia.js
- **Styling**: Tailwind CSS 4
- **Build Tool**: Vite
- **Database**: SQLite (development) / MySQL/PostgreSQL (production)

## Requirements

- PHP 8.2 or higher
- Composer
- Node.js 22 or higher
- NPM
- Database (SQLite for dev, MySQL/PostgreSQL recommended for production)

## Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/tintwym/easy_mart.git
cd easy_mart
```

2. Install dependencies and setup:
```bash
composer setup
```

This command will:
- Install PHP dependencies
- Create `.env` file from `.env.example`
- Generate application key
- Run database migrations
- Install Node.js dependencies
- Build frontend assets

3. Start the development server:
```bash
composer dev
```

This runs the Laravel server, queue worker, logs, and Vite dev server concurrently.

## Production Deployment

⚠️ **Important**: This is a full-stack Laravel application that requires a PHP runtime environment. It **cannot** be deployed to static hosting services like GitHub Pages, Netlify, or Vercel (without their Node.js runtime).

### Deployment Requirements

Your hosting environment must support:
- PHP 8.2+ with required extensions
- Composer
- Node.js (for building assets)
- Database server (MySQL/PostgreSQL recommended)
- Web server (Apache/Nginx)
- SSL certificate (recommended)

### Recommended Deployment Options

1. **Traditional PHP Hosting**
   - Shared hosting with PHP support (cPanel, Plesk)
   - Upload built files to `public_html` or web root
   - Point web server to the `public` directory

2. **Platform as a Service (PaaS)**
   - [Laravel Forge](https://forge.laravel.com) - Official Laravel deployment platform
   - [Laravel Vapor](https://vapor.laravel.com) - Serverless deployment on AWS
   - [Heroku](https://heroku.com) with PHP buildpack
   - [Railway](https://railway.app)
   - [Render](https://render.com)

3. **Virtual Private Server (VPS)**
   - DigitalOcean
   - AWS EC2
   - Linode
   - Vultr

4. **Containerized Deployment**
   - Docker with Docker Compose
   - Kubernetes

### Deployment Steps

1. **Build production assets:**
```bash
npm install
npm run build
```

2. **Optimize for production:**
```bash
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

3. **Set environment variables:**
   - Copy `.env.example` to `.env`
   - Set `APP_ENV=production`
   - Set `APP_DEBUG=false`
   - Configure database credentials
   - Generate `APP_KEY` with `php artisan key:generate`
   - Set correct `APP_URL`

4. **Run migrations:**
```bash
php artisan migrate --force
```

5. **Configure web server:**
   - Point document root to `/public` directory
   - Configure URL rewriting (Laravel includes `.htaccess` for Apache)
   - Set proper file permissions (storage and bootstrap/cache should be writable)

### Deploy to Heroku

1. **Create app**
   - [Heroku Dashboard](https://dashboard.heroku.com) → New app (or CLI: `heroku create your-app-name`).
   - Do **not** add Heroku Postgres; you’ll use Aiven for the database.

2. **Database: Aiven (MySQL or PostgreSQL)**
   - Create a [MySQL](https://aiven.io/mysql) or [PostgreSQL](https://aiven.io/postgresql) service on Aiven.
   - In the Aiven console, open your service → **Overview** → copy the **Connection URI** (e.g. `mysql://avnadmin:PASSWORD@xxx.aivencloud.com:PORT/defaultdb?ssl-mode=REQUIRED` or `postgres://...?sslmode=require`).
   - **Aiven MySQL (SSL):** Download the **CA Certificate** from the same Overview page and save it as `storage/app/ca.pem` in the project (or set `MYSQL_ATTR_SSL_CA` to its path). The app uses it to connect over SSL.
   - In Heroku: **Settings** → **Config Vars** → add:
     - `DATABASE_URL` = paste the Aiven connection URI (or use `DB_URL`; the app auto-detects MySQL vs PostgreSQL from the URL).

3. **Connect GitHub**
   - **Deploy** → Deployment method → **GitHub** → connect repo (e.g. `YOUR_USERNAME/easy_mart`).
   - Enable **Automatic deploys** from `main` if you want.

4. **Config vars** (Settings → Config Vars)
   - `APP_KEY` — run `php artisan key:generate --show` locally and paste the value.
   - `APP_ENV` — `production`
   - `APP_DEBUG` — `false`
   - `APP_URL` — `https://your-app-name.herokuapp.com` (use your app’s URL).
   - `STRIPE_KEY` — your Stripe publishable key.
   - `STRIPE_SECRET` — your Stripe secret key.
   - `DATABASE_URL` (or `DB_URL`) — Aiven MySQL or PostgreSQL connection URI (see step 2).

5. **Deploy**
   - **Deploy** → **Deploy branch** (e.g. `main`). Buildpack order must be **PHP first, then Node** (so `php` is available when Vite runs). The repo’s `app.json` sets this; if you created the app before that change, in **Settings** → **Buildpacks** put **heroku/php** above **heroku/nodejs**. The release phase runs `php artisan migrate --force`.

6. **Optional**
   - For file uploads (e.g. listing images) to persist, use a store like AWS S3 and set `FILESYSTEM_DISK=s3` and AWS env vars. On Heroku the filesystem is ephemeral.

Note: Heroku no longer has a free tier; you’ll need a paid dyno. Aiven may offer a free tier for PostgreSQL depending on region and plan.

### Domain Configuration

If deploying to `www.easymart.com.mm`:
- Configure DNS A/CNAME records to point to your server IP
- Set `APP_URL=https://www.easymart.com.mm` in `.env`
- Configure SSL certificate (Let's Encrypt recommended)

## Testing

Run the test suite:
```bash
composer test
```

This will:
- Run PHP linting with Pint
- Run PHPUnit tests

## Code Quality

- **PHP Linting**: `composer lint`
- **Frontend Formatting**: `npm run format`
- **Frontend Linting**: `npm run lint`
- **Type Checking**: `npm run types`

## License

MIT
