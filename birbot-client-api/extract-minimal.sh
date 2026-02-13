#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-.}"
cd "$ROOT"

echo "🔧 NestJS dependency pruning started"

############################################
# modules we intentionally REMOVED
############################################
DELETED_MODULE_PATTERNS=(
  "amo-crm"
  "analytics"
  "facebook"
  "telegram"
  "whatsapp"
  "utm"
  "halyk"
  "privileged"
  "not-compete"
  "notification"
  "integration"
  "marketing-statistics"
  "employee"
  "roles"
  "permissions"
  "google"
  "dashboard"
  "finance"
  "balance"
)

############################################
# 1. Remove broken imports
############################################
echo "🧹 Removing imports referencing deleted modules..."

for pattern in "${DELETED_MODULE_PATTERNS[@]}"; do
  grep -rl "from '.*$pattern" src 2>/dev/null | while read -r file; do
    echo "  fixing imports in $file"
    sed -i "/from '.*$pattern/d" "$file"
    sed -i "/from \".*$pattern/d" "$file"
  done
done

############################################
# 2. Fix AppModule imports array
############################################
APP_MODULE="src/app.module.ts"

if [ -f "$APP_MODULE" ]; then
  echo "🧠 Cleaning AppModule..."

  for pattern in "${DELETED_MODULE_PATTERNS[@]}"; do
    sed -i "/${pattern}.*Module/d" "$APP_MODULE"
  done

  # remove trailing commas that break TS
  sed -i 's/,\s*]/]/g' "$APP_MODULE"
  sed -i 's/,\s*}/}/g' "$APP_MODULE"
fi

############################################
# 3. Remove empty constructor injections
############################################
echo "🧠 Cleaning DI constructors..."

grep -rl "@InjectModel" src | while read -r file; do
  # remove injections referencing deleted models
  for pattern in "${DELETED_MODULE_PATTERNS[@]}"; do
    sed -i "/${pattern}/d" "$file"
  done
done

############################################
# 4. Remove DTO imports that no longer exist
############################################
echo "📦 Removing broken DTO imports..."

grep -rl "dto" src | while read -r file; do
  while read -r importline; do
    dto=$(echo "$importline" | sed -n "s/.*from '\(.*\)'/\1/p")
    if [ ! -f "src/${dto#./}.ts" ] && [ ! -f "${dto#./}.ts" ]; then
      sed -i "\|$dto|d" "$file"
      echo "  removed missing DTO in $file"
    fi
  done < <(grep "from '.*dto" "$file" || true)
done

############################################
# 5. Remove unused providers from modules
############################################
echo "📦 Cleaning module providers/controllers..."

grep -rl "@Module({" src | while read -r file; do
  sed -i '/controllers: \[\]/d' "$file"
  sed -i '/providers: \[\]/d' "$file"
  sed -i '/exports: \[\]/d' "$file"
done

############################################
# 6. Delete compiled cache if exists
############################################
rm -rf dist
rm -rf node_modules/.cache || true

############################################
# 7. Final TypeScript safety pass
############################################
echo "🔍 Removing imports of non-existing files..."

grep -rl "from './" src | while read -r file; do
  while read -r line; do
    path=$(echo "$line" | sed -n "s/.*from '\(.*\)'/\1/p")
    target="$(dirname "$file")/$path.ts"

    if [ ! -f "$target" ]; then
      sed -i "\|$path|d" "$file"
      echo "  removed orphan import in $file"
    fi
  done < <(grep "from './" "$file")
done

echo "✅ Pruning finished"
echo "Next: npm install && npm run build"
