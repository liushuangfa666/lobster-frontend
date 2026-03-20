import { ref, onUnmounted } from 'vue'

const API_BASE = import.meta.env.VITE_API_URL || ''
const WS_BASE = API_BASE.replace(/^http/, 'ws')

/**
 * WebSocket 客户端 Hook
 * @param {number} userId - 用户 ID
 * @param {string} token - JWT token
 * @param {Function} onTaskStatusChanged - 任务状态变更回调
 * @param {Function} onExecutionLog - 执行日志回调
 * @returns {Object} { ws, logs, connected, connect, disconnect }
 */
export function useWebSocket(userId, token, onTaskStatusChanged, onExecutionLog) {
  const ws = ref(null)
  const logs = ref([])
  const connected = ref(false)
  let reconnectTimer = null
  let reconnectAttempts = 0
  const MAX_RECONNECT_ATTEMPTS = 5
  const RECONNECT_DELAY = 3000

  function getWsUrl() {
    const base = WS_BASE || 'ws://localhost:8000'
    return `${base}/ws/${userId}?token=${encodeURIComponent(token)}`
  }

  function connect() {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      return
    }

    try {
      ws.value = new WebSocket(getWsUrl())

      ws.value.onopen = () => {
        connected.value = true
        reconnectAttempts = 0
        console.log('[WebSocket] 连接成功')
      }

      ws.value.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleMessage(data)
        } catch (e) {
          console.error('[WebSocket] 消息解析失败:', e)
        }
      }

      ws.value.onclose = (event) => {
        connected.value = false
        console.log(`[WebSocket] 连接关闭: code=${event.code}, reason=${event.reason || '无'}`)
        scheduleReconnect()
      }

      ws.value.onerror = (error) => {
        console.error('[WebSocket] 错误:', error)
        connected.value = false
      }
    } catch (e) {
      console.error('[WebSocket] 创建连接失败:', e)
      scheduleReconnect()
    }
  }

  function handleMessage(data) {
    switch (data.type) {
      case 'connected':
        console.log('[WebSocket] 已连接:', data)
        break

      case 'pong':
        // 心跳响应，忽略
        break

      case 'task_status_changed':
        logs.value.push({
          type: 'status',
          task_id: data.task_id,
          status: data.status,
          previous_status: data.previous_status,
          timestamp: data.timestamp,
          message: getStatusMessage(data.status, data.previous_status)
        })
        if (onTaskStatusChanged) {
          onTaskStatusChanged(data)
        }
        break

      case 'execution_log':
        logs.value.push({
          type: 'log',
          task_id: data.task_id,
          log: data.log,
          timestamp: data.timestamp,
          source: data.source || 'unknown'
        })
        if (onExecutionLog) {
          onExecutionLog(data)
        }
        break

      default:
        console.log('[WebSocket] 未知消息类型:', data.type, data)
    }
  }

  function getStatusMessage(newStatus, previousStatus) {
    const statusMap = {
      0: '待选择龙虾',
      1: '待执行',
      2: '执行中',
      3: '已完成',
      4: '已取消',
      5: '待更换'
    }
    return `任务状态变更: ${statusMap[previousStatus] || previousStatus} → ${statusMap[newStatus] || newStatus}`
  }

  function scheduleReconnect() {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.log('[WebSocket] 达到最大重连次数，停止重连')
      return
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
    }
    reconnectAttempts++
    console.log(`[WebSocket] ${RECONNECT_DELAY * reconnectAttempts / 1000}秒后尝试第${reconnectAttempts}次重连...`)
    reconnectTimer = setTimeout(() => {
      connect()
    }, RECONNECT_DELAY * reconnectAttempts)
  }

  function disconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    reconnectAttempts = MAX_RECONNECT_ATTEMPTS // 防止 onclose 触发重连
    if (ws.value) {
      ws.value.close(1000, '用户主动断开')
      ws.value = null
    }
    connected.value = false
  }

  function send(data) {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(data))
    } else {
      console.warn('[WebSocket] 连接未打开，无法发送消息')
    }
  }

  function ping() {
    send('ping')
  }

  // 组件卸载时自动断开
  onUnmounted(() => {
    disconnect()
  })

  return {
    ws,
    logs,
    connected,
    connect,
    disconnect,
    send,
    ping
  }
}

// 独立的日志格式化工具
export function formatLog(log) {
  if (!log) return ''
  if (typeof log === 'string') return log
  if (log.log) return `[${new Date(log.timestamp).toLocaleTimeString()}] ${log.log}`
  return JSON.stringify(log)
}

// 状态文本映射
export const STATUS_TEXT = {
  0: '待选择龙虾',
  1: '待执行',
  2: '执行中',
  3: '已完成',
  4: '已取消',
  5: '待更换'
}

// 状态样式映射
export const STATUS_CLASS = {
  0: 'bg-gray-100 text-gray-600',
  1: 'bg-blue-100 text-blue-600',
  2: 'bg-yellow-100 text-yellow-600',
  3: 'bg-green-100 text-green-600',
  4: 'bg-red-100 text-red-600',
  5: 'bg-orange-100 text-orange-600'
}
