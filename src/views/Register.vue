<template>
  <div class="min-h-[80vh] flex items-center justify-center py-12 px-4">
    <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
      <div class="text-center mb-8">
        <span class="text-4xl">🦞</span>
        <h1 class="text-2xl font-bold mt-2">注册龙虾交易平台</h1>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-gray-700 mb-2">用户名</label>
          <input
            v-model="form.username"
            type="text"
            class="input"
            placeholder="请输入用户名"
            required
            minlength="3"
            maxlength="50"
          />
        </div>
        <div>
          <label class="block text-gray-700 mb-2">邮箱</label>
          <input
            v-model="form.email"
            type="email"
            class="input"
            placeholder="请输入邮箱（可选）"
          />
        </div>
        <div>
          <label class="block text-gray-700 mb-2">密码</label>
          <input
            v-model="form.password"
            type="password"
            class="input"
            placeholder="请输入密码"
            required
            minlength="6"
          />
        </div>
        <div>
          <label class="block text-gray-700 mb-2">手机号</label>
          <input
            v-model="form.phone"
            type="tel"
            class="input"
            placeholder="请输入手机号（可选）"
          />
        </div>
        <button type="submit" class="btn-primary w-full" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>

      <p class="text-center mt-6 text-gray-600">
        已有账号？
        <router-link to="/login" class="text-[#ff6b35] hover:underline">
          立即登录
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '../api'
import { ElMessage } from 'element-plus'

const router = useRouter()

const form = ref({
  username: '',
  email: '',
  password: '',
  phone: '',
})
const loading = ref(false)

const handleRegister = async () => {
  if (form.value.password.length < 6) {
    ElMessage.error('密码至少6位')
    return
  }
  loading.value = true
  try {
    const data = {}
    if (form.value.username) data.username = form.value.username
    if (form.value.password) data.password = form.value.password
    if (form.value.email) data.email = form.value.email
    if (form.value.phone) data.phone = form.value.phone
    await authAPI.register(data)
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (error) {
    console.error('注册失败:', error)
  } finally {
    loading.value = false
  }
}
</script>
