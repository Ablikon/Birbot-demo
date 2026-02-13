import axios from 'axios';

const API_URL = 'http://localhost:8081/api';
const TOKEN_KEY = 'birbot_token';

const api = axios.create({
  baseURL: API_URL,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('birbot_auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ---- Auth ----
export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  getProfile: () =>
    api.get('/profile'),
};

// ---- Stores ----
export const storeAPI = {
  getAll: () =>
    api.get('/store'),

  getById: (storeId) =>
    api.get(`/store/${storeId}`),

  createTest: () =>
    api.post('/store/test'),

  delete: (storeId) =>
    api.delete(`/store/${storeId}`),

  startStop: (storeId) =>
    api.post(`/store/${storeId}/start-stop`),

  getGeneralStats: (storeId, { filter = 'month', startDate, endDate } = {}) => {
    const params = new URLSearchParams({ filter });
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    return api.get(`/store/${storeId}/stats/general?${params.toString()}`);
  },

  getChartStats: (storeId, { filter = 'month', startDate, endDate } = {}) => {
    const params = new URLSearchParams({ filter });
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    return api.get(`/store/${storeId}/stats/chart?${params.toString()}`);
  },
};

// ---- Products ----
export const productAPI = {
  // GET /product/:storeId → returns counts/stats by status
  getStats: (storeId) =>
    api.get(`/product/${storeId}`),

  // POST /product/:storeId → returns paginated product list
  getList: (storeId, { filter = 'all', page = 1, limit = 20, q = '', sortBy = '' } = {}) => {
    const params = new URLSearchParams({ filter, page, limit });
    if (q) params.set('q', q);
    if (sortBy) params.set('sortBy', sortBy);
    return api.post(`/product/${storeId}?${params.toString()}`);
  },

  getById: (productId) =>
    api.get(`/product/product-by-id/${productId}`),

  update: (productId, data) =>
    api.patch(`/product/${productId}`, data),
};

// ---- Orders ----
export const orderAPI = {
  getStats: (storeId, { filter = 'month', startDate, endDate } = {}) => {
    const params = new URLSearchParams({ filter });
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    return api.get(`/order/${storeId}/order-stats?${params.toString()}`);
  },

  getOrdersCount: (storeId) =>
    api.get(`/order/${storeId}/orders-count`),
};

export { TOKEN_KEY };
export default api;
