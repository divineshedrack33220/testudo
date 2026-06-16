const API_BASE = 'http://localhost:5000/api';

function getToken() {
  return sessionStorage.getItem('testudo_admin_session');
}

async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  // Add cache-busting for GET requests
  var reqUrl = `${API_BASE}${endpoint}`;
  if (!options.method || options.method === 'GET') {
    reqUrl += (endpoint.includes('?') ? '&' : '?') + '_t=' + Date.now();
  }
  const isFormData = options.body instanceof FormData;
  const config = {
    headers: { 
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      'Authorization': `Bearer ${token}`,
      ...options.headers 
    },
    ...options
  };
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }
  const res = await fetch(reqUrl, config);
  if (res.status === 401) {
    sessionStorage.removeItem('testudo_admin_session');
    window.location.href = 'index.html';
    return;
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

window.adminApi = {
  // Auth
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: credentials }),
  
  // Dashboard stats
  getStats: () => apiRequest('/dashboard/stats'),
  
  // Pages
  getPages: (params = {}) => apiRequest('/pages?' + new URLSearchParams(params)),
  getPage: (id) => apiRequest('/pages/' + id),
  createPage: (data) => apiRequest('/pages', { method: 'POST', body: data }),
  updatePage: (id, data) => apiRequest('/pages/' + id, { method: 'PUT', body: data }),
  deletePage: (id) => apiRequest('/pages/' + id, { method: 'DELETE' }),
  reorderPages: (pages) => apiRequest('/pages/reorder', { method: 'PUT', body: { pages } }),
  
  // Services
  getServices: (params = {}) => apiRequest('/services?' + new URLSearchParams(params)),
  getService: (id) => apiRequest('/services/' + id),
  createService: (data) => apiRequest('/services', { method: 'POST', body: data }),
  updateService: (id, data) => apiRequest('/services/' + id, { method: 'PUT', body: data }),
  deleteService: (id) => apiRequest('/services/' + id, { method: 'DELETE' }),
  reorderServices: (services) => apiRequest('/services/reorder', { method: 'PUT', body: { services } }),
  
  // Team
  getTeam: (params = {}) => apiRequest('/team?' + new URLSearchParams(params)),
  getMember: (id) => apiRequest('/team/' + id),
  createMember: (data) => apiRequest('/team', { method: 'POST', body: data }),
  updateMember: (id, data) => apiRequest('/team/' + id, { method: 'PUT', body: data }),
  deleteMember: (id) => apiRequest('/team/' + id, { method: 'DELETE' }),
  reorderTeam: (members) => apiRequest('/team/reorder', { method: 'PUT', body: { members } }),
  
  // Messages
  getMessages: (params = {}) => apiRequest('/messages?' + new URLSearchParams(params)),
  getMessage: (id) => apiRequest('/messages/' + id),
  updateMessage: (id, data) => apiRequest('/messages/' + id, { method: 'PUT', body: data }),
  deleteMessage: (id) => apiRequest('/messages/' + id, { method: 'DELETE' }),
  bulkUpdateMessages: (ids, status) => apiRequest('/messages/bulk', { method: 'PUT', body: { ids, status } }),
  
  // Settings
  getSettings: () => apiRequest('/settings'),
  updateSettings: (data) => apiRequest('/settings', { method: 'PUT', body: data }),
  
  // Testimonials
  getTestimonials: (params = {}) => apiRequest('/testimonials?' + new URLSearchParams(params)),
  getTestimonial: (id) => apiRequest('/testimonials/' + id),
  createTestimonial: (data) => apiRequest('/testimonials', { method: 'POST', body: data }),
  updateTestimonial: (id, data) => apiRequest('/testimonials/' + id, { method: 'PUT', body: data }),
  deleteTestimonial: (id) => apiRequest('/testimonials/' + id, { method: 'DELETE' }),
  bulkUpdateTestimonials: (data) => apiRequest('/testimonials/bulk', { method: 'PUT', body: data }),

  // Partners
  getPartners: (params = {}) => apiRequest('/partners?' + new URLSearchParams(params)),
  getPartner: (id) => apiRequest('/partners/' + id),
  createPartner: (data) => apiRequest('/partners', { method: 'POST', body: data }),
  updatePartner: (id, data) => apiRequest('/partners/' + id, { method: 'PUT', body: data }),
  deletePartner: (id) => apiRequest('/partners/' + id, { method: 'DELETE' }),
  bulkUpdatePartners: (data) => apiRequest('/partners/bulk', { method: 'PUT', body: data }),

  // FAQs
  getFAQs: (params = {}) => apiRequest('/faqs?' + new URLSearchParams(params)),
  getFAQ: (id) => apiRequest('/faqs/' + id),
  createFAQ: (data) => apiRequest('/faqs', { method: 'POST', body: data }),
  updateFAQ: (id, data) => apiRequest('/faqs/' + id, { method: 'PUT', body: data }),
  deleteFAQ: (id) => apiRequest('/faqs/' + id, { method: 'DELETE' }),
  bulkUpdateFAQs: (data) => apiRequest('/faqs/bulk', { method: 'PUT', body: data }),

  // Upload
  uploadImage: (file, folder) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);
    return apiRequest('/upload', { 
      method: 'POST', 
      body: formData,
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
  },
  listImages: (folder) => apiRequest('/upload?folder=' + (folder || 'testudo')),
  deleteImage: (publicId) => apiRequest('/upload', { method: 'DELETE', body: { publicId } })
};