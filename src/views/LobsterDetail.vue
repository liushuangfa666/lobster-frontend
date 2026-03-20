<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">加载中...</p>
    </div>

    <div v-else-if="!lobster" class="text-center py-12">
      <p class="text-gray-500">龙虾不存在</p>
    </div>

    <div v-else>
      <!-- 返回按钮 -->
      <button @click="$router.back()" class="mb-6 text-gray-600 hover:text-[#ff6b35]">
        ← 返回
      </button>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 左侧：龙虾信息 -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-xl shadow-md p-6">
            <!-- 标签 -->
            <div class="flex flex-wrap gap-2 mb-4">
              <span
                v-for="tag in (lobster.tags || '').split(',').filter(t => t)"
                :key="tag"
                class="bg-[#ff6b35]/10 text-[#ff6b35] px-3 py-1 rounded-full text-sm"
              >
                {{ tag }}
              </span>
            </div>

            <!-- 名称 -->
            <h1 class="text-3xl font-bold mb-2">{{ lobster.name }}</h1>

            <!-- 开发者信息 -->
            <div class="flex items-center gap-4 mb-6 text-gray-600">
              <span>开发者：{{ lobster.developer_name || '未知' }}</span>
              <span class="text-yellow-500">⭐ {{ lobster.score }}</span>
              <span>已售 {{ lobster.sales }}</span>
            </div>

            <!-- 描述 -->
            <div class="mb-6">
              <h2 class="text-xl font-bold mb-3">能力描述</h2>
              <p class="text-gray-700 whitespace-pre-wrap">{{ lobster.description }}</p>
            </div>

            <!-- 演示区 -->
            <div v-if="lobster.demo_url" class="mb-6">
              <h2 class="text-xl font-bold mb-3">演示</h2>
              <div class="bg-gray-100 rounded-lg p-4">
                <img :src="lobster.demo_url" alt="演示" class="max-w-full rounded" />
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：价格和操作 -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-md p-6 sticky top-24">
            <div class="mb-4">
              <span class="text-[#ff6b35] text-3xl font-bold">
                ¥{{ lobster.task_price || lobster.price }}
              </span>
              <span class="text-gray-500 ml-2">
                {{ priceTypeText[lobster.price_type] }}
              </span>
            </div>

            <!-- 价格类型说明 -->
            <div class="text-sm text-gray-500 mb-6">
              <p v-if="lobster.price_type === 3">按任务计费，每执行一次计费一次</p>
              <p v-else-if="lobster.price_type === 1">月费订阅，有效期内不限任务次数</p>
              <p v-else-if="lobster.price_type === 2">年费订阅，有效期内不限任务次数</p>
              <p v-else>一次性购买，永久使用</p>
            </div>

            <!-- 操作按钮 -->
            <div class="space-y-3">
              <button @click="handleHire" class="btn-primary w-full" :disabled="!canHire">
                立即雇佣
              </button>
              <button class="btn-secondary w-full" disabled>立即购买</button>
            </div>

            <!-- 提示 -->
            <p class="text-sm text-gray-500 mt-4 text-center">
              不满意？可免费更换2次龙虾
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { lobsterAPI, taskAPI } from '../api'
import { useUserStore } from '../stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(true)
const lobster = ref(null)

const priceTypeText = {
  0: '一次性',
  1: '月',
  2: '年',
  3: '/次',
}

const canHire = computed(() => userStore.isLoggedIn && lobster.value?.status === 1)

const handleHire = async () => {
  if (!userStore.isLoggedIn) {
    ElMessageBox.confirm('请先登录', '提示', {
      confirmButtonText: '去登录',
      cancelButtonText: '取消',
    }).then(() => {
      router.push('/login')
    })
    return
  }

  // 跳转到发布任务页面，并自动选择这个龙虾
  router.push({
    path: '/tasks/publish',
    query: { lobster_id: lobster.value.id },
  })
}

onMounted(async () => {
  try {
    const res = await lobsterAPI.getDetail(route.params.id)
    lobster.value = res
  } catch (error) {
    console.error('加载龙虾详情失败:', error)
  } finally {
    loading.value = false
  }
})
</script>
