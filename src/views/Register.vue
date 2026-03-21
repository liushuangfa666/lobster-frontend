<template>
  <div class="min-h-[80vh] flex items-center justify-center py-12 px-4">
    <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
      <div class="text-center mb-8">
      <span class="text-4xl">🦞</span>
        <h1 class="text-2xl font-bold mt-2">注册龙虾交易平台</h1>
      </div>

      <!-- 第一步：填写基本信息 -->
      <div v-if="step === 1" class="space-y-4">
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
        <div>
          <label class="block text-gray-700 mb-2">手机号 *</label>
          <div class="flex gap-2">
            <input
              v-model="form.phone"
              type="tel"
              class="input flex-1"
              placeholder="请输入手机号"
              maxlength="11"
            />
            <button
              type="button"
              class="btn-outline text-sm px-3 whitespace-nowrap"
              :disabled="countdown > 0 || sendingCode"
              @click="sendCode"
            >
              {{ countdown > 0 ? `${countdown}秒后重发` : '获取验证码' }}
            </button>
          </div>
          <p v-if="codeSent" class="text-green-600 text-sm mt-1">验证码已发送，请查收短信</p>
        </div>
        <button type="button" class="btn-primary w-full" :disabled="!canProceedStep1" @click="step = 2">
          下一步
        </button>
      </div>

      <!-- 第二步：填写验证码 -->
      <div v-if="step === 2" class="space-y-4">
        <div class="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
          验证码已发送至 <span class="font-bold">{{ form.phone }}</span>，请输入6位验证码
        </div>
        <div>
          <label class="block text-gray-700 mb-2">验证码 *</label>
          <input
            v-model="form.sms_code"
            type="text"
            class="input"
            placeholder="请输入6位验证码"
            maxlength="6"
          />
        </div>
        <div class="flex gap-2">
          <button type="button" class="btn-outline flex-1" @click="step = 1">
            上一步
          </button>
          <button type="button" class="btn-primary flex-1" :disabled="loading" @click="handleRegister">
            {{ loading ? '注册中...' : '完成注册' }}
          </button>
        </div>
      </div>

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
import { ref, computed } from 'vue'
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
const step = ref(1)
const loading = ref(false)
const sendingCode = ref(false)
const codeSent = ref(false)
const countdown = ref(0)

let countdownTimer = null

const canProceedStep1 = computed(() => {
  return form.value.username.length >= 3 &&
    form.value.password.length >= 6 &&
    form.value.phone.length === 11
})

const sendCode = async () => {
  if (!canProceedStep1.value) {
    ElMessage.error('请填写完整的用户名、密码和手机号')
    return
  }

  sendingCode.value = true
  try {
    const res = await authAPI.sendRegisterSms({
      username: form.value.username,
      password: form.value.password,
      phone: form.value.phone,
    })
    codeSent.value = true
    ElMessage.success('验证码已发送')
    countdown.value = 60
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

const handleRegister = async () => {
  if (form.value.sms_code.length !== 6) {
    ElMessage.error('请输入6位验证码')
    return
  }

  loading.value = true
  try {
    const res = await authAPI.smsRegister({
      username: form.value.username,
      password: form.value.password,
      phone: form.value.phone,
      sms_code: form.value.sms_code,
    })
    ElMessage.success('注册成功！')
    // 保存 token
    localStorage.setItem('token', res.access_token)
    // 跳转首页
    router.push('/')
    // 刷新页面
    window.location.reload()
  } catch (error) {
    console.error('注册失败:', error)
  } finally {
    loading.value = false
  }
}
</script>
