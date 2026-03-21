import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '../api'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(null)

  const isLoggedIn = computed(() => !!token.value)
  const isDeveloper = computed(() => userInfo.value?.user_type >= 1)
  const isAdmin = computed(() => userInfo.value?.user_type === 2)

  async function login(username, password) {
    const res = await authAPI.login(username, password)
    token.value = res.access_token
    localStorage.setItem('token', res.access_token)
    await fetchUserInfo()
    return res
  }

  async function fetchUserInfo() {
    if (!token.value) return null
    try {
      userInfo.value = await authAPI.getMe()
      return userInfo.value
    } catch (error) {
      logout()
      throw error
    }
  }

  async function upgradeToDeveloper() {
    await authAPI.upgradeToDeveloper()
    await fetchUserInfo()
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  // 初始化时获取用户信息
  if (token.value) {
    fetchUserInfo()
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    isDeveloper,
    isAdmin,
    login,
    fetchUserInfo,
    upgradeToDeveloper,
    logout,
  }
})
