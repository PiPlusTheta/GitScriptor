import argparse
from .agents import generate_readme

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("git_url")
    args = ap.parse_args()
    print(generate_readme(args.git_url))
