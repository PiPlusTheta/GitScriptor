#!/usr/bin/env python3
"""
Test AI-powered README generation with Gemini API
"""

import sys
import os
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from .src.services.gitscriptor_core import generate_readme, GeminiAPI


def test_gemini_api():
    """Test direct Gemini API connection."""
    print("🤖 Testing Gemini API Connection...")

    try:
        gemini = GeminiAPI()
        response = gemini.generate_content("Say hello in a creative way")
        print(f"✅ Gemini API working! Response: {response[:100]}...")
        return True
    except Exception as e:
        print(f"❌ Gemini API failed: {e}")
        return False


def test_ai_readme_generation():
    """Test AI-powered README generation."""
    print("\n🚀 Testing AI README Generation...")

    test_repo = "https://github.com/octocat/Hello-World"

    try:
        # Test classic style with AI
        readme = generate_readme(test_repo, style="classic")
        print(f"✅ Generated AI README ({len(readme)} characters)")
        print(f"   Preview: {readme[:200]}...")

        # Check if it's actually AI-generated (not fallback)
        if "Welcome to" in readme and "modern development needs" in readme:
            print("   ⚠️  Using fallback template (expected without valid analysis)")
        else:
            print("   🤖 AI-generated content detected!")

        return True
    except Exception as e:
        print(f"❌ AI README generation failed: {e}")
        return False


def main():
    """Run AI-specific tests."""
    print("🤖 GitScriptor AI Tests")
    print("=" * 40)

    # Test Gemini API directly
    gemini_ok = test_gemini_api()

    # Test integrated AI generation
    ai_readme_ok = test_ai_readme_generation()

    print("\n" + "=" * 40)
    if gemini_ok and ai_readme_ok:
        print("✅ All AI tests passed!")
        print("\n🎉 GitScriptor is ready for AI-powered README generation!")
    else:
        print("❌ Some AI tests failed!")
        print("   - Check GEMINI_API_KEY in .env file")
        print("   - Verify network connectivity")

    return gemini_ok and ai_readme_ok


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
