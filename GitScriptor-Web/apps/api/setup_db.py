#!/usr/bin/env python3
"""
Database setup script for GitScriptor API
"""

import os
import sys
import asyncpg
import asyncio
from pathlib import Path


async def create_database_if_not_exists():
    """Create the gitscriptor database if it doesn't exist."""

    # Try common PostgreSQL passwords
    common_passwords = ["password", "postgres", "admin", "123456", ""]

    # Get password from environment or try common ones
    env_password = os.getenv("POSTGRES_PASSWORD") or os.getenv("DB_PASSWORD")
    if env_password:
        passwords_to_try = [env_password] + common_passwords
    else:
        passwords_to_try = common_passwords

    target_db = "gitscriptor"

    for password in passwords_to_try:
        try:
            # Default connection (usually to 'postgres' database)
            default_db_url = f"postgresql://postgres:{password}@localhost:5432/postgres"

            print(
                f"🔄 Trying to connect with password: {'[hidden]' if password else '[empty]'}"
            )

            # Connect to default database
            conn = await asyncpg.connect(default_db_url)

            print(f"✅ Connected successfully!")

            # Check if gitscriptor database exists
            exists = await conn.fetchval(
                "SELECT 1 FROM pg_database WHERE datname = $1", target_db
            )

            if not exists:
                print(f"🔄 Creating database '{target_db}'...")
                await conn.execute(f"CREATE DATABASE {target_db}")
                print(f"✅ Database '{target_db}' created successfully!")
            else:
                print(f"✅ Database '{target_db}' already exists!")

            await conn.close()

            # Update .env file with working password
            update_env_password(password)

            return True

        except Exception as e:
            if "password authentication failed" in str(e):
                continue  # Try next password
            else:
                print(f"❌ Error: {e}")
                return False

    print("❌ Could not connect with any common passwords.")
    print(
        "\nPlease check your PostgreSQL setup or update the .env file with the correct password."
    )
    print("You can also set POSTGRES_PASSWORD environment variable.")
    return False


def update_env_password(password):
    """Update the .env file with the working password."""
    env_path = Path(".env")
    if env_path.exists():
        content = env_path.read_text()
        # Update DATABASE_URL with the working password
        new_url = f"postgresql://postgres:{password}@localhost:5432/gitscriptor"
        lines = content.split("\n")
        for i, line in enumerate(lines):
            if line.startswith("DATABASE_URL="):
                lines[i] = f"DATABASE_URL={new_url}"
                break

        env_path.write_text("\n".join(lines))
        print(f"✅ Updated .env file with working database connection")


async def test_database_connection():
    """Test connection to the gitscriptor database."""
    db_url = os.getenv(
        "DATABASE_URL", "postgresql://postgres:password@localhost:5432/gitscriptor"
    )

    try:
        conn = await asyncpg.connect(db_url)
        version = await conn.fetchval("SELECT version()")
        print(f"✅ Successfully connected to GitScriptor database!")
        print(f"📊 PostgreSQL version: {version.split(',')[0]}")
        await conn.close()
        return True
    except Exception as e:
        print(f"❌ Could not connect to GitScriptor database: {e}")
        return False


async def main():
    print("🚀 GitScriptor Database Setup")
    print("=" * 40)

    # Load environment variables
    from dotenv import load_dotenv

    load_dotenv()

    # Step 1: Create database
    if await create_database_if_not_exists():
        print()

        # Step 2: Test connection
        if await test_database_connection():
            print("\n✅ Database setup completed successfully!")
            print("\nNext step: Run migrations")
            print("Command: python migrate.py init")
            return True

    print("\n❌ Database setup failed!")
    return False


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
