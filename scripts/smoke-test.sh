#!/bin/bash
BASE_URL=${1:-"http://localhost:3000"}
echo "🔍 Smoke test Baraka Frontend — $BASE_URL"

check() {
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$1")
  if [ "$STATUS" = "$2" ]; then
    echo "✓ $1 → $STATUS"
  else
    echo "✗ $1 → $STATUS (attendu $2)"
    exit 1
  fi
}

check "/accueil" "200"
check "/besoin" "200"
check "/resultats" "200"
check "/simulateur" "200"
check "/compte" "200"
check "/onboarding" "200"
check "/manifest.json" "200"
check "/icons/icon-192.png" "200"
check "/offline" "200"

echo "✅ Tous les checks passent"
