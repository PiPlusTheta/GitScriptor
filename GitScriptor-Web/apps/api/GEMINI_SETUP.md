# GitScriptor API Setup Guide

## Gemini API Configuration

To enable AI-powered README generation, you need to set up the Google Gemini API.

### 1. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure Environment

Add your Gemini API key to the `.env` file:

```bash
# AI/Gemini Configuration
GEMINI_API_KEY=AIzaSyBe664wCJ3_w7qexXZ4QEEkbIklh5rKRiU
```

### 3. Test the Configuration

You can test the setup using the test scripts:

```bash
# Test core functionality
python test_gitscriptor.py

# Test AI integration specifically  
python test_ai.py
```

## API Endpoints

### Generate README

```bash
POST /generate/
```

**Request Body:**
```json
{
  "repo_url": "https://github.com/username/repository",
  "style": "classic"
}
```

**Styles:**
- `minimal`: Simple, concise README
- `classic`: Standard README with all common sections
- `comprehensive`: Detailed README with extensive documentation

**Example cURL:**
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBe664wCJ3_w7qexXZ4QEEkbIklh5rKRiU" \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "contents": [
      {
        "parts": [
          {
            "text": "Generate a README for this repository: https://github.com/octocat/Hello-World"
          }
        ]
      }
    ]
  }'
```

**GitScriptor API Example:**
```bash
curl -X POST "http://127.0.0.1:8000/generate/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "repo_url": "https://github.com/octocat/Hello-World",
    "style": "classic"
  }'
```

### Repository Analysis

The system automatically analyzes repositories to detect:

- **Languages**: Python, JavaScript, TypeScript, Java, etc.
- **Frameworks**: React, FastAPI, Django, Spring, etc.
- **Project Structure**: Tests, documentation, CI/CD
- **Git Information**: Contributors, commits, last update

## Fallback Behavior

If the Gemini API is unavailable or not configured:

1. **No API Key**: Falls back to template-based generation
2. **Network Error**: Uses cached analysis + templates
3. **Rate Limiting**: Queues requests or uses fallback

## Security Notes

- **API Key Security**: Never commit your API key to version control
- **Rate Limits**: Gemini API has usage limits per month
- **Error Handling**: All API errors are gracefully handled with fallbacks

## Monitoring

Check API status at: `GET /status`

The response includes:
- Database connectivity
- System resources
- Generation statistics
- API health metrics

## Troubleshooting

### Common Issues

1. **"GEMINI_API_KEY not found"**
   - Ensure the key is set in `.env` file
   - Restart the server after adding the key

2. **"Failed to clone repository"**
   - Check Git installation
   - Verify repository URL is accessible
   - Ensure network connectivity

3. **"Network error calling Gemini API"**
   - Check internet connection
   - Verify API key is valid
   - Check Gemini API status

4. **Rate limiting**
   - Monitor your API usage in Google Cloud Console
   - Implement request queuing for high-volume usage

### Debug Mode

Set environment variable for detailed logging:

```bash
ENVIRONMENT=development
```

This enables verbose error messages and request logging.

## Production Deployment

For production environments:

1. **Set secure environment variables**
2. **Configure proper logging**
3. **Set up monitoring and alerting**
4. **Implement caching for frequently analyzed repositories**
5. **Configure rate limiting and request queuing**

## Development

To modify the AI prompts or add new styles:

1. Edit `src/services/gitscriptor_core.py`
2. Modify the `create_readme_prompt()` function
3. Add new style conditions in `generate_readme()`
4. Test changes with `python test_gitscriptor.py`
