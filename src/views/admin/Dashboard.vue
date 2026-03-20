<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">🦞 管理后台</h1>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-xl shadow-md p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">用户总数</p>
            <p class="text-3xl font-bold text-[#ff6b35]">{{ stats.user_count || 0 }}</p>
          </div>
          <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <span class="text-2xl">👥</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-md p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">龙虾总数</p>
            <p class="text-3xl font-bold text-blue-500">{{ stats.lobster_count || 0 }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span class="text-2xl">🦞</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-md p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">任务总数</p>
            <p class="text-3xl font-bold text-green-500">{{ stats.task_count || 0 }}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <span class="text-2xl">📋</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-md p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">交易总额</p>
            <p class="text-3xl font-bold text-purple-500">¥{{ stats.transaction_amount || 0 }}</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <span class="text-2xl">💰</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 待处理事项 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl shadow-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold">待审核龙虾</h2>
          <router-link to="/admin/lobsters" class="text-[#ff6b35] hover:underline text-sm">
            查看全部 →
          </router-link>
        </div>
        <div v-if="pendingLobsters.length === 0" class="text-center py-8 text-gray-500">
          暂无待审核龙虾
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="lobster in pendingLobsters.slice(0, 5)"
            :key="lobster.id"
            class="flex items-center justify-between border-b pb-3 last:border-0"
          >
            <div>
              <p class="font-medium">{{ lobster.name }}</p>
              <p class="text-gray-500 text-xs">{{ lobster.developer_name }}</p>
            </div>
            <router-link
              to="/admin/lobsters"
              class="text-[#ff6b35] hover:underline text-sm"
            >
              去审核
            </router-link>
          </div>
        </div>
        <div v-if="pendingLobsters.length > 0" class="mt-4 text-center">
          <span class="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">
            {{ pendingLobsters.length }} 条待审核
          </span>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold">待审核提现</h2>
          <router-link to="/admin/withdraws" class="text-[#ff6b35] hover:underline text-sm">
            查看全部 →
          </router-link>
        </div>
        <div v-if="pendingWithdraws.length === 0" class="text-center py-8 text-gray-500">
          暂无待审核提现
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="w in pendingWithdraws.slice(0, 5)"
            :key="w.id"
            class="flex items-center justify-between border-b pb-3 last:border-0"
          >
            <div>
              <p class="font-medium">¥{{ w.amount }}</p>
              <p class="text-gray-500 text-xs">{{ w.developer_name }}</p>
            </div>
            <router-link
              to="/admin/withdraws"
              class="text-[#ff6b35] hover:underline text-sm"
            >
              去审核
            </router-link>
          </div>
        </div>
        <div v-if="pendingWithdraws.length > 0" class="mt-4 text-center">
          <span class="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">
            {{ pendingWithdraws.length }} 条待审核
          </span>
        </div>
      </div>
    </div>

    <!-- 快捷导航 -->
    <div class="mt-8 bg-white rounded-xl shadow-md p-6">
      <h2 class="text-xl font-bold mb-4">快捷操作</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <router-link
          to="/admin/lobsters"
          class="flex flex-col items-center p-4 border rounded-lg hover:border-[#ff6b35] transition-colors"
        >
          <span class="text-3xl mb-2">🦞</span>
          <span class="font-medium">龙虾审核</span>
        </router-link>
        <router-link
          to="/admin/withdraws"
          class="flex flex-col items-center p-4 border rounded-lg hover:border-[#ff6b35] transition-colors"
        >
          <span class="text-3xl mb-2">💸</span>
          <span class="font-medium">提现审核</span>
        </router-link>
        <router-link
          to="/admin/users"
          class="flex flex-col items-center p-4 border rounded-lg hover:border-[#ff6b35] transition-colors"
        >
          <span class="text-3xl mb-2">👥</span>
          <span class="font-medium">用户管理</span>
        </router-link>
        <router-link
          to="/"
          class="flex flex-col items-center p-4 border rounded-lg hover:border-[#ff6b35] transition-colors"
        >
          <span class="text-3xl mb-2">🏠</span>
          <span class="font-medium">返回首页</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAdminStore } from '../../stores/admin'

const adminStore = useAdminStore()

const { stats, pendingLobsters, pendingWithdraws } = adminStore

onMounted(async () => {
  await adminStore.fetchStats()
  await adminStore.fetchPendingLobsters()
  await adminStore.fetchPendingWithdraws()
})
</script>
