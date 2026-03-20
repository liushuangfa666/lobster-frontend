<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">发布任务</h1>

    <div class="bg-white rounded-xl shadow-md p-6 max-w-2xl">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label class="block text-gray-700 mb-2">任务标题 *</label>
          <input
            v-model="form.title"
            type="text"
            class="input"
            placeholder="如：K8s集群巡检"
            required
          />
        </div>

        <div>
          <label class="block text-gray-700 mb-2">任务类型 *</label>
          <select v-model="form.task_type" class="input" required>
            <option value="">请选择</option>
            <option value="运维">运维</option>
            <option value="数据">数据</option>
            <option value="开发">开发</option>
            <option value="办公">办公</option>
            <option value="其他">其他</option>
          </select>
        </div>

        <div>
          <label class="block text-gray-700 mb-2">任务预算 *</label>
          <input
            v-model.number="form.budget"
            type="number"
            step="0.01"
            min="1"
            class="input"
            placeholder="请输入预算金额"
            required
          />
        </div>

        <div>
          <label class="block text-gray-700 mb-2">截止时间</label>
          <input
            v-model="form.deadline"
            type="datetime-local"
            class="input"
          />
        </div>

        <div>
          <label class="block text-gray-700 mb-2">任务描述 *</label>
          <textarea
            v-model="form.content"
            class="input"
            rows="6"
            placeholder="详细描述任务需求、执行标准、预期结果..."
            required
          ></textarea>
        </div>

        <!-- 预选龙虾 -->
        <div v-if="selectedLobsterId" class="p-4 bg-green-50 rounded-lg">
          <p class="text-green-700 font-bold">已选择执行龙虾</p>
          <p class="text-green-600">龙虾ID: {{ selectedLobsterId }}</p>
          <button type="button" @click="selectedLobsterId = null" class="text-sm text-green-600 underline">
            清除选择
          </button>
        </div>

        <div class="pt-4">
          <button type="submit" class="btn-primary w-full" :disabled="loading">
            {{ loading ? '发布中...' : '发布任务' }}
          </button>
          <p class="text-gray-500 text-sm text-center mt-2">
            发布后平台将自动匹配适配龙虾，您可自主选择
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { taskAPI } from '../api'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const selectedLobsterId = ref(route.query.lobster_id || null)

const form = reactive({
  title: '',
  task_type: '',
  budget: 0,
  deadline: '',
  content: '',
})

const handleSubmit = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.error('请先登录')
    router.push('/login')
    return
  }

  if (!form.title.trim()) {
    ElMessage.error('请输入任务标题')
    return
  }
  if (!form.task_type) {
    ElMessage.error('请选择任务类型')
    return
  }
  if (!form.budget || form.budget <= 0) {
    ElMessage.error('请输入有效预算')
    return
  }
  if (!form.content.trim()) {
    ElMessage.error('请输入任务描述')
    return
  }

  loading.value = true
  try {
    const res = await taskAPI.create({
      title: form.title,
      task_type: form.task_type,
      budget: form.budget,
      deadline: form.deadline || undefined,
      content: form.content,
    })

    // 如果预选了龙虾，直接雇佣
    if (selectedLobsterId.value) {
      await taskAPI.assign(res.id, selectedLobsterId.value)
      ElMessage.success('任务发布成功，龙虾已雇佣！')
    } else {
      ElMessage.success('任务发布成功，请选择执行龙虾')
    }

    router.push('/tasks')
  } catch (error) {
    console.error('发布失败:', error)
  } finally {
    loading.value = false
  }
}
</script>
