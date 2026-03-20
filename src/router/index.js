import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import LobsterMarket from '../views/LobsterMarket.vue'
import LobsterDetail from '../views/LobsterDetail.vue'
import TaskHall from '../views/TaskHall.vue'
import TaskDetail from '../views/TaskDetail.vue'
import UserCenter from '../views/UserCenter.vue'
import MyLobsters from '../views/MyLobsters.vue'
import CreateLobster from '../views/CreateLobster.vue'
import PublishTask from '../views/PublishTask.vue'
import AdminPanel from '../views/AdminPanel.vue'
import AdminDashboard from '../views/admin/Dashboard.vue'
import AdminLobsterAudit from '../views/admin/LobsterAudit.vue'
import AdminWithdrawAudit from '../views/admin/WithdrawAudit.vue'
import AdminUserManage from '../views/admin/UserManage.vue'
import { useUserStore } from '../stores/user'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/lobsters', name: 'LobsterMarket', component: LobsterMarket },
  { path: '/lobsters/:id', name: 'LobsterDetail', component: LobsterDetail },
  { path: '/tasks', name: 'TaskHall', component: TaskHall },
  { path: '/tasks/:id', name: 'TaskDetail', component: TaskDetail },
  { path: '/user', name: 'UserCenter', component: UserCenter },
  { path: '/my-lobsters', name: 'MyLobsters', component: MyLobsters },
  { path: '/lobsters/create', name: 'CreateLobster', component: CreateLobster },
  { path: '/tasks/publish', name: 'PublishTask', component: PublishTask },
  // 管理员页面
  {
    path: '/admin',
    component: AdminPanel,
    redirect: '/admin/dashboard',
    meta: { requiresAdmin: true },
    children: [
      { path: 'dashboard', name: 'AdminDashboard', component: AdminDashboard },
      { path: 'lobsters', name: 'AdminLobsterAudit', component: AdminLobsterAudit },
      { path: 'withdraws', name: 'AdminWithdrawAudit', component: AdminWithdrawAudit },
      { path: 'users', name: 'AdminUserManage', component: AdminUserManage },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.meta.requiresAdmin) {
    // 管理员路由守卫
    const userStore = useUserStore()
    if (!userStore.isAdmin) {
      next('/')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
