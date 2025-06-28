# GitScriptor API

A production-ready FastAPI backend for GitScriptor - an AI-powered README generation service.

## 🚀 Features

- **AI-Powered README Generation** using Google Gemini API
- **Repository Analysis** with automatic language and framework detection  
- **Multiple README Styles** (minimal, classic, comprehensive)
- **User Authentication** with GitHub OAuth and JWT tokens
- **Database Management** with PostgreSQL and Alembic migrations
- **Comprehensive API** with health monitoring and analytics
- **Security Features** with encrypted token storage
- **Production Ready** with error handling, logging, and monitoring

## 📋 Prerequisites

- Python 3.11+
- PostgreSQL 12+
- Git
- Google Gemini API key (optional, for AI generation)

## 🛠️ Installation

### 1. Clone and Setup

```bash
git clone <repository-url>
cd GitScriptor-Web/apps/api
pip install -r requirements.txt
```

### 2. Environment Configuration

Copy and configure the environment file:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```bash
# Database Configuration
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/gitscriptor

# JWT Security
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256

# Token Encryption  
ENCRYPTION_KEY=your_encryption_key_here

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:8000/auth/callback

# AI/Gemini Configuration (optional)
GEMINI_API_KEY=your_gemini_api_key_here

# Environment
ENVIRONMENT=development
```

### 3. Database Setup

```bash
# Create database
python setup_db.py

# Run migrations
alembic upgrade head
```

### 4. Start the Server

```bash
python -m uvicorn src.main:app --reload --port 8000
```

## 📚 API Documentation

Once running, access the interactive API documentation:

- **Swagger UI**: http://127.0.0.1:8000/docs
- **ReDoc**: http://127.0.0.1:8000/redoc

## 🔑 Key Endpoints

### Authentication
- `POST /auth/github` - GitHub OAuth login
- `POST /auth/refresh` - Refresh JWT token
- `GET /auth/me` - Get current user

### README Generation
- `POST /generate/` - Generate README for repository
- `GET /generate/history` - Get generation history

### Repository Management
- `GET /repositories/` - List user repositories
- `POST /repositories/sync` - Sync with GitHub

### User Management
- `GET /users/me` - Get user profile
- `PUT /users/me` - Update user profile
- `GET /users/settings` - Get user settings

### Health & Monitoring
- `GET /health` - Basic health check
- `GET /status` - Detailed system status

## 🤖 AI-Powered Generation

GitScriptor uses Google Gemini API for intelligent README generation:

### Repository Analysis
- Automatically detects programming languages
- Identifies frameworks and libraries
- Analyzes project structure (tests, docs, CI/CD)
- Extracts Git metadata (contributors, commits)

### README Styles
- **Minimal**: Clean, concise documentation
- **Classic**: Standard sections with good balance
- **Comprehensive**: Detailed documentation with all sections

### Fallback System
- Template-based generation when AI is unavailable
- Graceful error handling with meaningful fallbacks
- No dependencies on external services for basic functionality

## 🔧 Configuration

### Gemini API Setup

See [GEMINI_SETUP.md](GEMINI_SETUP.md) for detailed instructions on:
- Getting a Gemini API key
- Configuring the environment
- Testing the setup
- Troubleshooting common issues

### Database Configuration

The API supports both PostgreSQL (production) and SQLite (development):

```bash
# PostgreSQL (recommended)
DATABASE_URL=postgresql://user:password@localhost:5432/gitscriptor

# SQLite (development only)
DATABASE_URL=sqlite:///./gitscriptor.db
```

## 🛡️ Security

### Authentication
- GitHub OAuth 2.0 integration
- JWT tokens with configurable expiration
- Secure token refresh mechanism

### Data Protection
- Token encryption using Fernet (AES)
- Environment-based configuration
- Secure password handling

### API Security
- Request rate limiting
- Input validation and sanitization
- CORS configuration
- Error message sanitization

## 📊 Monitoring

### Health Checks
```bash
curl http://localhost:8000/health
```

### System Status
```bash
curl http://localhost:8000/status
```

Provides information about:
- Database connectivity
- System resources (CPU, memory, disk)
- Generation statistics
- Recent activity metrics

## 🚀 Deployment

### Docker Deployment
```bash
docker build -t gitscriptor-api .
docker run -p 8000:8000 --env-file .env gitscriptor-api
```

### Production Considerations
- Use environment variables for all secrets
- Configure proper logging levels
- Set up database connection pooling
- Implement caching for frequently accessed data
- Configure reverse proxy (nginx) for static files
- Set up monitoring and alerting

## 🧪 Testing

Run the test suite:

```bash
# Test core functionality
python test_gitscriptor.py

# Test API endpoints (coming soon)
pytest tests/
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` endpoint for API details
- **Issues**: Report bugs on GitHub Issues
- **Questions**: Use GitHub Discussions

## 📈 Roadmap

- [ ] WebSocket support for real-time generation
- [ ] Plugin system for custom README templates
- [ ] Multiple AI provider support (OpenAI, Claude, etc.)
- [ ] Repository caching and incremental analysis
- [ ] Advanced analytics and usage metrics
- [ ] Team collaboration features
