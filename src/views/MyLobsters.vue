<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">我的龙虾</h1>
      <router-link to="/lobsters/create" class="btn-primary">
        上架新龙虾
      </router-link>
    </div>

    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">加载中...</p>
    </div>

    <div v-else-if="lobsters.length === 0" class="text-center py-12">
      <p class="text-gray-500 text-lg">你还没有上架任何龙虾</p>
      <router-link to="/lobsters/create" class="text-[#ff6b35] hover:underline mt-2 inline-block">
        立即上架
      </router-link>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="lobster in lobsters"
        :key="lobster.id"
        class="card"
      >
        <div class="flex items-center justify-between mb-3">
          <span :class="statusClass[lobster.status]" class="px-2 py-0.5 rounded text-xs">
            {{ statusText[lobster.status] }}
          </span>
          <span class="text-gray-400 text-sm">ID: {{ lobster.id }}</span>
        </div>

        <h3 class="font-bold text-lg mb-2">{{ lobster.name }}</h3>
        <p class="text-gray-500 text-sm mb-3 line-clamp-2">{{ lobster.description }}</p>

        <div class="flex items-center gap-4 mb-3 text-sm">
          <span>⭐ {{ lobster.score }}</span>
          <span>已售 {{ lobster.sales }}</span>
        </div>

        <div class="flex gap-2">
          <button
            v-if="lobster.status === 1"
            @click="toggleStatus(lobster)"
            class="btn-outline text-sm py-1 px-3"
          >
            下架
          </button>
          <button
            v-if="lobster.status === 2"
            @click="toggleStatus(lobster)"
            class="btn-primary text-sm py-1 px-3"
          >
            上架
          </button>
          <button class="btn-secondary text-sm py-1 px-3">
            编辑
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { lobsterAPI } from '../api'
import { ElMessage } from 'element-plus'

const loading = ref(true)
const lobsters = ref([])

const statusText = { 0: '待审核', 1: '已上架', 2: '已下架', 3: '审核失败' }
const statusClass = { 0: 'bg-gray-100 text-gray-600', 1: 'bg-green-100 text-green-600', 2: 'bg-red-100 text-red-600', 3: 'bg-orange-100 text-orange-600' }

const loadLobsters = async () => {
  loading.value = true
  try {
    const res = await lobsterAPI.getMyList()
    lobsters.value = res.items || []
  } catch (error) {
    console.error('加载龙虾失败:', error)
  } finally {
    loading.value = false
  }
}

const toggleStatus = async (lobster) => {
  try {
    await lobsterAPI.update(lobster.id, {
      status: lobster.status === 1 ? 2 : 1
    })
    ElMessage.success(lobster.status === 1 ? '下架成功' : '上架成功')
    loadLobsters()
  } catch (error) {
    console.error('操作失败:', error)
  }
}

onMounted(() => {
  loadLobsters()
})
</script>
