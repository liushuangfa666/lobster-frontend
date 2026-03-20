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
    if (error.response) {
      const message = error.response.data?.detail || '请求失败'
      ElMessage.error(message)
    } else {
      ElMessage.error('网络错误')
    }
    return Promise.reject(error)
  }
)

// ============ 认证相关 ============
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (username, password) => {
    const params = new URLSearchParams()
    params.append('username', username)
    params.append('password', password)
    return api.post('/api/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  },
  getMe: () => api.get('/api/auth/me'),
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
}

// ============ 订单相关 ============
export const orderAPI = {
  getList: (params) => api.get('/api/orders', { params }),
  getDetail: (id) => api.get(`/api/orders/${id}`),
  createComment: (data) => api.post('/api/orders/comments', data),
  withdraw: (data) => api.post('/api/orders/withdraw', data),
  getWithdrawHistory: () => api.get('/api/orders/withdraw/history'),
}

export default api
