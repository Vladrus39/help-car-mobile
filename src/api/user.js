import axios from './axios';

// Пример защищённого запроса
export async function getUserRequests() {
  return axios.get('/helpRequests/my');
}

export async function createHelpRequest(payload) {
  return axios.post('/helpRequests', payload);
}

export async function getHelpRequests() {
  return axios.get('/helpRequests');
}
