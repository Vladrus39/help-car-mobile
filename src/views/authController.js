const jwt = require('jsonwebtoken');
const { models, sequelize } = require('../database');
const { User, HelpRequest, Rating } = models;
const { AppError } = require('../middleware/errorHandler');

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'default-secret-key-change-in-production';
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h'; // По умолчанию 24 часа
  console.log('🔍 JWT Config:', { secret: secret ? 'set' : 'missing', expiresIn });
  return jwt.sign({ id: userId }, secret, {
    expiresIn: expiresIn,
  });
};

// Функция для генерации refresh token
const generateRefreshToken = (userId) => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'default-secret-key-change-in-production';
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d'; // По умолчанию 7 дней
  return jwt.sign({ id: userId }, secret, {
    expiresIn: expiresIn,
  });
};

exports.register = async (req, res, next) => {
  try {
    const { email, phone, password, full_name } = req.body;

    // Проверка существования пользователя
    const existingUser = await User.findOne({
      where: {
        [sequelize.Sequelize.Op.or]: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new AppError('Пользователь с таким email уже существует', 400);
      } else {
        throw new AppError('Пользователь с таким номером телефона уже существует', 400);
      }
    }

    // Создание пользователя
    // Используем виртуальное поле 'password' для автоматического хеширования
    const user = await User.create({
      email,
      phone,
      password: password, // Виртуальное поле автоматически хеширует пароль
      full_name,
    });

    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          rating: user.rating,
          avatar_url: user.avatar_url,
        },
        accessToken: token,
        refreshToken: refreshToken,
        token: token, // для обратной совместимости
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    console.log('🔍 LOGIN FUNCTION CALLED');
    console.log('🔍 Request body:', JSON.stringify(req.body));
    console.log('🔍 Request body type:', typeof req.body);
    console.log('🔍 Request body keys:', Object.keys(req.body || {}));
    console.log('🔍 Request headers:', JSON.stringify(req.headers));
    console.log('🔍 Content-Type:', req.headers['content-type']);
    
    const { email, phone, password } = req.body || {};
    
    // Если body пустой, возвращаем ошибку
    if (!req.body || Object.keys(req.body).length === 0) {
      console.error('❌ Request body is empty!');
      console.error('❌ This might be a parsing issue with express.urlencoded');
      throw new AppError('Данные не получены. Проверьте формат запроса.', 400);
    }
    
    // Проверяем, что User модель доступна
    if (!User) {
      console.error('❌ User model is not available');
      throw new AppError('Ошибка конфигурации сервера', 500);
    }
    console.log('✅ User model is available');
    
    console.log('🔍 Login attempt:', { 
      hasEmail: !!email, 
      hasPhone: !!phone, 
      hasPassword: !!password,
      email: email?.substring(0, 10) + '...',
      phone: phone?.substring(0, 5) + '...'
    });

    if (!password) {
      throw new AppError('Пожалуйста, введите пароль', 400);
    }

    if (!email && !phone) {
      throw new AppError('Пожалуйста, введите email или номер телефона', 400);
    }

    // Ищем пользователя по email или телефону
    const whereClause = email 
      ? { email } 
      : { phone };
    
    const user = await User.findOne({ where: whereClause });
    
    console.log('🔍 User found:', user ? `ID: ${user.id}` : 'NOT FOUND');

    if (!user) {
      throw new AppError(email ? 'Пользователь с таким email не найден' : 'Пользователь с таким номером телефона не найден', 401);
    }
    
    const isPasswordValid = await user.validatePassword(password);
    console.log('🔍 Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      throw new AppError('Неверный пароль', 401);
    }

    if (!user.is_active) {
      throw new AppError('Аккаунт пользователя деактивирован', 403);
    }

    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          rating: user.rating,
          avatar_url: user.avatar_url,
        },
        accessToken: token,
        refreshToken: refreshToken,
        token: token, // для обратной совместимости
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token обязателен'
      });
    }

    // Проверяем refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    
    // Ищем пользователя
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    // Генерируем новые токены
    const newAccessToken = generateToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Неверный refresh token'
    });
  }
};

exports.logout = async (req, res, next) => {
  try {
    // В реальной реализации здесь можно было бы добавить refresh token в черный список
    res.json({
      success: true,
      message: 'Вы успешно вышли из системы'
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: HelpRequest,
          as: 'helpRequests',
          limit: 10,
          order: [['created_at', 'DESC']],
        },
        {
          model: Rating,
          as: 'receivedRatings',
          limit: 5,
          order: [['created_at', 'DESC']],
        },
      ],
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { full_name, phone, avatar_url, fcm_token } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    const updates = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (phone !== undefined) {
      // Проверяем, не занят ли телефон другим пользователем
      const { Op } = require('sequelize');
      const existingUser = await User.findOne({
        where: {
          phone: phone,
          id: { [Op.ne]: req.user.id }
        }
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Этот номер телефона уже используется другим пользователем'
        });
      }
      updates.phone = phone;
    }
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (fcm_token !== undefined) updates.fcm_token = fcm_token;

    await user.update(updates);

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        rating: user.rating,
        avatar_url: user.avatar_url,
        is_active: user.is_active,
        is_verified: user.is_verified
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateLocation = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;

    const user = await User.findByPk(req.user.id);

    await user.update({
      last_location_lat: latitude,
      last_location_lon: longitude,
      last_location_updated: new Date(),
    });

    res.json({
      success: true,
      data: {
        latitude,
        longitude,
        updated_at: user.last_location_updated,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Текущий и новый пароль обязательны'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Новый пароль должен быть минимум 6 символов'
      });
    }

    const user = await User.findByPk(req.user.id);

    // Проверяем текущий пароль
    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Неверный текущий пароль'
      });
    }

    // Обновляем пароль
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await user.update({
      password_hash: hashedPassword
    });

    res.json({
      success: true,
      message: 'Пароль успешно изменен'
    });
  } catch (error) {
    next(error);
  }
};