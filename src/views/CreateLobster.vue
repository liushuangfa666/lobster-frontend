<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">{{ isEdit ? '编辑龙虾' : '上架新龙虾' }}</h1>

    <div class="bg-white rounded-xl shadow-md p-6 max-w-2xl">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label class="block text-gray-700 mb-2">龙虾名称 *</label>
          <input
            v-model="form.name"
            type="text"
            class="input"
            placeholder="如：K8s巡检龙虾"
            required
          />
        </div>

        <div>
          <label class="block text-gray-700 mb-2">标签 *</label>
          <div class="flex flex-wrap gap-2 mb-2">
            <span
              v-for="tag in availableTags"
              :key="tag"
              @click="toggleTag(tag)"
              :class="[
                'px-3 py-1 rounded-full text-sm cursor-pointer transition-colors',
                form.tags.includes(tag) ? 'bg-[#ff6b35] text-white' : 'bg-gray-100 hover:bg-gray-200'
              ]"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <div>
          <label class="block text-gray-700 mb-2">价格类型 *</label>
          <select v-model="form.price_type" class="input">
            <option :value="0">一次性购买</option>
            <option :value="1">月费</option>
            <option :value="2">年费</option>
            <option :value="3">按任务计费</option>
          </select>
        </div>

        <div>
          <label class="block text-gray-700 mb-2">
            {{ form.price_type === 3 ? '每次任务价格' : '价格' }} *
          </label>
          <input
            v-if="form.price_type === 3"
            v-model.number="form.task_price"
            type="number"
            step="0.01"
            min="0"
            class="input"
            placeholder="请输入每次任务价格"
            required
          />
          <input
            v-else
            v-model.number="form.price"
            type="number"
            step="0.01"
            min="0"
            class="input"
            placeholder="请输入价格"
            required
          />
        </div>

        <div>
          <label class="block text-gray-700 mb-2">能力描述 *</label>
          <textarea
            v-model="form.description"
            class="input"
            rows="6"
            placeholder="详细描述龙虾的核心能力、适用场景、执行效果..."
            required
          ></textarea>
        </div>

        <div>
          <label class="block text-gray-700 mb-2">演示视频/截图</label>
          <FileUpload v-model="form.demo_url" accept="image/*,video/*" hint="支持图片或视频，最大50MB" />
        </div>

        <div>
          <label class="block text-gray-700 mb-2">SDK/API地址</label>
          <input
            v-model="form.sdk_url"
            type="url"
            class="input"
            placeholder="用于接收任务回传的SDK地址"
          />
        </div>

        <div class="pt-4">
          <button type="submit" class="btn-primary w-full" :disabled="loading">
            {{ loading ? '提交中...' : (isEdit ? '保存修改' : '提交审核') }}
          </button>
          <p v-if="!isEdit" class="text-gray-500 text-sm text-center mt-2">
            提交后将自动进入审核流程，审核通过后即可上架
          </p>
          <button
            v-if="isEdit"
            type="button"
            class="btn-secondary bg-red-500 hover:bg-red-600 w-full mt-3"
            :disabled="loading"
            @click="handleDelete"
          >
            删除龙虾
          </button>
          <button
            v-if="isEdit && lobsterDetail.status !== undefined && lobsterDetail.status === 1"
            type="button"
            class="btn-outline w-full mt-3"
            :disabled="loading"
            @click="handleToggleStatus(2)"
          >
            下架龙虾
          </button>
          <button
            v-if="isEdit && lobsterDetail.status !== undefined && lobsterDetail.status === 2"
            type="button"
            class="btn-primary w-full mt-3"
            :disabled="loading"
            @click="handleToggleStatus(1)"
          >
            上架龙虾
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { lobsterAPI, authAPI, silentApi } from '../api'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
import FileUpload from '../components/FileUpload.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const availableTags = ['运维', '数据', '开发', '办公', 'K8s', 'Python', '脚本', '自动化']
const isEdit = computed(() => !!route.query.id)
const editId = computed(() => route.query.id)
const lobsterDetail = ref({})

const form = reactive({
  name: '',
  tags: [],
  price_type: 3,
  price: 0,
  task_price: 99,
  description: '',
  demo_url: '',
  sdk_url: '',
})

const toggleTag = (tag) => {
  const index = form.tags.indexOf(tag)
  if (index > -1) {
    form.tags.splice(index, 1)
  } else {
    form.tags.push(tag)
  }
}

const handleSubmit = async () => {
  if (!form.name.trim()) {
    ElMessage.error('请输入龙虾名称')
    return
  }
  if (form.tags.length === 0) {
    ElMessage.error('请选择至少一个标签')
    return
  }
  if (!form.description.trim()) {
    ElMessage.error('请输入能力描述')
    return
  }

  loading.value = true
  try {
    if (isEdit.value) {
      // 编辑模式
      await lobsterAPI.update(editId.value, {
        name: form.name,
        tags: form.tags.join(','),
        price_type: form.price_type,
        price: form.price_type === 3 ? 0 : form.price,
        task_price: form.price_type === 3 ? form.task_price : undefined,
        description: form.description,
        demo_url: form.demo_url || undefined,
        sdk_url: form.sdk_url || undefined,
      })
      ElMessage.success('龙虾修改成功！')
      router.push('/my-lobsters')
    } else {
      // 新建模式
      await lobsterAPI.create({
        name: form.name,
        tags: form.tags.join(','),
        price_type: form.price_type,
        price: form.price_type === 3 ? 0 : form.price,
        task_price: form.price_type === 3 ? form.task_price : undefined,
        description: form.description,
        demo_url: form.demo_url || undefined,
        sdk_url: form.sdk_url || undefined,
      })
      ElMessage.success('龙虾创建成功！')

      // 检查是否可以升级为开发者
      const checkRes = await authAPI.checkUpgrade()
      if (checkRes.can_upgrade) {
        try {
          await authAPI.upgradeToDeveloper()
          ElMessage.success('恭喜！你已成为开发者！')
        } catch (error) {
          // 可能是已经升级了，忽略错误
          if (error?.response?.data?.detail !== '已经是开发者') {
            throw error
          }
        }
        await userStore.fetchUserInfo()
      } else {
        ElMessage.info('龙虾已提交审核，审核通过后即可上架')
      }

      router.push('/my-lobsters')
    }
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (isEdit.value) {
    // 加载龙虾数据进行编辑
    try {
      const res = await lobsterAPI.getDetail(editId.value)
      lobsterDetail.value = res
      form.name = res.name || ''
      form.tags = res.tags ? res.tags.split(',') : []
      form.price_type = res.price_type ?? 3
      form.price = res.price || 0
      form.task_price = res.task_price || 99
      form.description = res.description || ''
      form.demo_url = res.demo_url || ''
      form.sdk_url = res.sdk_url || ''
    } catch (error) {
      console.error('加载龙虾详情失败:', error)
      ElMessage.error('加载龙虾信息失败')
      router.push('/my-lobsters')
    }
  }
})

const handleDelete = async () => {
  if (!confirm('确定要删除这个龙虾吗？')) return
  loading.value = true
  try {
    await lobsterAPI.delete(editId.value)
    ElMessage.success('龙虾已删除')
    router.push('/my-lobsters')
  } catch (error) {
    console.error('删除失败:', error)
  } finally {
    loading.value = false
  }
}

const handleToggleStatus = async (newStatus) => {
  loading.value = true
  try {
    if (newStatus === 2) {
      await silentApi.post(`/api/lobsters/${editId.value}/unlist`)
      ElMessage.success('龙虾已下架')
    } else {
      await lobsterAPI.update(editId.value, { status: newStatus })
      ElMessage.success('龙虾已上架')
    }
    // 刷新详情
    const res = await lobsterAPI.getDetail(editId.value)
    lobsterDetail.value = res
  } catch (error) {
    console.error('操作失败:', error)
  } finally {
    loading.value = false
  }
}
</script>
