import axios from 'axios';

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
export const API_BASE = `${BACKEND_URL}/api/surat`;

const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    }
});

/**
 * Fetch Sanctum CSRF Cookie sebelum POST/PUT/DELETE request
 */
export async function initCsrf() {
    try {
        await axios.get(`${BACKEND_URL}/sanctum/csrf-cookie`, {
            withCredentials: true,
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            }
        });
    } catch (e) {
        console.error('Gagal mengambil CSRF cookie:', e);
    }
}

// === AUTH & ACCOUNT API ===
export async function registerUser(formData) {
    await initCsrf();
    const response = await api.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
}

export async function loginUser(email, password, remember = false) {
    await initCsrf();
    const response = await api.post('/auth/login', { email, password, remember });
    return response.data;
}

export async function logoutUser() {
    await initCsrf();
    const response = await api.post('/auth/logout');
    return response.data;
}

export async function getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
}

// === WARGA API ===
export async function getTemplates() {
    const response = await api.get('/templates');
    return response.data;
}

export async function getTemplateById(id) {
    const response = await api.get(`/templates/${id}`);
    return response.data;
}

export async function submitLetterRequest(templateId, formData) {
    await initCsrf();
    const response = await api.post('/permohonan', {
        template_id: templateId,
        form_data: formData
    });
    return response.data;
}

export async function getMyRequests() {
    const response = await api.get('/permohonan/my');
    return response.data;
}

// === ADMIN API ===
export async function getPendingUsers() {
    const response = await api.get('/admin/users/pending');
    return response.data;
}

export async function getAllUsers() {
    const response = await api.get('/admin/users/all');
    return response.data;
}

export async function approveUser(userId) {
    await initCsrf();
    const response = await api.post(`/admin/users/${userId}/approve`);
    return response.data;
}

export function getKtpUrl(userId) {
    return `${API_BASE}/admin/users/${userId}/ktp`;
}

export async function getAdminLetterRequests(status = 'all') {
    const response = await api.get(`/admin/surat?status=${status}`);
    return response.data;
}

export async function approveLetterRequest(requestId) {
    await initCsrf();
    const response = await api.post(`/admin/surat/${requestId}/approve`);
    return response.data;
}

export async function rejectLetterRequest(requestId, reason) {
    await initCsrf();
    const response = await api.post(`/admin/surat/${requestId}/reject`, {
        rejection_reason: reason
    });
    return response.data;
}

export function getPdfDownloadUrl(requestId) {
    return `${API_BASE}/pdf/download/${requestId}`;
}

export default api;
