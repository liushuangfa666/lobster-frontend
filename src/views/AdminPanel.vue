<template>
  <div class="container mx-auto px-4 py-8">
    <!-- 顶部标题 -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold">🦞 管理后台</h1>
      <router-link to="/" class="text-[#ff6b35] hover:underline">
        ← 返回首页
      </router-link>
    </div>

    <!-- 侧边栏 + 内容区 -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- 左侧菜单 -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-xl shadow-md p-4 sticky top-20">
          <nav class="space-y-2">
            <router-link
              to="/admin/dashboard"
              class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
              :class="isActive('/admin/dashboard') ? 'bg-[#ff6b35] text-white' : 'hover:bg-gray-100'"
            >
              <span>📊</span> 首页概览
            </router-link>
            <router-link
              to="/admin/lobsters"
              class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
              :class="isActive('/admin/lobsters') ? 'bg-[#ff6b35] text-white' : 'hover:bg-gray-100'"
            >
              <span>🦞</span> 龙虾审核
              <span v-if="adminStore.pendingLobsters.length > 0" class="ml-auto bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">
                {{ adminStore.pendingLobsters.length }}
              </span>
            </router-link>
            <router-link
              to="/admin/withdraws"
              class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
              :class="isActive('/admin/withdraws') ? 'bg-[#ff6b35] text-white' : 'hover:bg-gray-100'"
            >
              <span>💸</span> 提现审核
              <span v-if="adminStore.pendingWithdraws.length > 0" class="ml-auto bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">
                {{ adminStore.pendingWithdraws.length }}
              </span>
            </router-link>
            <router-link
              to="/admin/users"
              class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
              :class="isActive('/admin/users') ? 'bg-[#ff6b35] text-white' : 'hover:bg-gray-100'"
            >
              <span>👥</span> 用户管理
            </router-link>
          </nav>
        </div>
      </div>

      <!-- 右侧内容 -->
      <div class="lg:col-span-3">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAdminStore } from '../stores/admin'

const route = useRoute()
const adminStore = useAdminStore()

const isActive = (path) => route.path === path

onMounted(async () => {
  try {
    await adminStore.fetchPendingLobsters()
    await adminStore.fetchPendingWithdraws()
  } catch (error) {
    console.error('加载待审核数据失败:', error)
  }
})
</script>

