# Help-Car - Frontend (Vue.js)

Современный веб-интерфейс для платформы Help-Car.

## 🚀 Быстрый старт

### Установка зависимостей

```bash
npm install
```

### Запуск в режиме разработки

```bash
npm run dev
```

Сайт будет доступен на `http://localhost:8080`

### Сборка для production

```bash
npm run build
```

## 🎨 Технологии

- **Vue 3** - прогрессивный фреймворк
- **Vite** - быстрая сборка
- **Tailwind CSS** - современные стили
- **Pinia** - управление состоянием
- **Vue Router** - маршрутизация
- **Axios** - HTTP клиент
- **Socket.io Client** - WebSocket

## 📁 Структура проекта

```
frontend/
├── src/
│   ├── views/          # Страницы
│   │   ├── HomeView.vue
│   │   ├── LoginView.vue
│   │   ├── RegisterView.vue
│   │   ├── MapView.vue
│   │   ├── CreateRequestView.vue
│   │   ├── MyRequestsView.vue
│   │   ├── ProfileView.vue
│   │   └── ChatView.vue
│   ├── stores/         # Pinia stores
│   │   └── auth.js
│   ├── services/       # API сервисы
│   │   ├── api.js
│   │   └── websocket.js
│   ├── router/         # Маршрутизация
│   │   └── index.js
│   ├── assets/         # Стили и ресурсы
│   │   └── main.css
│   ├── App.vue
│   └── main.js
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## 🔌 Подключение к Backend

Backend должен быть запущен на `http://localhost:3000`

Для изменения URL отредактируйте:
- `src/services/api.js` - BASE_URL
- `src/services/websocket.js` - WS_URL

## ✨ Функции

- ✅ Адаптивный дизайн
- ✅ Авторизация и регистрация
- ✅ Создание запросов о помощи
- ✅ Просмотр запросов на карте
- ✅ Реал-тайм обновления
- ✅ Чат
- ✅ Профиль пользователя
- ✅ История запросов

## 🎨 Дизайн

Современный минималистичный дизайн с:
- Градиентными фонами
- Плавными анимациями
- Адаптивной версткой
- Красивыми карточками
- Интуитивным UX

## 📱 Адаптивность

Сайт полностью адаптивен для:
- 📱 Мобильных телефонов
- 📲 Планшетов
- 💻 Десктопов

## 🔒 Защищенные маршруты

Некоторые страницы требуют авторизации:
- `/map` - Карта с запросами
- `/create-request` - Создание запроса
- `/my-requests` - Мои запросы
- `/profile` - Профиль
- `/chat/:id` - Чат

## 📄 Лицензия

MIT

