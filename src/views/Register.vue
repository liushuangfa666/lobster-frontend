<template>
  <div class="min-h-[80vh] flex items-center justify-center py-12 px-4">
    <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
      <div class="text-center mb-8">
        <span class="text-4xl">🦞</span>
        <h1 class="text-2xl font-bold mt-2">注册龙虾交易平台</h1>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <!-- 用户名 -->
        <div>
          <label class="block text-gray-700 mb-2">用户名 *</label>
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

        <!-- 密码 -->
        <div>
          <label class="block text-gray-700 mb-2">密码 *</label>
          <input
            v-model="form.password"
            type="password"
            class="input"
            placeholder="请输入密码"
            required
            minlength="6"
          />
        </div>

        <!-- 手机号 -->
        <div>
          <label class="block text-gray-700 mb-2">手机号 *</label>
          <input
            v-model="form.phone"
            type="tel"
            class="input"
            placeholder="请输入手机号"
            maxlength="11"
            required
          />
        </div>

        <!-- 验证码（同一行显示） -->
        <div>
          <label class="block text-gray-700 mb-2">验证码 *</label>
          <div class="flex gap-2">
            <input
              v-model="form.sms_code"
              type="text"
              class="input flex-1"
              placeholder="请输入6位验证码"
              maxlength="6"
              required
            />
            <button
              type="button"
              class="btn-outline text-sm px-3 whitespace-nowrap shrink-0"
              :disabled="countdown > 0 || sendingCode"
              @click="sendCode"
            >
              {{ countdown > 0 ? `${countdown}秒` : '获取验证码' }}
            </button>
          </div>
          <p v-if="sendSuccess" class="text-green-600 text-sm mt-1">
            验证码已发送，请在{{ expireMinutes }}分钟内完成注册
          </p>
        </div>

        <!-- 提交按钮 -->
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
  password: '',
  phone: '',
  sms_code: '',
})
const loading = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)
const sendSuccess = ref(false)
const expireMinutes = ref(5)

let countdownTimer = null

const handleRegister = async () => {
  if (form.value.phone.length !== 11) {
    ElMessage.error('请输入正确的11位手机号')
    return
  }
  if (form.value.sms_code.length !== 6) {
    ElMessage.error('请输入6位验证码')
    return
  }

  loading.value = true
  try {
    const res = await authAPI.smsRegister({
      phone: form.value.phone,
      sms_code: form.value.sms_code,
    })
    ElMessage.success('注册成功！')
    localStorage.setItem('token', res.access_token)
    router.push('/')
  } catch (error) {
    console.error('注册失败:', error)
  } finally {
    loading.value = false
  }
}

const sendCode = async () => {
  if (form.value.username.length < 3) {
    ElMessage.error('请先输入用户名（至少3个字符）')
    return
  }
  if (form.value.password.length < 6) {
    ElMessage.error('请先输入密码（至少6位）')
    return
  }
  if (form.value.phone.length !== 11) {
    ElMessage.error('请输入正确的11位手机号')
    return
  }

  sendingCode.value = true
  try {
    await authAPI.sendRegisterSms({
      username: form.value.username,
      password: form.value.password,
      phone: form.value.phone,
    })
    sendSuccess.value = true
    ElMessage.success('验证码已发送')
    countdown.value = 60
    expireMinutes.value = 5
    countdownTimer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(countdownTimer)
      }
    }, 1000)
  } catch (error) {
    console.error('发送验证码失败:', error)
  } finally {
    sendingCode.value = false
  }
}
</script>
