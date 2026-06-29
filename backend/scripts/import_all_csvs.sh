#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
ENV_FILE="$ROOT/backend/.env.local"
SCHEMA_FILE="$ROOT/backend/src/db/schema.sql"

if [ ! -f "$ENV_FILE" ]; then
  echo "backend/.env.local not found" >&2
  exit 1
fi
if [ ! -f "$SCHEMA_FILE" ]; then
  echo "schema.sql not found at $SCHEMA_FILE" >&2
  exit 1
fi

# Extract DATABASE_URL (handles optional quotes)
DB_URL_RAW=$(grep '^DATABASE_URL=' "$ENV_FILE" || true)
if [ -z "$DB_URL_RAW" ]; then
  echo "DATABASE_URL not found in $ENV_FILE" >&2
  exit 1
fi
DB_URL=${DB_URL_RAW#DATABASE_URL=}
DB_URL="${DB_URL%\"}"
DB_URL="${DB_URL#\"}"

echo "Using DATABASE_URL: ${DB_URL:0:40}..."

# Check psql
if ! command -v psql >/dev/null 2>&1; then
  echo "psql not found in PATH" >&2
  exit 1
fi

# Apply schema
echo "Applying schema: $SCHEMA_FILE"
psql "$DB_URL" -f "$SCHEMA_FILE"

# Find CSVs
CSV_FILES=$(find "$ROOT" -type f -iname '*.csv')
if [ -z "$CSV_FILES" ]; then
  echo "No CSV files found in repo." >&2
  exit 0
fi

for file in $CSV_FILES; do
  echo "\nProcessing $file"
  name=$(basename "$file" .csv)
  tbl="stg_${name//[^a-zA-Z0-9_]/_}"
  tbl=$(echo "$tbl" | tr '[:upper:]' '[:lower:]')
  echo "Creating staging table $tbl from CSV header"
  header=$(head -n 1 "$file" | tr -d '\r')
  if [ -z "$header" ]; then
    echo "Empty header in $file, skipping"
    continue
  fi
  # build column list
  IFS=',' read -r -a cols <<< "$header"
  col_sql=""
  for i in "${!cols[@]}"; do
    c=${cols[$i]}
    # remove quotes and trim
    c=$(echo "$c" | sed 's/^"//;s/"$//;s/^ *//;s/ *$//')
    if [ -z "$c" ]; then c="col_$i"; fi
    # sanitize
    c=$(echo "$c" | sed 's/[^a-zA-Z0-9_]/_/g')
    c=$(echo "$c" | tr '[:upper:]' '[:lower:]')
    if [ $i -eq 0 ]; then
      col_sql="\"$c\" text"
    else
      col_sql="$col_sql, \"$c\" text"
    fi
  done
  # Drop and create table
  echo "Dropping and creating $tbl"
  psql "$DB_URL" -c "DROP TABLE IF EXISTS \"$tbl\"; CREATE TABLE \"$tbl\" ($col_sql);"
  echo "Importing CSV into $tbl"
  psql "$DB_URL" -c "\copy \"$tbl\" FROM '$(pwd)/$file' CSV HEADER DELIMITER ',' NULL ''"
  echo "Imported $file -> $tbl"
done

echo "All done." 
