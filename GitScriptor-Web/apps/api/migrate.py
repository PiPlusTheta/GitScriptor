#!/usr/bin/env python3
"""
Database migration management script for GitScriptor API
"""

import os
import sys
import subprocess
from pathlib import Path

# Add src to Python path
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))


def run_command(cmd: list[str], description: str):
    """Run a command and handle errors."""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        if result.stdout:
            print(f"Output: {result.stdout.strip()}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed!")
        print(f"Error: {e.stderr.strip()}")
        return False


def main():
    """Main migration management function."""
    if len(sys.argv) < 2:
        print(
            """
GitScriptor API Database Migration Manager

Usage:
    python migrate.py init     - Initialize database with initial schema
    python migrate.py upgrade  - Apply pending migrations
    python migrate.py revision - Create a new migration
    python migrate.py current  - Show current migration
    python migrate.py history  - Show migration history
    python migrate.py reset    - Reset database (WARNING: Destroys all data)

Environment Variables:
    DATABASE_URL - PostgreSQL connection string
                  Default: postgresql://postgres:password@localhost:5432/gitscriptor
    
Example:
    DATABASE_URL=postgresql://user:pass@localhost:5432/gitscriptor python migrate.py init
        """
        )
        return

    command = sys.argv[1]

    # Set working directory to src for alembic
    os.chdir(src_path)

    if command == "init":
        print("🚀 Initializing GitScriptor Database...")

        # Check if database is accessible
        print("🔍 Checking database connection...")

        # Apply initial migration
        if run_command(["alembic", "upgrade", "head"], "Applying initial schema"):
            print("\n🎉 Database initialization completed successfully!")
            print("\nNext steps:")
            print("1. Start the API server: uvicorn src.main:app --reload")
            print("2. Visit http://localhost:8000/docs to see the API documentation")
        else:
            print("\n❌ Database initialization failed!")
            print("Please check your DATABASE_URL and ensure PostgreSQL is running")

    elif command == "upgrade":
        run_command(
            ["alembic", "upgrade", "head"], "Upgrading database to latest migration"
        )

    elif command == "revision":
        message = input("Enter migration message: ")
        run_command(
            ["alembic", "revision", "--autogenerate", "-m", message],
            f"Creating new migration: {message}",
        )

    elif command == "current":
        run_command(["alembic", "current"], "Getting current migration")

    elif command == "history":
        run_command(["alembic", "history"], "Getting migration history")

    elif command == "reset":
        confirm = input(
            "⚠️  WARNING: This will destroy all data! Type 'RESET' to confirm: "
        )
        if confirm == "RESET":
            # Downgrade to base
            if run_command(
                ["alembic", "downgrade", "base"], "Removing all database tables"
            ):
                # Upgrade back to head
                run_command(
                    ["alembic", "upgrade", "head"],
                    "Recreating database with fresh schema",
                )
                print("✅ Database reset completed")
        else:
            print("❌ Reset cancelled")

    else:
        print(f"❌ Unknown command: {command}")
        print("Use 'python migrate.py' to see available commands")


if __name__ == "__main__":
    main()
