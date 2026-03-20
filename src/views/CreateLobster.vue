<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">上架新龙虾</h1>

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
            v-model.number="form.price_type === 3 ? form.task_price : form.price"
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
          <label class="block text-gray-700 mb-2">演示视频/截图URL</label>
          <input
            v-model="form.demo_url"
            type="url"
            class="input"
            placeholder="https://..."
          />
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
            {{ loading ? '提交中...' : '提交审核' }}
          </button>
          <p class="text-gray-500 text-sm text-center mt-2">
            提交后将自动进入审核流程，审核通过后即可上架
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { lobsterAPI } from '../api'
import { ElMessage } from 'element-plus'

const router = useRouter()

const loading = ref(false)
const availableTags = ['运维', '数据', '开发', '办公', 'K8s', 'Python', '脚本', '自动化']

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
    ElMessage.success('提交成功，等待审核')
    router.push('/my-lobsters')
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    loading.value = false
  }
}
</script>
