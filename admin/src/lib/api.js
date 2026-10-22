const rawEnvApi = (process.env.NEXT_PUBLIC_API_URL || '').replace(/^\uFEFF/, '').trim();
export const API_BASE_URL = rawEnvApi || 'https://api.pintaara.com/api';

export async function adminFetch(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('pintaara_admin_token') : null;

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return await response.text();
  } catch (err) {
    console.warn(`Admin API offline or fetch error on ${endpoint}:`, err.message);
    return null;
  }
}

export default {
  // Authentication & Security
  adminLogin: async (credentials) => {
    const res = await fetch(`${API_BASE_URL}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return await res.json();
  },
  adminLogout: () => adminFetch('/admin/auth/logout', { method: 'POST' }),
  getAdminProfile: () => adminFetch('/admin/auth/me'),

  getDashboardStats: () => adminFetch('/admin/dashboard'),
  getGoldRates: (query = '') => adminFetch(`/gold-rate/today${query}`),
  updateGoldRate: (data) => adminFetch('/gold-rate/settings', { method: 'POST', body: JSON.stringify(data) }),
  getCollections: async () => {
    // 1. Try authenticated admin endpoint
    try {
      const res = await adminFetch('/admin/collections');
      if (res && res.status === 'success' && Array.isArray(res.data) && res.data.length > 0) {
        return res;
      }
    } catch (_) {}

    // 2. Fallback to public collections endpoint (which requires no auth and is always active)
    try {
      const pub = await fetch(`${API_BASE_URL}/collections`, {
        headers: { 'Accept': 'application/json' }
      });
      if (pub.ok) {
        const pubJson = await pub.json();
        if (pubJson && pubJson.status === 'success' && Array.isArray(pubJson.data) && pubJson.data.length > 0) {
          return pubJson;
        }
      }
    } catch (_) {}

    // 3. Fallback to direct production API if base was different
    try {
      const liveRes = await fetch('https://api.pintaara.com/api/collections', {
        headers: { 'Accept': 'application/json' }
      });
      if (liveRes.ok) {
        const liveJson = await liveRes.json();
        if (liveJson && liveJson.status === 'success' && Array.isArray(liveJson.data) && liveJson.data.length > 0) {
          return liveJson;
        }
      }
    } catch (_) {}

    // 4. Fallback to localStorage cache
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('pintaara_collections_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return { status: 'success', data: parsed };
          }
        }
      } catch (_) {}
    }

    // 5. Ultimate fallback to atelier default collections
    return {
      status: 'success',
      data: [
        { id: 27, name: 'pendant', slug: 'pendant' },
        { id: 28, name: 'necklace', slug: 'necklace' },
        { id: 29, name: 'earring', slug: 'earring' },
        { id: 30, name: 'bracelet', slug: 'bracelet' },
        { id: 31, name: 'ring', slug: 'ring' },
        { id: 32, name: 'chain', slug: 'chain' },
      ]
    };
  },
  createCollection: (data) => adminFetch('/admin/collections', { method: 'POST', body: JSON.stringify(data) }),
  updateCollection: (id, data) => adminFetch(`/admin/collections/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCollection: (id) => adminFetch(`/admin/collections/${id}`, { method: 'DELETE' }),
  uploadCollectionImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return adminFetch('/admin/collections/upload-image', {
      method: 'POST',
      body: formData,
    });
  },
  getProducts: async (params) => {
    let query = '';
    if (params && typeof params === 'object') {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '' && v !== 'all') {
          searchParams.append(k, v);
        }
      });
      const qs = searchParams.toString();
      if (qs) query = `?${qs}`;
    } else if (typeof params === 'string' && params) {
      query = params.startsWith('?') ? params : `?${params}`;
    }

    // 1. Try authenticated admin endpoint
    try {
      const res = await adminFetch(`/admin/products${query}`);
      if (res && res.status === 'success' && Array.isArray(res.data) && res.data.length > 0) {
        return {
          ...res,
          data: res.data.map(p => ({
            ...p,
            sku: p.sku || p.design_code || `P-${p.id}`,
            image: p.image || p.primary_image || (Array.isArray(p.images) && p.images[0]) || '',
            status: p.status || 'active',
            collection_master_id: p.collection_master_id || p.collection?.id,
            collection_name: p.collection_name || p.collection?.name || 'Jewelry',
          }))
        };
      }
    } catch (_) {}

    // 2. Fallback to public products endpoint
    try {
      const pub = await fetch(`${API_BASE_URL}/products${query}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (pub.ok) {
        const pubJson = await pub.json();
        if (pubJson && pubJson.status === 'success' && Array.isArray(pubJson.data) && pubJson.data.length > 0) {
          return {
            ...pubJson,
            data: pubJson.data.map(p => ({
              ...p,
              sku: p.sku || p.design_code || `P-${p.id}`,
              image: p.image || p.primary_image || (Array.isArray(p.images) && p.images[0]) || '',
              status: p.status || 'active',
              collection_master_id: p.collection_master_id || p.collection?.id,
              collection_name: p.collection_name || p.collection?.name || 'Jewelry',
              total_price: p.total_price || p.live_price?.total_price,
              price: p.price || (p.live_price?.total_price ? `₹${Math.round(p.live_price.total_price).toLocaleString('en-IN')}` : undefined),
            }))
          };
        }
      }
    } catch (_) {}

    // 3. Fallback directly to production live API
    try {
      const live = await fetch(`https://api.pintaara.com/api/products${query}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (live.ok) {
        const liveJson = await live.json();
        if (liveJson && liveJson.status === 'success' && Array.isArray(liveJson.data) && liveJson.data.length > 0) {
          return {
            ...liveJson,
            data: liveJson.data.map(p => ({
              ...p,
              sku: p.sku || p.design_code || `P-${p.id}`,
              image: p.image || p.primary_image || (Array.isArray(p.images) && p.images[0]) || '',
              status: p.status || 'active',
              collection_master_id: p.collection_master_id || p.collection?.id,
              collection_name: p.collection_name || p.collection?.name || 'Jewelry',
              total_price: p.total_price || p.live_price?.total_price,
              price: p.price || (p.live_price?.total_price ? `₹${Math.round(p.live_price.total_price).toLocaleString('en-IN')}` : undefined),
            }))
          };
        }
      }
    } catch (_) {}

    // 4. Fallback to localStorage cache
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('pintaara_products_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return { status: 'success', data: parsed };
          }
        }
      } catch (_) {}
    }

    return { status: 'success', data: [] };
  },
  getProduct: async (id) => {
    try {
      const res = await adminFetch(`/admin/products/${id}`);
      if (res && res.status === 'success' && res.data) return res;
    } catch (_) {}

    try {
      const pub = await fetch(`${API_BASE_URL}/products/${id}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (pub.ok) {
        const pubJson = await pub.json();
        if (pubJson && pubJson.status === 'success' && pubJson.data) return pubJson;
      }
    } catch (_) {}

    return null;
  },
  createProduct: (data) => adminFetch('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => adminFetch(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => adminFetch(`/admin/products/${id}`, { method: 'DELETE' }),
  previewProductPrice: (data) => adminFetch('/admin/products/preview-price', { method: 'POST', body: JSON.stringify(data) }),
  getOptionMasters: () => adminFetch('/admin/option-masters'),
  getMasters: async () => {
    try {
      const res = await adminFetch('/admin/masters');
      if (res && res.status === 'success' && Array.isArray(res.data) && res.data.length > 0) {
        return res;
      }
    } catch (_) {}

    try {
      const pub = await fetch(`${API_BASE_URL}/masters`, {
        headers: { 'Accept': 'application/json' }
      });
      if (pub.ok) {
        const pubJson = await pub.json();
        if (pubJson && pubJson.status === 'success' && Array.isArray(pubJson.data) && pubJson.data.length > 0) {
          return pubJson;
        }
      }
    } catch (_) {}

    return { status: 'success', data: [] };
  },
  createMaster: (data) => adminFetch('/admin/masters', { method: 'POST', body: JSON.stringify(data) }),
  updateMaster: (id, data) => adminFetch(`/admin/masters/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMaster: (id) => adminFetch(`/admin/masters/${id}`, { method: 'DELETE' }),
  addMasterValue: (masterId, data) => adminFetch(`/admin/masters/${masterId}/values`, { method: 'POST', body: JSON.stringify(data) }),
  updateMasterValue: (valueId, data) => adminFetch(`/admin/masters/values/${valueId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMasterValue: (valueId) => adminFetch(`/admin/masters/values/${valueId}`, { method: 'DELETE' }),
  saveMasters: (masters) => adminFetch('/admin/masters', { method: 'POST', body: JSON.stringify({ masters }) }),
  resetMasters: () => adminFetch('/admin/masters/reset', { method: 'POST' }),
  getGoldRates: async () => {
    try {
      const res = await adminFetch('/admin/gold-rates');
      if (res && res.status === 'success' && res.data) return res;
    } catch (_) {}

    try {
      const pub = await fetch(`${API_BASE_URL}/gold-rate/today`, {
        headers: { 'Accept': 'application/json' }
      });
      if (pub.ok) {
        const pubJson = await pub.json();
        if (pubJson) return pubJson;
      }
    } catch (_) {}

    return null;
  },
  updateGoldRate: async (rateData) => {
    try {
      const res = await adminFetch('/gold-rate/settings', { method: 'POST', body: JSON.stringify(rateData) });
      if (res && res.status === 'success') return res;
    } catch (_) {}
    return await adminFetch('/admin/gold-rates', { method: 'POST', body: JSON.stringify(rateData) });
  },
  getOrders: () => adminFetch('/admin/orders'),
  getOrder: (id) => adminFetch(`/admin/orders/${id}`),
  updateOrderStatus: (id, status) => adminFetch(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  updateOrderFulfillment: (id, fulfillment_status) => adminFetch(`/admin/orders/${id}/fulfillment`, { method: 'PUT', body: JSON.stringify({ fulfillment_status }) }),
  addOrderComment: (id, comment) => adminFetch(`/admin/orders/${id}/comments`, { method: 'POST', body: JSON.stringify({ comment }) }),
  updateOrderNotes: (id, notes) => adminFetch(`/admin/orders/${id}/notes`, { method: 'PUT', body: JSON.stringify({ notes }) }),
  updateOrderShippingAddress: (id, data) => adminFetch(`/admin/orders/${id}/shipping-address`, { method: 'PUT', body: JSON.stringify(data) }),
  updateOrderItemCertificate: (orderId, itemId, data) => adminFetch(`/admin/orders/${orderId}/items/${itemId}/certificate`, { method: 'PUT', body: JSON.stringify(data) }),
  uploadCertificate: async (file) => {
    const formData = new FormData();
    formData.append('certificate', file);
    return adminFetch('/admin/upload-certificate', {
      method: 'POST',
      body: formData,
    });
  },
  uploadMasterImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return adminFetch('/admin/masters/upload-image', {
      method: 'POST',
      body: formData,
    });
  },
  uploadProductMedia: async (fileOrFormData) => {
    let body;
    if (fileOrFormData instanceof FormData) {
      body = fileOrFormData;
    } else {
      body = new FormData();
      body.append('media', fileOrFormData);
    }
    return adminFetch('/admin/products/upload-media', {
      method: 'POST',
      body,
    });
  },
  uploadMedia: async (fileOrFormData) => {
    let body;
    if (fileOrFormData instanceof FormData) {
      body = fileOrFormData;
    } else {
      body = new FormData();
      body.append('media', fileOrFormData);
    }
    return adminFetch('/admin/products/upload-media', {
      method: 'POST',
      body,
    });
  },
  // Sequel 247 Logistics
  getLogisticsConfig: () => adminFetch('/admin/logistics/config'),
  checkServiceability: (pincode) => adminFetch('/logistics/check-serviceability', { method: 'POST', body: JSON.stringify({ pincode }) }),
  calculateEDD: (data) => adminFetch('/logistics/calculate-edd', { method: 'POST', body: JSON.stringify(data) }),
  createSequelDocket: (orderId, data = {}) => adminFetch(`/admin/orders/${orderId}/sequel-docket`, { method: 'POST', body: JSON.stringify(data) }),
  trackSequelDocket: (orderId) => adminFetch(`/admin/orders/${orderId}/sequel-track`),
  cancelSequelDocket: (orderId, reason) => adminFetch(`/admin/orders/${orderId}/sequel-cancel`, { method: 'POST', body: JSON.stringify({ reason }) }),
  // Patrons & Customers
  getCustomers: (search = '') => adminFetch(`/admin/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  updateCustomerStatus: (id, action, notes = '') => adminFetch(`/admin/customers/${id}/status`, { method: 'PUT', body: JSON.stringify({ action, notes }) }),
  deleteCustomer: (id) => adminFetch(`/admin/customers/${id}`, { method: 'DELETE' }),
  // Appointments & Consultations
  getAppointments: () => adminFetch('/admin/appointments'),
  updateAppointmentStatus: (id, status) => adminFetch(`/admin/appointments/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  // Atelier & External API Configurations (Production & Testing)
  getSettings: () => adminFetch('/admin/settings'),
  updateSettings: (data) => adminFetch('/admin/settings', { method: 'POST', body: JSON.stringify(data) }),
  testConnection: (data) => adminFetch('/admin/settings/test-connection', { method: 'POST', body: JSON.stringify(data) }),

  // Jewelry Dynamic Configuration & Variants Engine
  getFinishes: () => adminFetch('/admin/config/finishes'),
  getPurities: () => adminFetch('/admin/config/purities'),
  getFinishPuritiesMatrix: () => adminFetch('/admin/config/finish-purities'),
  getSizes: () => adminFetch('/admin/config/sizes'),
  getStones: () => adminFetch('/admin/config/stones'),
  getProductFinishPurities: (id) => adminFetch(`/admin/products/${id}/finish-purities`),
  syncProductFinishPurities: (id, configurations) => adminFetch(`/admin/products/${id}/finish-purities/sync`, { method: 'POST', body: JSON.stringify({ configurations }) }),
  getProductVariants: (id) => adminFetch(`/admin/products/${id}/variants`),
  createProductVariant: (id, data) => adminFetch(`/admin/products/${id}/variants`, { method: 'POST', body: JSON.stringify(data) }),
  updateProductVariant: (id, variantId, data) => adminFetch(`/admin/products/${id}/variants/${variantId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProductVariant: (id, variantId) => adminFetch(`/admin/products/${id}/variants/${variantId}`, { method: 'DELETE' }),
};

