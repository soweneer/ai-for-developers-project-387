#!/bin/sh
set -e

PORT="${PORT:-8080}"
PGDATA="${PGDATA:-/var/lib/postgresql/data}"

mkdir -p "$PGDATA" /run/postgresql /var/log/nginx
touch /var/log/postgresql.log
chown -R postgres:postgres "$PGDATA" /run/postgresql /var/log/postgresql.log

if [ ! -s "$PGDATA/PG_VERSION" ]; then
  echo "Initializing PostgreSQL data directory..."
  su-exec postgres initdb -D "$PGDATA" --auth=trust >/dev/null
fi

echo "Starting PostgreSQL..."
su-exec postgres pg_ctl -D "$PGDATA" -l /var/log/postgresql.log -w start

su-exec postgres psql -v ON_ERROR_STOP=1 --username postgres <<-'EOSQL'
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'cal') THEN
        CREATE ROLE cal LOGIN PASSWORD 'cal';
      END IF;
    END
    $$;
EOSQL

su-exec postgres psql -v ON_ERROR_STOP=1 --username postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'cal'" | grep -q 1 \
  || su-exec postgres psql --username postgres -c "CREATE DATABASE cal OWNER cal"

echo "Starting backend..."
dotnet /app/backend/Cal.Web.dll &
BACKEND_PID=$!

echo "Waiting for backend to become ready..."
i=0
while ! wget -q -O /dev/null http://127.0.0.1:8081/ 2>/dev/null; do
  i=$((i + 1))
  if [ "$i" -ge 60 ]; then
    echo "Backend did not become ready in time" >&2
    break
  fi
  sleep 1
done

sed "s/%%PORT%%/$PORT/g" /etc/nginx/nginx.conf.template > /etc/nginx/http.d/default.conf

shutdown() {
  echo "Shutting down..."
  kill -TERM "$BACKEND_PID" 2>/dev/null
  su-exec postgres pg_ctl -D "$PGDATA" stop -m fast >/dev/null 2>&1
  exit 0
}
trap shutdown TERM INT

echo "Starting nginx on port $PORT..."
nginx -g 'daemon off;' &
NGINX_PID=$!
wait "$NGINX_PID"
