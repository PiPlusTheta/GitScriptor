# GitScriptor API Database Setup Guide

## 🗄️ Database Migration & Setup

### Prerequisites

1. **PostgreSQL Database**
   ```bash
   # Install PostgreSQL (Ubuntu/Debian)
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   
   # Start PostgreSQL service
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   
   # Create database and user
   sudo -u postgres psql
   CREATE DATABASE gitscriptor;
   CREATE USER gitscriptor_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE gitscriptor TO gitscriptor_user;
   \q
   ```

2. **Environment Variables**
   Create a `.env` file in the API directory:
   ```env
   # Database
   DATABASE_URL=postgresql://gitscriptor_user:your_password@localhost:5432/gitscriptor
   
   # JWT Security
   SECRET_KEY=your-super-secret-jwt-key-change-in-production
   
   # Token Encryption
   ENCRYPTION_KEY=your-32-byte-base64-encoded-encryption-key
   
   # GitHub OAuth
   GITHUB_CLIENT_ID=your_github_oauth_app_client_id
   GITHUB_CLIENT_SECRET=your_github_oauth_app_client_secret
   GITHUB_REDIRECT_URI=http://localhost:8000/auth/callback
   
   # Environment
   ENVIRONMENT=development
   ```

### 🚀 Quick Setup

1. **Install Dependencies**
   ```bash
   cd apps/api
   poetry install
   ```

2. **Initialize Database**
   ```bash
   # Initialize with all tables
   python migrate.py init
   ```

3. **Start the API**
   ```bash
   poetry run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
   ```

### 📋 Migration Commands

The `migrate.py` script provides easy database management:

```bash
# Initialize database (first time setup)
python migrate.py init

# Apply pending migrations
python migrate.py upgrade

# Create a new migration
python migrate.py revision

# Check current migration
python migrate.py current

# View migration history
python migrate.py history

# Reset database (⚠️ DESTROYS ALL DATA)
python migrate.py reset
```

### 🏗️ Database Schema

The initial migration creates these tables:

#### **users**
- User accounts with GitHub OAuth integration
- Stores encrypted GitHub access tokens
- User profile information and preferences

#### **user_settings**
- User-specific settings and preferences
- Default README styles, themes, notifications

#### **repositories**
- Synced GitHub repositories
- Repository metadata, statistics, languages
- Links to user accounts

#### **readme_drafts**
- Saved README drafts
- Version control for drafts
- Links to repositories and users

#### **generation_history**
- Complete audit trail of README generations
- Performance metrics, token usage
- Success/failure tracking

#### **generated_readmes** *(deprecated)*
- Legacy table for backward compatibility

### 🔧 Advanced Migration Management

#### Manual Alembic Commands
```bash
cd src

# Check current revision
alembic current

# Upgrade to specific revision
alembic upgrade <revision>

# Downgrade to specific revision
alembic downgrade <revision>

# Generate new migration
alembic revision --autogenerate -m "Description"

# Show migration history
alembic history --verbose

# Show SQL for migration (dry run)
alembic upgrade head --sql
```

#### Creating Custom Migrations
```bash
# Create a new empty migration
alembic revision -m "Add new feature"

# Create migration with auto-detection
alembic revision --autogenerate -m "Auto-detected changes"
```

### 🛡️ Security Features

#### Token Encryption
- GitHub access tokens are encrypted using Fernet (AES 128)
- Encryption key should be securely managed in production
- Fallback to base64 encoding for development

#### JWT Authentication
- Secure JWT tokens for API authentication
- Configurable expiration (default: 30 days)
- HMAC signing with secret key

### 🐳 Docker Setup

If using Docker:

```dockerfile
# Database service in docker-compose.yml
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: gitscriptor
      POSTGRES_USER: gitscriptor_user
      POSTGRES_PASSWORD: your_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 🔍 Troubleshooting

#### Common Issues

1. **Connection Error**
   ```
   FATAL: database "gitscriptor" does not exist
   ```
   **Solution**: Create the database first
   ```bash
   sudo -u postgres createdb gitscriptor
   ```

2. **Permission Denied**
   ```
   FATAL: role "gitscriptor_user" does not exist
   ```
   **Solution**: Create the user
   ```bash
   sudo -u postgres createuser --interactive gitscriptor_user
   ```

3. **Migration Conflict**
   ```
   Multiple heads in database
   ```
   **Solution**: Merge migrations
   ```bash
   alembic merge heads -m "Merge migrations"
   ```

4. **Encryption Key Error**
   ```
   Invalid key format
   ```
   **Solution**: Generate a proper encryption key
   ```python
   from cryptography.fernet import Fernet
   print(Fernet.generate_key().decode())
   ```

### 📊 Monitoring Database Health

The API includes database health monitoring:
- **GET /status** - Shows database connection status
- **GET /health** - Basic health check
- Automatic connection retry logic
- Database statistics and metrics

### 🔄 Production Deployment

For production deployment:

1. **Use a managed PostgreSQL service** (AWS RDS, Google Cloud SQL, etc.)
2. **Set strong environment variables**
3. **Enable SSL connections**
4. **Set up database backups**
5. **Configure connection pooling**
6. **Monitor database performance**

### 📝 Migration Best Practices

1. **Always backup** before running migrations in production
2. **Test migrations** in a staging environment first
3. **Review generated migrations** before applying
4. **Keep migrations small** and focused
5. **Document breaking changes** in migration comments
6. **Use transactions** for data migrations

### 🎯 Next Steps

After setting up the database:

1. **Configure GitHub OAuth** in your GitHub Developer Settings
2. **Test the API endpoints** using the interactive docs at `/docs`
3. **Set up your frontend** to consume the API
4. **Configure monitoring** and logging
5. **Set up CI/CD** for automated deployments

The database is now ready to support all GitScriptor API features! 🚀
