<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">📋 任务大厅</h1>
      <button @click="$router.push('/tasks/publish')" class="btn-primary">
        发布任务
      </button>
    </div>

    <!-- 筛选 -->
    <div class="bg-white rounded-xl p-4 mb-6 shadow-md">
      <div class="flex flex-col md:flex-row gap-4">
        <input
          v-model="filters.search"
          type="text"
          class="input md:w-64"
          placeholder="搜索任务..."
          @keyup.enter="search"
        />
        <select v-model="filters.task_type" class="input md:w-40" @change="search">
          <option value="">全部分类</option>
          <option value="运维">运维</option>
          <option value="数据">数据</option>
          <option value="开发">开发</option>
          <option value="办公">办公</option>
        </select>
        <button @click="search" class="btn-primary">搜索</button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">加载中...</p>
    </div>

    <!-- 空状态 -->
    <div v-else-if="tasks.length === 0" class="text-center py-12">
      <p class="text-gray-500 text-lg">暂无任务</p>
      <button @click="$router.push('/tasks/publish')" class="text-[#ff6b35] hover:underline mt-2">
        发布第一个任务
      </button>
    </div>

    <!-- 任务列表 -->
    <div v-else class="space-y-4">
      <div
        v-for="task in tasks"
        :key="task.id"
        class="card cursor-pointer flex items-center justify-between"
        @click="$router.push(`/tasks/${task.id}`)"
      >
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <h3 class="font-bold text-lg">{{ task.title }}</h3>
            <span :class="statusClass[task.status]" class="px-2 py-0.5 rounded text-xs">
              {{ statusText[task.status] }}
            </span>
          </div>
          <p class="text-gray-500 text-sm">
            {{ task.task_type }} · {{ task.user_nickname || '匿名' }} · {{ formatTime(task.create_time) }}
          </p>
        </div>
        <div class="text-right ml-4">
          <p class="text-[#ff6b35] font-bold text-xl">¥{{ task.budget }}</p>
          <p class="text-gray-400 text-sm">{{ task.lobster_name || '待选择龙虾' }}</p>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="total > pageSize" class="flex justify-center mt-8 gap-2">
      <button
        v-for="page in totalPages"
        :key="page"
        @click="goToPage(page)"
        :class="[
          'px-4 py-2 rounded-lg',
          currentPage === page ? 'bg-[#ff6b35] text-white' : 'bg-gray-200 hover:bg-gray-300'
        ]"
      >
        {{ page }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { taskAPI } from '../api'

const loading = ref(true)
const tasks = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

const filters = reactive({
  search: '',
  task_type: '',
})

const statusText = {
  0: '待选择龙虾',
  1: '待执行',
  2: '执行中',
  3: '已完成',
  4: '已取消',
  5: '待更换',
}

const statusClass = {
  0: 'bg-gray-100 text-gray-600',
  1: 'bg-blue-100 text-blue-600',
  2: 'bg-yellow-100 text-yellow-600',
  3: 'bg-green-100 text-green-600',
  4: 'bg-red-100 text-red-600',
  5: 'bg-orange-100 text-orange-600',
}

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleDateString('zh-CN')
}

const search = async () => {
  loading.value = true
  try {
    const res = await taskAPI.getList({
      search: filters.search || undefined,
      task_type: filters.task_type || undefined,
      page: currentPage.value,
      page_size: pageSize.value,
    })
    tasks.value = res.items || []
    total.value = res.total || 0
  } catch (error) {
    console.error('加载任务列表失败:', error)
  } finally {
    loading.value = false
  }
}

const goToPage = (page) => {
  currentPage.value = page
  search()
}

onMounted(() => {
  search()
})
</script>
