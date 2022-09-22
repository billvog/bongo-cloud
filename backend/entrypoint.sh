#!/bin/bash
cd /code/bongocloudapi
gunicorn --worker-tmp-dir /dev/shm bongocloudapi.wsgi:application --bind "0.0.0.0:8000"