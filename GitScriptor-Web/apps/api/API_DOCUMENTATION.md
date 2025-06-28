# GitScriptor API - Complete Endpoint Documentation

## 🚀 Core API Endpoints

### 1. README Generation
**POST** `/generate/`
- **Purpose**: Generate README from repository URL
- **Authentication**: Optional (enhanced features for authenticated users)
- **Request Body**:
```json
{
  "repo_url": "https://github.com/username/repository",
  "style": "classic|modern|minimal|comprehensive",
  "include_sections": {
    "badges": true,
    "toc": true,
    "installation": true,
    "usage": true,
    "contributing": false
  },
  "template_id": "classic",
  "custom_sections": ["features", "api"],
  "ai_model": "default|advanced|premium"
}
```
- **Response**:
```json
{
  "success": true,
  "markdown": "# Generated README content...",
  "elapsed_ms": 2500,
  "style": "classic",
  "template_used": "classic",
  "sections_generated": ["header", "description", "installation"],
  "word_count": 450,
  "repository": {
    "id": 123,
    "name": "repository",
    "full_name": "username/repository",
    "description": "A cool project",
    "language": "JavaScript",
    "stars_count": 150,
    "forks_count": 25
  },
  "metadata": {
    "repo_url": "https://github.com/username/repository",
    "generated_at": 1703123456.789,
    "user_authenticated": true,
    "ai_model": "default"
  },
  "generation_id": "gen_1703123456_123"
}
```
- **Error Response**:
```json
{
  "error": "GITHUB_ERROR|GEMINI_ERROR|VALIDATION_ERROR|TIMEOUT",
  "detail": "Detailed error message",
  "code": "ERROR_CODE",
  "timestamp": "2023-12-21T10:30:00Z",
  "path": "/generate/"
}
```

## 🔐 Authentication Endpoints

### 2. GitHub OAuth Login
**GET** `/auth/login`
- **Purpose**: Redirect to GitHub OAuth
- **Response**: Redirects to GitHub OAuth

### 3. GitHub OAuth Callback
**GET** `/auth/callback?code={code}`
- **Purpose**: Handle GitHub OAuth callback
- **Response**:
```json
{
  "user": {
    "id": 123,
    "github_id": 456789,
    "username": "johndoe",
    "email": "john@example.com",
    "name": "John Doe",
    "avatar_url": "https://github.com/avatar.jpg",
    "bio": "Software Developer",
    "location": "San Francisco",
    "company": "ACME Corp",
    "public_repos": 25,
    "followers": 100,
    "following": 150,
    "is_active": true,
    "created_at": "2023-01-01T00:00:00Z"
  },
  "access_token": "jwt_token_here",
  "token_type": "bearer",
  "message": "Login successful"
}
```

### 4. User Profile
**GET** `/auth/me`
- **Authentication**: Required
- **Response**: User object (same as login response)

### 5. Logout
**POST** `/auth/logout`
- **Authentication**: Required
- **Response**:
```json
{
  "message": "Logout successful"
}
```

## 📁 Repository Management

### 6. User Repositories
**GET** `/repositories/`
- **Authentication**: Required
- **Query Parameters**:
  - `sort`: stars, updated, created, name
  - `direction`: asc, desc
  - `language`: JavaScript, Python, TypeScript, etc.
  - `type`: all, public, private
  - `page`: 1, 2, 3...
  - `per_page`: 10, 25, 50
- **Response**:
```json
{
  "repositories": [
    {
      "id": 123,
      "github_id": 456789,
      "name": "my-project",
      "full_name": "username/my-project",
      "description": "A cool project",
      "url": "https://github.com/username/my-project",
      "language": "JavaScript",
      "languages": {"JavaScript": 75.5, "CSS": 24.5},
      "topics": ["web", "react", "api"],
      "stars_count": 150,
      "forks_count": 25,
      "is_private": false,
      "github_created_at": "2023-01-01T00:00:00Z",
      "github_updated_at": "2023-12-20T15:30:00Z",
      "readme_count": 3,
      "last_readme_generated": "2023-12-20T10:00:00Z",
      "total_generations": 3
    }
  ],
  "total": 25,
  "page": 1,
  "per_page": 25,
  "total_pages": 1,
  "has_next": false,
  "has_prev": false
}
```

### 7. Repository Details
**GET** `/repositories/{repository_id}`
- **Authentication**: Required
- **Response**: Single repository object

### 8. Sync Repositories
**GET** `/repositories/sync`
- **Authentication**: Required
- **Response**:
```json
{
  "message": "Successfully synced 5 new repositories",
  "total_repositories": 25
}
```

## 📊 Repository Insights

### 9. Repository Analytics
**GET** `/repositories/{repository_id}/analytics`
- **Authentication**: Required
- **Response**:
```json
{
  "repository_id": 123,
  "language_breakdown": {
    "JavaScript": 75.5,
    "CSS": 20.0,
    "HTML": 4.5
  },
  "complexity_score": 75.5,
  "documentation_score": 60.0,
  "activity_score": 85.2,
  "last_commit": "2023-12-20T15:30:00Z",
  "commit_frequency": {
    "2023-12": 15,
    "2023-11": 22,
    "2023-10": 18
  },
  "contributor_count": 3,
  "issue_resolution_rate": 0.8,
  "code_quality_metrics": {}
}
```

## 📝 Editor & Export

### 10. Save README Draft
**POST** `/readme/drafts`
- **Authentication**: Required
- **Request Body**:
```json
{
  "repository_id": 123,
  "title": "My README Draft",
  "content": "# My Project\n\nContent here...",
  "style": "modern",
  "metadata": {
    "template_used": "comprehensive",
    "auto_save": true
  }
}
```
- **Response**: ReadmeDraft object

### 11. Get README Drafts
**GET** `/readme/drafts`
- **Authentication**: Required
- **Query Parameters**: page, per_page, repository_id
- **Response**: Paginated drafts with repository info

### 12. Update README Draft
**PUT** `/readme/drafts/{draft_id}`
- **Authentication**: Required
- **Request Body**: Partial draft update
- **Response**: Updated draft object

### 13. Delete README Draft
**DELETE** `/readme/drafts/{draft_id}`
- **Authentication**: Required
- **Response**: Success message

### 14. Commit README to GitHub
**POST** `/readme/commit`
- **Authentication**: Required
- **Request Body**:
```json
{
  "repository_id": 123,
  "content": "# README content to commit",
  "commit_message": "Update README.md",
  "branch": "main"
}
```
- **Response**:
```json
{
  "success": true,
  "commit_sha": "abc123def456",
  "commit_url": "https://github.com/user/repo/commit/abc123",
  "message": "README committed successfully"
}
```

## 📚 History & Saved Projects

### 15. Generation History
**GET** `/history/`
- **Authentication**: Required
- **Query Parameters**: page, per_page, status, style, repository_id
- **Response**: Paginated generation history with repository info

### 16. Get Single History Item
**GET** `/history/{history_id}`
- **Authentication**: Required
- **Response**: Single history item

### 17. Delete History Item
**DELETE** `/history/{history_id}`
- **Authentication**: Required
- **Response**: Success message

### 18. Generation Statistics
**GET** `/history/stats`
- **Authentication**: Required
- **Response**:
```json
{
  "total_generations": 50,
  "successful_generations": 47,
  "failed_generations": 3,
  "average_generation_time": 2500.5,
  "total_tokens_used": 150000,
  "most_used_style": "modern",
  "generations_by_month": {
    "2023-12": 15,
    "2023-11": 20,
    "2023-10": 15
  },
  "popular_languages": {
    "JavaScript": 20,
    "Python": 15,
    "TypeScript": 10
  }
}
```

## ⚙️ Settings & Configuration

### 19. User Settings
**GET** `/user/settings`
- **Authentication**: Required
- **Response**:
```json
{
  "id": 1,
  "user_id": 123,
  "default_style": "modern",
  "auto_save_drafts": true,
  "email_notifications": true,
  "theme": "dark",
  "language": "en",
  "timezone": "UTC",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-12-20T10:00:00Z"
}
```

### 20. Update Settings
**PUT** `/user/settings`
- **Authentication**: Required
- **Request Body**: Partial settings update
- **Response**: Updated settings object

### 21. User Profile Extended
**GET** `/user/profile`
- **Authentication**: Required
- **Response**: User object with statistics (total_repositories, total_readmes_generated, total_drafts)

## 🎨 Templates & Styles

### 22. Get Templates and Styles
**GET** `/templates/`
- **Response**:
```json
{
  "templates": [
    {
      "id": "classic",
      "name": "Classic",
      "description": "Traditional README format",
      "style": "classic",
      "sections": ["header", "description", "installation"],
      "preview": "# Project Name\\n\\nDescription...",
      "is_premium": false
    }
  ],
  "styles": [
    {
      "name": "classic",
      "description": "Traditional GitHub README style",
      "sections": [...],
      "badges": true,
      "table_of_contents": false
    }
  ],
  "total": 4
}
```

### 23. Get Available Styles
**GET** `/templates/styles`
- **Response**: List of available styles with features

### 24. Get Available Sections
**GET** `/templates/sections`
- **Response**: List of available README sections

## 🔍 Search & Autocomplete

### 25. Search Repositories
**GET** `/search/repositories`
- **Query Parameters**: q, limit
- **Authentication**: Optional (enhanced for authenticated users)
- **Response**:
```json
{
  "query": "react",
  "results": [
    {
      "id": 123,
      "name": "react",
      "full_name": "facebook/react",
      "description": "A declarative library",
      "url": "https://github.com/facebook/react",
      "language": "JavaScript",
      "stars": 200000,
      "is_owner": false,
      "updated_at": "2023-12-20T10:00:00Z"
    }
  ],
  "total": 50,
  "suggestions": ["facebook/react", "vuejs/vue"]
}
```

### 26. Search Languages
**GET** `/search/languages`
- **Query Parameters**: q
- **Authentication**: Optional
- **Response**: Matching programming languages

### 27. Search Users
**GET** `/search/users`
- **Query Parameters**: q, limit
- **Authentication**: Required
- **Response**: GitHub users matching query

### 28. Get Search Suggestions
**GET** `/search/suggestions`
- **Query Parameters**: type (repository|language|user)
- **Authentication**: Optional
- **Response**: Popular search suggestions

## 🏥 Health & Monitoring

### 29. Health Check
**GET** `/health/`
- **Response**:
```json
{
  "ok": true
}
```

### 30. API Status
**GET** `/status`
- **Response**:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "production",
  "uptime": "5 days, 10 hours",
  "database": {
    "connected": true,
    "total_users": 1500,
    "total_repositories": 25000,
    "total_generations": 50000,
    "recent_generations_24h": 150
  },
  "system": {
    "cpu_percent": 25.5,
    "memory_percent": 45.2,
    "disk_percent": 30.1
  },
  "statistics": {
    "total_generations": 50000,
    "failed_generations": 250,
    "success_rate": 99.5,
    "average_generation_time_ms": 2500.5
  }
}
```

## 🛡️ Error Handling

All endpoints return consistent error responses:
```json
{
  "error": "ERROR_CODE",
  "detail": "Human readable error message",
  "code": "ERROR_CODE",
  "timestamp": "2023-12-21T10:30:00Z",
  "path": "/api/endpoint",
  "request_id": "req_abc123"
}
```

**Common Error Codes:**
- `NOT_FOUND` - Resource not found (404)
- `UNAUTHORIZED` - Authentication required (401)
- `FORBIDDEN` - Access denied (403)
- `RATE_LIMITED` - Too many requests (429)
- `VALIDATION_ERROR` - Invalid input data (422)
- `GITHUB_ERROR` - GitHub API error (502)
- `GEMINI_ERROR` - AI service error (502)
- `INTERNAL_ERROR` - Server error (500)

## 🔗 Base URL

**Development**: `http://localhost:8000`
**Production**: `https://api.gitscriptor.com`

All endpoints support CORS and return JSON responses with appropriate HTTP status codes.
