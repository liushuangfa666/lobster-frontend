<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold">🦞 龙虾审核</h1>
      <router-link to="/admin" class="text-[#ff6b35] hover:underline">
        ← 返回首页
      </router-link>
    </div>

    <!-- 筛选标签 -->
    <div class="bg-white rounded-xl shadow-md p-4 mb-6">
      <div class="flex gap-3">
        <button
          v-for="tab in filterTabs"
          :key="tab.value"
          @click="activeFilter = tab.value"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-colors',
            activeFilter === tab.value
              ? 'bg-[#ff6b35] text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          ]"
        >
          {{ tab.label }}
          <span
            v-if="tab.count !== undefined"
            class="ml-1 bg-white text-[#ff6b35] px-2 py-0.5 rounded-full text-xs"
          >
            {{ tab.count }}
          </span>
        </button>
      </div>
    </div>

    <!-- 龙虾列表 -->
    <div class="bg-white rounded-xl shadow-md p-6">
      <div v-if="loading" class="text-center py-12 text-gray-500">
        加载中...
      </div>
      <div v-else-if="filteredLobsters.length === 0" class="text-center py-12 text-gray-500">
        暂无数据
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="lobster in filteredLobsters"
          :key="lobster.id"
          class="border rounded-xl p-4 hover:shadow-md transition-shadow"
        >
          <div class="flex justify-between items-start mb-3">
            <div>
              <h3 class="font-bold text-lg">{{ lobster.name }}</h3>
              <p class="text-gray-500 text-xs">ID: {{ lobster.id }}</p>
            </div>
            <span :class="statusClass[lobster.status]" class="px-2 py-0.5 rounded text-xs whitespace-nowrap">
              {{ statusText[lobster.status] }}
            </span>
          </div>

          <p class="text-gray-600 text-sm mb-3 line-clamp-2">
            {{ lobster.description || '暂无描述' }}
          </p>

          <!-- 标签 -->
          <div class="flex flex-wrap gap-1 mb-3">
            <span
              v-for="tag in (lobster.tags || '').split(',').filter(t => t)"
              :key="tag"
              class="bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-600"
            >
              {{ tag }}
            </span>
          </div>

          <div class="text-xs text-gray-500 mb-3">
            <p>开发者: {{ lobster.developer_name || lobster.developer_id }}</p>
            <p>创建时间: {{ formatTime(lobster.create_time || lobster.created_at) }}</p>
            <p v-if="lobster.price">价格: ¥{{ lobster.price }}</p>
          </div>

          <!-- 审核操作 -->
          <div v-if="lobster.status === 0" class="flex gap-2 mt-3 pt-3 border-t">
            <el-button type="primary" size="small" @click="handleApprove(lobster.id)">
              通过
            </el-button>
            <el-button type="danger" size="small" @click="openRejectDialog(lobster.id)">
              拒绝
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 拒绝原因对话框 -->
    <el-dialog v-model="rejectDialogVisible" title="拒绝龙虾审核" width="400px">
      <el-form>
        <el-form-item label="拒绝原因">
          <el-input
            v-model="rejectReason"
            type="textarea"
            :rows="3"
            placeholder="请输入拒绝原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="handleReject" :loading="actionLoading">
          确认拒绝
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '../../stores/admin'
import { ElMessage } from 'element-plus'

const adminStore = useAdminStore()

const loading = ref(false)
const actionLoading = ref(false)
const activeFilter = ref('pending')
const rejectDialogVisible = ref(false)
const rejectReason = ref('')
const currentRejectId = ref(null)

const filterTabs = computed(() => [
  { label: '待审核', value: 'pending', count: adminStore.pendingLobsters.length },
  { label: '已通过', value: 'approved' },
  { label: '已拒绝', value: 'rejected' },
  { label: '全部', value: 'all' },
])

const statusText = { 0: '待审核', 1: '已通过', 2: '已拒绝', 3: '已下架' }
const statusClass = {
  0: 'bg-yellow-100 text-yellow-700',
  1: 'bg-green-100 text-green-700',
  2: 'bg-red-100 text-red-700',
  3: 'bg-gray-100 text-gray-600',
}

const filteredLobsters = computed(() => {
  const all = adminStore.allLobsters
  switch (activeFilter.value) {
    case 'pending':
      return all.filter(l => l.status === 0)
    case 'approved':
      return all.filter(l => l.status === 1)
    case 'rejected':
      return all.filter(l => l.status === 2)
    default:
      return all
  }
})

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleDateString('zh-CN')
}

const loadData = async () => {
  loading.value = true
  try {
    await adminStore.fetchPendingLobsters()
    await adminStore.fetchLobsters()
  } catch (error) {
    console.error('加载龙虾数据失败:', error)
  } finally {
    loading.value = false
  }
}

const handleApprove = async (id) => {
  try {
    await adminStore.approveLobster(id)
    ElMessage.success('龙虾已审核通过')
    await loadData()
  } catch (error) {
    console.error('审核失败:', error)
  }
}

const openRejectDialog = (id) => {
  currentRejectId.value = id
  rejectReason.value = ''
  rejectDialogVisible.value = true
}

const handleReject = async () => {
  if (!rejectReason.value.trim()) {
    ElMessage.warning('请填写拒绝原因')
    return
  }
  actionLoading.value = true
  try {
    await adminStore.rejectLobster(currentRejectId.value, rejectReason.value)
    ElMessage.success('龙虾已审核拒绝')
    rejectDialogVisible.value = false
    await loadData()
  } catch (error) {
    console.error('审核失败:', error)
  } finally {
    actionLoading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
