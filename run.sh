#!/usr/bin/env bash
# ============================================================
# APES — Automatic Prospectus & Eligibility System
# Startup Script v2.0 (Node.js/Express backend)
# ============================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/Backend"
DB_DIR="$SCRIPT_DIR/Database"
ENV_FILE="$BACKEND_DIR/.env"

# ── Colours ────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; CYAN='\033[0;36m'; RESET='\033[0m'
info()    { echo -e "${CYAN}[APES]${RESET} $1"; }
success() { echo -e "${GREEN}[APES] ✓${RESET} $1"; }
warn()    { echo -e "${YELLOW}[APES] ⚠${RESET} $1"; }
error()   { echo -e "${RED}[APES] ✗${RESET} $1"; }

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════╗${RESET}"
echo -e "${CYAN}║   APES — Automatic Prospectus & Eligibility System  ║${RESET}"
echo -e "${CYAN}║                    v2.0                              ║${RESET}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════╝${RESET}"
echo ""

# ── Check Node.js ──────────────────────────────────────────
if ! command -v node &>/dev/null; then
  error "Node.js is not installed. Install Node.js 18+ from https://nodejs.org"
  exit 1
fi
NODE_VERSION=$(node --version)
info "Node.js: $NODE_VERSION"

# ── Check npm ──────────────────────────────────────────────
if ! command -v npm &>/dev/null; then
  error "npm is not installed."
  exit 1
fi

# ── Check MySQL ────────────────────────────────────────────
if ! command -v mysql &>/dev/null; then
  warn "mysql client not found in PATH — skipping database auto-setup."
  SKIP_DB=true
else
  SKIP_DB=false
fi

# ── Install dependencies ───────────────────────────────────
if [ ! -d "$BACKEND_DIR/node_modules" ]; then
  info "Installing Node.js dependencies…"
  cd "$BACKEND_DIR" && npm install
  success "Dependencies installed."
else
  info "node_modules found — skipping install. Run 'npm install' in Backend/ to update."
fi

# ── Check .env ─────────────────────────────────────────────
if [ ! -f "$ENV_FILE" ]; then
  error ".env file not found at $ENV_FILE"
  error "Required variables: DB_HOST, DB_USER, DB_PASSWORD, JWT_SECRET,"
  error "  GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,"
  error "  EMAIL_USER, EMAIL_PASS,"
  error "  CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET"
  exit 1
fi
success ".env file found."

# ── Database setup ─────────────────────────────────────────
if [ "$SKIP_DB" = false ]; then
  # Parse .env values
  DB_HOST_VAL=$(grep '^DB_HOST=' "$ENV_FILE" | cut -d'=' -f2- | tr -d '"' || echo "localhost")
  DB_USER_VAL=$(grep '^DB_USER=' "$ENV_FILE" | cut -d'=' -f2- | tr -d '"' || echo "root")
  DB_PASS_VAL=$(grep '^DB_PASSWORD=' "$ENV_FILE" | cut -d'=' -f2- | tr -d '"' || echo "")
  DB_NAME_VAL=$(grep '^DB_NAME=' "$ENV_FILE" | cut -d'=' -f2- | tr -d '"' || echo "apes_system")

  DB_HOST_VAL="${DB_HOST_VAL:-localhost}"
  DB_USER_VAL="${DB_USER_VAL:-root}"
  DB_NAME_VAL="${DB_NAME_VAL:-apes_system}"

  MYSQL_CMD="mysql -h $DB_HOST_VAL -u $DB_USER_VAL"
  if [ -n "$DB_PASS_VAL" ]; then
    MYSQL_CMD="$MYSQL_CMD -p$DB_PASS_VAL"
  fi

  DB_EXISTS=$($MYSQL_CMD -e "SHOW DATABASES LIKE '${DB_NAME_VAL}';" 2>/dev/null | grep -c "$DB_NAME_VAL" || echo "0")

  if [ "$DB_EXISTS" = "0" ]; then
    warn "Database '$DB_NAME_VAL' not found. Setting up database…"

    if [ -f "$DB_DIR/schema.sql" ]; then
      info "Running schema.sql…"
      $MYSQL_CMD < "$DB_DIR/schema.sql" && success "Schema created." || warn "Schema may have failed — check MySQL output."
    else
      error "schema.sql not found at $DB_DIR/schema.sql"
    fi

    if [ -f "$DB_DIR/seed.sql" ]; then
      info "Running seed.sql (this may take a moment)…"
      $MYSQL_CMD < "$DB_DIR/seed.sql" && success "Seed data loaded." || warn "Seed may have failed — check MySQL output."
    else
      warn "seed.sql not found — database will be empty."
    fi
  else
    success "Database '$DB_NAME_VAL' already exists — skipping setup."
    info "To re-seed: mysql -u <user> -p < Database/seed.sql"
  fi
fi

# ── Start server ───────────────────────────────────────────
PORT=$(grep '^PORT=' "$ENV_FILE" 2>/dev/null | cut -d'=' -f2- | tr -d '"' || echo "3000")
PORT="${PORT:-3000}"

echo ""
# ── Port check ───────────────────────────────────────────
if command -v lsof >/dev/null 2>&1; then
  if lsof -i :"$PORT" -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo ""
    error "Port $PORT is already in use."
    echo "Run 'lsof -i :$PORT' to see what is using it, then stop it or set a different PORT in $ENV_FILE."
    exit 1
  fi
elif command -v ss >/dev/null 2>&1; then
  if ss -ltn "sport = :$PORT" | grep -q LISTEN; then
    echo ""
    error "Port $PORT is already in use."
    echo "Run 'ss -ltn | grep \":$PORT\"' to see what is using it, then stop it or set a different PORT in $ENV_FILE."
    exit 1
  fi
fi

echo ""
info "Starting APES server on port $PORT…"
echo ""
echo -e "${GREEN}  ┌────────────────────────────────────────────┐${RESET}"
echo -e "${GREEN}  │  App:      http://localhost:${PORT}            │${RESET}"
echo -e "${GREEN}  │  Login:    http://localhost:${PORT}/login.html │${RESET}"
echo -e "${GREEN}  │  Register: http://localhost:${PORT}/register.html │${RESET}"
echo -e "${GREEN}  └────────────────────────────────────────────┘${RESET}"
echo ""
info "Press Ctrl+C to stop the server."
echo ""

cd "$BACKEND_DIR"
NODE_ENV="${NODE_ENV:-development}" node server.js
