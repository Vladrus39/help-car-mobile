const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Простая функция для чтения логов без зависимости от centralLogger
async function readLogs() {
    try {
        const logPath = path.join(__dirname, '../../logs/combined.log');
        const data = await fs.readFile(logPath, 'utf8');
        const lines = data.split('\n').filter(line => line.trim());
        
        return lines.map((line, index) => {
            try {
                return JSON.parse(line);
            } catch {
                return {
                    level: 'info',
                    message: line,
                    timestamp: new Date().toISOString(),
                    index: index
                };
            }
        });
    } catch (error) {
        console.error('Error reading logs:', error);
        return [];
    }
}

// Публичный endpoint для AI без авторизации
router.get('/ai-logs', async (req, res) => {
    try {
        const logs = await readLogs();
        
        // Фильтруем логи на наличие ошибок (включая HTTP статус коды)
        const errorLogs = logs.filter(log => {
            const logString = JSON.stringify(log);
            return log.level === 'error' || 
                   log.message?.toLowerCase().includes('error') ||
                   logString.includes('"status": 401') ||
                   logString.includes('"status": 403') ||
                   logString.includes('"status": 404') ||
                   logString.includes('"status": 500') ||
                   logString.includes('"POST.*401') ||
                   logString.includes('"GET.*401') ||
                   logString.includes('Error:') ||
                   logString.includes('Exception:') ||
                   logString.includes('Failed:');
        });

        res.status(200).json({
            message: 'AI logs access',
            status: 'ok',
            timestamp: new Date().toISOString(),
            totalLogs: logs.length,
            errorLogs: errorLogs.length,
            logs: logs.slice(-100), // Последние 100 записей
            errors: errorLogs.slice(-50) // Последние 50 ошибок
        });
    } catch (error) {
        console.error('Error getting AI logs:', error);
        res.status(500).json({ 
            message: 'Error getting AI logs', 
            error: error.message 
        });
    }
});

module.exports = router;

const fs = require('fs').promises;
const path = require('path');

// Простая функция для чтения логов без зависимости от centralLogger
async function readLogs() {
    try {
        const logPath = path.join(__dirname, '../../logs/combined.log');
        const data = await fs.readFile(logPath, 'utf8');
        const lines = data.split('\n').filter(line => line.trim());
        
        return lines.map((line, index) => {
            try {
                return JSON.parse(line);
            } catch {
                return {
                    level: 'info',
                    message: line,
                    timestamp: new Date().toISOString(),
                    index: index
                };
            }
        });
    } catch (error) {
        console.error('Error reading logs:', error);
        return [];
    }
}

// Публичный endpoint для AI без авторизации
router.get('/ai-logs', async (req, res) => {
    try {
        const logs = await readLogs();
        
        // Фильтруем логи на наличие ошибок (включая HTTP статус коды)
        const errorLogs = logs.filter(log => {
            const logString = JSON.stringify(log);
            return log.level === 'error' || 
                   log.message?.toLowerCase().includes('error') ||
                   logString.includes('"status": 401') ||
                   logString.includes('"status": 403') ||
                   logString.includes('"status": 404') ||
                   logString.includes('"status": 500') ||
                   logString.includes('"POST.*401') ||
                   logString.includes('"GET.*401') ||
                   logString.includes('Error:') ||
                   logString.includes('Exception:') ||
                   logString.includes('Failed:');
        });

        res.status(200).json({
            message: 'AI logs access',
            status: 'ok',
            timestamp: new Date().toISOString(),
            totalLogs: logs.length,
            errorLogs: errorLogs.length,
            logs: logs.slice(-100), // Последние 100 записей
            errors: errorLogs.slice(-50) // Последние 50 ошибок
        });
    } catch (error) {
        console.error('Error getting AI logs:', error);
        res.status(500).json({ 
            message: 'Error getting AI logs', 
            error: error.message 
        });
    }
});

module.exports = router;





const fs = require('fs').promises;
const path = require('path');

// Простая функция для чтения логов без зависимости от centralLogger
async function readLogs() {
    try {
        const logPath = path.join(__dirname, '../../logs/combined.log');
        const data = await fs.readFile(logPath, 'utf8');
        const lines = data.split('\n').filter(line => line.trim());
        
        return lines.map((line, index) => {
            try {
                return JSON.parse(line);
            } catch {
                return {
                    level: 'info',
                    message: line,
                    timestamp: new Date().toISOString(),
                    index: index
                };
            }
        });
    } catch (error) {
        console.error('Error reading logs:', error);
        return [];
    }
}

// Публичный endpoint для AI без авторизации
router.get('/ai-logs', async (req, res) => {
    try {
        const logs = await readLogs();
        
        // Фильтруем логи на наличие ошибок (включая HTTP статус коды)
        const errorLogs = logs.filter(log => {
            const logString = JSON.stringify(log);
            return log.level === 'error' || 
                   log.message?.toLowerCase().includes('error') ||
                   logString.includes('"status": 401') ||
                   logString.includes('"status": 403') ||
                   logString.includes('"status": 404') ||
                   logString.includes('"status": 500') ||
                   logString.includes('"POST.*401') ||
                   logString.includes('"GET.*401') ||
                   logString.includes('Error:') ||
                   logString.includes('Exception:') ||
                   logString.includes('Failed:');
        });

        res.status(200).json({
            message: 'AI logs access',
            status: 'ok',
            timestamp: new Date().toISOString(),
            totalLogs: logs.length,
            errorLogs: errorLogs.length,
            logs: logs.slice(-100), // Последние 100 записей
            errors: errorLogs.slice(-50) // Последние 50 ошибок
        });
    } catch (error) {
        console.error('Error getting AI logs:', error);
        res.status(500).json({ 
            message: 'Error getting AI logs', 
            error: error.message 
        });
    }
});

module.exports = router;

const fs = require('fs').promises;
const path = require('path');

// Простая функция для чтения логов без зависимости от centralLogger
async function readLogs() {
    try {
        const logPath = path.join(__dirname, '../../logs/combined.log');
        const data = await fs.readFile(logPath, 'utf8');
        const lines = data.split('\n').filter(line => line.trim());
        
        return lines.map((line, index) => {
            try {
                return JSON.parse(line);
            } catch {
                return {
                    level: 'info',
                    message: line,
                    timestamp: new Date().toISOString(),
                    index: index
                };
            }
        });
    } catch (error) {
        console.error('Error reading logs:', error);
        return [];
    }
}

// Публичный endpoint для AI без авторизации
router.get('/ai-logs', async (req, res) => {
    try {
        const logs = await readLogs();
        
        // Фильтруем логи на наличие ошибок (включая HTTP статус коды)
        const errorLogs = logs.filter(log => {
            const logString = JSON.stringify(log);
            return log.level === 'error' || 
                   log.message?.toLowerCase().includes('error') ||
                   logString.includes('"status": 401') ||
                   logString.includes('"status": 403') ||
                   logString.includes('"status": 404') ||
                   logString.includes('"status": 500') ||
                   logString.includes('"POST.*401') ||
                   logString.includes('"GET.*401') ||
                   logString.includes('Error:') ||
                   logString.includes('Exception:') ||
                   logString.includes('Failed:');
        });

        res.status(200).json({
            message: 'AI logs access',
            status: 'ok',
            timestamp: new Date().toISOString(),
            totalLogs: logs.length,
            errorLogs: errorLogs.length,
            logs: logs.slice(-100), // Последние 100 записей
            errors: errorLogs.slice(-50) // Последние 50 ошибок
        });
    } catch (error) {
        console.error('Error getting AI logs:', error);
        res.status(500).json({ 
            message: 'Error getting AI logs', 
            error: error.message 
        });
    }
});

module.exports = router;







const fs = require('fs').promises;
const path = require('path');

// Простая функция для чтения логов без зависимости от centralLogger
async function readLogs() {
    try {
        const logPath = path.join(__dirname, '../../logs/combined.log');
        const data = await fs.readFile(logPath, 'utf8');
        const lines = data.split('\n').filter(line => line.trim());
        
        return lines.map((line, index) => {
            try {
                return JSON.parse(line);
            } catch {
                return {
                    level: 'info',
                    message: line,
                    timestamp: new Date().toISOString(),
                    index: index
                };
            }
        });
    } catch (error) {
        console.error('Error reading logs:', error);
        return [];
    }
}

// Публичный endpoint для AI без авторизации
router.get('/ai-logs', async (req, res) => {
    try {
        const logs = await readLogs();
        
        // Фильтруем логи на наличие ошибок (включая HTTP статус коды)
        const errorLogs = logs.filter(log => {
            const logString = JSON.stringify(log);
            return log.level === 'error' || 
                   log.message?.toLowerCase().includes('error') ||
                   logString.includes('"status": 401') ||
                   logString.includes('"status": 403') ||
                   logString.includes('"status": 404') ||
                   logString.includes('"status": 500') ||
                   logString.includes('"POST.*401') ||
                   logString.includes('"GET.*401') ||
                   logString.includes('Error:') ||
                   logString.includes('Exception:') ||
                   logString.includes('Failed:');
        });

        res.status(200).json({
            message: 'AI logs access',
            status: 'ok',
            timestamp: new Date().toISOString(),
            totalLogs: logs.length,
            errorLogs: errorLogs.length,
            logs: logs.slice(-100), // Последние 100 записей
            errors: errorLogs.slice(-50) // Последние 50 ошибок
        });
    } catch (error) {
        console.error('Error getting AI logs:', error);
        res.status(500).json({ 
            message: 'Error getting AI logs', 
            error: error.message 
        });
    }
});

module.exports = router;

const fs = require('fs').promises;
const path = require('path');

// Простая функция для чтения логов без зависимости от centralLogger
async function readLogs() {
    try {
        const logPath = path.join(__dirname, '../../logs/combined.log');
        const data = await fs.readFile(logPath, 'utf8');
        const lines = data.split('\n').filter(line => line.trim());
        
        return lines.map((line, index) => {
            try {
                return JSON.parse(line);
            } catch {
                return {
                    level: 'info',
                    message: line,
                    timestamp: new Date().toISOString(),
                    index: index
                };
            }
        });
    } catch (error) {
        console.error('Error reading logs:', error);
        return [];
    }
}

// Публичный endpoint для AI без авторизации
router.get('/ai-logs', async (req, res) => {
    try {
        const logs = await readLogs();
        
        // Фильтруем логи на наличие ошибок (включая HTTP статус коды)
        const errorLogs = logs.filter(log => {
            const logString = JSON.stringify(log);
            return log.level === 'error' || 
                   log.message?.toLowerCase().includes('error') ||
                   logString.includes('"status": 401') ||
                   logString.includes('"status": 403') ||
                   logString.includes('"status": 404') ||
                   logString.includes('"status": 500') ||
                   logString.includes('"POST.*401') ||
                   logString.includes('"GET.*401') ||
                   logString.includes('Error:') ||
                   logString.includes('Exception:') ||
                   logString.includes('Failed:');
        });

        res.status(200).json({
            message: 'AI logs access',
            status: 'ok',
            timestamp: new Date().toISOString(),
            totalLogs: logs.length,
            errorLogs: errorLogs.length,
            logs: logs.slice(-100), // Последние 100 записей
            errors: errorLogs.slice(-50) // Последние 50 ошибок
        });
    } catch (error) {
        console.error('Error getting AI logs:', error);
        res.status(500).json({ 
            message: 'Error getting AI logs', 
            error: error.message 
        });
    }
});

module.exports = router;





const fs = require('fs').promises;
const path = require('path');

// Простая функция для чтения логов без зависимости от centralLogger
async function readLogs() {
    try {
        const logPath = path.join(__dirname, '../../logs/combined.log');
        const data = await fs.readFile(logPath, 'utf8');
        const lines = data.split('\n').filter(line => line.trim());
        
        return lines.map((line, index) => {
            try {
                return JSON.parse(line);
            } catch {
                return {
                    level: 'info',
                    message: line,
                    timestamp: new Date().toISOString(),
                    index: index
                };
            }
        });
    } catch (error) {
        console.error('Error reading logs:', error);
        return [];
    }
}

// Публичный endpoint для AI без авторизации
router.get('/ai-logs', async (req, res) => {
    try {
        const logs = await readLogs();
        
        // Фильтруем логи на наличие ошибок (включая HTTP статус коды)
        const errorLogs = logs.filter(log => {
            const logString = JSON.stringify(log);
            return log.level === 'error' || 
                   log.message?.toLowerCase().includes('error') ||
                   logString.includes('"status": 401') ||
                   logString.includes('"status": 403') ||
                   logString.includes('"status": 404') ||
                   logString.includes('"status": 500') ||
                   logString.includes('"POST.*401') ||
                   logString.includes('"GET.*401') ||
                   logString.includes('Error:') ||
                   logString.includes('Exception:') ||
                   logString.includes('Failed:');
        });

        res.status(200).json({
            message: 'AI logs access',
            status: 'ok',
            timestamp: new Date().toISOString(),
            totalLogs: logs.length,
            errorLogs: errorLogs.length,
            logs: logs.slice(-100), // Последние 100 записей
            errors: errorLogs.slice(-50) // Последние 50 ошибок
        });
    } catch (error) {
        console.error('Error getting AI logs:', error);
        res.status(500).json({ 
            message: 'Error getting AI logs', 
            error: error.message 
        });
    }
});

module.exports = router;

const fs = require('fs').promises;
const path = require('path');

// Простая функция для чтения логов без зависимости от centralLogger
async function readLogs() {
    try {
        const logPath = path.join(__dirname, '../../logs/combined.log');
        const data = await fs.readFile(logPath, 'utf8');
        const lines = data.split('\n').filter(line => line.trim());
        
        return lines.map((line, index) => {
            try {
                return JSON.parse(line);
            } catch {
                return {
                    level: 'info',
                    message: line,
                    timestamp: new Date().toISOString(),
                    index: index
                };
            }
        });
    } catch (error) {
        console.error('Error reading logs:', error);
        return [];
    }
}

// Публичный endpoint для AI без авторизации
router.get('/ai-logs', async (req, res) => {
    try {
        const logs = await readLogs();
        
        // Фильтруем логи на наличие ошибок (включая HTTP статус коды)
        const errorLogs = logs.filter(log => {
            const logString = JSON.stringify(log);
            return log.level === 'error' || 
                   log.message?.toLowerCase().includes('error') ||
                   logString.includes('"status": 401') ||
                   logString.includes('"status": 403') ||
                   logString.includes('"status": 404') ||
                   logString.includes('"status": 500') ||
                   logString.includes('"POST.*401') ||
                   logString.includes('"GET.*401') ||
                   logString.includes('Error:') ||
                   logString.includes('Exception:') ||
                   logString.includes('Failed:');
        });

        res.status(200).json({
            message: 'AI logs access',
            status: 'ok',
            timestamp: new Date().toISOString(),
            totalLogs: logs.length,
            errorLogs: errorLogs.length,
            logs: logs.slice(-100), // Последние 100 записей
            errors: errorLogs.slice(-50) // Последние 50 ошибок
        });
    } catch (error) {
        console.error('Error getting AI logs:', error);
        res.status(500).json({ 
            message: 'Error getting AI logs', 
            error: error.message 
        });
    }
});

module.exports = router;






