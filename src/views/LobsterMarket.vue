<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">🦞 龙虾市集</h1>

    <!-- 筛选区 -->
    <div class="bg-white rounded-xl p-4 mb-6 shadow-md">
      <div class="flex flex-col md:flex-row gap-4">
        <input
          v-model="filters.search"
          type="text"
          class="input md:w-64"
          placeholder="搜索龙虾名称、能力..."
          @keyup.enter="search"
        />
        <select v-model="filters.tag" class="input md:w-40" @change="search">
          <option value="">全部分类</option>
          <option value="运维">运维</option>
          <option value="数据">数据</option>
          <option value="开发">开发</option>
          <option value="办公">办公</option>
        </select>
        <select v-model="filters.sort_by" class="input md:w-40" @change="search">
          <option value="score">评分</option>
          <option value="sales">销量</option>
          <option value="price">价格</option>
        </select>
        <button @click="search" class="btn-primary">搜索</button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">加载中...</p>
    </div>

    <!-- 空状态 -->
    <div v-else-if="lobsters.length === 0" class="text-center py-12">
      <p class="text-gray-500 text-lg">暂无龙虾</p>
      <router-link to="/register" class="text-[#ff6b35] hover:underline mt-2 inline-block">
        成为第一个开发者？
      </router-link>
    </div>

    <!-- 龙虾列表 -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="lobster in lobsters"
        :key="lobster.id"
        class="card cursor-pointer"
        @click="$router.push(`/lobsters/${lobster.id}`)"
      >
        <!-- 标签 -->
        <div class="flex flex-wrap gap-1 mb-3">
          <span
            v-for="tag in (lobster.tags || '').split(',').filter(t => t)"
            :key="tag"
            class="bg-[#ff6b35]/10 text-[#ff6b35] px-2 py-0.5 rounded text-xs"
          >
            {{ tag }}
          </span>
        </div>

        <!-- 名称和开发者 -->
        <h3 class="font-bold text-lg mb-1">{{ lobster.name }}</h3>
        <p class="text-gray-500 text-sm mb-3">开发者：{{ lobster.developer_name || '未知' }}</p>

        <!-- 描述 -->
        <p class="text-gray-600 text-sm mb-3 line-clamp-2">{{ lobster.description }}</p>

        <!-- 评分和销量 -->
        <div class="flex items-center gap-4 mb-3 text-sm">
          <span class="text-yellow-500">⭐ {{ lobster.score }}</span>
          <span class="text-gray-400">已售 {{ lobster.sales }}</span>
        </div>

        <!-- 价格 -->
        <div class="flex items-center justify-between pt-3 border-t">
          <span class="text-[#ff6b35] font-bold text-xl">
            ¥{{ lobster.task_price || lobster.price }}
            <span class="text-gray-400 text-sm font-normal">
              /{{ priceTypeText[lobster.price_type] }}
            </span>
          </span>
          <button class="btn-outline text-sm py-1 px-3">查看详情</button>
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
import { lobsterAPI } from '../api'

const loading = ref(true)
const lobsters = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

const filters = reactive({
  search: '',
  tag: '',
  sort_by: 'score',
  order: 'desc',
})

const priceTypeText = {
  0: '一次性',
  1: '月',
  2: '年',
  3: '次',
}

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

const search = async () => {
  loading.value = true
  try {
    const res = await lobsterAPI.getList({
      status: 1,
      search: filters.search || undefined,
      tags: filters.tag || undefined,
      sort_by: filters.sort_by,
      order: filters.order,
      page: currentPage.value,
      page_size: pageSize.value,
    })
    lobsters.value = res.items || []
    total.value = res.total || 0
  } catch (error) {
    console.error('加载龙虾列表失败:', error)
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
