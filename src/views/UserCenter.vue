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
              <button
                v-if="userStore.userInfo?.phone"
                class="ml-3 text-sm text-[#ff6b35] hover:underline"
                @click="openChangePhoneDialog"
              >
                修改手机号
              </button>
            </div>
            <div class="flex items-center">
              <span class="w-24 text-gray-500">余额</span>
              <span class="text-[#ff6b35] font-bold">¥{{ userStore.userInfo?.balance || 0 }}</span>
            </div>
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
          <template v-if="!userStore.isDeveloper && !userStore.isAdmin">
            <h2 class="text-xl font-bold mb-4 text-center">我的龙虾</h2>
            <div class="text-center py-8">
              <p class="text-gray-600 mb-4">成为开发者，上架龙虾赚收益</p>
              <router-link to="/lobsters/create" class="btn-primary inline-block">
                上架新龙虾
              </router-link>
            </div>
          </template>
          <template v-else>
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-bold">我的龙虾</h2>
              <router-link to="/lobsters/create" class="btn-primary">
                上架新龙虾
              </router-link>
            </div>
            <div v-if="myLobsters.length === 0" class="text-center py-8 text-gray-500">
              暂无龙虾，开始上架吧
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
          </template>
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

    <!-- 修改手机号弹窗 -->
    <el-dialog v-model="changePhoneDialogVisible" title="修改手机号" width="400px">
      <div class="space-y-4">
        <div v-if="!changePhoneStep2">
          <!-- 步骤1：输入新手机号 -->
          <div>
            <label class="block text-gray-700 mb-2">新手机号</label>
            <div class="flex gap-2">
              <input
                v-model="changePhoneForm.phone"
                type="tel"
                class="input flex-1"
                placeholder="请输入新手机号"
                maxlength="11"
              />
              <button
                class="btn-outline text-sm px-3 whitespace-nowrap"
                :disabled="phoneCountdown > 0 || changePhoneSending"
                @click="sendChangePhoneCode"
              >
                {{ phoneCountdown > 0 ? `${phoneCountdown}秒` : '获取验证码' }}
              </button>
            </div>
          </div>
          <button class="btn-primary w-full mt-4" :disabled="!canSendChangePhone" @click="changePhoneStep2 = true">
            下一步
          </button>
        </div>
        <div v-else>
          <!-- 步骤2：输入验证码 -->
          <div class="bg-blue-50 rounded-lg p-3 text-sm text-blue-700 mb-4">
            验证码已发送至 <span class="font-bold">{{ changePhoneForm.phone }}</span>
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 mb-2">验证码</label>
            <input
              v-model="changePhoneForm.code"
              type="text"
              class="input"
              placeholder="请输入6位验证码"
              maxlength="6"
            />
          </div>
          <div class="flex gap-2">
            <button class="btn-outline flex-1" @click="changePhoneStep2 = false">上一步</button>
            <button class="btn-primary flex-1" :disabled="changePhoneLoading" @click="handleChangePhone">确认修改</button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { taskAPI, lobsterAPI, orderAPI, authAPI } from '../api'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeTab = ref('info')
const myTasks = ref([])
const myLobsters = ref([])
const myOrders = ref([])

// 修改手机号
const changePhoneDialogVisible = ref(false)
const changePhoneStep2 = ref(false)
const changePhoneLoading = ref(false)
const changePhoneSending = ref(false)
const phoneCountdown = ref(0)
const changePhoneForm = ref({ phone: '', code: '' })
let phoneCountdownTimer = null

const canSendChangePhone = computed(() => changePhoneForm.value.phone.length === 11)

const openChangePhoneDialog = () => {
  changePhoneDialogVisible.value = true
  changePhoneStep2.value = false
  changePhoneForm.value = { phone: '', code: '' }
  phoneCountdown.value = 0
  if (phoneCountdownTimer) clearInterval(phoneCountdownTimer)
}

const sendChangePhoneCode = async () => {
  changePhoneSending.value = true
  try {
    await authAPI.sendChangePhoneSms({ phone: changePhoneForm.value.phone })
    ElMessage.success('验证码已发送')
    phoneCountdown.value = 60
    phoneCountdownTimer = setInterval(() => {
      phoneCountdown.value--
      if (phoneCountdown.value <= 0) clearInterval(phoneCountdownTimer)
    }, 1000)
  } catch (error) {
    console.error('发送验证码失败:', error)
  } finally {
    changePhoneSending.value = false
  }
}

const handleChangePhone = async () => {
  if (changePhoneForm.value.code.length !== 6) {
    ElMessage.error('请输入6位验证码')
    return
  }
  changePhoneLoading.value = true
  try {
    await authAPI.changePhone({
      phone: changePhoneForm.value.phone,
      sms_code: changePhoneForm.value.code
    })
    ElMessage.success('手机号修改成功')
    changePhoneDialogVisible.value = false
    await userStore.fetchUserInfo()
  } catch (error) {
    console.error('修改手机号失败:', error)
  } finally {
    changePhoneLoading.value = false
  }
}

const userTypeText = computed(() => {
  const type = userStore.userInfo?.user_type
  return type === 1 ? '开发者' : type === 2 ? '管理员' : '普通用户'
})

const menuItems = computed(() => {
  const items = [
    { key: 'info', label: '基本信息' },
    { key: 'tasks', label: '我的任务' },
    { key: 'orders', label: '我的订单' },
    { key: 'lobsters', label: '我的龙虾' },
  ]
  return items
})

const statusText = { 0: '待选择', 1: '待执行', 2: '执行中', 3: '已完成', 4: '已取消', 5: '待更换' }
const statusClass = { 0: 'bg-gray-100', 1: 'bg-blue-100', 2: 'bg-yellow-100', 3: 'bg-green-100', 4: 'bg-red-100', 5: 'bg-orange-100' }
const lobsterStatusText = { 0: '待审核', 1: '已上架', 2: '已下架', 3: '审核失败' }
const lobsterStatusClass = { 0: 'bg-gray-100 text-gray-600', 1: 'bg-green-100 text-green-600', 2: 'bg-red-100 text-red-600', 3: 'bg-orange-100 text-orange-600' }
const orderStatusText = { 0: '待支付', 1: '已托管', 2: '已结算', 3: '已取消', 4: '已退款' }
const orderStatusClass = { 0: 'bg-gray-100', 1: 'bg-blue-100', 2: 'bg-green-100', 3: 'bg-red-100', 4: 'bg-orange-100' }
const orderNoType = { 0: '购买', 1: '雇佣', 2: '更换手续费' }

const formatTime = (time) => new Date(time).toLocaleDateString('zh-CN')

const upgradeToDeveloper = async () => {
  try {
    const res = await authAPI.checkUpgrade()
    console.log('checkUpgrade 返回:', res)
    if (res.can_upgrade) {
      console.log('有龙虾，升级')
      await authAPI.upgradeToDeveloper()
      await userStore.fetchUserInfo()
      ElMessage.success('升级成功！')
    } else {
      console.log('没龙虾，跳转')
      router.push('/lobsters/create')
    }
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
    myTasks.value = (taskRes.items || []).filter(t => t.user_id === userStore.userInfo?.id)
    myOrders.value = (orderRes.items || []).filter(o => o.user_id === userStore.userInfo?.id)
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

const loadLobsters = async () => {
  if (!userStore.isDeveloper && !userStore.isAdmin) return
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
  const tab = route.query.tab
  if (tab && ['info', 'tasks', 'orders', 'lobsters'].includes(tab)) {
    activeTab.value = tab
  }
  loadData()
})
</script>
