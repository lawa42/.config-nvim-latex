#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

branch="${1:-master}"

echo "Fetching upstream..."
git fetch upstream

echo "Checking out $branch..."
git checkout "$branch"

echo "Merging upstream/master into $branch..."
git merge --ff-only upstream/master || {
  echo "Fast-forward failed. Please resolve merge or rebase manually."
  exit 1
}

echo "Pushing to origin..."
git push origin "$branch"

echo "Done."
