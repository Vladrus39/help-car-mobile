const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Статус сборок (в памяти, для dev режима)
const buildStatus = {
  android: {
    building: false,
    ready: false,
    progress: 0,
    error: null,
    lastBuild: null
  },
  ios: {
    building: false,
    ready: false,
    progress: 0,
    error: null,
    lastBuild: null
  }
};

/**
 * POST /api/v1/build/trigger/:platform
 * Запустить автоматическую сборку и скачивание
 */
router.post('/trigger/:platform', async (req, res) => {
  const { platform } = req.params;
  
  if (platform !== 'android' && platform !== 'ios') {
    return res.status(400).json({ error: 'Invalid platform' });
  }
  
  // Проверяем уже собрано ли
  const projectRoot = path.join(__dirname, '../../..');
  const buildDir = path.join(projectRoot, 'mobile-builds', platform);
  const filename = platform === 'android' ? 'RoadHelp.apk' : 'RoadHelp.ipa';
  const filePath = path.join(buildDir, filename);
  
  if (fs.existsSync(filePath)) {
    logger.info(`${platform} app already exists, serving...`);
    return res.json({
      ready: true,
      downloadUrl: `/api/v1/mobile/download/${platform}`,
      message: 'Приложение уже собрано, начинаем скачивание...'
    });
  }
  
  // Проверяем идёт ли сборка
  if (buildStatus[platform].building) {
    return res.json({
      building: true,
      progress: buildStatus[platform].progress,
      message: 'Сборка уже в процессе, подождите...'
    });
  }
  
  // Запускаем сборку
  logger.info(`Starting ${platform} build...`);
  buildStatus[platform].building = true;
  buildStatus[platform].progress = 0;
  buildStatus[platform].error = null;
  
  // Статус не кешируем
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  res.json({
    building: true,
    message: `Запускаем сборку ${platform} приложения...`,
    estimatedTime: platform === 'android' ? '3-5 минут' : '5-10 минут',
    statusUrl: `/api/v1/build/status/${platform}`
  });
  
  // Асинхронная сборка
  buildApp(platform, projectRoot);
});

/**
 * Функция сборки приложения
 */
async function buildApp(platform, projectRoot) {
  try {
    buildStatus[platform].progress = 10;
    
    // Проверяем Flutter
    const flutterCheck = await execCommand('flutter --version', projectRoot);
    if (!flutterCheck.success) {
      throw new Error('Flutter не установлен! Установите: https://flutter.dev');
    }
    
    buildStatus[platform].progress = 20;
    logger.info('✅ Flutter найден');
    
    // Очистка
    buildStatus[platform].progress = 30;
    await execCommand('flutter clean', projectRoot);
    logger.info('✅ Очистка выполнена');
    
    // Получение зависимостей
    buildStatus[platform].progress = 40;
    await execCommand('flutter pub get', projectRoot);
    logger.info('✅ Зависимости получены');
    
    buildStatus[platform].progress = 50;
    
    // Сборка
    let buildCommand;
    let outputPath;
    let targetPath;
    
    if (platform === 'android') {
      buildCommand = 'flutter build apk --release';
      outputPath = path.join(projectRoot, 'build/app/outputs/flutter-apk/app-release.apk');
      targetPath = path.join(projectRoot, 'mobile-builds/android/RoadHelp.apk');
    } else {
      buildCommand = 'flutter build ios --release --no-codesign';
      outputPath = path.join(projectRoot, 'build/ios/iphoneos/Runner.app');
      targetPath = path.join(projectRoot, 'mobile-builds/ios/RoadHelp.ipa');
    }
    
    buildStatus[platform].progress = 60;
    logger.info(`Начинаем сборку: ${buildCommand}`);
    
    const buildResult = await execCommand(buildCommand, projectRoot, 600000); // 10 минут timeout
    
    if (!buildResult.success) {
      throw new Error('Ошибка сборки: ' + buildResult.error);
    }
    
    buildStatus[platform].progress = 90;
    logger.info('✅ Сборка завершена');
    
    // Копируем файл
    if (platform === 'android' && fs.existsSync(outputPath)) {
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      fs.copyFileSync(outputPath, targetPath);
      logger.info(`✅ APK скопирован: ${targetPath}`);
    }
    
    buildStatus[platform].progress = 100;
    buildStatus[platform].building = false;
    buildStatus[platform].ready = true;
    buildStatus[platform].lastBuild = new Date();
    
    logger.info(`✅ ${platform} сборка полностью завершена!`);
    
  } catch (error) {
    logger.error(`❌ Ошибка сборки ${platform}:`, error);
    buildStatus[platform].building = false;
    buildStatus[platform].error = error.message;
    buildStatus[platform].progress = 0;
  }
}

/**
 * Выполнение команды
 */
function execCommand(command, cwd, timeout = 30000) {
  return new Promise((resolve) => {
    exec(command, { cwd, timeout }, (error, stdout, stderr) => {
      if (error) {
        resolve({ success: false, error: stderr || error.message });
      } else {
        resolve({ success: true, stdout });
      }
    });
  });
}

/**
 * GET /api/v1/build/status/:platform
 * Получить статус сборки
 */
router.get('/status/:platform', (req, res) => {
  const { platform } = req.params;
  
  if (platform !== 'android' && platform !== 'ios') {
    return res.status(400).json({ error: 'Invalid platform' });
  }
  
  const status = buildStatus[platform];
  
  // Не кешируем статус
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  res.json({
    building: status.building,
    ready: status.ready,
    progress: status.progress,
    error: status.error,
    lastBuild: status.lastBuild,
    downloadUrl: status.ready ? `/api/v1/mobile/download/${platform}` : null
  });
});

module.exports = router;

