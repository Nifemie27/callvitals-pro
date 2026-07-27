#!/bin/sh
set -e

# Serverless Postgres providers (Neon included) suspend their compute after
# a period of inactivity; the first connection after that has to wait for it
# to wake back up, which can take longer than `prisma migrate deploy`'s fixed
# 10-second advisory-lock timeout (P1002). Retrying a few times with a short
# backoff is enough to ride out that wake-up window without needing the
# database to already be warm before this container starts.
attempt=1
max_attempts=5
until npx prisma migrate deploy; do
  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "prisma migrate deploy failed after $max_attempts attempts" >&2
    exit 1
  fi
  echo "migrate deploy attempt $attempt failed, retrying in $((attempt * 5))s..." >&2
  sleep $((attempt * 5))
  attempt=$((attempt + 1))
done

npx prisma db seed

exec node dist/server.js
