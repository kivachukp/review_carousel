# Review Carousel Application
Блок отзывов с фронтендом на React и бэкендом на FastAPI.

🐳 Быстрый запуск через Docker
Предварительные требования

Установленный Docker
Установленный Docker Compose
Запуск за 3 шага

Создайте файл docker-compose.yml:
```
mkdir review-carousel && cd review-carousel
cat > docker-compose.yml << 'EOF'
```
В файл docker-compose.yml добавляем код ниже
```
version: "3.9"

services:
  backend:
    image: kivachukp/review_carousel_backend:latest
    ports:
      - "8000:8000"
    restart: unless-stopped
    environment:
      - PYTHONPATH=/app

  frontend:
    image: kivachukp/review_carousel_frontend:latest
    ports:
      - "5173:5173"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://backend:8000
    restart: unless-stopped
```
Запустите приложение:
```
docker-compose up -d
```
Для проверки откройте в браузере:
Фронтенд: http://localhost:5173
Бэкенд (документация API): http://localhost:8000/docs
