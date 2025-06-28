import os
import json
import requests
from pathlib import Path
from typing import List, Dict, Any


def analyze_repository(repo_path: Path) -> Dict[str, Any]:
    """Analyze repository structure and extract key information."""
    analysis = {
        "name": repo_path.name,
        "files": [],
        "directories": [],
        "languages": set(),
        "framework_indicators": [],
        "package_files": [],
        "documentation": [],
    }

    # Common file extensions and their languages
    lang_extensions = {
        ".py": "Python",
        ".js": "JavaScript",
        ".ts": "TypeScript",
        ".jsx": "React",
        ".tsx": "React TypeScript",
        ".java": "Java",
        ".cpp": "C++",
        ".c": "C",
        ".cs": "C#",
        ".go": "Go",
        ".rs": "Rust",
        ".php": "PHP",
        ".rb": "Ruby",
        ".swift": "Swift",
        ".kt": "Kotlin",
        ".scala": "Scala",
        ".html": "HTML",
        ".css": "CSS",
        ".scss": "SCSS",
        ".vue": "Vue.js",
        ".r": "R",
        ".m": "MATLAB",
        ".sh": "Shell",
    }

    # Framework and tool indicators
    framework_files = {
        "package.json": "Node.js/npm project",
        "requirements.txt": "Python project",
        "pyproject.toml": "Python project (Poetry/modern)",
        "Pipfile": "Python project (Pipenv)",
        "pom.xml": "Java (Maven)",
        "build.gradle": "Java/Android (Gradle)",
        "Cargo.toml": "Rust project",
        "go.mod": "Go module",
        "composer.json": "PHP (Composer)",
        "Gemfile": "Ruby (Bundler)",
        "Dockerfile": "Docker containerized",
        "docker-compose.yml": "Docker Compose",
        ".github/workflows": "GitHub Actions CI/CD",
        "tsconfig.json": "TypeScript project",
        "angular.json": "Angular project",
        "vue.config.js": "Vue.js project",
        "next.config.js": "Next.js project",
        "nuxt.config.js": "Nuxt.js project",
        "gatsby-config.js": "Gatsby project",
        "webpack.config.js": "Webpack build",
        "vite.config.js": "Vite build",
        "rollup.config.js": "Rollup build",
    }

    def scan_directory(path: Path, max_depth: int = 3, current_depth: int = 0):
        if current_depth > max_depth:
            return

        try:
            for item in path.iterdir():
                if item.name.startswith(".") and item.name not in [
                    ".github",
                    ".vscode",
                    ".env.example",
                ]:
                    continue

                if item.is_file():
                    analysis["files"].append(str(item.relative_to(repo_path)))

                    # Detect language
                    suffix = item.suffix.lower()
                    if suffix in lang_extensions:
                        analysis["languages"].add(lang_extensions[suffix])

                    # Check for framework indicators
                    if item.name in framework_files:
                        analysis["framework_indicators"].append(
                            framework_files[item.name]
                        )
                        analysis["package_files"].append(
                            str(item.relative_to(repo_path))
                        )

                    # Check for documentation
                    if item.name.lower() in [
                        "readme.md",
                        "readme.txt",
                        "readme.rst",
                        "license",
                        "license.txt",
                        "license.md",
                    ]:
                        analysis["documentation"].append(
                            str(item.relative_to(repo_path))
                        )

                elif item.is_dir() and current_depth < max_depth:
                    analysis["directories"].append(str(item.relative_to(repo_path)))
                    scan_directory(item, max_depth, current_depth + 1)

        except PermissionError:
            pass

    scan_directory(repo_path)
    analysis["languages"] = list(analysis["languages"])

    return analysis


def read_key_files(repo_path: Path, analysis: Dict[str, Any]) -> Dict[str, str]:
    """Read content of key files for context."""
    key_content = {}

    # Priority files to read for context
    priority_files = [
        "package.json",
        "pyproject.toml",
        "requirements.txt",
        "Cargo.toml",
        "go.mod",
        "pom.xml",
        "build.gradle",
        "composer.json",
        "Gemfile",
    ]

    for file_path in analysis["package_files"]:
        if any(pf in file_path for pf in priority_files):
            try:
                full_path = repo_path / file_path
                if full_path.exists() and full_path.stat().st_size < 10000:  # Max 10KB
                    key_content[file_path] = full_path.read_text(
                        encoding="utf-8", errors="ignore"
                    )
            except:
                continue

    # Try to read existing README for reference
    for doc_file in analysis["documentation"]:
        if "readme" in doc_file.lower():
            try:
                full_path = repo_path / doc_file
                if full_path.exists() and full_path.stat().st_size < 20000:  # Max 20KB
                    key_content[doc_file] = full_path.read_text(
                        encoding="utf-8", errors="ignore"
                    )
                    break
            except:
                continue

    return key_content


def call_gemini_api(prompt: str, api_key: str) -> str:
    """Call Google Gemini API to generate content."""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"

    headers = {"Content-Type": "application/json"}

    data = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 2048},
    }

    try:
        response = requests.post(url, headers=headers, json=data, timeout=30)
        response.raise_for_status()

        result = response.json()
        if "candidates" in result and len(result["candidates"]) > 0:
            return result["candidates"][0]["content"]["parts"][0]["text"]
        else:
            raise Exception("No content generated by Gemini API")

    except requests.exceptions.RequestException as e:
        raise Exception(f"API request failed: {str(e)}")
    except (KeyError, IndexError) as e:
        raise Exception(f"Unexpected API response format: {str(e)}")


def generate_readme(repo_path: str | Path, *, style: str = "classic") -> str:
    """Generate a comprehensive README using Google Gemini AI."""

    # Get API key from environment or use the provided one
    api_key = os.getenv("GEMINI_API_KEY", "AIzaSyBe664wCJ3_w7qexXZ4QEEkbIklh5rKRiU")

    if not api_key:
        return f"""# {Path(repo_path).name}

Error: No Gemini API key provided. Please set the GEMINI_API_KEY environment variable.

This is an autogenerated README for **{repo_path}** (style: {style}).
"""

    repo_path = Path(repo_path)

    try:
        # Analyze the repository
        analysis = analyze_repository(repo_path)
        key_content = read_key_files(repo_path, analysis)

        # Build the prompt for Gemini
        prompt = f"""You are a technical documentation expert. Generate a comprehensive, professional README.md file for this software project.

Project Analysis:
- Project Name: {analysis['name']}
- Programming Languages: {', '.join(analysis['languages']) if analysis['languages'] else 'Unknown'}
- Framework Indicators: {', '.join(analysis['framework_indicators']) if analysis['framework_indicators'] else 'None detected'}
- Key Files: {', '.join(analysis['package_files']) if analysis['package_files'] else 'None'}

File Structure Preview:
{chr(10).join(f"- {f}" for f in analysis['files'][:20])}
{'...(truncated)' if len(analysis['files']) > 20 else ''}

Key File Contents:
{chr(10).join(f"=== {name} ==={chr(10)}{content[:500]}{'...(truncated)' if len(content) > 500 else ''}{chr(10)}" for name, content in key_content.items())}

Style: {style}

Please generate a complete README.md that includes:

1. **Project Title & Description**: Clear, engaging project description
2. **Features**: Key features and capabilities
3. **Installation**: Step-by-step installation instructions
4. **Usage**: Basic usage examples and code snippets
5. **API/Documentation**: If applicable, basic API documentation
6. **Development Setup**: How to set up for development
7. **Contributing**: Guidelines for contributors
8. **License**: Standard license section

Requirements:
- Use proper Markdown formatting
- Be professional but engaging
- Include relevant badges if appropriate
- Make installation instructions clear and platform-agnostic when possible
- Include code examples where relevant
- Keep it concise but comprehensive
- If this appears to be a web application, include screenshots/demo section
- If this is a library/package, include import examples

Generate ONLY the README.md content in markdown format. Do not include any explanations before or after the markdown content."""

        # Call Gemini API
        readme_content = call_gemini_api(prompt, api_key)

        return readme_content.strip()

    except Exception as e:
        # Fallback to a basic README with error information
        return f"""# {analysis.get('name', Path(repo_path).name) if 'analysis' in locals() else Path(repo_path).name}

**Note:** This is a fallback README. The AI generation failed with error: {str(e)}

## Project Information

- **Languages Detected**: {', '.join(analysis.get('languages', [])) if 'analysis' in locals() else 'Unknown'}
- **Framework Indicators**: {', '.join(analysis.get('framework_indicators', [])) if 'analysis' in locals() else 'None detected'}

## Installation

Please check the project files for specific installation instructions.

## Usage

This project appears to be a **{analysis.get('languages', ['Unknown'])[0] if 'analysis' in locals() and analysis.get('languages') else 'software'}** project.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

Please check the project for license information.

---

*This README was auto-generated by GitScriptor. For better results, please ensure the Gemini API is properly configured.*
"""
