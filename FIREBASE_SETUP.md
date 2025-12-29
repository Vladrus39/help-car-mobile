# 🔔 Настройка Firebase Push-уведомлений для RoadHelp

## Шаг 1: Создание проекта Firebase

1. Откройте [Firebase Console](https://console.firebase.google.com/)
2. Нажмите **"Создать проект"**
3. Название: `RoadHelp` или `help-car-online`
4. Отключите Google Analytics (не обязательно)
5. Нажмите **"Создать проект"**

---

## Шаг 2: Добавление Android приложения

1. В Firebase Console нажмите значок Android 🤖
2. Заполните форму:
   - **Название пакета**: `online.helpcar.app`
   - **Псевдоним**: `RoadHelp Android`
   - **SHA-1** (опционально, для Google Sign-In)

3. Скачайте файл `google-services.json`

4. Поместите файл сюда:
```
frontend/android/app/google-services.json
```

---

## Шаг 3: Добавление iOS приложения (опционально)

1. Нажмите значок iOS 🍎
2. **Bundle ID**: `online.helpcar.app`
3. Скачайте `GoogleService-Info.plist`
4. Поместите в:
```
frontend/ios/App/App/GoogleService-Info.plist
```

---

## Шаг 4: Получение Server Key (для backend)

1. Firebase Console → ⚙️ Настройки проекта
2. Вкладка **Cloud Messaging**
3. Скопируйте **Server key** (или создайте новый)
4. Добавьте в backend `.env`:

```env
FIREBASE_SERVER_KEY=AAAAxxxxxxx...
```

---

## Шаг 5: Проверка конфигурации

После размещения файлов, выполните:

```bash
cd frontend
npx cap sync
```

---

## 🎯 Быстрая проверка

Файлы должны быть:
- ✅ `frontend/android/app/google-services.json`
- ✅ `frontend/ios/App/App/GoogleService-Info.plist` (для iOS)
- ✅ Backend `.env` с `FIREBASE_SERVER_KEY`

---

## 📱 Тестирование

1. Соберите APK и установите на телефон
2. Разрешите push-уведомления
3. Отправьте тестовое уведомление из Firebase Console:
   - Cloud Messaging → Send your first message
   - Выберите устройство или тему

---

## Полезные ссылки

- [Firebase Console](https://console.firebase.google.com/)
- [Capacitor Push Notifications](https://capacitorjs.com/docs/apis/push-notifications)
- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
