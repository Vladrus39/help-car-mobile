<template>
  <div 
    v-if="preview && !preview.error" 
    class="link-preview mt-2 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 transition-all cursor-pointer"
    @click="openLink"
  >
    <!-- Preview Image -->
    <div v-if="preview.image" class="relative">
      <img 
        :src="preview.image" 
        :alt="preview.title"
        class="w-full h-32 object-cover"
        @error="handleImageError"
      >
      <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
    </div>
    
    <!-- Content -->
    <div class="p-3">
      <!-- Favicon + Site name -->
      <div class="flex items-center gap-2 mb-1">
        <img 
          v-if="preview.favicon"
          :src="preview.favicon"
          class="w-4 h-4 rounded"
          @error="(e) => e.target.style.display = 'none'"
        >
        <span class="text-xs text-gray-500 dark:text-gray-400 truncate">
          {{ preview.siteName || getDomain(url) }}
        </span>
      </div>
      
      <!-- Title -->
      <h4 class="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 mb-1">
        {{ preview.title || 'Ссылка' }}
      </h4>
      
      <!-- Description -->
      <p 
        v-if="preview.description" 
        class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2"
      >
        {{ preview.description }}
      </p>
    </div>
  </div>
  
  <!-- Loading state -->
  <div 
    v-else-if="isLoading" 
    class="link-preview-loading mt-2 p-3 rounded-xl border border-gray-200 dark:border-gray-600 animate-pulse"
  >
    <div class="flex items-center gap-2 mb-2">
      <div class="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
      <div class="w-24 h-3 bg-gray-200 dark:bg-gray-600 rounded"></div>
    </div>
    <div class="w-full h-4 bg-gray-200 dark:bg-gray-600 rounded mb-1"></div>
    <div class="w-2/3 h-3 bg-gray-200 dark:bg-gray-600 rounded"></div>
  </div>
  
  <!-- Simple URL fallback (on error or no preview) -->
  <a 
    v-else-if="url && !isLoading"
    :href="url"
    target="_blank"
    rel="noopener noreferrer"
    class="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 hover:underline text-sm mt-1"
    @click.stop
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
    </svg>
    {{ getDomain(url) }}
  </a>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { apiService } from '@/services/api'

const props = defineProps({
  url: {
    type: String,
    required: true
  }
})

const preview = ref(null)
const isLoading = ref(false)
const hasImage = ref(true)

// Локальный кэш превью
const previewCache = new Map()

async function fetchPreview() {
  if (!props.url) return
  
  // Проверка кэша
  if (previewCache.has(props.url)) {
    preview.value = previewCache.get(props.url)
    return
  }
  
  try {
    isLoading.value = true
    const response = await apiService.getLinkPreview(props.url)
    
    if (response.success && response.data) {
      preview.value = response.data
      previewCache.set(props.url, response.data)
    }
  } catch (error) {
    console.warn('Failed to fetch link preview:', error)
    preview.value = null
  } finally {
    isLoading.value = false
  }
}

function getDomain(url) {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

function openLink() {
  window.open(props.url, '_blank', 'noopener,noreferrer')
}

function handleImageError(e) {
  e.target.style.display = 'none'
  hasImage.value = false
}

// Fetch on mount
onMounted(() => {
  fetchPreview()
})

// Re-fetch if URL changes
watch(() => props.url, () => {
  fetchPreview()
})
</script>

<style scoped>
.link-preview {
  max-width: 400px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
