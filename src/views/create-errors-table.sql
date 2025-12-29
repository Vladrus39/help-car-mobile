-- Создание таблицы errors для логирования ошибок

-- Создаем enum для level
DO $$ BEGIN
  CREATE TYPE enum_errors_level AS ENUM ('error', 'warning', 'info', 'debug');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Создаем таблицу errors
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

-- Создаем индексы
CREATE INDEX IF NOT EXISTS idx_errors_level ON "errors"("level");
CREATE INDEX IF NOT EXISTS idx_errors_source ON "errors"("source");
CREATE INDEX IF NOT EXISTS idx_errors_category ON "errors"("category");
CREATE INDEX IF NOT EXISTS idx_errors_resolved ON "errors"("resolved");
CREATE INDEX IF NOT EXISTS idx_errors_created_at ON "errors"("created_at");
CREATE INDEX IF NOT EXISTS idx_errors_last_occurred ON "errors"("last_occurred");

