const API_BASE = (typeof window !== 'undefined' && window.API_BASE) || 'http://localhost:5000/api';

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  };
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }
  const res = await fetch(url, config);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

window.api = {
  // Pages
  getPage: (slug) => apiRequest(`/pages/public/${slug}`),
  getPages: () => apiRequest('/pages/public'),
  
  // Services
  getServices: () => apiRequest('/services/public'),
  
  // Team
  getTeam: () => apiRequest('/team/public'),
  
  // Messages (public create)
  sendMessage: (data) => apiRequest('/messages', { method: 'POST', body: data }),
  
  // Settings
  getSettings: () => apiRequest('/settings/public'),
  
  // Auth (admin)
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: credentials }),
};

window.setApiBase = function setApiBase(base) {
  window.API_BASE = base;
}