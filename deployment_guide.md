# Server Deployment Guide

This guide will help you deploy the HamkorQurilish application to your remote server using Docker.

## 1. Server Prerequisites
Make sure your server has the following installed:
- **Docker**: `sudo apt-get install docker.io`
- **Docker Compose**: `sudo apt-get install docker-compose`
- **Git**: `sudo apt-get install git`

## 2. Server Setup

### Step 1: Clone the Repository
On your server, run:
```bash
git clone https://github.com/your-username/yangiUstalar.git
cd yangiUstalar
```

### Step 2: Configure Environment Variables
Copy the example environment files and edit them with your production details:

#### Backend
```bash
cp Beckend/.env.example Beckend/.env
nano Beckend/.env
```
*Make sure to set your production bot tokens, secret keys, and database paths.*

#### Frontend
```bash
cp Frontend/.env.example Frontend/.env
nano Frontend/.env
```
*Set `VITE_API_URL` to your server's IP or domain (e.g., `http://your-server-ip:8000`).*

### Step 3: Set Permissions
Make the deployment script executable:
```bash
chmod +x deploy.sh
```

## 3. Deploy
Run the deployment script to build and start all services:
```bash
./deploy.sh
```

## 4. Accessing the App
- **Frontend**: Accessible on port `80` (Standard HTTP).
- **Backend API**: Accessible on port `8000`.

## 5. Security & Maintenance
- **Secrets**: NEVER share your `.env` files. They are ignored by Git.
- **Updates**: To update the server, simply run `./deploy.sh` again. It will pull new code, rebuild images, and restart containers without data loss (thanks to Docker volumes).
- **SSL**: For production, it is highly recommended to use Nginx with Certbot (Let's Encrypt) on the server to enable HTTPS.
