from .gitscriptor_core import generate_readme


class GeneratorService:
    """Service for generating README files."""

    def __init__(self):
        pass

    async def generate_readme(self, repo_path: str, style: str = "classic") -> str:
        """Generate README for a repository path."""
        return generate_readme(repo_path, style=style)
