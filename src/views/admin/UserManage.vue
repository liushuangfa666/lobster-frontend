<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold">👥 用户管理</h1>
      <router-link to="/admin" class="text-[#ff6b35] hover:underline">
        ← 返回首页
      </router-link>
    </div>

    <!-- 用户列表 -->
    <div class="bg-white rounded-xl shadow-md p-6">
      <div v-if="loading" class="text-center py-12 text-gray-500">
        加载中...
      </div>
      <div v-else>
        <el-table :data="users" stripe class="w-full">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column label="用户名" min-width="150">
            <template #default="{ row }">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-[#ff6b35] rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {{ row.username?.[0]?.toUpperCase() || '?' }}
                </div>
                <span class="font-medium">{{ row.username }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="类型" width="120">
            <template #default="{ row }">
              <span :class="userTypeClass[row.user_type]" class="font-medium">
                {{ userTypeText[row.user_type] }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
                {{ row.status === 1 ? '正常' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="余额" width="120">
            <template #default="{ row }">
              <span class="text-[#ff6b35] font-bold">¥{{ row.balance || 0 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="注册时间" min-width="160">
            <template #default="{ row }">
              <span class="text-gray-500 text-sm">
                {{ formatTime(row.create_time || row.created_at) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="140" fixed="right">
            <template #default="{ row }">
              <el-button
                v-if="row.status === 1"
                type="danger"
                size="small"
                @click="toggleStatus(row.id, false)"
              >
                禁用
              </el-button>
              <el-button
                v-else
                type="success"
                size="small"
                @click="toggleStatus(row.id, true)"
              >
                启用
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="mt-4 flex justify-end">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="usersTotal"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAdminStore } from '../../stores/admin'
import { ElMessage } from 'element-plus'

const adminStore = useAdminStore()

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const usersTotal = ref(0)

const { users } = adminStore

const userTypeText = { 0: '普通用户', 1: '开发者', 2: '管理员' }
const userTypeClass = {
  0: 'text-gray-600',
  1: 'text-blue-600',
  2: 'text-purple-600',
}

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleDateString('zh-CN')
}

const loadData = async () => {
  loading.value = true
  try {
    await adminStore.fetchUsers(currentPage.value, pageSize.value)
    usersTotal.value = adminStore.usersTotal
  } catch (error) {
    console.error('加载用户数据失败:', error)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  loadData()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadData()
}

const toggleStatus = async (id, enabled) => {
  try {
    await adminStore.toggleUserStatus(id, enabled)
    ElMessage.success(`用户已${enabled ? '启用' : '禁用'}`)
    await loadData()
  } catch (error) {
    console.error('操作失败:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>
