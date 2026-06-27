const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
const TOKEN_STORAGE_KEY = 'jwt_token';

const buildUrl = (path) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

export const getStoredToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);
export const setStoredToken = (token) => localStorage.setItem(TOKEN_STORAGE_KEY, token);
export const clearStoredToken = () => localStorage.removeItem(TOKEN_STORAGE_KEY);

const getAuthHeaders = () => {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const parseResponse = async (response) => {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.detail || data?.message || 'Request failed';
    throw new Error(message);
  }

  return data;
};

export const apiClient = {
  async request(path, { method = 'GET', body, headers = {}, params = {}, ...rest } = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${buildUrl(path)}?${query}` : buildUrl(path);

    const isFormData = body instanceof FormData;
    const isUrlEncoded = body instanceof URLSearchParams;

    const requestHeaders = {
      ...getAuthHeaders(),
      ...headers,
    };

    if (!isFormData && body !== undefined && !requestHeaders['Content-Type'] && !requestHeaders['content-type']) {
      if (isUrlEncoded) {
        requestHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
      } else {
        requestHeaders['Content-Type'] = 'application/json';
      }
    }

    const payload = body === undefined
      ? undefined
      : isFormData || isUrlEncoded || typeof body === 'string'
        ? body
        : JSON.stringify(body);

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: payload,
      ...rest,
    });

    return parseResponse(response);
  },

  get(path, options = {}) {
    return this.request(path, { ...options, method: 'GET' });
  },

  post(path, body, options = {}) {
    return this.request(path, { ...options, method: 'POST', body });
  },

  put(path, body, options = {}) {
    return this.request(path, { ...options, method: 'PUT', body });
  },

  delete(path, options = {}) {
    return this.request(path, { ...options, method: 'DELETE' });
  },
};

export const authApi = {
  login: async (username, password) => {
    const response = await apiClient.post('/api/v1/auth/login', new URLSearchParams({ username, password }));
    if (response?.access_token) {
      setStoredToken(response.access_token);
      window.dispatchEvent(new Event('auth:changed'));
    }
    return response;
  },
  register: async (payload) => apiClient.post('/api/v1/auth/register', payload),
  me: async () => apiClient.get('/api/v1/auth/me'),
  logout: () => {
    clearStoredToken();
    window.dispatchEvent(new Event('auth:changed'));
  },
};

export const patientsApi = {
  list: async (params = {}) => apiClient.get('/api/v1/patients/', { params }),
  create: async (payload) => apiClient.post('/api/v1/patients/', payload),
  update: async (id, payload) => apiClient.put(`/api/v1/patients/${id}`, payload),
  remove: async (id) => apiClient.delete(`/api/v1/patients/${id}`),
};

export const consultationsApi = {
  list: async (params = {}) => apiClient.get('/api/v1/consultations/', { params }),
  create: async (payload) => apiClient.post('/api/v1/consultations/', payload),
  update: async (id, payload) => apiClient.put(`/api/v1/consultations/${id}`, payload),
  remove: async (id) => apiClient.delete(`/api/v1/consultations/${id}`),
};

export const prescriptionsApi = {
  listByConsultation: async (consultationId) => apiClient.get(`/api/v1/prescriptions/consultation/${consultationId}`),
  create: async (payload) => apiClient.post('/api/v1/prescriptions/', payload),
  update: async (id, payload) => apiClient.put(`/api/v1/prescriptions/${id}`, payload),
  remove: async (id) => apiClient.delete(`/api/v1/prescriptions/${id}`),
};

export const vaccinationsApi = {
  listByPatient: async (patientId) => apiClient.get(`/api/v1/vaccinations/patient/${patientId}`),
  create: async (payload) => apiClient.post('/api/v1/vaccinations/', payload),
  update: async (id, payload) => apiClient.put(`/api/v1/vaccinations/${id}`, payload),
  remove: async (id) => apiClient.delete(`/api/v1/vaccinations/${id}`),
};

export const syncApi = {
  trigger: async () => apiClient.post('/api/v1/sync/trigger'),
  status: async () => apiClient.get('/api/v1/sync/status'),
  retryFailed: async () => apiClient.post('/api/v1/sync/retry-failed'),
  queue: async (params = {}) => apiClient.get('/api/v1/sync/queue', { params }),
};
