<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">加载中...</p>
    </div>

    <div v-else-if="!task" class="text-center py-12">
      <p class="text-gray-500">任务不存在</p>
    </div>

    <div v-else>
      <button @click="$router.back()" class="mb-6 text-gray-600 hover:text-[#ff6b35]">
        ← 返回
      </button>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 左侧：任务信息 -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-xl shadow-md p-6">
            <div class="flex items-center gap-3 mb-4">
              <h1 class="text-2xl font-bold">{{ task.title }}</h1>
              <span :class="statusClass[task.status]" class="px-3 py-1 rounded-full text-sm">
                {{ statusText[task.status] }}
              </span>
            </div>

            <div class="flex items-center gap-6 text-gray-600 mb-6">
              <span>{{ task.task_type }}</span>
              <span>发布者：{{ task.user_nickname || '匿名' }}</span>
              <span>{{ formatTime(task.create_time) }}</span>
            </div>

            <div class="mb-6">
              <h2 class="text-xl font-bold mb-3">任务描述</h2>
              <p class="text-gray-700 whitespace-pre-wrap">{{ task.content }}</p>
            </div>

            <!-- 当前选中的龙虾 -->
            <div v-if="task.current_lobster_id" class="mb-6">
              <h2 class="text-xl font-bold mb-3">当前执行的龙虾</h2>
              <div class="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p class="font-bold">{{ task.lobster_name }}</p>
                  <p class="text-gray-500 text-sm">已更换 {{ task.replace_count }} 次</p>
                </div>
                <button
                  v-if="canReplace"
                  @click="showReplaceDialog = true"
                  class="btn-outline text-sm"
                >
                  更换龙虾
                </button>
              </div>
            </div>

            <!-- OpenClaw 执行进度 -->
            <div v-if="task.current_lobster_id && (task.status === 1 || task.status === 2 || task.status === 3)" class="mb-6">
              <div class="flex items-center justify-between mb-3">
                <h2 class="text-xl font-bold">任务执行进度</h2>
                <button
                  @click="refreshExecution"
                  class="text-sm text-[#ff6b35] hover:underline flex items-center gap-1"
                  :disabled="refreshingExecution"
                >
                  <span v-if="refreshingExecution">刷新中...</span>
                  <span v-else>刷新</span>
                </button>
              </div>
              
              <!-- 执行状态标签 -->
              <div class="bg-gray-50 rounded-lg p-4 mb-4">
                <div class="flex items-center gap-4">
                  <span :class="executionStatusClass" class="px-3 py-1 rounded-full text-sm font-bold">
                    {{ executionStatusText }}
                  </span>
                  <span v-if="execution.lobster_name" class="text-gray-600">
                    执行者: {{ execution.lobster_name }}
                  </span>
                </div>
              </div>

              <!-- 执行日志 (可折叠) -->
              <div class="border rounded-lg">
                <button
                  @click="showLogs = !showLogs"
                  class="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-t-lg"
                >
                  <span class="font-bold">执行日志</span>
                  <span>{{ showLogs ? '收起' : '展开' }}</span>
                </button>
                <div v-show="showLogs" class="p-4 border-t">
                  <div v-if="executionLogs.length === 0" class="text-gray-500 text-center py-4">
                    暂无执行日志
                  </div>
                  <div v-else class="bg-black text-green-400 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
                    <div v-for="(log, index) in executionLogs" :key="index" class="mb-1">
                      {{ log }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- 执行结果 -->
              <div v-if="executionResult" class="mt-4 border rounded-lg p-4">
                <h3 class="font-bold mb-2">执行结果</h3>
                <pre class="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">{{ JSON.stringify(executionResult, null, 2) }}</pre>
              </div>

              <!-- 下发任务按钮 -->
              <div v-if="task.status === 1 && isOwner" class="mt-4">
                <button
                  @click="handleDispatch"
                  :disabled="dispatching"
                  class="btn-primary w-full"
                >
                  {{ dispatching ? '下发中...' : '下发任务给龙虾' }}
                </button>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div v-if="isOwner" class="flex gap-4">
              <button
                v-if="task.status === 1 || task.status === 2"
                @click="handleComplete"
                class="btn-primary"
              >
                确认完成
              </button>
              <button
                v-if="task.status === 0 || task.status === 1"
                @click="handleCancel"
                class="btn-secondary bg-red-500 hover:bg-red-600"
              >
                取消任务
              </button>
            </div>
          </div>
        </div>

        <!-- 右侧：任务概览 -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-md p-6 sticky top-24">
            <h3 class="font-bold text-lg mb-4">任务概览</h3>
            <div class="space-y-4">
              <div class="flex justify-between">
                <span class="text-gray-500">预算</span>
                <span class="text-[#ff6b35] font-bold text-xl">¥{{ task.budget }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">截止时间</span>
                <span>{{ task.deadline ? formatTime(task.deadline) : '未设置' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">已更换次数</span>
                <span>{{ task.replace_count }} / 2 次免费</span>
              </div>
            </div>

            <!-- 选择龙虾 -->
            <div v-if="task.status === 0 && !task.current_lobster_id" class="mt-6 pt-6 border-t">
              <h4 class="font-bold mb-3">选择执行龙虾</h4>
              <button @click="showLobsterDialog = true" class="btn-secondary w-full">
                选择龙虾
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 选择龙虾弹窗 -->
    <div v-if="showLobsterDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <h3 class="text-xl font-bold mb-4">选择龙虾</h3>
        <div class="space-y-4">
          <div
            v-for="lobster in lobsters"
            :key="lobster.id"
            class="card cursor-pointer flex items-center justify-between"
            @click="selectLobster(lobster.id)"
          >
            <div>
              <p class="font-bold">{{ lobster.name }}</p>
              <p class="text-gray-500 text-sm">{{ lobster.tags }}</p>
            </div>
            <div class="text-right">
              <p class="text-[#ff6b35] font-bold">¥{{ lobster.task_price || lobster.price }}</p>
            </div>
          </div>
        </div>
        <button @click="showLobsterDialog = false" class="btn-secondary w-full mt-4">
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { taskAPI, lobsterAPI } from '../api'
import { useUserStore } from '../stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(true)
const task = ref(null)
const lobsters = ref([])
const showLobsterDialog = ref(false)
const showReplaceDialog = ref(false)

// OpenClaw 执行状态
const execution = ref({})
const executionLogs = ref([])
const executionResult = ref(null)
const showLogs = ref(false)
const refreshingExecution = ref(false)
const dispatching = ref(false)

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

const isOwner = computed(() => userStore.userInfo?.id === task.value?.user_id)
const canReplace = computed(() => (task.value?.replace_count || 0) < 2 || task.value?.replace_count === 2)

// OpenClaw 执行状态
const executionStatusText = computed(() => {
  const statusMap = {
    0: '待选择龙虾',
    1: '待下发',
    2: '执行中',
    3: '已完成',
    4: '已取消',
    5: '待更换'
  }
  return statusMap[execution.value.status] || '未知'
})

const executionStatusClass = computed(() => {
  const classMap = {
    0: 'bg-gray-100 text-gray-600',
    1: 'bg-blue-100 text-blue-600',
    2: 'bg-yellow-100 text-yellow-600 animate-pulse',
    3: 'bg-green-100 text-green-600',
    4: 'bg-red-100 text-red-600',
    5: 'bg-orange-100 text-orange-600'
  }
  return classMap[execution.value.status] || 'bg-gray-100 text-gray-600'
})

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleDateString('zh-CN')
}

const handleComplete = async () => {
  try {
    await taskAPI.complete(route.params.id)
    ElMessage.success('任务已完成')
    task.value.status = 3
  } catch (error) {
    console.error('确认完成失败:', error)
  }
}

const handleCancel = async () => {
  try {
    await taskAPI.cancel(route.params.id)
    ElMessage.success('任务已取消')
    task.value.status = 4
  } catch (error) {
    console.error('取消任务失败:', error)
  }
}

const selectLobster = async (lobsterId) => {
  try {
    await taskAPI.assign(route.params.id, lobsterId)
    ElMessage.success('龙虾雇佣成功')
    showLobsterDialog.value = false
    // 刷新任务详情
    const res = await taskAPI.getDetail(route.params.id)
    task.value = res
    // 刷新执行状态
    await refreshExecution()
  } catch (error) {
    console.error('雇佣龙虾失败:', error)
  }
}

// OpenClaw 刷新执行状态
const refreshExecution = async () => {
  if (refreshingExecution.value) return
  refreshingExecution.value = true
  try {
    const res = await taskAPI.getExecution(route.params.id)
    execution.value = res
    executionLogs.value = res.execution_logs || []
    executionResult.value = res.execution_result || null
  } catch (error) {
    console.error('获取执行状态失败:', error)
  } finally {
    refreshingExecution.value = false
  }
}

// 下发任务给龙虾
const handleDispatch = async () => {
  try {
    dispatching.value = true
    await taskAPI.dispatch(route.params.id)
    ElMessage.success('任务已下发到龙虾')
    // 刷新任务详情和执行状态
    const res = await taskAPI.getDetail(route.params.id)
    task.value = res
    await refreshExecution()
  } catch (error) {
    console.error('下发任务失败:', error)
  } finally {
    dispatching.value = false
  }
}

onMounted(async () => {
  try {
    const res = await taskAPI.getDetail(route.params.id)
    task.value = res

    // 加载可选龙虾列表
    const lobsterRes = await lobsterAPI.getList({ status: 1, page: 1, page_size: 100 })
    lobsters.value = lobsterRes.items || []

    // 如果有执行的龙虾，加载执行状态
    if (res.current_lobster_id && (res.status === 1 || res.status === 2 || res.status === 3)) {
      await refreshExecution()
    }
  } catch (error) {
    console.error('加载任务详情失败:', error)
  } finally {
    loading.value = false
  }
})
</script>
