import axios from 'axios'
import { ElMessage } from 'element-plus'

const API_BASE = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加 Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // config.silent === true 时静默处理，不弹窗，便于调试
    const silent = error.config?.silent
    if (error.response) {
      const message = error.response.data?.detail || '请求失败'
      if (!silent) ElMessage.error(message)
    } else if (!silent) {
      ElMessage.error('网络错误')
    }
    return Promise.reject(error)
  }
)

// 静默请求封装 - 不弹窗，便于屏蔽用户可见错误
export const silentApi = {
  get: (url, config = {}) => api.get(url, { ...config, silent: true }),
  post: (url, data, config = {}) => api.post(url, data, { ...config, silent: true }),
  put: (url, data, config = {}) => api.put(url, data, { ...config, silent: true }),
  delete: (url, config = {}) => api.delete(url, { ...config, silent: true }),
}

// ============ 认证相关 ============
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  sendRegisterSms: (data) => api.post('/api/auth/send-register-sms', data),
  smsRegister: (data) => api.post('/api/auth/sms-register', data),
  sendChangePhoneSms: (data) => api.post('/api/auth/send-change-phone-sms', data),
  changePhone: (data) => api.post('/api/auth/change-phone', data),
  sendResetPasswordSms: (data) => api.post('/api/auth/send-reset-password-sms', data),
  resetPassword: (data) => api.post('/api/auth/reset-password', data),
  login: (username, password) => {
    const params = new URLSearchParams()
    params.append('username', username)
    params.append('password', password)
    return api.post('/api/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  },
  getMe: () => api.get('/api/auth/me'),
  checkUpgrade: () => api.get('/api/auth/check-upgrade'),
  upgradeToDeveloper: () => api.post('/api/auth/upgrade-to-developer'),
}

// ============ 龙虾相关 ============
export const lobsterAPI = {
  getList: (params) => api.get('/api/lobsters', { params }),
  getDetail: (id) => api.get(`/api/lobsters/${id}`),
  create: (data) => api.post('/api/lobsters', data),
  update: (id, data) => api.put(`/api/lobsters/${id}`, data),
  delete: (id) => api.delete(`/api/lobsters/${id}`),
  getMyList: () => api.get('/api/lobsters/my/list'),
}

// ============ 任务相关 ============
export const taskAPI = {
  getList: (params) => api.get('/api/tasks', { params }),
  getDetail: (id) => api.get(`/api/tasks/${id}`),
  create: (data) => api.post('/api/tasks', data),
  update: (id, data) => api.put(`/api/tasks/${id}`, data),
  assign: (taskId, lobsterId) => api.post(`/api/tasks/${taskId}/assign?lobster_id=${lobsterId}`),
  complete: (taskId) => api.post(`/api/tasks/${taskId}/complete`),
  replace: (taskId, newLobsterId, reason) =>
    api.post(`/api/tasks/${taskId}/replace?new_lobster_id=${newLobsterId}`, { reason }),
  cancel: (taskId) => api.post(`/api/tasks/${taskId}/cancel`),
  // OpenClaw 任务集成
  dispatch: (taskId) => api.post(`/api/tasks/${taskId}/dispatch`),
  getExecution: (taskId) => api.get(`/api/tasks/${taskId}/execution`),
}

// ============ 订单相关 ============
export const orderAPI = {
  getList: (params) => api.get('/api/orders', { params }),
  getDetail: (id) => api.get(`/api/orders/${id}`),
  createComment: (data) => api.post('/api/orders/comments', data),
  withdraw: (data) => api.post('/api/orders/withdraw', data),
  getWithdrawHistory: () => api.get('/api/orders/withdraw/history'),
}

// ============ 管理员相关 ============
export const adminAPI = {
  getStats: () => api.get('/api/admin/stats'),
  getUsers: (page, page_size) => api.get('/api/admin/users', { params: { page, page_size } }),
  getPendingLobsters: () => api.get('/api/admin/lobsters/pending'),
  getLobsters: (status) => api.get('/api/admin/lobsters', { params: { status } }),
  approveLobster: (id, reason) => api.post(`/api/admin/lobsters/${id}/approve`, { reason }),
  rejectLobster: (id, reason) => api.post(`/api/admin/lobsters/${id}/reject`, { reason }),
  getPendingWithdraws: () => api.get('/api/admin/withdraws/pending'),
  approveWithdraw: (id) => api.post(`/api/admin/withdraws/${id}/approve`),
  rejectWithdraw: (id) => api.post(`/api/admin/withdraws/${id}/reject`),
  setUserStatus: (id, enabled) => api.put(`/api/admin/users/${id}/status`, { enabled }),
}

// ============ 文件上传相关 ============
export const uploadAPI = {
  upload: (file, onProgress) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / e.total)),
    })
  },
}

export default api
