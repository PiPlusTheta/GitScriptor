"""
GitScriptor Core - AI-powered README generation using Gemini API.
"""

import os
import re
import json
import requests
import subprocess
import tempfile
from pathlib import Path
from typing import Optional, Dict, List, Any
from urllib.parse import urlparse
import logging

logger = logging.getLogger(__name__)


"""
GitScriptor Core - AI-powered README generation using Gemini API.
"""

import os
import re
import json
import requests
import subprocess
import tempfile
import shutil
from pathlib import Path
from typing import Optional, Dict, List, Any
from urllib.parse import urlparse
import logging

logger = logging.getLogger(__name__)

# Load environment variables
try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass


class GitScriptorError(Exception):
    """Base exception for GitScriptor operations."""

    pass


class RepositoryAnalyzer:
    """Analyzes Git repositories to extract metadata and structure."""

    def __init__(self):
        self.supported_languages = {
            ".py": "Python",
            ".js": "JavaScript",
            ".ts": "TypeScript",
            ".jsx": "React",
            ".tsx": "React",
            ".java": "Java",
            ".cpp": "C++",
            ".c": "C",
            ".cs": "C#",
            ".php": "PHP",
            ".rb": "Ruby",
            ".go": "Go",
            ".rs": "Rust",
            ".swift": "Swift",
            ".kt": "Kotlin",
            ".dart": "Dart",
            ".html": "HTML",
            ".css": "CSS",
            ".scss": "SCSS",
            ".vue": "Vue.js",
            ".svelte": "Svelte",
        }

        self.framework_indicators = {
            "package.json": ["React", "Next.js", "Vue.js", "Angular", "Express"],
            "requirements.txt": ["Django", "Flask", "FastAPI"],
            "pom.xml": ["Spring", "Maven"],
            "build.gradle": ["Spring", "Gradle"],
            "composer.json": ["Laravel", "Symfony"],
            "Gemfile": ["Rails", "Sinatra"],
            "go.mod": ["Gin", "Echo"],
            "Cargo.toml": ["Actix", "Rocket"],
        }

    def clone_repository(self, repo_url: str, temp_dir: Path) -> Path:
        """Clone repository to temporary directory."""
        try:
            result = subprocess.run(
                ["git", "clone", "--depth", "1", repo_url, str(temp_dir)],
                capture_output=True,
                text=True,
                timeout=30,
            )

            if result.returncode != 0:
                raise GitScriptorError(f"Failed to clone repository: {result.stderr}")

            return temp_dir
        except subprocess.TimeoutExpired:
            raise GitScriptorError("Repository clone timed out")
        except Exception as e:
            raise GitScriptorError(f"Error cloning repository: {str(e)}")

    def analyze_files(self, repo_path: Path) -> Dict[str, Any]:
        """Analyze repository files and structure."""
        languages = set()
        frameworks = set()
        has_tests = False
        has_docs = False
        has_ci = False
        file_count = 0
        total_lines = 0

        # Common test directory names and file patterns
        test_patterns = ["test", "tests", "__tests__", "spec", "specs"]
        test_file_patterns = ["test_", "_test.", ".spec.", ".test."]

        # Common documentation patterns
        doc_patterns = ["readme", "docs", "documentation", "wiki"]

        # CI/CD patterns
        ci_patterns = [
            ".github",
            ".gitlab-ci",
            "jenkinsfile",
            ".travis.yml",
            "circle.yml",
        ]

        try:
            for file_path in repo_path.rglob("*"):
                if file_path.is_file() and not any(
                    part.startswith(".git") for part in file_path.parts
                ):
                    file_count += 1

                    # Count lines in text files
                    try:
                        if file_path.suffix in [
                            ".py",
                            ".js",
                            ".ts",
                            ".java",
                            ".cpp",
                            ".c",
                            ".cs",
                        ]:
                            with open(
                                file_path, "r", encoding="utf-8", errors="ignore"
                            ) as f:
                                total_lines += len(f.readlines())
                    except:
                        pass

                    # Detect language
                    if file_path.suffix in self.supported_languages:
                        languages.add(self.supported_languages[file_path.suffix])

                    # Check for tests
                    file_name_lower = file_path.name.lower()
                    if any(
                        pattern in file_name_lower for pattern in test_file_patterns
                    ):
                        has_tests = True

                    # Check for documentation
                    if any(pattern in file_name_lower for pattern in doc_patterns):
                        has_docs = True

                    # Check for CI/CD
                    if any(
                        pattern in str(file_path).lower() for pattern in ci_patterns
                    ):
                        has_ci = True

                    # Framework detection
                    if file_path.name in self.framework_indicators:
                        frameworks.update(self.framework_indicators[file_path.name])

        except Exception as e:
            logger.warning(f"Error analyzing files: {e}")

        # Check for test directories
        for test_pattern in test_patterns:
            if (repo_path / test_pattern).exists():
                has_tests = True
                break

        return {
            "languages": list(languages),
            "frameworks": list(frameworks),
            "has_tests": has_tests,
            "has_docs": has_docs,
            "has_ci": has_ci,
            "file_count": file_count,
            "lines_of_code": total_lines,
        }

    def get_git_info(self, repo_path: Path) -> Dict[str, Any]:
        """Get Git repository information."""
        try:
            # Get commit count
            result = subprocess.run(
                ["git", "-C", str(repo_path), "rev-list", "--count", "HEAD"],
                capture_output=True,
                text=True,
            )
            commit_count = int(result.stdout.strip()) if result.returncode == 0 else 0

            # Get contributors
            result = subprocess.run(
                ["git", "-C", str(repo_path), "shortlog", "-sn", "--all"],
                capture_output=True,
                text=True,
            )
            contributors = (
                len(result.stdout.strip().split("\n"))
                if result.returncode == 0 and result.stdout.strip()
                else 1
            )

            # Get last commit date
            result = subprocess.run(
                ["git", "-C", str(repo_path), "log", "-1", "--format=%ci"],
                capture_output=True,
                text=True,
            )
            last_commit = result.stdout.strip() if result.returncode == 0 else None

            return {
                "commit_count": commit_count,
                "contributors": contributors,
                "last_commit": last_commit,
            }
        except Exception as e:
            logger.warning(f"Error getting git info: {e}")
            return {"commit_count": 0, "contributors": 1, "last_commit": None}


class GeminiAPI:
    """Interface for Gemini AI API."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise GitScriptorError(
                "Gemini API key not found. Set GEMINI_API_KEY environment variable."
            )

        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

    def generate_content(self, prompt: str) -> str:
        """Generate content using Gemini API."""
        headers = {"Content-Type": "application/json"}

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 2048,
            },
        }

        try:
            response = requests.post(
                f"{self.base_url}?key={self.api_key}",
                headers=headers,
                json=payload,
                timeout=30,
            )

            if response.status_code != 200:
                raise GitScriptorError(
                    f"Gemini API error: {response.status_code} - {response.text}"
                )

            data = response.json()

            if "candidates" not in data or not data["candidates"]:
                raise GitScriptorError("No content generated by Gemini API")

            content = data["candidates"][0]["content"]["parts"][0]["text"]
            return content.strip()

        except requests.exceptions.RequestException as e:
            raise GitScriptorError(f"Network error calling Gemini API: {str(e)}")
        except Exception as e:
            raise GitScriptorError(f"Error calling Gemini API: {str(e)}")


def generate_readme(repo_url: str, style: str = "classic", **kwargs) -> str:
    """
    Generate README content for a repository using AI.

    Args:
        repo_url: URL to the repository
        style: Style of README to generate (classic, minimal, comprehensive)
        **kwargs: Additional parameters

    Returns:
        Generated README markdown content
    """
    try:
        # Analyze repository
        analysis = analyze_repository(repo_url)

        # Initialize Gemini API
        gemini = GeminiAPI()

        # Create prompt based on analysis and style
        prompt = create_readme_prompt(repo_url, analysis, style)

        # Generate README using AI
        readme_content = gemini.generate_content(prompt)

        return readme_content

    except Exception as e:
        logger.error(f"Error generating README: {e}")
        # Fallback to basic template
        return generate_fallback_readme(repo_url, style)


def analyze_repository(repo_url: str) -> Dict[str, Any]:
    """
    Analyze a Git repository and extract metadata.

    Args:
        repo_url: URL to the repository

    Returns:
        Dictionary with repository analysis data
    """
    analyzer = RepositoryAnalyzer()

    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)

        try:
            # Clone repository
            repo_path = analyzer.clone_repository(repo_url, temp_path / "repo")

            # Analyze files and structure
            file_analysis = analyzer.analyze_files(repo_path)

            # Get Git information
            git_info = analyzer.get_git_info(repo_path)

            # Extract repository name
            repo_name = urlparse(repo_url).path.split("/")[-1].replace(".git", "")

            return {
                "repo_name": repo_name,
                "repo_url": repo_url,
                **file_analysis,
                **git_info,
            }

        except Exception as e:
            logger.warning(f"Error analyzing repository {repo_url}: {e}")
            # Return basic analysis
            repo_name = urlparse(repo_url).path.split("/")[-1].replace(".git", "")
            return {
                "repo_name": repo_name,
                "repo_url": repo_url,
                "languages": ["Unknown"],
                "frameworks": [],
                "has_tests": False,
                "has_docs": False,
                "has_ci": False,
                "file_count": 0,
                "lines_of_code": 0,
                "commit_count": 0,
                "contributors": 1,
                "last_commit": None,
            }


def create_readme_prompt(repo_url: str, analysis: Dict[str, Any], style: str) -> str:
    """Create a prompt for AI README generation."""

    repo_name = analysis["repo_name"]
    languages = ", ".join(analysis["languages"]) if analysis["languages"] else "Unknown"
    frameworks = (
        ", ".join(analysis["frameworks"]) if analysis["frameworks"] else "None detected"
    )

    base_prompt = f"""
Generate a professional README.md file for a GitHub repository with the following details:

Repository: {repo_name}
URL: {repo_url}
Primary Languages: {languages}
Frameworks/Libraries: {frameworks}
Has Tests: {analysis['has_tests']}
Has Documentation: {analysis['has_docs']}
Has CI/CD: {analysis['has_ci']}
Lines of Code: {analysis['lines_of_code']}
Contributors: {analysis['contributors']}

Style: {style}
"""

    if style == "minimal":
        base_prompt += """
Create a minimal, clean README with:
- Project title and brief description
- Installation instructions
- Basic usage example
- License information
Keep it concise and under 200 words.
"""
    elif style == "comprehensive":
        base_prompt += """
Create a comprehensive README with:
- Project title with badges
- Detailed description and features
- Table of contents
- Installation prerequisites and steps
- Usage examples with code snippets
- API documentation if applicable
- Contributing guidelines
- Testing information
- Deployment instructions
- License and support information
- Screenshots or diagrams if appropriate
Make it detailed and professional.
"""
    else:  # classic
        base_prompt += """
Create a classic, well-structured README with:
- Project title and description
- Table of contents
- Installation instructions
- Usage examples
- Contributing guidelines
- License information
Balance detail with readability.
"""

    base_prompt += """
Important guidelines:
- Use proper Markdown formatting
- Include relevant badges if appropriate
- Make installation instructions clear and specific to the detected languages/frameworks
- Add realistic code examples based on the detected technologies
- Ensure the content is professional and informative
- Do not include placeholder text like "Add description here"
- Generate actual content based on the repository analysis
"""

    return base_prompt


def generate_fallback_readme(repo_url: str, style: str) -> str:
    """Generate a fallback README when AI generation fails."""
    repo_name = urlparse(repo_url).path.split("/")[-1].replace(".git", "")

    if style == "minimal":
        return f"""# {repo_name}

A software project hosted at {repo_url}.

## Installation

```bash
git clone {repo_url}
cd {repo_name}
```

## Usage

See the project documentation for usage instructions.

## License

See LICENSE file for details.
"""

    elif style == "comprehensive":
        return f"""# {repo_name}

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Overview

{repo_name} is a software project that provides solutions for modern development needs.

## Features

- Modern architecture
- Easy to use
- Well documented
- Actively maintained

## Installation

### Prerequisites

Make sure you have the following installed:
- Git
- Your preferred development environment

### Setup

```bash
git clone {repo_url}
cd {repo_name}
# Follow language-specific setup instructions
```

## Usage

```bash
# Add your usage examples here
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions and support, please open an issue on GitHub.
"""

    else:  # classic
        return f"""# {repo_name}

Welcome to {repo_name}! This project provides a solution for modern development challenges.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Installation

To get started with {repo_name}:

```bash
git clone {repo_url}
cd {repo_name}
```

## Usage

This section will be updated with usage examples and instructions.

## Contributing

We welcome contributions to {repo_name}! Please see our contributing guidelines for more information.

## License

This project is open source and available under the MIT License.
"""
