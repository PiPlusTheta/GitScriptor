#!/usr/bin/env python3
"""
Test script for GitScriptor Core functionality
"""

import sys
import os
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from services.gitscriptor_core import analyze_repository, generate_fallback_readme


def test_repository_analysis():
    """Test repository analysis functionality."""
    print("🧪 Testing Repository Analysis...")

    # Test with a public repository
    test_repo = "https://github.com/octocat/Hello-World"

    try:
        analysis = analyze_repository(test_repo)
        print(f"✅ Analysis successful for {test_repo}")
        print(f"   - Repository: {analysis.get('repo_name', 'Unknown')}")
        print(f"   - Languages: {analysis.get('languages', [])}")
        print(f"   - Frameworks: {analysis.get('frameworks', [])}")
        print(f"   - Has Tests: {analysis.get('has_tests', False)}")
        print(f"   - Lines of Code: {analysis.get('lines_of_code', 0)}")
        print(f"   - Contributors: {analysis.get('contributors', 0)}")
        return True
    except Exception as e:
        print(f"❌ Analysis failed: {e}")
        return False


def test_fallback_readme():
    """Test fallback README generation."""
    print("\n🧪 Testing Fallback README Generation...")

    test_repo = "https://github.com/example/test-repo"

    try:
        # Test different styles
        for style in ["classic", "minimal", "comprehensive"]:
            readme = generate_fallback_readme(test_repo, style)
            print(f"✅ Generated {style} README ({len(readme)} characters)")
        return True
    except Exception as e:
        print(f"❌ Fallback README generation failed: {e}")
        return False


def main():
    """Run all tests."""
    print("🚀 GitScriptor Core Tests")
    print("=" * 40)

    # Check if Git is available
    import shutil

    if not shutil.which("git"):
        print("⚠️  Git not found in PATH. Repository cloning will fail.")

    # Run tests
    analysis_ok = test_repository_analysis()
    fallback_ok = test_fallback_readme()

    print("\n" + "=" * 40)
    if analysis_ok and fallback_ok:
        print("✅ All tests passed!")
        print("\n📝 Notes:")
        print("   - To use AI generation, set GEMINI_API_KEY in .env file")
        print("   - Repository analysis requires Git to be installed")
        print("   - Fallback generation works without external dependencies")
    else:
        print("❌ Some tests failed!")
        print("   - Check Git installation and network connectivity")
        print("   - Ensure repository URLs are accessible")

    return analysis_ok and fallback_ok


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
