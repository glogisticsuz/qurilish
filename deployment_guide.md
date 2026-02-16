# 🚀 MegaStroy: Serverga Joylash Bo'yicha To'liq Qo'llanma

Ushbu qo'llanma loyihani noldan boshlab Ubuntu serveriga (VPS) joylashni o'rgatadi.

## 📋 0-bosqich: Fayllarni serverga yuklash
Barcha fayllarni (Beckend va Frontend) bitta papkaga serverga yuklang (masalan: `/var/www/megastroy/`).

---

## 🐍 1-bosqich: Backend Sozlamalari (Python/FastAPI)

1. **Python muhitini o'rnatish:**
   ```bash
   sudo apt update
   sudo apt install python3-pip python3-venv
   ```

2. **Virtual muhit yaratish:**
   ```bash
   cd /var/www/megastroy/Beckend
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Kutubxonalarni o'rnatish:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Sozlamalar (.env):**
   `Beckend/.env.example` faylini `.env` ga o'zgartiring va o'z ma'lumotlaringizni kiriting:
   ```bash
   cp .env.example .env
   nano .env
   ```
   > [!IMPORTANT]
   > `JWT_SECRET`, `ADMIN_PASSWORD` va `IMAGEKIT` kalitlarini o'zgartirishni unutmang!

5. **Gunicornni test qilish:**
   ```bash
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000
   ```

---

## 🎨 2-bosqich: Frontend Sozlamalari (Vite/React)

1. **Node.js o'rnatish:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

2. **Dasturni yig'ish (Build):**
   ```bash
   cd /var/www/megastroy/Frontend/src
   npm install
   # .env.production faylini ochib, API manzilini yozing (masalan: https://api.megastroy.uz)
   npm run build
   ```
   Endi `dist` papkasida tayyor sayt fayllari paydo bo'ldi.

---

## ⚙️ 3-bosqich: Nginx Sozlamalari

1. **Nginx o'rnatish:**
   ```bash
   sudo apt install nginx
   ```

2. **Sayt uchun yangi config yaratish:**
   ```bash
   sudo nano /etc/nginx/sites-available/megastroy
   ```

3. **Quyidagi kodni nusxalang:**
   ```nginx
   server {
       listen 80;
       server_name megastroy.uz www.megastroy.uz api.megastroy.uz;

       # Frontend
       location / {
           root /var/www/megastroy/Frontend/src/dist;
           index index.html;
           try_files $uri $uri/ /index.html;
       }

       # Backend API Proxy
       location /api/ {
           proxy_pass http://127.0.0.1:8000/;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Configni yoqish:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/megastroy /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

## 🛡️ 4-bosqich: SSL (HTTPS) o'rnatish

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d megastroy.uz -d api.megastroy.uz
```

---

## 🔄 5-bosqich: Process Manager (PM2/Systemd)
Dastur server o'chib yonganida ham o'zi ishlab ketishi uchun:

**Backend uchun:**
```bash
# PM2 o'rnating
sudo npm install -g pm2

cd /var/www/megastroy/Beckend
pm2 start "venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000" --name megastroy-api
pm2 save
pm2 startup
```

---

**Hammasi tayyor!** Endi saytingiz internetda ishlashi kerak. 🎉
Agar xatoliklar bo'lsa, `pm2 logs` yoki `sudo tail -f /var/log/nginx/error.log` buyruqlari bilan tekshiring.
