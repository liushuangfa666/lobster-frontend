<template>
  <div class="min-h-screen flex flex-col">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-md sticky top-0 z-50">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <router-link to="/" class="flex items-center space-x-2">
            <span class="text-2xl">🦞</span>
            <span class="font-bold text-xl text-[#ff6b35]">龙虾交易平台</span>
          </router-link>

          <!-- 导航链接 -->
          <div class="hidden md:flex items-center space-x-6">
            <router-link to="/lobsters" class="text-gray-600 hover:text-[#ff6b35] transition-colors">
              龙虾市集
            </router-link>
            <router-link to="/tasks" class="text-gray-600 hover:text-[#ff6b35] transition-colors">
              任务大厅
            </router-link>
          </div>

          <!-- 用户菜单 -->
          <div class="flex items-center space-x-4">
            <template v-if="userStore.isLoggedIn">
              <router-link
                v-if="userStore.isDeveloper"
                to="/my-lobsters"
                class="text-gray-600 hover:text-[#ff6b35]"
              >
                我的龙虾
              </router-link>
              <router-link
                v-if="userStore.isAdmin"
                to="/admin"
                class="text-red-600 hover:text-red-700 font-medium"
              >
                管理后台
              </router-link>
              <router-link to="/user" class="text-gray-600 hover:text-[#ff6b35]">
                个人中心
              </router-link>
              <button
                @click="handleLogout"
                class="text-gray-600 hover:text-[#ff6b35]"
              >
                退出
              </button>
            </template>
            <template v-else>
              <router-link to="/login" class="text-gray-600 hover:text-[#ff6b35]">
                登录
              </router-link>
              <router-link to="/register" class="btn-primary">
                注册
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容区 -->
    <main class="flex-1">
      <router-view />
    </main>

    <!-- 页脚 -->
    <footer class="bg-gray-800 text-white py-8 mt-12">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 class="font-bold text-lg mb-4">关于我们</h3>
            <p class="text-gray-400">龙虾交易平台 - 专注OpenClaw智能体交易</p>
          </div>
          <div>
            <h3 class="font-bold text-lg mb-4">快速链接</h3>
            <ul class="space-y-2 text-gray-400">
              <li><router-link to="/lobsters" class="hover:text-white">龙虾市集</router-link></li>
              <li><router-link to="/tasks" class="hover:text-white">任务大厅</router-link></li>
            </ul>
          </div>
          <div>
            <h3 class="font-bold text-lg mb-4">帮助中心</h3>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white">常见问题</a></li>
              <li><a href="#" class="hover:text-white">联系客服</a></li>
            </ul>
          </div>
          <div>
            <h3 class="font-bold text-lg mb-4">开发者文档</h3>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white">API文档</a></li>
              <li><a href="#" class="hover:text-white">接入指南</a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2026 龙虾交易平台. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useUserStore } from './stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const handleLogout = () => {
  userStore.logout()
  router.push('/')
}
</script>
