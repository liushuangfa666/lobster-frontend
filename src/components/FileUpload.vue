<template>
  <div class="file-upload">
    <input
      type="file"
      ref="fileInput"
      @change="handleFileSelect"
      :accept="accept"
      class="file-input"
    />
    <div v-if="uploading" class="upload-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <span class="progress-text">上传中: {{ progress }}%</span>
    </div>
    <div v-if="uploaded && url" class="upload-result">
      <img v-if="isImage" :src="url" :alt="filename" class="preview-image" />
      <div v-else class="file-info">
        <span class="file-icon">📎</span>
        <a :href="url" target="_blank" class="file-link">{{ filename }}</a>
      </div>
      <button type="button" @click="removeFile" class="remove-btn">×</button>
    </div>
    <p v-if="hint" class="upload-hint">{{ hint }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { uploadAPI } from '../api/index.js'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  accept: {
    type: String,
    default: 'image/*,video/*,.pdf,.doc,.docx'
  },
  hint: {
    type: String,
    default: '支持 JPG、PNG、GIF、MP4、MOV、PDF、DOC、DOCX，最大 50MB'
  }
})

const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const uploading = ref(false)
const progress = ref(0)
const url = ref(props.modelValue)
const filename = ref('')

const uploaded = computed(() => !!url.value)
const isImage = computed(() => {
  if (!url.value) return false
  return /\.(jpg|jpeg|png|gif)$/i.test(url.value)
})

const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 验证文件大小
  if (file.size > 50 * 1024 * 1024) {
    ElMessage.error('文件大小超过50MB限制')
    event.target.value = ''
    return
  }

  uploading.value = true
  progress.value = 0
  filename.value = file.name

  try {
    const res = await uploadAPI.upload(file, (p) => {
      progress.value = p
    })
    url.value = res.url
    emit('update:modelValue', res.url)
    ElMessage.success('上传成功')
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败，请重试')
    url.value = ''
    filename.value = ''
  } finally {
    uploading.value = false
    event.target.value = ''
  }
}

const removeFile = () => {
  url.value = ''
  filename.value = ''
  progress.value = 0
  emit('update:modelValue', '')
}
</script>

<style scoped>
.file-upload {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-input {
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  width: 100%;
}

.upload-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #ff6b35;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}

.upload-result {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
  position: relative;
}

.preview-image {
  max-width: 200px;
  max-height: 150px;
  border-radius: 4px;
  object-fit: cover;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  font-size: 20px;
}

.file-link {
  color: #ff6b35;
  text-decoration: none;
  word-break: break-all;
}

.file-link:hover {
  text-decoration: underline;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border: none;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  line-height: 1;
}

.remove-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.upload-hint {
  font-size: 12px;
  color: #999;
  margin: 0;
}
</style>
