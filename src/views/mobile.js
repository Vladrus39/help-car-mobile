const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

/**
 * GET /api/v1/mobile/download/:platform
 * Скачать мобильное приложение (или запустить сборку если нужно)
 */
router.get('/download/:platform', async (req, res) => {
  const { platform } = req.params; // 'android' или 'ios'
  
  try {
    const projectRoot = path.join(__dirname, '../../..');
    const buildDir = path.join(projectRoot, 'mobile-builds', platform);
    
    let filename;
    if (platform === 'android') {
      filename = 'RoadHelp.apk';
    } else if (platform === 'ios') {
      filename = 'RoadHelp.ipa';
    } else {
      return res.status(400).json({ error: 'Invalid platform' });
    }
    
    const filePath = path.join(buildDir, filename);
    
    // Проверяем существует ли файл
    // Всегда отдаём свежий файл и запрещаем кеш
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    if (fs.existsSync(filePath)) {
      // Файл уже собран - отдаём его
      logger.info(`Serving ${platform} app: ${filename}`);
      
      res.setHeader('Content-Type', platform === 'android' 
        ? 'application/vnd.android.package-archive' 
        : 'application/octet-stream'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      return res.download(filePath);
    } else {
      // Файл не найден - нужна сборка
      logger.info(`${platform} app not found. Build required.`);
      
      return res.status(404).json({
        error: 'App not built yet',
        message: `Приложение для ${platform} ещё не собрано. Запустите сборку через скрипт build-mobile-apps.sh`,
        buildCommand: platform === 'android' 
          ? 'flutter build apk --release'
          : 'flutter build ios --release'
      });
    }
  } catch (error) {
    logger.error('Error downloading mobile app:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/v1/mobile/build/:platform
 * Запустить сборку приложения (только для разработчиков)
 */
router.post('/build/:platform', async (req, res) => {
  const { platform } = req.params;
  
  // В production это должно быть защищено авторизацией админа
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Build endpoint disabled in production' });
  }
  
  try {
    const projectRoot = path.join(__dirname, '../../..');
    
    let buildCommand;
    if (platform === 'android') {
      buildCommand = 'flutter build apk --release';
    } else if (platform === 'ios') {
      buildCommand = 'flutter build ios --release';
    } else {
      return res.status(400).json({ error: 'Invalid platform' });
    }
    
    logger.info(`Starting ${platform} build...`);
    
    // Запускаем сборку асинхронно
    exec(buildCommand, { cwd: projectRoot }, (error, stdout, stderr) => {
      if (error) {
        logger.error(`Build error for ${platform}:`, error);
        return;
      }
      logger.info(`${platform} build completed successfully`);
    });
    
    // Сразу отвечаем что сборка запущена
    res.json({
      message: `Сборка ${platform} приложения запущена`,
      estimatedTime: platform === 'android' ? '3-5 минут' : '5-10 минут',
      checkEndpoint: `/api/v1/mobile/status/${platform}`
    });
    
  } catch (error) {
    logger.error('Error starting build:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/v1/mobile/status/:platform
 * Проверить статус сборки
 */
router.get('/status/:platform', (req, res) => {
  const { platform } = req.params;
  
  const projectRoot = path.join(__dirname, '../../..');
  const buildDir = path.join(projectRoot, 'mobile-builds', platform);
  
  const filename = platform === 'android' 
    ? 'RoadHelp.apk' 
    : 'RoadHelp.ipa';
    
  const filePath = path.join(buildDir, filename);
  
  const exists = fs.existsSync(filePath);
  
  // Запрещаем кешировать статус
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  if (exists) {
    const stats = fs.statSync(filePath);
    
    res.json({
      ready: true,
      filename,
      size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
      lastModified: stats.mtime,
      downloadUrl: `/api/v1/mobile/download/${platform}`
    });
  } else {
    res.json({
      ready: false,
      message: 'Приложение ещё не собрано или сборка в процессе'
    });
  }
});

module.exports = router;

