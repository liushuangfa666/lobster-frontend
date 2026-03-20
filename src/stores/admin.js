import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminAPI } from '../api'

export const useAdminStore = defineStore('admin', () => {
  const stats = ref({
    user_count: 0,
    lobster_count: 0,
    task_count: 0,
    transaction_amount: 0,
    pending_lobster_count: 0,
    pending_withdraw_count: 0,
  })

  const pendingLobsters = ref([])
  const allLobsters = ref([])
  const pendingWithdraws = ref([])
  const users = ref([])
  const usersTotal = ref(0)

  // 获取统计数据
  async function fetchStats() {
    try {
      const res = await adminAPI.getStats()
      stats.value = res
      return res
    } catch (error) {
      console.error('获取统计数据失败:', error)
      throw error
    }
  }

  // 获取待审核龙虾
  async function fetchPendingLobsters() {
    try {
      pendingLobsters.value = await adminAPI.getPendingLobsters()
      return pendingLobsters.value
    } catch (error) {
      console.error('获取待审核龙虾失败:', error)
      throw error
    }
  }

  // 获取龙虾列表（支持筛选）
  async function fetchLobsters(status) {
    try {
      const res = await adminAPI.getLobsters(status)
      allLobsters.value = res.items || res || []
      return allLobsters.value
    } catch (error) {
      console.error('获取龙虾列表失败:', error)
      throw error
    }
  }

  // 审核通过龙虾
  async function approveLobster(id) {
    await adminAPI.approveLobster(id)
    await fetchPendingLobsters()
  }

  // 审核拒绝龙虾
  async function rejectLobster(id, reason) {
    await adminAPI.rejectLobster(id, reason)
    await fetchPendingLobsters()
  }

  // 获取待审核提现
  async function fetchPendingWithdraws() {
    try {
      pendingWithdraws.value = await adminAPI.getPendingWithdraws()
      return pendingWithdraws.value
    } catch (error) {
      console.error('获取待审核提现失败:', error)
      throw error
    }
  }

  // 审核通过提现
  async function approveWithdraw(id) {
    await adminAPI.approveWithdraw(id)
    await fetchPendingWithdraws()
  }

  // 审核拒绝提现
  async function rejectWithdraw(id) {
    await adminAPI.rejectWithdraw(id)
    await fetchPendingWithdraws()
  }

  // 获取用户列表
  async function fetchUsers(page = 1, pageSize = 20) {
    try {
      const res = await adminAPI.getUsers(page, pageSize)
      if (Array.isArray(res)) {
        users.value = res
        usersTotal.value = res.length
      } else {
        users.value = res.items || res.data || []
        usersTotal.value = res.total || users.value.length
      }
      return users.value
    } catch (error) {
      console.error('获取用户列表失败:', error)
      throw error
    }
  }

  // 启用/禁用用户
  async function toggleUserStatus(id, enabled) {
    await adminAPI.setUserStatus(id, enabled)
    await fetchUsers()
  }

  return {
    stats,
    pendingLobsters,
    allLobsters,
    pendingWithdraws,
    users,
    usersTotal,
    fetchStats,
    fetchPendingLobsters,
    fetchLobsters,
    approveLobster,
    rejectLobster,
    fetchPendingWithdraws,
    approveWithdraw,
    rejectWithdraw,
    fetchUsers,
    toggleUserStatus,
  }
})
