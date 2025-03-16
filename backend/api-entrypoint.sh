#!/bin/bash
set -e 

# Load environment variables from .env file
if [ -f .env ]; then
  export $(cat .env | xargs)
fi

echo "Applying database migrations..."
python manage.py makemigrations login core
python manage.py migrate
echo "Starting Django server..."
exec "$@"
