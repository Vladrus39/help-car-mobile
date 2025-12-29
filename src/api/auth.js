import axios from './axios';

// === Авторизация и регистрация ===
export async function login(credentials) {
  const response = await axios.post('/auth/login', credentials);
  console.log('🔍 Login response:', response.data);
  
  // Backend возвращает { success: true, data: { accessToken, user } }
  const token = response.data?.data?.accessToken;
  const user = response.data?.data?.user;
  
  if (token) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Сохраняем refreshToken если он есть
    const refreshToken = response.data?.data?.refreshToken;
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('✅ Token saved and set in axios');
  } else {
    console.error('❌ No token in response');
    throw new Error('Токен не получен от сервера');
  }
  
  return response.data;
}

export async function register(data) {
  return axios.post('/auth/register', data);
}

export async function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete axios.defaults.headers.common['Authorization'];
}

export async function getProfile() {
  return axios.get('/auth/profile');
}
