<template>
  <div class="min-h-[80vh] flex items-center justify-center py-12 px-4">
    <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
      <div class="text-center mb-8">
        <span class="text-4xl">🦞</span>
        <h1 class="text-2xl font-bold mt-2">忘记密码</h1>
      </div>

      <!-- 步骤1：输入手机号 -->
      <div v-if="step === 1">
        <div class="mb-6">
          <label class="block text-gray-700 mb-2">手机号</label>
          <input
            v-model="form.phone"
            type="tel"
            class="input"
            placeholder="请输入注册时的手机号"
            maxlength="11"
          />
        </div>
        <div class="mb-6">
          <label class="block text-gray-700 mb-2">验证码</label>
          <div class="flex gap-2">
            <input
              v-model="form.code"
              type="text"
              class="input flex-1"
              placeholder="请输入6位验证码"
              maxlength="6"
            />
            <button
              class="btn-outline text-sm px-3 whitespace-nowrap shrink-0"
              :disabled="countdown > 0 || sending"
              @click="sendCode"
            >
              {{ countdown > 0 ? `${countdown}秒` : '获取验证码' }}
            </button>
          </div>
        </div>
        <button
          class="btn-primary w-full"
          :disabled="form.phone.length !== 11 || form.code.length !== 6 || loading"
          @click="nextStep"
        >
          {{ loading ? '验证中...' : '下一步' }}
        </button>
        <p class="text-center mt-6">
          <button @click="$router.push('/login')" class="text-[#ff6b35] hover:underline">
            返回登录
          </button>
        </p>
      </div>

      <!-- 步骤2：设置新密码 -->
      <div v-if="step === 2">
        <div class="bg-blue-50 rounded-lg p-3 text-sm text-blue-700 mb-6">
          验证码已通过，请设置新密码
        </div>
        <div class="mb-6">
          <label class="block text-gray-700 mb-2">新密码</label>
          <input
            v-model="form.new_password"
            type="password"
            class="input"
            placeholder="请输入新密码（至少6位）"
          />
        </div>
        <div class="mb-6">
          <label class="block text-gray-700 mb-2">确认密码</label>
          <input
            v-model="form.confirm_password"
            type="password"
            class="input"
            placeholder="请再次输入新密码"
          />
          <p v-if="form.confirm_password && form.new_password !== form.confirm_password" class="text-red-500 text-sm mt-1">
            两次密码输入不一致
          </p>
        </div>
        <button
          class="btn-primary w-full"
          :disabled="form.new_password.length < 6 || form.new_password !== form.confirm_password || loading"
          @click="handleReset"
        >
          {{ loading ? '设置中...' : '确认设置' }}
        </button>
        <p class="text-center mt-6">
          <button @click="$router.push('/login')" class="text-[#ff6b35] hover:underline">
            返回登录
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '../api'
import { ElMessage } from 'element-plus'

const router = useRouter()

const step = ref(1)
const form = ref({ phone: '', code: '', new_password: '', confirm_password: '' })
const sending = ref(false)
const countdown = ref(0)
const loading = ref(false)
let countdownTimer = null

const sendCode = async () => {
  if (form.value.phone.length !== 11) {
    ElMessage.error('请输入正确的11位手机号')
    return
  }
  sending.value = true
  try {
    await authAPI.sendResetPasswordSms({ phone: form.value.phone })
    ElMessage.success('验证码已发送')
    countdown.value = 60
    countdownTimer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(countdownTimer)
    }, 1000)
  } catch (error) {
    console.error('发送验证码失败:', error)
  } finally {
    sending.value = false
  }
}

const nextStep = async () => {
  if (form.value.phone.length !== 11 || form.value.code.length !== 6) {
    ElMessage.error('请填写完整信息')
    return
  }
  loading.value = true
  try {
    // 只验证验证码，不重置密码
    await authAPI.resetPassword({
      phone: form.value.phone,
      sms_code: form.value.code,
    })
    step.value = 2
  } catch (error) {
    ElMessage.error('验证码错误')
  } finally {
    loading.value = false
  }
}

const handleReset = async () => {
  if (form.value.new_password.length < 6) {
    ElMessage.error('密码长度不能少于6位')
    return
  }
  if (form.value.new_password !== form.value.confirm_password) {
    ElMessage.error('两次密码输入不一致')
    return
  }
  loading.value = true
  try {
    await authAPI.resetPassword({
      phone: form.value.phone,
      sms_code: form.value.code,
      new_password: form.value.new_password,
    })
    ElMessage.success('密码重置成功，请使用新密码登录')
    router.push('/login')
  } catch (error) {
    ElMessage.error('重置失败，请重试')
    console.error('重置密码失败:', error)
  } finally {
    loading.value = false
  }
}
</script>
