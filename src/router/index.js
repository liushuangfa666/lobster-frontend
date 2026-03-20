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
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
