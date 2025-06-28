import httpx
import os
from typing import Optional, Dict, Any, List
from datetime import datetime

from ..schemas.auth import GitHubUser
from ..schemas.repository import Repository, RepositoryCreate


class GitHubService:
    def __init__(self):
        self.client_id = os.getenv("GITHUB_CLIENT_ID")
        self.client_secret = os.getenv("GITHUB_CLIENT_SECRET")
        self.redirect_uri = os.getenv(
            "GITHUB_REDIRECT_URI", "http://localhost:8000/auth/callback"
        )
        self.base_url = "https://api.github.com"

    def get_oauth_url(self, state: Optional[str] = None) -> str:
        """Get GitHub OAuth authorization URL."""
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "scope": "user:email,repo,read:org",
        }
        if state:
            params["state"] = state

        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"https://github.com/login/oauth/authorize?{query_string}"

    async def exchange_code_for_token(self, code: str) -> Optional[Dict[str, Any]]:
        """Exchange authorization code for access token."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://github.com/login/oauth/access_token",
                data={
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "code": code,
                    "redirect_uri": self.redirect_uri,
                },
                headers={"Accept": "application/json"},
            )

            if response.status_code == 200:
                return response.json()
            return None

    async def get_user_info(self, access_token: str) -> Optional[GitHubUser]:
        """Get user information from GitHub API."""
        headers = {
            "Authorization": f"token {access_token}",
            "Accept": "application/vnd.github.v3+json",
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/user", headers=headers)

            if response.status_code == 200:
                user_data = response.json()
                return GitHubUser(
                    id=user_data["id"],
                    login=user_data["login"],
                    name=user_data.get("name"),
                    email=user_data.get("email"),
                    avatar_url=user_data["avatar_url"],
                    bio=user_data.get("bio"),
                    location=user_data.get("location"),
                    company=user_data.get("company"),
                    blog=user_data.get("blog"),
                    twitter_username=user_data.get("twitter_username"),
                    public_repos=user_data.get("public_repos", 0),
                    public_gists=user_data.get("public_gists", 0),
                    followers=user_data.get("followers", 0),
                    following=user_data.get("following", 0),
                    created_at=datetime.fromisoformat(
                        user_data["created_at"].replace("Z", "+00:00")
                    ),
                )
            return None

    async def get_user_repositories(
        self,
        access_token: str,
        sort: str = "updated",
        direction: str = "desc",
        type: str = "all",
        per_page: int = 30,
        page: int = 1,
    ) -> List[Dict[str, Any]]:
        """Get user repositories from GitHub API."""
        headers = {
            "Authorization": f"token {access_token}",
            "Accept": "application/vnd.github.v3+json",
        }

        params = {
            "sort": sort,
            "direction": direction,
            "type": type,
            "per_page": per_page,
            "page": page,
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/user/repos", headers=headers, params=params
            )

            if response.status_code == 200:
                return response.json()
            return []

    async def get_repository_details(
        self, access_token: str, owner: str, repo: str
    ) -> Optional[Dict[str, Any]]:
        """Get detailed repository information."""
        headers = {
            "Authorization": f"token {access_token}",
            "Accept": "application/vnd.github.v3+json",
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/repos/{owner}/{repo}", headers=headers
            )

            if response.status_code == 200:
                return response.json()
            return None

    async def get_repository_languages(
        self, access_token: str, owner: str, repo: str
    ) -> Dict[str, int]:
        """Get repository language breakdown."""
        headers = {
            "Authorization": f"token {access_token}",
            "Accept": "application/vnd.github.v3+json",
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/repos/{owner}/{repo}/languages", headers=headers
            )

            if response.status_code == 200:
                return response.json()
            return {}

    async def search_repositories(
        self, access_token: str, query: str, sort: str = "stars", per_page: int = 30
    ) -> Dict[str, Any]:
        """Search repositories on GitHub."""
        headers = {
            "Authorization": f"token {access_token}",
            "Accept": "application/vnd.github.v3+json",
        }

        params = {"q": query, "sort": sort, "per_page": per_page}

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/search/repositories", headers=headers, params=params
            )

            if response.status_code == 200:
                return response.json()
            return {"items": [], "total_count": 0}

    async def commit_file(
        self,
        access_token: str,
        owner: str,
        repo: str,
        path: str,
        content: str,
        message: str,
        branch: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """Commit a file to a GitHub repository."""
        headers = {
            "Authorization": f"token {access_token}",
            "Accept": "application/vnd.github.v3+json",
        }

        # Get current file SHA if it exists
        file_response = await self._get_file_sha(
            access_token, owner, repo, path, branch
        )

        import base64

        encoded_content = base64.b64encode(content.encode()).decode()

        data = {
            "message": message,
            "content": encoded_content,
        }

        if branch:
            data["branch"] = branch

        if file_response:
            data["sha"] = file_response["sha"]

        async with httpx.AsyncClient() as client:
            response = await client.put(
                f"{self.base_url}/repos/{owner}/{repo}/contents/{path}",
                headers=headers,
                json=data,
            )

            if response.status_code in [200, 201]:
                return response.json()
            return None

    async def _get_file_sha(
        self,
        access_token: str,
        owner: str,
        repo: str,
        path: str,
        branch: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """Get the SHA of a file if it exists."""
        headers = {
            "Authorization": f"token {access_token}",
            "Accept": "application/vnd.github.v3+json",
        }

        params = {}
        if branch:
            params["ref"] = branch

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/repos/{owner}/{repo}/contents/{path}",
                headers=headers,
                params=params,
            )

            if response.status_code == 200:
                return response.json()
            return None


# Global instance
github_service = GitHubService()
