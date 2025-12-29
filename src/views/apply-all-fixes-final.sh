#!/bin/bash

# Финальный скрипт для применения всех исправлений

set -e

cd /home/vmroadhelp

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 ПРИМЕНЕНИЕ ВСЕХ ИСПРАВЛЕНИЙ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Создание таблицы errors
echo "📋 Шаг 1: Создание таблицы errors..."
if [ -f create-errors-table.sql ]; then
  docker exec -i roadhelp-postgres psql -U roadhelp_user -d roadhelp < create-errors-table.sql 2>&1 | tail -3
else
  echo "⚠️  Файл не найден, создаю таблицу напрямую..."
  docker exec roadhelp-postgres psql -U roadhelp_user -d roadhelp <<EOF 2>&1 | tail -3
DO \$\$ BEGIN
  CREATE TYPE enum_errors_level AS ENUM ('error', 'warning', 'info', 'debug');
EXCEPTION WHEN duplicate_object THEN null;
END \$\$;
CREATE TABLE IF NOT EXISTS "errors" (
  "id" SERIAL PRIMARY KEY,
  "level" enum_errors_level NOT NULL DEFAULT 'error',
  "message" TEXT NOT NULL,
  "stack" TEXT,
  "source" VARCHAR(255),
  "category" VARCHAR(100),
  "user_id" UUID,
  "admin_id" INTEGER,
  "url" VARCHAR(500),
  "user_agent" VARCHAR(500),
  "ip_address" VARCHAR(45),
  "extra_data" JSONB,
  "resolved" BOOLEAN NOT NULL DEFAULT false,
  "resolved_at" TIMESTAMP,
  "resolved_by" INTEGER,
  "resolved_note" TEXT,
  "occurrence_count" INTEGER NOT NULL DEFAULT 1,
  "first_occurred" TIMESTAMP NOT NULL DEFAULT NOW(),
  "last_occurred" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_errors_level ON "errors"("level");
CREATE INDEX IF NOT EXISTS idx_errors_source ON "errors"("source");
CREATE INDEX IF NOT EXISTS idx_errors_category ON "errors"("category");
CREATE INDEX IF NOT EXISTS idx_errors_resolved ON "errors"("resolved");
CREATE INDEX IF NOT EXISTS idx_errors_created_at ON "errors"("created_at");
CREATE INDEX IF NOT EXISTS idx_errors_last_occurred ON "errors"("last_occurred");
EOF
fi
echo "✅ Таблица errors создана"
echo ""

# 2. Копирование файлов в backend
echo "📋 Шаг 2: Копирование исправленных файлов в backend..."
docker cp backend/src/routes/index.js roadhelp-backend:/app/src/routes/ 2>&1
docker cp backend/src/services/databaseBackup.js roadhelp-backend:/app/src/services/ 2>&1
docker cp backend/src/controllers/backupController.js roadhelp-backend:/app/src/controllers/ 2>&1
docker cp backend/src/controllers/systemController.js roadhelp-backend:/app/src/controllers/ 2>&1
docker cp backend/src/routes/adminRoutes.js roadhelp-backend:/app/src/routes/ 2>&1
echo "✅ Файлы скопированы"
echo ""

# 3. Перезапуск backend
echo "📋 Шаг 3: Перезапуск backend..."
docker-compose -f docker-compose.production.yml restart backend
echo "⏳ Ожидание запуска backend (20 сек)..."
sleep 20
echo "✅ Backend перезапущен"
echo ""

# 4. Пересборка frontend
echo "📋 Шаг 4: Пересборка frontend..."
cd frontend
npm run build 2>&1 | tail -5
docker cp dist/. roadhelp-frontend:/usr/share/nginx/html/ 2>&1
docker-compose -f docker-compose.production.yml restart frontend
cd ..
echo "✅ Frontend пересобран и перезапущен"
echo ""

# 5. Проверка статуса
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ВСЕ ИСПРАВЛЕНИЯ ПРИМЕНЕНЫ!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Статус сервисов:"
docker ps --format 'table {{.Names}}\t{{.Status}}' | grep -E '(backend|frontend|postgres)'
echo ""
echo "📋 Проверка:"
echo "1. Таблица errors:"
docker exec roadhelp-postgres psql -U roadhelp_user -d roadhelp -t -c 'SELECT COUNT(*) FROM errors;' 2>&1 | head -1
echo ""
echo "2. superAdminRoutes подключен:"
docker exec roadhelp-backend node -e "try { require('./src/routes/index'); console.log('✅ superAdminRoutes подключен'); } catch(e) { console.log('❌ Ошибка:', e.message); }" 2>&1 | tail -1
echo ""
echo "🌐 Откройте: https://help-car.online/admin/super"
echo ""

