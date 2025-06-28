from fastapi import APIRouter
from typing import List

from ..schemas.template import (
    ReadmeTemplate,
    ReadmeSection,
    StyleConfig,
    TemplateListResponse,
)

router = APIRouter(prefix="/templates", tags=["Templates & Styles"])


@router.get("/", response_model=TemplateListResponse)
async def get_templates_and_styles():
    """Get available README templates and styles."""

    # Define available templates
    templates = [
        ReadmeTemplate(
            id="classic",
            name="Classic",
            description="Traditional README format with standard sections",
            style="classic",
            sections=[
                "header",
                "description",
                "installation",
                "usage",
                "contributing",
                "license",
            ],
            preview="# Project Name\n\nDescription here...\n\n## Installation\n\n```bash\nnpm install\n```",
            is_premium=False,
        ),
        ReadmeTemplate(
            id="modern",
            name="Modern",
            description="Contemporary design with badges and visual elements",
            style="modern",
            sections=[
                "header",
                "badges",
                "description",
                "features",
                "installation",
                "usage",
                "api",
                "contributing",
                "license",
            ],
            preview='<div align="center">\n  <h1>🚀 Project Name</h1>\n  <p>Modern project description</p>\n</div>',
            is_premium=False,
        ),
        ReadmeTemplate(
            id="minimal",
            name="Minimal",
            description="Clean, minimalist approach with essential information only",
            style="minimal",
            sections=["header", "description", "installation", "usage"],
            preview="# Project Name\n\nSimple description.\n\n## Install\n`npm install`\n\n## Use\n`npm start`",
            is_premium=False,
        ),
        ReadmeTemplate(
            id="comprehensive",
            name="Comprehensive",
            description="Detailed documentation with all possible sections",
            style="comprehensive",
            sections=[
                "header",
                "badges",
                "toc",
                "description",
                "features",
                "installation",
                "usage",
                "api",
                "examples",
                "testing",
                "deployment",
                "contributing",
                "changelog",
                "license",
                "acknowledgments",
            ],
            preview="# 📋 Project Name\n\n[![Build Status](badge)](link)\n\n## 📖 Table of Contents\n- [Features](#features)\n- [Installation](#installation)...",
            is_premium=True,
        ),
    ]

    # Define style configurations
    styles = [
        StyleConfig(
            name="classic",
            description="Traditional GitHub README style",
            sections=[
                ReadmeSection(
                    id="header",
                    name="Project Header",
                    description="Project title and basic information",
                    template="# {project_name}\n\n{description}",
                    is_required=True,
                    order=1,
                ),
                ReadmeSection(
                    id="description",
                    name="Description",
                    description="Detailed project description",
                    template="## Description\n\n{detailed_description}",
                    is_required=True,
                    order=2,
                ),
                ReadmeSection(
                    id="installation",
                    name="Installation",
                    description="Installation instructions",
                    template="## Installation\n\n```bash\n{install_commands}\n```",
                    is_required=True,
                    order=3,
                ),
                ReadmeSection(
                    id="usage",
                    name="Usage",
                    description="Usage examples and instructions",
                    template="## Usage\n\n{usage_examples}",
                    is_required=True,
                    order=4,
                ),
                ReadmeSection(
                    id="contributing",
                    name="Contributing",
                    description="Contribution guidelines",
                    template="## Contributing\n\n{contributing_guidelines}",
                    is_required=False,
                    order=5,
                ),
                ReadmeSection(
                    id="license",
                    name="License",
                    description="License information",
                    template="## License\n\n{license_info}",
                    is_required=False,
                    order=6,
                ),
            ],
            badges=True,
            table_of_contents=False,
            installation_section=True,
            usage_section=True,
            contributing_section=True,
            license_section=True,
        ),
        StyleConfig(
            name="modern",
            description="Modern style with visual elements and badges",
            sections=[
                ReadmeSection(
                    id="header",
                    name="Modern Header",
                    description="Stylized header with center alignment",
                    template='<div align="center">\n  <h1>🚀 {project_name}</h1>\n  <p>{description}</p>\n</div>',
                    is_required=True,
                    order=1,
                ),
                ReadmeSection(
                    id="badges",
                    name="Badges",
                    description="Status badges for the project",
                    template='\n<div align="center">\n\n{badges}\n\n</div>',
                    is_required=False,
                    order=2,
                ),
            ],
            badges=True,
            table_of_contents=True,
            installation_section=True,
            usage_section=True,
            contributing_section=True,
            license_section=True,
        ),
        StyleConfig(
            name="minimal",
            description="Clean and minimal style",
            sections=[
                ReadmeSection(
                    id="header",
                    name="Simple Header",
                    description="Simple project title",
                    template="# {project_name}\n\n{description}",
                    is_required=True,
                    order=1,
                )
            ],
            badges=False,
            table_of_contents=False,
            installation_section=True,
            usage_section=True,
            contributing_section=False,
            license_section=False,
        ),
        StyleConfig(
            name="comprehensive",
            description="Detailed documentation style",
            sections=[
                ReadmeSection(
                    id="header",
                    name="Comprehensive Header",
                    description="Detailed header with emoji and badges",
                    template="# 📋 {project_name}\n\n> {tagline}\n\n{description}",
                    is_required=True,
                    order=1,
                ),
                ReadmeSection(
                    id="toc",
                    name="Table of Contents",
                    description="Detailed navigation",
                    template="## 📖 Table of Contents\n\n{toc}",
                    is_required=True,
                    order=2,
                ),
            ],
            badges=True,
            table_of_contents=True,
            installation_section=True,
            usage_section=True,
            contributing_section=True,
            license_section=True,
        ),
    ]

    return TemplateListResponse(
        templates=templates, styles=styles, total=len(templates)
    )


@router.get("/styles")
async def get_available_styles():
    """Get list of available README styles."""
    return {
        "styles": [
            {
                "id": "classic",
                "name": "Classic",
                "description": "Traditional GitHub README style",
                "features": [
                    "Standard sections",
                    "Clean formatting",
                    "Professional appearance",
                ],
            },
            {
                "id": "modern",
                "name": "Modern",
                "description": "Contemporary design with visual elements",
                "features": ["Badges", "Emojis", "Center alignment", "Visual appeal"],
            },
            {
                "id": "minimal",
                "name": "Minimal",
                "description": "Clean and simple approach",
                "features": [
                    "Essential sections only",
                    "Concise content",
                    "Fast to read",
                ],
            },
            {
                "id": "comprehensive",
                "name": "Comprehensive",
                "description": "Detailed documentation approach",
                "features": [
                    "All sections",
                    "Table of contents",
                    "Detailed examples",
                    "Premium",
                ],
            },
        ]
    }


@router.get("/sections")
async def get_available_sections():
    """Get list of available README sections."""
    return {
        "sections": [
            {
                "id": "header",
                "name": "Project Header",
                "description": "Project title and basic description",
                "required": True,
            },
            {
                "id": "badges",
                "name": "Badges",
                "description": "Build status, version, and other badges",
                "required": False,
            },
            {
                "id": "toc",
                "name": "Table of Contents",
                "description": "Navigation links to sections",
                "required": False,
            },
            {
                "id": "description",
                "name": "Description",
                "description": "Detailed project description",
                "required": True,
            },
            {
                "id": "features",
                "name": "Features",
                "description": "Key features and capabilities",
                "required": False,
            },
            {
                "id": "installation",
                "name": "Installation",
                "description": "Setup and installation instructions",
                "required": True,
            },
            {
                "id": "usage",
                "name": "Usage",
                "description": "How to use the project",
                "required": True,
            },
            {
                "id": "api",
                "name": "API Reference",
                "description": "API documentation and examples",
                "required": False,
            },
            {
                "id": "examples",
                "name": "Examples",
                "description": "Code examples and demos",
                "required": False,
            },
            {
                "id": "testing",
                "name": "Testing",
                "description": "Testing instructions and guidelines",
                "required": False,
            },
            {
                "id": "deployment",
                "name": "Deployment",
                "description": "Deployment instructions",
                "required": False,
            },
            {
                "id": "contributing",
                "name": "Contributing",
                "description": "Contribution guidelines",
                "required": False,
            },
            {
                "id": "changelog",
                "name": "Changelog",
                "description": "Version history and changes",
                "required": False,
            },
            {
                "id": "license",
                "name": "License",
                "description": "License information",
                "required": False,
            },
            {
                "id": "acknowledgments",
                "name": "Acknowledgments",
                "description": "Credits and thanks",
                "required": False,
            },
        ]
    }
