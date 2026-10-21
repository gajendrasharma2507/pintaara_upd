export function getApiBaseUrl() {
  const raw = (process.env.NEXT_PUBLIC_API_URL || '').replace(/[\uFEFF\u200B-\u200D\u00A0]/g, '').trim();
  return raw || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' 
      ? 'https://api.pintaara.com/api' 
      : 'http://127.0.0.1:8000/api');
}

export function getApiHost() {
  return getApiBaseUrl().replace(/\/api\/?$/, '');
}

const API_BASE_URL = getApiBaseUrl();

import { safeStorage } from '@/lib/storage';

export async function apiFetch(endpoint, options = {}) {
  const token = safeStorage.getItem('pintaara_token');

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Handle FormData upload if content-type header should be omitted
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  let data = null;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    let errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
    // If validation errors exist (e.g. Laravel 422 validation failure)
    if (data?.errors && typeof data.errors === 'object') {
      const fieldErrors = Object.values(data.errors).flat().filter(Boolean);
      if (fieldErrors.length > 0) {
        errorMsg = fieldErrors.join(' ');
      }
    }
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    error.errors = data?.errors || null;
    throw error;
  }

  return data;
}

export default {
  // Auth API
  login: (credentials) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => {
    const isFormData = typeof FormData !== 'undefined' && userData instanceof FormData;
    return apiFetch('/auth/register', {
      method: 'POST',
      body: isFormData ? userData : JSON.stringify(userData),
    });
  },
  verifyOtp: (otpData) => apiFetch('/auth/verify-otp', { method: 'POST', body: JSON.stringify(otpData) }),
  resendOtp: (resendData) => apiFetch('/auth/resend-otp', { method: 'POST', body: JSON.stringify(resendData) }),
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
  getProfile: () => apiFetch('/auth/me'),
  updateProfile: (profileData) => apiFetch('/auth/profile', { method: 'PUT', body: JSON.stringify(profileData) }),
  changePassword: (data) => apiFetch('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),
  sendEmailChangeOtp: (data) => apiFetch('/auth/send-email-change-otp', { method: 'POST', body: JSON.stringify(data) }),
  verifyEmailChangeOtp: (data) => apiFetch('/auth/verify-email-change-otp', { method: 'POST', body: JSON.stringify(data) }),
  forgotPassword: (data) => apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify(data) }),
  resetPassword: (data) => apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),

  // User Protected Resources
  getUserOrders: () => apiFetch('/user/orders'),
  getUserCollection: () => apiFetch('/user/collection'),
  getUserAppointments: () => apiFetch('/user/appointments'),
  bookAppointment: (data) => apiFetch('/appointments', { method: 'POST', body: JSON.stringify(data) }),
  getUserDesigns: () => apiFetch('/user/designs'),
  createUserDesign: (formData) => apiFetch('/user/designs', { method: 'POST', body: formData }),

  // Customer Addresses
  getUserAddresses: () => apiFetch('/user/addresses'),
  addUserAddress: (addressData) => apiFetch('/user/addresses', { method: 'POST', body: JSON.stringify(addressData) }),
  createUserAddress: (data) => apiFetch('/user/addresses', { method: 'POST', body: JSON.stringify(data) }),
  updateUserAddress: (id, data) => apiFetch(`/user/addresses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUserAddress: (id) => apiFetch(`/user/addresses/${id}`, { method: 'DELETE' }),

  // 1. Live Gold Rate APIs
  getTodayGoldRate: () => apiFetch('/gold-rate/today'),
  getGoldRateHistory: () => apiFetch('/gold-rate/history'),
  publishGoldRate: (rateData) => apiFetch('/admin/gold-rate', { method: 'POST', body: JSON.stringify(rateData) }),

  // 2. Products API with Dynamic Live Pricing
  getProducts: (params = '') => apiFetch(`/products${params}`),
  getProductBySlug: (slug) => apiFetch(`/products/${slug}`),
  calculatePrice: (calcData) => apiFetch('/price/calculate', { method: 'POST', body: JSON.stringify(calcData) }),
  getMasters: () => apiFetch('/masters'),

  // 3. Categories & Collections API
  getCollections: () => apiFetch('/collections'),
  getCategories: () => apiFetch('/collections'),

  // 4. Design Log CMS API
  getDesignLogs: () => apiFetch('/design-log'),
  getDesignLogByCode: (code) => apiFetch(`/design-log/${code}`),
  createDesignLog: (data) => apiFetch('/admin/design-log', { method: 'POST', body: JSON.stringify(data) }),
  updateDesignLog: (id, data) => apiFetch(`/admin/design-log/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDesignLog: (id) => apiFetch(`/admin/design-log/${id}`, { method: 'DELETE' }),

  // 5. Orders & Checkout API
  createOrder: (orderData) => apiFetch('/checkout', { method: 'POST', body: JSON.stringify(orderData) }),
  getOrderByNumber: (orderNumber) => apiFetch(`/orders/${orderNumber}`),

  // 6. Settings API
  getSettings: () => apiFetch('/settings'),
  updateSettings: (settingsData) => apiFetch('/admin/settings', { method: 'POST', body: JSON.stringify(settingsData) }),

  // 7. Admin Dashboard & Products Management
  getAdminDashboard: () => apiFetch('/admin/dashboard'),
  getAdminProducts: () => apiFetch('/admin/products'),
  createAdminProduct: (productData) => apiFetch('/admin/products', { method: 'POST', body: JSON.stringify(productData) }),
  getAdminProductDetail: (id) => apiFetch(`/admin/products/${id}`),
  updateAdminProduct: (id, productData) => apiFetch(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(productData) }),
  deleteAdminProduct: (id) => apiFetch(`/admin/products/${id}`, { method: 'DELETE' }),
  previewProductPrice: (calcData) => apiFetch('/admin/products/preview-price', { method: 'POST', body: JSON.stringify(calcData) }),

  // Admin Categories
  getAdminCategories: () => apiFetch('/admin/categories'),
  createAdminCategory: (categoryData) => apiFetch('/admin/categories', { method: 'POST', body: JSON.stringify(categoryData) }),
  updateAdminCategory: (id, categoryData) => apiFetch(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(categoryData) }),
  deleteAdminCategory: (id) => apiFetch(`/admin/categories/${id}`, { method: 'DELETE' }),

  // Admin Orders (5-step flow)
  getAdminOrders: (status = '') => apiFetch(`/admin/orders${status ? `?status=${status}` : ''}`),
  updateAdminOrderStatus: (id, status) => apiFetch(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Admin Users
  getAdminUsers: () => apiFetch('/admin/users'),
  updateAdminUserRole: (id, role) => apiFetch(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),

  // 8. Razorpay Payment Gateway APIs
  getRazorpayConfig: () => apiFetch('/payment/razorpay/config'),
  createRazorpayOrder: (orderData) => apiFetch('/payment/razorpay/order', { method: 'POST', body: JSON.stringify(orderData) }),
  verifyRazorpayPayment: (paymentData) => apiFetch('/payment/razorpay/verify', { method: 'POST', body: JSON.stringify(paymentData) }),
};
