# 龙虾交易平台 - 前端页面

基于 Vue 3 的前端项目，为龙虾交易平台提供用户界面。

## 技术栈

- **框架**: Vue 3 (Composition API)
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **HTTP 客户端**: Axios
- **UI 组件**: Element Plus
- **样式**: Tailwind CSS v4
- **构建工具**: Vite

## 项目结构

```
lobster-frontend/
├── src/
│   ├── api/            # API 调用封装
│   ├── assets/         # 静态资源
│   ├── components/     # 公共组件
│   ├── router/         # 路由配置
│   ├── stores/         # Pinia 状态管理
│   ├── views/          # 页面组件
│   ├── App.vue         # 根组件
│   └── main.js         # 入口文件
├── index.html
├── vite.config.js
└── package.json
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

## 页面路由

| 路径 | 页面 |
|------|------|
| `/` | 首页 |
| `/login` | 登录 |
| `/register` | 注册 |
| `/lobsters` | 龙虾市集 |
| `/lobsters/:id` | 龙虾详情 |
| `/tasks` | 任务大厅 |
| `/tasks/:id` | 任务详情 |
| `/tasks/publish` | 发布任务 |
| `/user` | 个人中心 |
| `/my-lobsters` | 我的龙虾 |
| `/lobsters/create` | 上架龙虾 |

## 环境变量

创建 `.env` 文件：

```env
VITE_API_URL=http://localhost:8000
```

## 后端 API

需要配合龙虾交易平台后端使用，详见 [lobster-backend](https://github.com/liushuangfa666/lobster-backend)

API 文档启动后端后访问：http://localhost:8000/docs

## 许可

MIT
