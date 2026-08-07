#!/bin/sh
# Truth-pin: fail CI when stale Live Tennis API product facts reappear.
# Quota grid since 2026-08-06: FREE 100/day, BASIC 1,000/day, PRO 10,000/day,
# ULTRA 500,000/day. Docs live at docs.livetennisapi.com.
set -u
cd "$(dirname "$0")/.."

# CHANGELOG.md is exempt: its dated entries describe history, including the
# old quota grid. The lockfile and this script are noise, not product copy.
files=$(git ls-files | grep -vE '^(CHANGELOG\.md|package-lock\.json|scripts/truthcheck\.sh)$')

fail=0

forbid() {
	pattern="$1"
	why="$2"
	hits=$(printf '%s\n' "$files" | xargs grep -inE "$pattern" 2>/dev/null)
	if [ -n "$hits" ]; then
		echo "FORBIDDEN ($why):"
		printf '%s\n' "$hits"
		fail=1
	fi
}

require() {
	pattern="$1"
	why="$2"
	if ! printf '%s\n' "$files" | xargs grep -qiE "$pattern" 2>/dev/null; then
		echo "MISSING ($why): no tracked file matches /$pattern/"
		fail=1
	fi
}

forbid '100,?000 *(requests|req|calls|/day)|100k *(requests|req|calls|/day)' 'no tier has a 100k/day quota'
forbid 'free[^.]*1,?000[^.]*(/| per )day|1,?000 *(requests?)? *(/| per )day[^.]*free' 'FREE is 100 requests/day since 2026-08-06'
forbid 'livetennisapi\.com/docs' 'docs live at docs.livetennisapi.com, not livetennisapi.com/docs'
forbid 'bensynapse' 'use the Live Tennis API org identity'
forbid 'midnight UTC' 'the daily quota resets at the resets_at instant, not midnight UTC'

# The README states quotas, so the current pins must be present.
require '100 requests/day|100/day' 'FREE quota pin (100/day)'
require 'docs\.livetennisapi\.com' 'canonical docs URL'

if [ "$fail" -ne 0 ]; then
	exit 1
fi
echo 'truthcheck: OK'
