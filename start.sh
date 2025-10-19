#!/bin/bash
echo "Starting Facebook Group Finder..."
exec gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --threads 4 --worker-class sync --timeout 120