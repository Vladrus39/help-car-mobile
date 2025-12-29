<template>
  <div class="h-screen flex flex-col overflow-hidden chat-container">
    <!-- Animated background -->
    <div class="chat-bg-pattern"></div>
    
    <!-- Header -->
    <div class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-b dark:border-gray-700 px-4 py-3 flex-shrink-0 shadow-lg relative z-20">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button
            class="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
            @click="goBack"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          
          <!-- Partner info -->
          <router-link
            v-if="chatPartner"
            :to="`/user/${chatPartner.id}`"
            class="flex items-center gap-3 group"
          >
            <div class="relative">
              <div v-if="chatPartner.avatar_url" class="w-10 h-10 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-blue-400 transition">
                <img :src="getAvatarUrl(chatPartner.avatar_url)" class="w-full h-full object-cover">
              </div>
              <div v-else class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold ring-2 ring-transparent group-hover:ring-blue-400 transition">
                {{ getInitials(chatPartner.full_name) }}
              </div>
              <span v-if="chatPartner.is_online" class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full animate-pulse"/>
              <span v-else-if="chatPartner.is_available_to_help" class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-yellow-500 border-2 border-white dark:border-gray-800 rounded-full"/>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <p class="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  {{ chatPartner.full_name }}
                </p>
                <PremiumBadge :status="chatPartner.premium_status" size="xs" />
              </div>
              <p v-if="isTyping" class="text-xs text-blue-500 animate-pulse">печатает...</p>
              <p v-else-if="chatPartner.is_online" class="text-xs text-green-500 flex items-center gap-1">
                <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span> онлайн
              </p>
              <p v-else class="text-xs text-gray-500">{{ formatLastSeen(chatPartner.last_seen || chatPartner.last_login) }}</p>
            </div>
          </router-link>
        </div>
        
        <!-- Actions -->
        <div class="flex items-center gap-1">
          <!-- Звонки - доступны во всех чатах -->
          <button @click="startCall('audio')" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition text-gray-600 dark:text-gray-400" title="Голосовой звонок">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
          </button>
          <button @click="startCall('video')" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition text-gray-600 dark:text-gray-400" title="Видеозвонок">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
            </svg>
          </button>
          
          <!-- Кнопка друзей -->
          <button
            v-if="chatPartner && !chatPartner.isFriend && !friendRequestSent"
            :disabled="isSendingFriendRequest"
            class="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 transition disabled:opacity-50"
            @click="sendFriendRequest"
          >
            {{ isSendingFriendRequest ? '...' : '👥' }}
          </button>
          <span v-else-if="friendRequestSent" class="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs rounded-full">✓</span>
          <span v-else-if="chatPartner?.isFriend" class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">👥</span>
          
          <!-- Меню -->
          <button class="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition" @click="showMenu = !showMenu">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Dropdown menu -->
      <div v-if="showMenu" class="absolute right-4 top-16 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border dark:border-gray-700 py-2 z-50 min-w-[180px]">
        <button class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2" @click="toggleSearch(); showMenu = false">
          🔍 Поиск
        </button>
        <button class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2" @click="openGallery(); showMenu = false">
          🖼️ Галерея
        </button>
        <button class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2" @click="sendLocation(); showMenu = false">
          📍 Геолокация
        </button>
        <div class="border-t dark:border-gray-700 my-1"></div>
        <button v-if="chatPartner" class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2" @click="viewProfile(chatPartner.id); showMenu = false">
          👤 Профиль
        </button>
        <button class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2" @click="clearChat(); showMenu = false">
          🗑️ Очистить чат
        </button>
      </div>
    </div>
    
    <!-- Request Context Bar -->
    <div v-if="isRequestChat && requestData" class="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-b dark:border-gray-700 px-4 py-2 flex-shrink-0 relative z-20">
      <div class="flex items-center justify-between gap-3">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 text-sm">
            <span class="font-semibold text-orange-700 dark:text-orange-400">{{ problemTypeLabel }}</span>
            <span v-if="requestData.status" class="px-2 py-0.5 rounded-full text-xs" :class="{
              'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400': requestData.status === 'accepted',
              'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400': requestData.status === 'in_progress',
              'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400': requestData.status === 'completed',
              'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400': !['accepted', 'in_progress', 'completed'].includes(requestData.status)
            }">
              {{ requestData.status === 'accepted' ? 'Принята' : requestData.status === 'in_progress' ? 'В работе' : requestData.status === 'completed' ? 'Завершена' : requestData.status }}
            </span>
          </div>
          <p v-if="requestData.address" class="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
            📍 {{ requestData.address }}
          </p>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <!-- Complete button -->
          <button
            v-if="canCompleteRequest"
            :disabled="isCompletingRequest"
            class="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-full transition flex items-center gap-1 disabled:opacity-50"
            @click="completeRequest"
          >
            <span v-if="isCompletingRequest" class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span v-else>✅</span>
            Завершить
          </button>
          <!-- Rate button -->
          <button
            v-if="canRate"
            class="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-medium rounded-full transition flex items-center gap-1"
            @click="showRatingModal = true"
          >
            ⭐ Оценить
          </button>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 space-y-3 messages-area relative z-10" @scroll="handleScroll">
      <!-- Loading more -->
      <div v-if="isLoadingMore" class="text-center py-2">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow text-sm text-gray-500">
          <div class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Загрузка...
        </div>
      </div>
      
      <!-- Skeleton loading -->
      <template v-if="isLoading">
        <div v-for="i in 8" :key="'s'+i" class="flex" :class="i % 2 ? 'justify-start' : 'justify-end'">
          <div :class="['max-w-xs px-4 py-3 rounded-2xl skeleton', i % 2 ? 'bg-white dark:bg-gray-800' : 'bg-blue-500']" style="width: 60%"/>
        </div>
      </template>

      <!-- Messages list -->
      <template v-else>
        <template v-for="(message, index) in messages" :key="message.id">
          <!-- Date separator -->
          <div v-if="shouldShowDateSeparator(message, messages[index - 1])" class="flex items-center justify-center my-4">
            <span class="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
              {{ formatDateSeparator(message.createdAt) }}
            </span>
          </div>
          
          <div :class="['flex', message.is_mine ? 'justify-end' : 'justify-start']">
            <!-- Avatar -->
            <div v-if="!message.is_mine && shouldShowAvatar(message, messages[index + 1])" class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 self-end">
              {{ getInitials(chatPartner?.full_name) }}
            </div>
            <div v-else-if="!message.is_mine" class="w-8 mr-2"/>
            
            <div class="max-w-[80%] sm:max-w-[70%]">
              <div :class="['px-4 py-2.5 rounded-2xl message-bubble break-words relative group', message.is_mine ? 'message-mine' : 'message-other']">
                <!-- Image -->
                <div v-if="message.image_url" class="mb-2">
                  <img :src="getImageUrl(message.thumbnail_url || message.image_url)" :alt="message.content || 'Изображение'" class="max-w-full rounded-xl cursor-pointer hover:opacity-90 transition" style="max-height: 300px; object-fit: contain; min-width: 100px; min-height: 100px; background: #f3f4f6;" loading="lazy" @click="openImageFullscreen(message.image_url)" @error="handleImageError"/>
                </div>
                
                <!-- Voice message -->
                <div v-if="message.voice_url" class="mb-2">
                  <div class="flex items-center gap-3 p-2 rounded-xl" :class="message.is_mine ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-600'">
                    <button type="button" @click="toggleVoicePlay(message.id)" class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition" :class="message.is_mine ? 'bg-white/30 hover:bg-white/40 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'">
                      <svg v-if="playingVoiceId !== message.id" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    </button>
                    <div class="flex-1">
                      <div class="flex items-center gap-2">
                        <div class="flex-1 h-1 rounded-full" :class="message.is_mine ? 'bg-white/30' : 'bg-gray-300 dark:bg-gray-500'">
                          <div class="h-full rounded-full bg-current w-0" :id="`voice-progress-${message.id}`"></div>
                        </div>
                        <span class="text-xs" :class="message.is_mine ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'">
                          {{ formatVoiceDuration(message.voice_duration) }}
                        </span>
                      </div>
                    </div>
                    <audio :ref="el => { if (el) voiceRefs[message.id] = el }" :src="getImageUrl(message.voice_url)" @ended="onVoiceEnded(message.id)" @timeupdate="updateVoiceProgress(message.id, $event)" @error="handleVoiceError" class="hidden"/>
                  </div>
                </div>
                
                <p v-if="message.content" class="text-sm sm:text-base whitespace-pre-wrap">{{ message.content }}</p>
                
                <!-- Link Preview -->
                <LinkPreview v-for="url in extractUrls(message.content)" :key="url" :url="url"/>
                
                <!-- Quick reactions on hover -->
                <div :class="['absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1', message.is_mine ? '-left-16' : '-right-16']">
                  <button class="w-7 h-7 bg-white dark:bg-gray-700 rounded-full shadow flex items-center justify-center hover:scale-110 transition text-sm" @click="reactToMessage(message, '👍')">👍</button>
                  <button class="w-7 h-7 bg-white dark:bg-gray-700 rounded-full shadow flex items-center justify-center hover:scale-110 transition text-sm" @click="reactToMessage(message, '❤️')">❤️</button>
                </div>
                
                <!-- Reactions display -->
                <div v-if="message.reactions && message.reactions.length" class="flex gap-1 mt-1">
                  <span v-for="reaction in message.reactions" :key="reaction.emoji" class="px-2 py-0.5 bg-black/10 dark:bg-white/10 rounded-full text-xs">
                    {{ reaction.emoji }} {{ reaction.count }}
                  </span>
                </div>
              </div>
              
              <!-- Time and read status -->
              <div :class="['flex items-center gap-1.5 mt-1 text-xs', message.is_mine ? 'justify-end' : 'justify-start']">
                <span class="text-gray-400">{{ formatTime(message.createdAt) }}</span>
                <span v-if="message.is_mine" :class="message.is_read ? 'text-blue-500' : 'text-gray-400'">
                  {{ message.is_read ? '✓✓' : '✓' }}
                </span>
              </div>
            </div>
          </div>
        </template>
        
        <!-- Typing indicator -->
        <div v-if="isTyping" class="flex justify-start">
          <div class="bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3">
            <div class="flex gap-1">
              <span class="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"/>
              <span class="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"/>
              <span class="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"/>
            </div>
          </div>
        </div>
      </template>
      
      <!-- Scroll to bottom button -->
      <button v-if="showScrollButton" class="fixed bottom-24 right-6 w-10 h-10 bg-white dark:bg-gray-800 shadow-lg rounded-full flex items-center justify-center text-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition z-10" @click="scrollToBottom">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
        </svg>
      </button>
    </div>

    <!-- Input area -->
    <div class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-t dark:border-gray-700 p-3 flex-shrink-0 relative z-20">
      <!-- Image preview -->
      <div v-if="selectedImage" class="mb-3 relative inline-block">
        <img :src="selectedImagePreview" class="h-20 rounded-lg object-cover">
        <button type="button" class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition" @click="removeSelectedImage">✕</button>
        <div v-if="isUploadingImage" class="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
          <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
      
      <!-- Recording indicator -->
      <div v-if="isRecording" class="mb-3 flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <div class="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        <span class="text-red-600 dark:text-red-400 font-medium">Запись {{ formatRecordingTime(recordingDuration) }}</span>
        <div class="flex-1"></div>
        <button @click="cancelRecording" class="p-2 text-gray-500 hover:text-red-600">✕</button>
        <button @click="stopRecording" class="px-4 py-1.5 bg-red-600 text-white rounded-full text-sm font-medium hover:bg-red-700">Отправить</button>
      </div>
      
      <div v-else class="flex items-end gap-2">
        <!-- Attach button -->
        <button class="p-2 text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition flex-shrink-0" :disabled="isUploadingImage" @click="triggerImageSelect">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        </button>
        <input ref="imageInputRef" type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/gif" class="hidden" @change="handleImageSelect">
        
        <!-- Input -->
        <div class="flex-1 relative">
          <textarea ref="inputRef" v-model="newMessage" placeholder="Сообщение..." rows="1" class="w-full px-4 py-2.5 bg-gray-100/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32 text-sm sm:text-base transition-all" style="overflow-y: auto;" @keydown.enter.exact.prevent="sendMessage" @input="handleTyping"/>
        </div>
        
        <!-- Emoji picker -->
        <div class="relative">
          <button type="button" class="p-2 text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition flex-shrink-0" @click="showEmojiPicker = !showEmojiPicker">
            <span class="text-xl">😊</span>
          </button>
          <div v-if="showEmojiPicker" class="absolute bottom-12 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 p-3 z-50 w-72">
            <div class="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
              <button v-for="emoji in emojis" :key="emoji" type="button" class="w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition" @click="insertEmoji(emoji)">
                {{ emoji }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- Voice / Send button -->
        <button v-if="!newMessage.trim() && !selectedImage" class="p-2.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition flex-shrink-0" @click="startRecording">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
          </svg>
        </button>
        <button v-else :disabled="(!newMessage.trim() && !selectedImage) || isSending" :class="['p-2.5 rounded-full transition flex-shrink-0', (newMessage.trim() || selectedImage) ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30' : 'bg-gray-200 dark:bg-gray-700 text-gray-400']" @click="sendMessage">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Search modal -->
    <div v-if="showSearch" class="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div class="p-4 border-b dark:border-gray-700 flex items-center gap-3">
          <input v-model="searchQuery" type="text" placeholder="Поиск сообщений..." class="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white" @input="performSearch">
          <button @click="toggleSearch" class="p-2 text-gray-500">✕</button>
        </div>
        <div class="max-h-96 overflow-y-auto p-4">
          <div v-if="isSearching" class="text-center text-gray-500">Поиск...</div>
          <div v-else-if="searchResults.length === 0 && searchQuery" class="text-center text-gray-500">Ничего не найдено</div>
          <div v-for="msg in searchResults" :key="msg.id" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer" @click="showSearch = false">
            <p class="text-sm text-gray-900 dark:text-white">{{ msg.content }}</p>
            <p class="text-xs text-gray-500">{{ formatTime(msg.created_at) }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Media gallery modal -->
    <div v-if="showGallery" class="fixed inset-0 bg-black/90 z-50 p-4">
      <button @click="showGallery = false" class="absolute top-4 right-4 text-white text-2xl">✕</button>
      <h3 class="text-white text-xl mb-4">Медиа в чате</h3>
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        <img v-for="media in galleryMedia" :key="media.id" :src="getImageUrl(media.thumbnail_url || media.image_url)" class="aspect-square object-cover rounded cursor-pointer hover:opacity-80" @click="openImageFullscreen(media.image_url)">
      </div>
    </div>
    
    <!-- Fullscreen image modal -->
    <div v-if="fullscreenImage" class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" @click="fullscreenImage = null">
      <button class="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition" @click="fullscreenImage = null">✕</button>
      <img :src="getImageUrl(fullscreenImage)" class="max-w-full max-h-full object-contain" @click.stop>
    </div>
    
    <!-- Rating Modal -->
    <RatingModal
      v-if="requestData && chatPartner"
      :is-open="showRatingModal"
      :help-request-id="String(requestData.id)"
      :helper-id="String(chatPartner.id)"
      :helper-name="chatPartner.full_name"
      @close="showRatingModal = false"
      @rated="onRatingComplete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { wsService } from '@/services/websocket'
import { io } from 'socket.io-client'
import PremiumBadge from '@/components/PremiumBadge.vue'
import LinkPreview from '@/components/LinkPreview.vue'
import RatingModal from '@/components/RatingModal.vue'
import { getSocketIOUrl, getImageUrl } from '@/utils/imageUrl'

const props = defineProps({
  chatType: { type: String, default: 'auto' } // 'request', 'direct', or 'auto'
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// === Core State ===
const messages = ref([])
const newMessage = ref('')
const isLoading = ref(true)
const isLoadingMore = ref(false)
const isSending = ref(false)
const chatId = ref(null)
const chatContainer = ref(null)
const inputRef = ref(null)
const chatPartner = ref(null)
const isSendingFriendRequest = ref(false)
const friendRequestSent = ref(false)
const isTyping = ref(false)
const showMenu = ref(false)
const showScrollButton = ref(false)

// === Request Chat Context ===
const requestData = ref(null)
const showRatingModal = ref(false)
const isCompletingRequest = ref(false)

// === Image Upload ===
const imageInputRef = ref(null)
const selectedImage = ref(null)
const selectedImagePreview = ref(null)
const isUploadingImage = ref(false)
const fullscreenImage = ref(null)
const showEmojiPicker = ref(false)

// === Voice Messages ===
const isRecording = ref(false)
const recordingDuration = ref(0)
const mediaRecorder = ref(null)
const audioChunks = ref([])
let recordingInterval = null
const playingVoiceId = ref(null)
const voiceRefs = {}

// === Search & Gallery ===
const showSearch = ref(false)
const searchQuery = ref('')
const searchResults = ref([])
const isSearching = ref(false)
const showGallery = ref(false)
const galleryMedia = ref([])

const emojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😉', '😊', '😇',
  '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '🤗', '🤔', '🤭', '🤫',
  '👍', '👎', '👌', '✌️', '🤞', '🤙', '👊', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🔥', '⭐', '🎉',
  '🚗', '🚕', '🚙', '🚌', '🛠️', '🔧', '⛽', '📱', '💻', '🏠', '📍', '✅', '❌'
]

let socket = null
let typingTimeout = null

const handleFriendOnline = (data) => {
  const friendId = data?.friend?.id
  if (!friendId || !chatPartner.value?.id) return
  if (String(friendId) === String(chatPartner.value.id)) {
    chatPartner.value.is_online = true
    chatPartner.value.last_seen = new Date().toISOString()
  }
}

const handleFriendOffline = (data) => {
  const friendId = data?.friendId || data?.friend?.id
  if (!friendId || !chatPartner.value?.id) return
  if (String(friendId) === String(chatPartner.value.id)) {
    chatPartner.value.is_online = false
    chatPartner.value.last_seen = new Date().toISOString()
  }
}

// Определяем тип чата автоматически
const isRequestChat = computed(() => {
  if (props.chatType !== 'auto') return props.chatType === 'request'
  return !!route.params.requestId
})

// Можно ли завершить заявку (только заявитель и статус accepted/in_progress)
const canCompleteRequest = computed(() => {
  if (!requestData.value) return false
  const req = requestData.value
  const isOwner = String(req.user_id) === String(authStore.user?.id)
  const validStatus = ['accepted', 'in_progress'].includes(req.status)
  return isOwner && validStatus
})

// Можно ли оценить (заявка завершена)
const canRate = computed(() => {
  if (!requestData.value) return false
  return requestData.value.status === 'completed' && !requestData.value.userHasRated
})

// Тип проблемы для отображения
const problemTypeLabel = computed(() => {
  if (!requestData.value) return ''
  const types = {
    'flat_tire': '🛞 Пробило колесо',
    'battery': '🔋 Сел аккумулятор',
    'fuel': '⛽ Закончилось топливо',
    'tow': '🚛 Нужна эвакуация',
    'engine': '🔧 Не заводится',
    'keys': '🔑 Закрылся в машине',
    'other': '❓ Другое'
  }
  return types[requestData.value.problem_type] || requestData.value.problem_type_name || '🆘 Заявка'
})

function goBack() {
  router.back()
}

onMounted(async () => {
  // Ждём загрузку пользователя если ещё не загружен
  if (!authStore.user) {
    await authStore.checkAuth()
  }
  
  // Определяем chatId в зависимости от типа
  if (route.params.chatId) {
    chatId.value = route.params.chatId
    await loadDirectChat()
  } else {
    const requestId = route.params.requestId || route.params.id
    if (requestId) {
      await loadChatByRequest(requestId)
    }
  }
  
  if (chatId.value) {
    await loadMessages()
    setupWebSocket()
  }

  wsService.on('friend_online', handleFriendOnline)
  wsService.on('friend_offline', handleFriendOffline)
  // Не фокусируем на мобильных - клавиатура откроется после клика
  if (window.innerWidth > 768) {
    inputRef.value?.focus()
  }
})

onUnmounted(() => {
  if (socket) {
    socket.disconnect()
  }

  wsService.off('friend_online')
  wsService.off('friend_offline')
  if (typingTimeout) clearTimeout(typingTimeout)
  if (recordingInterval) clearInterval(recordingInterval)
})

// Auto-resize textarea
watch(newMessage, () => {
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.style.height = 'auto'
      inputRef.value.style.height = Math.min(inputRef.value.scrollHeight, 128) + 'px'
    }
  })
})

// Watch for route changes
watch(() => route.params, async (newParams, oldParams) => {
  if (newParams.requestId !== oldParams?.requestId || newParams.chatId !== oldParams?.chatId) {
    messages.value = []
    chatId.value = null
    chatPartner.value = null
    isLoading.value = true
    if (socket) { socket.disconnect(); socket = null }
    
    if (newParams.chatId) {
      chatId.value = newParams.chatId
      await loadDirectChat()
    } else if (newParams.requestId) {
      await loadChatByRequest(newParams.requestId)
    }
    
    if (chatId.value) {
      await loadMessages()
      setupWebSocket()
    }
  }
}, { deep: true })

async function loadDirectChat() {
  try {
    const response = await apiService.client.get(`/chats/${chatId.value}/direct`)
    if (response.success) {
      chatPartner.value = response.otherUser
      messages.value = (response.messages || []).map(msg => ({
        ...msg,
        is_mine: String(msg.sender_id || '') === String(authStore.user?.id || ''),
        createdAt: msg.createdAt || msg.created_at
      }))
      await nextTick()
      scrollToBottom(true) // force scroll при загрузке личного чата
      if (chatPartner.value?.id) await checkFriendshipStatus(chatPartner.value.id)
    }
  } catch (err) {
    console.error('Failed to load direct chat:', err)
    if (err.response?.status === 404) router.push('/my-chats')
  } finally {
    isLoading.value = false
  }
}

async function loadChatByRequest(requestId) {
  try {
    const response = await apiService.getChatByRequest(requestId)
    const chat = response?.data || response
    
    if (chat?.id) {
      chatId.value = chat.id
      if (chat.messages && Array.isArray(chat.messages)) {
        messages.value = chat.messages.map(msg => ({
          ...msg,
          is_mine: String(msg.sender_id || '') === String(authStore.user?.id || ''),
          createdAt: msg.createdAt || msg.created_at
        }))
      }
      
      // Save request data for context display
      if (chat.helpRequest) {
        requestData.value = chat.helpRequest
      }
      
      // Find partner
      if (chat.participants) {
        const partner = chat.participants.find(p => p.id !== authStore.user?.id)
        if (partner) {
          chatPartner.value = partner
          await checkFriendshipStatus(partner.id)
        }
      } else if (chat.helpRequest) {
        const req = chat.helpRequest
        if (req.user_id === authStore.user?.id && req.helper) {
          chatPartner.value = req.helper
          await checkFriendshipStatus(req.helper.id)
        } else if (req.user) {
          chatPartner.value = req.user
          await checkFriendshipStatus(req.user.id)
        }
      }
      
      await nextTick()
      scrollToBottom(true) // force scroll при загрузке чата
    }
  } catch (error) {
    console.error('Failed to load chat by request:', error)
  }
}

async function loadMessages() {
  if (!chatId.value) return
  try {
    isLoading.value = true
    const response = await apiService.getChatMessages(chatId.value, { limit: 100, offset: 0 })
    
    let msgs = []
    if (Array.isArray(response?.data)) msgs = response.data
    else if (Array.isArray(response?.messages)) msgs = response.messages
    else if (Array.isArray(response)) msgs = response
    
    messages.value = msgs.map(msg => ({
      ...msg,
      is_mine: String(msg.sender_id || '') === String(authStore.user?.id || ''),
      createdAt: msg.createdAt || msg.created_at
    }))
    
    if (!chatPartner.value && response?.chat) {
      const chat = response.chat
      if (chat.participants) {
        const partner = chat.participants.find(p => p.id !== authStore.user?.id)
        if (partner) { chatPartner.value = partner; await checkFriendshipStatus(partner.id) }
      }
    }
    
    await nextTick()
    scrollToBottom(true) // force scroll при начальной загрузке
    
    // Отмечаем сообщения как прочитанные
    try {
      await apiService.markChatRead(chatId.value)
    } catch (e) {
      console.warn('Failed to mark messages as read:', e)
    }
  } catch (error) {
    console.error('Failed to load messages:', error)
  } finally {
    isLoading.value = false
  }
}

async function checkFriendshipStatus(userId) {
  try {
    const response = await apiService.getFriends()
    const friends = response?.data || response || []
    const isFriend = friends.some(f => f.friend?.id === userId)
    if (chatPartner.value) chatPartner.value.isFriend = isFriend
  } catch (error) { console.error('Failed to check friendship:', error) }
}

async function sendFriendRequest() {
  if (!chatPartner.value?.id) return
  try {
    isSendingFriendRequest.value = true
    const response = await apiService.sendFriendRequest(chatPartner.value.id)
    if (response.success) {
      friendRequestSent.value = true
      if (response.message?.includes('теперь друзья')) {
        chatPartner.value.isFriend = true
        friendRequestSent.value = false
      }
    }
  } catch (error) {
    alert(error.response?.data?.message || 'Не удалось отправить заявку')
  } finally { isSendingFriendRequest.value = false }
}

// === Звонки ===
function startCall(callType = 'audio') {
  const targetId = chatPartner.value?.id
  if (!targetId) { alert('Не удалось начать звонок'); return }
  if (typeof window.__initiateCall === 'function') {
    window.__initiateCall(targetId, callType)
  } else {
    alert('Функция звонков недоступна')
  }
}

// === Завершение заявки ===
async function completeRequest() {
  if (!requestData.value?.id) return
  if (!confirm('Подтвердить завершение помощи?')) return
  
  try {
    isCompletingRequest.value = true
    await apiService.completeHelpRequest(requestData.value.id)
    requestData.value.status = 'completed'
    alert('Заявка завершена! Пожалуйста, оцените помощника.')
    showRatingModal.value = true
  } catch (error) {
    console.error('Failed to complete request:', error)
    alert(error.response?.data?.message || 'Не удалось завершить заявку')
  } finally {
    isCompletingRequest.value = false
  }
}

function onRatingComplete() {
  if (requestData.value) {
    requestData.value.userHasRated = true
  }
  showRatingModal.value = false
}

// === Image handling ===
function triggerImageSelect() { imageInputRef.value?.click() }

function handleImageSelect(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!validTypes.includes(file.type)) { alert('Поддерживаются только: JPEG, PNG, WebP, GIF'); return }
  if (file.size > 10 * 1024 * 1024) { alert('Макс. размер: 10 МБ'); return }
  selectedImage.value = file
  selectedImagePreview.value = URL.createObjectURL(file)
}

function removeSelectedImage(revokeUrl = true) {
  if (revokeUrl && selectedImagePreview.value) URL.revokeObjectURL(selectedImagePreview.value)
  selectedImage.value = null
  selectedImagePreview.value = null
  if (imageInputRef.value) imageInputRef.value.value = ''
}

function openImageFullscreen(url) { fullscreenImage.value = url }

async function sendMessage() {
  if ((!newMessage.value.trim() && !selectedImage.value) || !chatId.value || isSending.value) return
  
  const content = newMessage.value.trim()
  const imageToSend = selectedImage.value
  const imagePreview = selectedImagePreview.value
  
  newMessage.value = ''
  removeSelectedImage(false)
  
  const tempId = 'temp-' + Date.now()
  messages.value.push({ id: tempId, content, is_mine: true, createdAt: new Date().toISOString(), is_sending: true, image_url: imagePreview })
  await nextTick()
  scrollToBottom()
  
  try {
    isSending.value = true
    let image_url = null, thumbnail_url = null
    
    if (imageToSend) {
      isUploadingImage.value = true
      try {
        const uploadResponse = await apiService.uploadChatImage(imageToSend)
        if (uploadResponse.success) { image_url = uploadResponse.image_url; thumbnail_url = uploadResponse.thumbnail_url }
      } finally { isUploadingImage.value = false }
    }
    
    const response = await apiService.client.post(`/chats/${chatId.value}/messages`, { content: content || '', image_url, thumbnail_url })
    
    if (response?.success && response?.data) {
      const idx = messages.value.findIndex(m => m.id === tempId)
      if (idx !== -1) messages.value[idx] = { ...response.data, is_mine: true, createdAt: response.data.createdAt || response.data.created_at }
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  } catch (error) {
    const idx = messages.value.findIndex(m => m.id === tempId)
    if (idx !== -1) { messages.value[idx].is_failed = true; messages.value[idx].is_sending = false }
    if (imagePreview) URL.revokeObjectURL(imagePreview)
  } finally { isSending.value = false }
}

function handleTyping() { if (socket && chatId.value) socket.emit('chat:typing', { chatId: chatId.value }) }
function insertEmoji(emoji) { newMessage.value += emoji; showEmojiPicker.value = false; inputRef.value?.focus() }

function setupWebSocket() {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  if (!token) return
  // Используем централизованную функцию для получения URL (работает и в Capacitor)
  const socketUrl = getSocketIOUrl()
  socket = io(socketUrl, { auth: { token } })
  socket.emit('chat:join', { chatId: chatId.value })
  
  socket.on('chat:newMessage', (data) => {
    if (data.chatId === chatId.value) {
      const exists = messages.value.some(m => m.id === data.id || (m.id?.startsWith?.('temp-') && m.content === data.content))
      if (exists) {
        const tempIdx = messages.value.findIndex(m => m.id?.startsWith?.('temp-') && m.content === data.content)
        if (tempIdx !== -1) messages.value[tempIdx] = { ...messages.value[tempIdx], id: data.id, is_sending: false }
        return
      }
      if (data.senderId !== authStore.user?.id) {
        messages.value.push({ id: data.id, content: data.content, sender_id: data.senderId, is_mine: false, createdAt: data.createdAt || new Date().toISOString() })
        nextTick(() => scrollToBottom())
        isTyping.value = false
      }
    }
  })
  
  socket.on('chat:typing', (data) => {
    if (data.chatId === chatId.value && data.userId !== authStore.user?.id) {
      isTyping.value = true
      if (typingTimeout) clearTimeout(typingTimeout)
      typingTimeout = setTimeout(() => { isTyping.value = false }, 3000)
    }
  })
  
  socket.on('chat:read', (data) => { if (data.chatId === chatId.value) messages.value.forEach(m => { if (m.is_mine) m.is_read = true }) })
}

function handleScroll() {
  if (!chatContainer.value) return
  const { scrollTop, scrollHeight, clientHeight } = chatContainer.value
  showScrollButton.value = scrollHeight - scrollTop - clientHeight > 200
}

function scrollToBottom(force = false) {
  if (!chatContainer.value) return
  
  // Используем setTimeout для гарантии что DOM обновился
  setTimeout(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
      showScrollButton.value = false
    }
  }, force ? 100 : 50)
}

function reactToMessage(message, emoji) {
  if (!message.reactions) message.reactions = []
  const existing = message.reactions.find(r => r.emoji === emoji)
  if (existing) existing.count++
  else message.reactions.push({ emoji, count: 1 })
}

function viewProfile(userId) { router.push(`/user/${userId}`) }
function clearChat() { if (confirm('Очистить историю чата?')) messages.value = [] }

// === Voice Recording ===
async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder.value = new MediaRecorder(stream, { mimeType: 'audio/webm' })
    audioChunks.value = []
    mediaRecorder.value.ondataavailable = (e) => audioChunks.value.push(e.data)
    mediaRecorder.value.onstop = async () => {
      const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm' })
      await sendVoiceMessage(audioBlob)
      stream.getTracks().forEach(track => track.stop())
    }
    mediaRecorder.value.start()
    isRecording.value = true
    recordingDuration.value = 0
    recordingInterval = setInterval(() => recordingDuration.value++, 1000)
  } catch (err) { alert('Нет доступа к микрофону') }
}

function stopRecording() {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
    isRecording.value = false
    clearInterval(recordingInterval)
  }
}

function cancelRecording() {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
    isRecording.value = false
    clearInterval(recordingInterval)
    audioChunks.value = []
  }
}

async function sendVoiceMessage(audioBlob) {
  if (!chatId.value || audioChunks.value.length === 0) return
  try {
    isSending.value = true
    const uploadResponse = await apiService.uploadVoiceMessage(audioBlob, recordingDuration.value)
    if (uploadResponse.success) {
      const response = await apiService.client.post(`/chats/${chatId.value}/messages`, { content: '', voice_url: uploadResponse.voice_url, voice_duration: uploadResponse.duration })
      if (response?.success && response?.data) {
        messages.value.push({ ...response.data, is_mine: true, createdAt: response.data.createdAt || response.data.created_at })
        await nextTick()
        scrollToBottom()
      }
    }
  } catch (error) { console.error('Ошибка отправки голосового:', error) }
  finally { isSending.value = false; recordingDuration.value = 0 }
}

function toggleVoicePlay(messageId) {
  const audio = voiceRefs[messageId]
  if (!audio) return
  Object.entries(voiceRefs).forEach(([id, a]) => { if (id !== messageId && !a.paused) { a.pause(); a.currentTime = 0 } })
  if (playingVoiceId.value === messageId) { audio.pause(); playingVoiceId.value = null }
  else { audio.play(); playingVoiceId.value = messageId }
}

// Автовоспроизведение следующего голосового (как в WhatsApp)
function onVoiceEnded(messageId) {
  playingVoiceId.value = null
  
  // Находим индекс текущего сообщения
  const currentIndex = messages.value.findIndex(m => m.id === messageId)
  if (currentIndex === -1) return
  
  // Ищем следующее голосовое сообщение
  for (let i = currentIndex + 1; i < messages.value.length; i++) {
    const nextMsg = messages.value[i]
    if (nextMsg.voice_url) {
      // Нашли следующее голосовое - воспроизводим
      setTimeout(() => {
        toggleVoicePlay(nextMsg.id)
      }, 300) // Небольшая пауза между сообщениями
      break
    }
  }
}

function updateVoiceProgress(messageId, event) {
  const audio = event.target
  const progress = (audio.currentTime / audio.duration) * 100
  const progressEl = document.getElementById(`voice-progress-${messageId}`)
  if (progressEl) progressEl.style.width = `${progress}%`
}

// === Search ===
async function performSearch() {
  if (!searchQuery.value || searchQuery.value.length < 2) { searchResults.value = []; return }
  try {
    isSearching.value = true
    const response = await apiService.searchMessages(chatId.value, searchQuery.value)
    searchResults.value = response.data || []
  } catch (error) { console.error('Ошибка поиска:', error) }
  finally { isSearching.value = false }
}

function toggleSearch() { showSearch.value = !showSearch.value; if (!showSearch.value) { searchQuery.value = ''; searchResults.value = [] } }

// === Gallery ===
async function openGallery() {
  try {
    const response = await apiService.getChatMedia(chatId.value, 'images')
    galleryMedia.value = response.data || []
    showGallery.value = true
  } catch (error) { console.error('Ошибка загрузки галереи:', error) }
}

// === Location ===
async function sendLocation() {
  if (!navigator.geolocation) { alert('Геолокация не поддерживается'); return }
  try {
    const position = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 }))
    const { latitude, longitude } = position.coords
    const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`
    const response = await apiService.client.post(`/chats/${chatId.value}/messages`, { content: `📍 Моя геолокация: ${locationUrl}`, message_type: 'location' })
    if (response?.success && response?.data) {
      messages.value.push({ ...response.data, is_mine: true, createdAt: response.data.createdAt || response.data.created_at })
      await nextTick()
      scrollToBottom()
    }
  } catch (error) { alert('Не удалось получить геолокацию') }
}

// === Helpers ===
function getInitials(name) { return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?' }
function formatTime(dateString) { return dateString ? new Date(dateString).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '' }
function formatLastSeen(dateString) {
  if (!dateString) return 'был(а) давно'
  const diffMins = Math.floor((new Date() - new Date(dateString)) / 60000)
  if (diffMins < 5) return 'онлайн'
  if (diffMins < 60) return `был(а) ${diffMins} мин назад`
  if (diffMins < 1440) return `был(а) ${Math.floor(diffMins / 60)} ч назад`
  return `был(а) ${Math.floor(diffMins / 1440)} дн назад`
}
function formatDateSeparator(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return 'Сегодня'
  if (date.toDateString() === yesterday.toDateString()) return 'Вчера'
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}
function shouldShowDateSeparator(current, previous) {
  if (!previous) return true
  return new Date(current.createdAt).toDateString() !== new Date(previous.createdAt).toDateString()
}
function shouldShowAvatar(current, next) { return !next || next.is_mine || next.sender_id !== current.sender_id }
function formatRecordingTime(seconds) { return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}` }
function formatVoiceDuration(seconds) { return seconds ? `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}` : '0:00' }

function handleImageError(event) {
  event.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect fill="%23e5e7eb" width="200" height="150"/><text x="100" y="75" text-anchor="middle" fill="%239ca3af" font-size="14">Ошибка загрузки</text></svg>'
  event.target.style.opacity = '0.7'
}

function handleVoiceError(event) {
  console.warn('Ошибка загрузки аудио:', event.target.src)
  const parent = event.target.parentElement
  if (parent) {
    parent.innerHTML = '<span class="text-xs text-red-500">✖ Аудио недоступно</span>'
  }
}

function extractUrls(text) {
  if (!text) return []
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi
  const matches = text.match(urlRegex) || []
  return [...new Set(matches.map(url => url.replace(/[.,;:!?)]+$/, '')))].slice(0, 2)
}
</script>

<style scoped>
.chat-container { position: relative; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.dark .chat-container { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); }

.chat-bg-pattern {
  position: absolute; inset: 0; opacity: 0.1; pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  animation: float 20s ease-in-out infinite;
}
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

.messages-area { background: linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 100%); backdrop-filter: blur(10px); }
.dark .messages-area { background: linear-gradient(180deg, rgba(17,24,39,0.95) 0%, rgba(31,41,55,0.98) 100%); }

.message-bubble { animation: message-appear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); transition: transform 0.2s ease; }
.message-bubble:hover { transform: scale(1.01); }

.message-mine { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; border-bottom-right-radius: 6px; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3); }
.message-other { background: white; color: #1f2937; border-bottom-left-radius: 6px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); border: 1px solid rgba(0,0,0,0.05); }
.dark .message-other { background: linear-gradient(135deg, #374151 0%, #4b5563 100%); color: white; border: 1px solid rgba(255,255,255,0.1); }

@keyframes message-appear { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }

.skeleton { position: relative; overflow: hidden; }
.skeleton::after { content: ''; position: absolute; inset: 0; transform: translateX(-100%); background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,.4) 50%, transparent 100%); animation: shimmer 1.4s infinite; }
@keyframes shimmer { 100% { transform: translateX(100%); } }

.messages-area::-webkit-scrollbar { width: 6px; }
.messages-area::-webkit-scrollbar-track { background: transparent; }
.messages-area::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.2); border-radius: 3px; }
.dark .messages-area::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); }

/* Mobile viewport fix - use dynamic viewport height */
@supports (height: 100dvh) {
  .chat-container { height: 100dvh; }
}

/* iOS Safari safe area insets */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .chat-container { padding-bottom: env(safe-area-inset-bottom); }
}

/* Fix for mobile keyboards */
@media (max-width: 768px) {
  .chat-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: 100%;
    height: 100dvh;
  }
}
</style>
