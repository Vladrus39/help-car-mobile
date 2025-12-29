<template>
  <div class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
    <!-- Reply preview -->
    <Transition name="slide">
      <div 
        v-if="replyTo"
        class="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 flex items-center justify-between"
      >
        <div class="flex-1 min-w-0">
          <div class="text-xs font-bold text-blue-600 dark:text-blue-400">
            ↩️ Ответ для {{ replyTo.sender?.full_name || 'пользователя' }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-300 truncate">
            {{ replyTo.content || '📷 Изображение' }}
          </div>
        </div>
        <button 
          class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          @click="$emit('cancelReply')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </Transition>

    <!-- Image previews -->
    <Transition name="slide">
      <div 
        v-if="selectedImages.length > 0"
        class="px-4 py-3 flex gap-2 overflow-x-auto bg-gray-50 dark:bg-gray-900"
      >
        <div 
          v-for="(img, index) in selectedImages"
          :key="index"
          class="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden group"
        >
          <img :src="img.preview" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <button 
              class="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
              @click="removeImage(index)"
            >
              ✕
            </button>
          </div>
          <div v-if="img.uploading" class="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"/>
          </div>
        </div>
        <button 
          v-if="selectedImages.length < 5"
          class="flex-shrink-0 w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition"
          @click="$refs.fileInput.click()"
        >
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
        </button>
      </div>
    </Transition>

    <!-- Input area -->
    <div class="p-3 sm:p-4 flex items-end gap-2 sm:gap-3">
      <!-- Attach button -->
      <button 
        class="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition"
        @click="$refs.fileInput.click()"
      >
        <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      </button>
      <input 
        ref="fileInput"
        type="file"
        accept="image/*"
        multiple
        class="hidden"
        @change="handleFileSelect"
      >

      <!-- Text input -->
      <div class="flex-1 relative">
        <textarea
          ref="textInput"
          v-model="message"
          :placeholder="placeholder"
          :disabled="disabled"
          rows="1"
          class="w-full px-4 py-2.5 sm:py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-600 transition placeholder-gray-400 max-h-32 overflow-y-auto"
          @input="autoResize"
          @keydown="handleKeydown"
          @focus="$emit('focus')"
          @blur="$emit('blur')"
        />
        
        <!-- Emoji button -->
        <button 
          class="absolute right-3 bottom-2.5 text-gray-400 hover:text-yellow-500 transition"
          @click="showEmojis = !showEmojis"
        >
          <span class="text-xl">😊</span>
        </button>
      </div>

      <!-- Send button -->
      <button 
        :disabled="!canSend || disabled"
        :class="[
          'flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all',
          canSend && !disabled
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
        ]"
        @click="send"
      >
        <svg v-if="!isSending" class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
        </svg>
        <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
      </button>
    </div>

    <!-- Emoji picker -->
    <Transition name="slide">
      <div 
        v-if="showEmojis"
        class="absolute bottom-full left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-2xl rounded-t-2xl overflow-hidden"
      >
        <div class="p-2 border-b border-gray-200 dark:border-gray-700 flex gap-2 overflow-x-auto">
          <button
            v-for="(cat, key) in emojiCategories"
            :key="key"
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition',
              activeCategory === key
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
            @click="activeCategory = key"
          >
            {{ cat.icon }} {{ cat.name }}
          </button>
        </div>
        <div class="p-4 grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
          <button
            v-for="emoji in emojiCategories[activeCategory].emojis"
            :key="emoji"
            class="w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all hover:scale-110"
            @click="insertEmoji(emoji)"
          >
            {{ emoji }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'

const props = defineProps({
  placeholder: { type: String, default: 'Напишите сообщение...' },
  disabled: { type: Boolean, default: false },
  replyTo: { type: Object, default: null },
  isSending: { type: Boolean, default: false }
})

const emit = defineEmits(['send', 'typing', 'focus', 'blur', 'cancelReply', 'imagesSelected'])

const message = ref('')
const selectedImages = ref([])
const showEmojis = ref(false)
const activeCategory = ref('smileys')
const textInput = ref(null)
const fileInput = ref(null)

const emojiCategories = {
  smileys: {
    name: 'Смайлы',
    icon: '😀',
    emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐']
  },
  gestures: {
    name: 'Жесты',
    icon: '👋',
    emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄']
  },
  hearts: {
    name: 'Сердца',
    icon: '❤️',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '🔥', '⭐', '✨', '💫', '🌟', '💥', '💢', '💦', '💨', '🕳️', '💣', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤']
  },
  animals: {
    name: 'Животные',
    icon: '🐶',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕']
  },
  food: {
    name: 'Еда',
    icon: '🍕',
    emojis: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝']
  },
  transport: {
    name: 'Транспорт',
    icon: '🚗',
    emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🛵', '🏍️', '🛺', '🚲', '🛴', '🛹', '🛼', '🚁', '✈️', '🛩️', '🛫', '🛬', '🪂', '⛵', '🛶', '🚤', '🛥️', '🛳️', '⛴️', '🚢', '⚓', '🚧', '⛽', '🚏', '🚦', '🚥', '🛑', '🚧']
  }
}

const canSend = computed(() => {
  return message.value.trim().length > 0 || selectedImages.value.length > 0
})

let typingTimeout = null

watch(message, () => {
  emit('typing')
  clearTimeout(typingTimeout)
  typingTimeout = setTimeout(() => {
    // Stop typing indicator
  }, 2000)
})

function autoResize() {
  if (textInput.value) {
    textInput.value.style.height = 'auto'
    textInput.value.style.height = Math.min(textInput.value.scrollHeight, 128) + 'px'
  }
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

function send() {
  if (!canSend.value || props.disabled || props.isSending) return
  
  emit('send', {
    content: message.value.trim(),
    images: selectedImages.value.map(img => img.file),
    replyTo: props.replyTo?.id
  })
  
  message.value = ''
  selectedImages.value = []
  showEmojis.value = false
  
  nextTick(() => {
    autoResize()
    textInput.value?.focus()
  })
}

function handleFileSelect(e) {
  const files = Array.from(e.target.files || [])
  
  for (const file of files) {
    if (selectedImages.value.length >= 5) break
    if (!file.type.startsWith('image/')) continue
    if (file.size > 10 * 1024 * 1024) continue
    
    const reader = new FileReader()
    reader.onload = (ev) => {
      selectedImages.value.push({
        file,
        preview: ev.target.result,
        uploading: false
      })
    }
    reader.readAsDataURL(file)
  }
  
  if (fileInput.value) fileInput.value.value = ''
}

function removeImage(index) {
  selectedImages.value.splice(index, 1)
}

function insertEmoji(emoji) {
  message.value += emoji
  textInput.value?.focus()
}

function focus() {
  textInput.value?.focus()
}

defineExpose({ focus })
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

textarea {
  scrollbar-width: thin;
}

textarea::-webkit-scrollbar {
  width: 4px;
}

textarea::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 4px;
}
</style>
