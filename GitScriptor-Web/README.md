# GitScriptor-Web

A modern web application for automatically generating beautiful README files from GitHub repositories, designed with GitHub's official design system.

## 🚀 Quick Start

Run the entire application with Docker Compose:

```bash
docker compose up --build
```

Then visit:
- **Frontend**: http://localhost:5173
- **API**: http://localhost:8000
- **API Health**: http://localhost:8000/health/

## ✨ Features

- 🎨 **GitHub-styled UI**: Authentic GitHub design system and theming
- 🤖 **AI-Powered**: Uses Google Gemini AI for intelligent README generation
- ⚡ **Fast**: Generate comprehensive READMEs in 10-30 seconds
- 📱 **Responsive**: Beautiful UI that works on desktop and mobile
- 🔍 **Smart Analysis**: Detects project languages, frameworks, and structure
- 📝 **Professional Output**: Generates industry-standard documentation
- 💾 **Easy Export**: Copy to clipboard or download as README.md
- 🔗 **Quick Examples**: Pre-populated popular repository examples

## 🎨 UI Features

- **GitHub Header**: Authentic navigation bar with GitHub branding
- **Color Scheme**: Official GitHub colors and typography
- **Interactive Elements**: GitHub-style buttons, inputs, and components
- **Smart Loading**: Beautiful loading states with progress indicators
- **Responsive Design**: Mobile-first design that scales perfectly
- **Accessibility**: Full keyboard navigation and screen reader support

## 📁 Project Structure

```
GitScriptor-Web/
├── apps/
│   ├── web-frontend/    # React + Vite frontend (GitHub-styled)
│   └── api/            # FastAPI backend with Gemini AI
├── packages/
│   └── gitscriptor_core/  # Shared README generation logic
├── docker-compose.yml
└── README.md
```

## 🛠️ Development

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.11+ & Poetry (for local backend development)

### Local Development

**Frontend:**
```bash
cd apps/web-frontend
npm install
npm run dev
```

**Backend:**
```bash
cd apps/api
poetry install
poetry run uvicorn src.main:app --reload
```

## 🧪 Testing

```bash
# Frontend tests
cd apps/web-frontend && npm test

# Backend tests  
cd apps/api && poetry run pytest

# Linting
cd apps/web-frontend && npm run lint
cd apps/api && poetry run ruff .
```

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + Vite + Material-UI (GitHub theme)
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **AI Engine**: Google Gemini 1.5 Flash for content generation
- **Core**: Shared Python package for README generation
- **Deployment**: Docker Compose with health checks

## 🎯 How It Works

1. **Repository Analysis**: Clones and analyzes the repository structure
2. **Language Detection**: Identifies programming languages and frameworks
3. **Context Building**: Reads key files (package.json, requirements.txt, etc.)
4. **AI Generation**: Uses Gemini AI to generate contextual documentation
5. **Professional Output**: Returns formatted, comprehensive README

## � Configuration

Set your Gemini API key in environment variables:

```bash
export GEMINI_API_KEY="your-api-key-here"
```

Or create a `.env` file:

```env
GEMINI_API_KEY=your-api-key-here
```

## �📝 License

MIT License - see LICENSE file for details.

---

*Built with ❤️ using React, FastAPI, and Google Gemini AI*
