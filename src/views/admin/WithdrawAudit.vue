<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold">💸 提现审核</h1>
      <router-link to="/admin" class="text-[#ff6b35] hover:underline">
        ← 返回首页
      </router-link>
    </div>

    <!-- 提现列表 -->
    <div class="bg-white rounded-xl shadow-md p-6">
      <div v-if="loading" class="text-center py-12 text-gray-500">
        加载中...
      </div>
      <div v-else-if="pendingWithdraws.length === 0" class="text-center py-12 text-gray-500">
        暂无待审核提现申请
      </div>
      <div v-else>
        <el-table :data="pendingWithdraws" stripe class="w-full">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column label="申请人">
            <template #default="{ row }">
              <div>
                <p class="font-medium">{{ row.developer_name || '-' }}</p>
                <p class="text-gray-500 text-xs">ID: {{ row.developer_id }}</p>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="金额" width="120">
            <template #default="{ row }">
              <span class="text-[#ff6b35] font-bold">¥{{ row.amount }}</span>
            </template>
          </el-table-column>
          <el-table-column label="账户类型" width="120">
            <template #default="{ row }">
              <span>{{ accountTypeText[row.account_type] || '银行卡' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="账户信息" min-width="200">
            <template #default="{ row }">
              <span class="text-gray-600">{{ row.account_info || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="申请时间" min-width="160">
            <template #default="{ row }">
              <span class="text-gray-500 text-sm">
                {{ formatTime(row.create_time || row.created_at) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" fixed="right">
            <template #default="{ row }">
              <div class="flex gap-2">
                <el-button type="primary" size="small" @click="handleApprove(row.id)">
                  通过
                </el-button>
                <el-button type="danger" size="small" @click="openRejectDialog(row.id)">
                  拒绝
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 拒绝原因对话框 -->
    <el-dialog v-model="rejectDialogVisible" title="拒绝提现申请" width="400px">
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
import { ref, onMounted } from 'vue'
import { useAdminStore } from '../../stores/admin'
import { ElMessage } from 'element-plus'

const adminStore = useAdminStore()

const loading = ref(false)
const actionLoading = ref(false)
const rejectDialogVisible = ref(false)
const rejectReason = ref('')
const currentRejectId = ref(null)

const { pendingWithdraws } = adminStore

const accountTypeText = { 0: '银行卡', 1: '微信', 2: '支付宝' }

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const loadData = async () => {
  loading.value = true
  try {
    await adminStore.fetchPendingWithdraws()
  } catch (error) {
    console.error('加载提现数据失败:', error)
  } finally {
    loading.value = false
  }
}

const handleApprove = async (id) => {
  try {
    await adminStore.approveWithdraw(id)
    ElMessage.success('提现已审核通过')
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
    await adminStore.rejectWithdraw(currentRejectId.value)
    ElMessage.success('提现已审核拒绝')
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
