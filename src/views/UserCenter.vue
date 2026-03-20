<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">个人中心</h1>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- 左侧菜单 -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-xl shadow-md p-4">
          <div class="text-center mb-6 pb-6 border-b">
            <div class="w-20 h-20 bg-[#ff6b35] rounded-full mx-auto flex items-center justify-center text-white text-3xl">
              {{ userStore.userInfo?.username?.[0]?.toUpperCase() || '?' }}
            </div>
            <h3 class="font-bold mt-4">{{ userStore.userInfo?.username }}</h3>
            <p class="text-gray-500 text-sm">{{ userTypeText }}</p>
          </div>
          <nav class="space-y-2">
            <button
              v-for="item in menuItems"
              :key="item.key"
              @click="activeTab = item.key"
              :class="[
                'w-full text-left px-4 py-2 rounded-lg transition-colors',
                activeTab === item.key ? 'bg-[#ff6b35] text-white' : 'hover:bg-gray-100'
              ]"
            >
              {{ item.label }}
            </button>
          </nav>
        </div>
      </div>

      <!-- 右侧内容 -->
      <div class="lg:col-span-3">
        <!-- 基本信息 -->
        <div v-if="activeTab === 'info'" class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-xl font-bold mb-6">基本信息</h2>
          <div class="space-y-4">
            <div class="flex items-center">
              <span class="w-24 text-gray-500">用户名</span>
              <span>{{ userStore.userInfo?.username }}</span>
            </div>
            <div class="flex items-center">
              <span class="w-24 text-gray-500">邮箱</span>
              <span>{{ userStore.userInfo?.email || '未设置' }}</span>
            </div>
            <div class="flex items-center">
              <span class="w-24 text-gray-500">手机号</span>
              <span>{{ userStore.userInfo?.phone || '未设置' }}</span>
            </div>
            <div class="flex items-center">
              <span class="w-24 text-gray-500">余额</span>
              <span class="text-[#ff6b35] font-bold">¥{{ userStore.userInfo?.balance || 0 }}</span>
            </div>
          </div>

          <!-- 升级为开发者 -->
          <div v-if="!userStore.isDeveloper" class="mt-8 p-4 bg-gray-50 rounded-lg">
            <p class="text-gray-600 mb-4">成为开发者，上架龙虾赚收益</p>
            <button @click="upgradeToDeveloper" class="btn-primary">
              升级为开发者
            </button>
          </div>
        </div>

        <!-- 我的任务 -->
        <div v-if="activeTab === 'tasks'" class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-xl font-bold mb-6">我的任务</h2>
          <div v-if="myTasks.length === 0" class="text-center py-8 text-gray-500">
            暂无任务
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="task in myTasks"
              :key="task.id"
              class="border rounded-lg p-4 cursor-pointer hover:border-[#ff6b35]"
              @click="$router.push(`/tasks/${task.id}`)"
            >
              <div class="flex justify-between">
                <span class="font-bold">{{ task.title }}</span>
                <span :class="statusClass[task.status]" class="px-2 py-0.5 rounded text-xs">
                  {{ statusText[task.status] }}
                </span>
              </div>
              <p class="text-gray-500 text-sm mt-1">预算：¥{{ task.budget }}</p>
            </div>
          </div>
        </div>

        <!-- 我的龙虾 -->
        <div v-if="activeTab === 'lobsters'" class="bg-white rounded-xl shadow-md p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold">我的龙虾</h2>
            <router-link to="/lobsters/create" class="btn-primary">
              上架新龙虾
            </router-link>
          </div>
          <div v-if="myLobsters.length === 0" class="text-center py-8 text-gray-500">
            暂无龙虾，成为开发者开始上架吧
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="lobster in myLobsters"
              :key="lobster.id"
              class="border rounded-lg p-4 cursor-pointer hover:border-[#ff6b35]"
              @click="$router.push(`/lobsters/${lobster.id}`)"
            >
              <div class="flex justify-between">
                <span class="font-bold">{{ lobster.name }}</span>
                <span :class="lobsterStatusClass[lobster.status]" class="px-2 py-0.5 rounded text-xs">
                  {{ lobsterStatusText[lobster.status] }}
                </span>
              </div>
              <p class="text-gray-500 text-sm mt-1">销量：{{ lobster.sales }} · 评分：{{ lobster.score }}</p>
            </div>
          </div>
        </div>

        <!-- 我的订单 -->
        <div v-if="activeTab === 'orders'" class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-xl font-bold mb-6">我的订单</h2>
          <div v-if="myOrders.length === 0" class="text-center py-8 text-gray-500">
            暂无订单
          </div>
          <div v-else class="space-y-4">
            <div v-for="order in myOrders" :key="order.id" class="border rounded-lg p-4">
              <div class="flex justify-between">
                <span class="font-bold">{{ order.lobster_name || '龙虾 #' + order.lobster_id }}</span>
                <span :class="orderStatusClass[order.status]" class="px-2 py-0.5 rounded text-xs">
                  {{ orderStatusText[order.status] }}
                </span>
              </div>
              <p class="text-gray-500 text-sm mt-1">
                {{ orderNoType[order.order_type] }} · ¥{{ order.amount }}
              </p>
              <p class="text-gray-400 text-xs mt-1">{{ formatTime(order.create_time) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '../stores/user'
import { taskAPI, lobsterAPI, orderAPI } from '../api'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()

const activeTab = ref('info')
const myTasks = ref([])
const myLobsters = ref([])
const myOrders = ref([])

const userTypeText = computed(() => {
  const type = userStore.userInfo?.user_type
  return type === 1 ? '开发者' : type === 2 ? '管理员' : '普通用户'
})

const menuItems = computed(() => {
  const items = [
    { key: 'info', label: '基本信息' },
    { key: 'tasks', label: '我的任务' },
    { key: 'orders', label: '我的订单' },
  ]
  if (userStore.isDeveloper) {
    items.splice(2, 0, { key: 'lobsters', label: '我的龙虾' })
  }
  return items
})

const statusText = { 0: '待选择', 1: '待执行', 2: '执行中', 3: '已完成', 4: '已取消', 5: '待更换' }
const statusClass = { 0: 'bg-gray-100', 1: 'bg-blue-100', 2: 'bg-yellow-100', 3: 'bg-green-100', 4: 'bg-red-100', 5: 'bg-orange-100' }
const lobsterStatusText = { 0: '待审核', 1: '已上架', 2: '已下架', 3: '审核失败' }
const lobsterStatusClass = { 0: 'bg-gray-100', 1: 'bg-green-100', 2: 'bg-red-100', 3: 'bg-orange-100' }
const orderStatusText = { 0: '待支付', 1: '已托管', 2: '已结算', 3: '已取消', 4: '已退款' }
const orderStatusClass = { 0: 'bg-gray-100', 1: 'bg-blue-100', 2: 'bg-green-100', 3: 'bg-red-100', 4: 'bg-orange-100' }
const orderNoType = { 0: '购买', 1: '雇佣', 2: '更换手续费' }

const formatTime = (time) => new Date(time).toLocaleDateString('zh-CN')

const upgradeToDeveloper = async () => {
  try {
    await userStore.upgradeToDeveloper()
    ElMessage.success('升级成功！')
  } catch (error) {
    console.error('升级失败:', error)
  }
}

const loadData = async () => {
  try {
    const [taskRes, orderRes] = await Promise.all([
      taskAPI.getList({ page: 1, page_size: 100 }),
      orderAPI.getList({ page: 1, page_size: 100 }),
    ])
    // 筛选当前用户的任务和订单
    myTasks.value = (taskRes.items || []).filter(t => t.user_id === userStore.userInfo?.id)
    myOrders.value = (orderRes.items || []).filter(o => o.user_id === userStore.userInfo?.id)
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

const loadLobsters = async () => {
  if (!userStore.isDeveloper) return
  try {
    const res = await lobsterAPI.getMyList()
    myLobsters.value = res.items || []
  } catch (error) {
    console.error('加载龙虾失败:', error)
  }
}

watch(activeTab, (tab) => {
  if (tab === 'lobsters') loadLobsters()
  if (tab === 'tasks' || tab === 'orders') loadData()
})

onMounted(() => {
  if (userStore.isLoggedIn) {
    userStore.fetchUserInfo()
  }
  loadData()
})
</script>
