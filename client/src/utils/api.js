import axios from 'axios';
import { SITE_URL as DEFAULT_SITE_URL } from '../config/site';
import { getAdminToken, clearAdminSession } from './adminSession';

const envUrl = import.meta.env.VITE_API_URL;
export const SITE_URL = import.meta.env.VITE_SITE_URL?.replace(/\/$/, '') || DEFAULT_SITE_URL;
const SKIN_AI_URL = import.meta.env.VITE_SKIN_AI_URL || 'https://srikamala-skin-ai.onrender.com';
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const normalizeBaseUrl = (rawUrl) => {
  if (!rawUrl || !rawUrl.trim()) return null;
  let clean = rawUrl.trim().replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(clean)) {
    clean = `https://${clean}`;
  }
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

const api = axios.create({
  baseURL: normalizeBaseUrl(envUrl)
    ? normalizeBaseUrl(envUrl)
    : isLocalhost
      ? 'http://localhost:5000/api'
      : 'https://srikamalahospital.onrender.com/api',
});

api.interceptors.request.use((config) => {
  const token = getAdminToken();
  const path = config.url || '';
  if (token && (path.includes('/admin/') || path === '/config' && config.method === 'post')) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const path = error.config?.url || '';
    if (error.response?.status === 401 && path.includes('/admin/')) {
      clearAdminSession();
      if (typeof window !== 'undefined' && window.location.pathname === '/6665') {
        window.dispatchEvent(new Event('sk-admin-logout'));
      }
    }
    return Promise.reject(error);
  }
);

export const bookAppointment = (data) => api.post('/create-appointment', data);
export const getAppointments = (params = {}) => api.get('/admin/appointments', { params });
export const getAppointmentByToken = (token) => api.get(`/appointments/${token}`);
export const getConfig = () => api.get('/config');
export const updateConfig = (data) => api.post('/config', data);
export const adminLogin = (password) => api.post('/admin/login', { password });
export const getAdminDashboardStats = () => api.get('/admin/dashboard-stats');
export const getAdminPharmacyOrders = (params = {}) => api.get('/admin/pharmacy-orders', { params });
export const updatePharmacyOrderStatus = (payload) => api.patch('/admin/pharmacy-orders', payload);
export const submitPharmacyOrder = (order) => api.post('/pharmacy/orders', {
  token: order.token,
  name: order.name,
  phone: order.phone,
  age: order.age,
  gender: order.gender,
  notes: order.notes,
  items: order.items,
  subtotal: order.subtotal,
  rxCount: order.rxCount,
  status: order.status,
  createdAt: order.createdAt,
  appointmentToken: order.appointmentToken || null,
});
export const getReviews = () => api.get('/reviews');
export const submitReview = (data) => api.post('/reviews', data);
export const getAdminReviews = () => api.get('/admin/reviews');
export const updateAdminReview = (payload) => api.patch('/admin/reviews', payload);
export const submitLabReport = (data) => api.post('/lab-reports', data);
export const trackLabReports = (params) => api.get('/lab-reports/track', { params });
export const getAdminLabReports = () => api.get('/admin/lab-reports');
export const updateAdminLabReport = (payload) => api.patch('/admin/lab-reports', payload);
export const getPatientJourney = (phone, name) =>
  api.get('/admin/patient-journey', { params: { phone, name: name || undefined } });
export const matchPharmacyMedicines = (names) => api.post('/pharmacy/match-medicines', { names });
export const updateAppointment = (id, status) => api.post('/admin/update-appointment', { id, paymentStatus: status });
export const fetchLabTests = () => api.get('/lab/tests');
export const fetchPharmacyProducts = (category) =>
  api.get('/pharmacy/products', { params: category && category !== 'All' ? { category } : {} });
export const fetchPharmacyCategories = () => api.get('/pharmacy/categories');
export const fetchMedicinesCatalog = () => api.get('/medicines/catalog');

export const analyzeSymptoms = (symptoms) => api.post('/ai/symptom', { symptoms });
export const analyzeVisionImage = (image, symptoms) => api.post('/ai/vision', { image, symptoms });
export const predictSkinCancer = async (file) => {
  const { compressImageFile } = await import('./imageCompress');
  const optimized = await compressImageFile(file, 512, 0.88);
  const formData = new FormData();
  formData.append('image', optimized);
  return api.post('/ai/skin-predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 15000
  });
};
export const analyzeOCR = (image) => api.post('/ai/ocr', { image });
export const chatWithAI = (query, options = {}) =>
  api.post('/ai/chat', { query, ...options }, { timeout: 45000 });

/** Doctor assistant — uses dedicated mode on backend */
export const doctorConsultAI = (message, doctor) =>
  api.post('/ai/chat', {
    query: message,
    mode: 'doctor',
    doctorName: doctor?.name || 'Dr. D. Kiran',
    specialty: doctor?.specialty || 'General Medicine',
  }, { timeout: 45000 });
export const discoverMedicines = (keyword) => api.post('/ai/medicine-discovery', { keyword });
export const savePatientClinicalNote = (data) => api.post('/admin/patient-clinical-note', data);
export const getPatientClinicalHistory = (patientName, phone) => api.post('/admin/patient-clinical-history', { patientName, phone });

export default api;
