#!/bin/bash

# HamkorQurilish Deployment Script

# Pull latest changes
echo "Pulling latest changes from Git..."
git pull origin master

# Build and restart containers
echo "Building and restarting containers..."
docker-compose up -d --build

# Clean up unused images
echo "Cleaning up old images..."
docker image prune -f

echo "Deployment finished successfully!"
