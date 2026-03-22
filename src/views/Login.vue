<template>
  <div class="min-h-[80vh] flex items-center justify-center py-12 px-4">
    <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
      <div class="text-center mb-8">
        <span class="text-4xl">🦞</span>
        <h1 class="text-2xl font-bold mt-2">登录龙虾交易平台</h1>
      </div>

      <!-- 标签页切换 -->
      <div class="flex border-b mb-6">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="switchTab(tab.key)"
          :class="[
            'flex-1 pb-3 text-center border-b-2 transition-colors text-sm',
            activeTab === tab.key
              ? 'border-[#ff6b35] text-[#ff6b35] font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- 密码登录 -->
      <div v-if="activeTab === 'password'">
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-gray-700 mb-2">用户名/手机号</label>
            <input
              v-model="form.username"
              type="text"
              class="input"
              placeholder="请输入用户名或手机号"
              required
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
            />
          </div>
          <div class="text-right">
            <router-link to="/forgot-password" class="text-sm text-gray-500 hover:text-[#ff6b35]">
              忘记密码？
            </router-link>
          </div>
          <button type="submit" class="btn-primary w-full" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>
      </div>

      <!-- 验证码登录 -->
      <div v-if="activeTab === 'sms'">
        <form @submit.prevent="handleSmsLogin" class="space-y-4">
          <div>
            <label class="block text-gray-700 mb-2">手机号</label>
            <input
              v-model="smsForm.phone"
              type="tel"
              class="input"
              placeholder="请输入手机号"
              maxlength="11"
              required
            />
          </div>
          <div>
            <label class="block text-gray-700 mb-2">验证码</label>
            <div class="flex gap-2">
              <input
                v-model="smsForm.code"
                type="text"
                class="input flex-1"
                placeholder="请输入6位验证码"
                maxlength="6"
                required
              />
              <button
                type="button"
                class="btn-outline text-sm px-3 whitespace-nowrap shrink-0"
                :disabled="smsCountdown > 0 || smsSending"
                @click="sendSmsLoginCode"
              >
                {{ smsCountdown > 0 ? `${smsCountdown}秒` : '获取验证码' }}
              </button>
            </div>
          </div>
          <button type="submit" class="btn-primary w-full" :disabled="smsLoading">
            {{ smsLoading ? '登录中...' : '登录' }}
          </button>
        </form>
      </div>

      <p class="text-center mt-6 text-gray-600">
        还没有账号？
        <router-link to="/register" class="text-[#ff6b35] hover:underline">
          立即注册
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { authAPI } from '../api'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeTab = ref('password')
const tabs = [
  { key: 'password', label: '密码登录' },
  { key: 'sms', label: '验证码登录' },
]

// 密码登录
const form = ref({ username: '', password: '' })
const loading = ref(false)

// 验证码登录
const smsForm = ref({ phone: '', code: '' })
const smsSending = ref(false)
const smsCountdown = ref(0)
const smsLoading = ref(false)
let smsCountdownTimer = null

onMounted(() => {
  // 如果 URL 有 sms_login 参数，自动切换到验证码登录 Tab
  if (route.query.sms_login === '1' && route.query.phone) {
    activeTab.value = 'sms'
    smsForm.value.phone = route.query.phone
  }
})

const switchTab = (key) => {
  activeTab.value = key
}

// 密码登录
const handleLogin = async () => {
  loading.value = true
  try {
    await userStore.login(form.value.username, form.value.password)
    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}

// 验证码登录 - 发送验证码
const sendSmsLoginCode = async () => {
  if (smsForm.value.phone.length !== 11) {
    ElMessage.error('请输入正确的11位手机号')
    return
  }
  smsSending.value = true
  try {
    await authAPI.sendResetPasswordSms({ phone: smsForm.value.phone })
    ElMessage.success('验证码已发送')
    smsCountdown.value = 60
    smsCountdownTimer = setInterval(() => {
      smsCountdown.value--
      if (smsCountdown.value <= 0) clearInterval(smsCountdownTimer)
    }, 1000)
  } catch (error) {
    console.error('发送验证码失败:', error)
  } finally {
    smsSending.value = false
  }
}

// 验证码登录 - 提交
const handleSmsLogin = async () => {
  if (smsForm.value.phone.length !== 11) {
    ElMessage.error('请输入正确的11位手机号')
    return
  }
  if (smsForm.value.code.length !== 6) {
    ElMessage.error('请输入6位验证码')
    return
  }
  smsLoading.value = true
  try {
    const res = await authAPI.smsLogin({
      phone: smsForm.value.phone,
      sms_code: smsForm.value.code,
    })
    userStore.token = res.access_token
    localStorage.setItem('token', res.access_token)
    await userStore.fetchUserInfo()
    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    if (error.response?.status === 404) {
      ElMessage.error('该手机号未注册，请先注册')
    }
    console.error('验证码登录失败:', error)
  } finally {
    smsLoading.value = false
  }
}
</script>
