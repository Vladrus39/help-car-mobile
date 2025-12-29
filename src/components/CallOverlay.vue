<template>
  <!-- Предупреждение о медиа-устройствах -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="deviceWarning"
        class="fixed top-4 left-1/2 -translate-x-1/2 z-[10001] max-w-md w-full mx-4"
      >
        <div class="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl shadow-2xl shadow-amber-500/30 p-4 flex items-start gap-3 backdrop-blur-xl">
          <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          <div class="flex-1">
            <p class="font-medium text-sm">{{ deviceWarning }}</p>
          </div>
          <button 
            @click="dismissWarning"
            class="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Overlay для входящего звонка -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="incomingCall"
        class="fixed inset-0 z-[10000] bg-gradient-to-br from-slate-900/95 via-gray-900/95 to-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4"
      >
        <div class="max-w-sm w-full text-center">
          <!-- Пульсирующие кольца -->
          <div class="relative w-40 h-40 mx-auto mb-8">
            <div class="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping-slow"></div>
            <div class="absolute inset-2 rounded-full bg-emerald-500/15 animate-ping-slower"></div>
            <div class="absolute inset-4 rounded-full bg-emerald-500/10 animate-ping-slowest"></div>
            
            <!-- Аватар -->
            <div class="absolute inset-6 rounded-full overflow-hidden ring-4 ring-emerald-500 shadow-2xl shadow-emerald-500/40">
              <img 
                v-if="incomingCall.caller?.avatar_url" 
                :src="getAvatarUrl(incomingCall.caller.avatar_url)"
                class="w-full h-full object-cover"
                @error="handleAvatarError"
              >
              <div 
                v-else 
                class="w-full h-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center"
              >
                <span class="text-4xl text-white font-bold">{{ getInitial(incomingCall.caller?.full_name) }}</span>
              </div>
            </div>
          </div>

          <!-- Информация о звонке -->
          <div class="mb-10">
            <h2 class="text-2xl font-bold text-white mb-2">
              {{ incomingCall.caller?.full_name || 'Неизвестный' }}
            </h2>
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
              <div :class="['w-8 h-8 rounded-full flex items-center justify-center', incomingCall.callType === 'video' ? 'bg-purple-500' : 'bg-blue-500']">
                <svg v-if="incomingCall.callType === 'video'" class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z"/></svg>
                <svg v-else class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/></svg>
              </div>
              <span class="text-white/80 text-sm font-medium">{{ incomingCall.callType === 'video' ? 'Видеозвонок' : 'Голосовой звонок' }}</span>
            </div>
          </div>

          <!-- Кнопки управления -->
          <div class="flex justify-center gap-8">
            <div class="flex flex-col items-center gap-2">
              <button 
                @click="rejectCall"
                class="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/40 transition-all hover:scale-110 active:scale-95"
              >
                <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.956.956 0 010-1.36C3.69 8.35 7.64 6 12 6s8.31 2.35 11.71 5.72c.37.37.37.98 0 1.36l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.73-1.68-1.36-2.66-1.85a.996.996 0 01-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/></svg>
              </button>
              <span class="text-white/60 text-xs font-medium">Отклонить</span>
            </div>
            
            <div class="flex flex-col items-center gap-2">
              <button 
                @click="acceptCall"
                class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 transition-all hover:scale-110 active:scale-95 animate-pulse-call"
              >
                <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/></svg>
              </button>
              <span class="text-white/60 text-xs font-medium">Ответить</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Активный звонок -->
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div 
        v-if="activeCall"
        class="fixed inset-0 z-[10000] bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 flex flex-col"
      >
        <!-- Header со статусом -->
        <div class="absolute top-0 left-0 right-0 z-30 p-4 bg-gradient-to-b from-black/60 to-transparent">
          <div class="flex items-center justify-center gap-3">
            <div :class="[
              'w-2 h-2 rounded-full',
              callStatus === 'connecting' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
            ]"></div>
            <div class="text-center">
              <p class="text-white/70 text-xs font-medium uppercase tracking-wider">
                {{ callStatus === 'connecting' ? 'Соединение...' : 'В звонке' }}
              </p>
              <h2 class="text-white font-bold text-lg">{{ remoteUser?.full_name }}</h2>
            </div>
          </div>
          <!-- Таймер -->
          <div class="text-center mt-1">
            <span class="text-white/50 text-sm font-mono tabular-nums">{{ formatDuration(callDuration) }}</span>
          </div>
        </div>

        <!-- Video container -->
        <div class="flex-1 relative overflow-hidden">
          <!-- Remote video (большое) - скрываем когда swap -->
          <video 
            v-if="activeCall.callType === 'video'"
            v-show="!isVideoSwapped"
            ref="remoteVideoRef"
            autoplay
            playsinline
            class="absolute inset-0 w-full h-full object-cover z-0"
          ></video>

          <!-- Remote audio (для всех звонков - звук идет через audio элемент) -->
          <audio
            ref="remoteAudioRef"
            autoplay
            playsinline
            style="position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none;"
          ></audio>
          
          <!-- Avatar if audio only -->
          <div 
            v-if="activeCall.callType !== 'video'"
            class="absolute inset-0 flex items-center justify-center"
          >
            <div class="relative">
              <!-- Декоративные кольца -->
              <div class="absolute inset-0 -m-8 rounded-full border border-white/10 animate-pulse-ring"></div>
              <div class="absolute inset-0 -m-16 rounded-full border border-white/5"></div>
              
              <!-- Аватар -->
              <div class="w-36 h-36 rounded-full overflow-hidden ring-4 ring-white/20 shadow-2xl">
                <img 
                  v-if="remoteUser?.avatar_url"
                  :src="getAvatarUrl(remoteUser.avatar_url)"
                  class="w-full h-full object-cover"
                  @error="handleAvatarError"
                >
                <div v-else class="w-full h-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center">
                  <span class="text-5xl text-white font-bold">{{ getInitial(remoteUser?.full_name) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Local video (маленькое, перетаскиваемое) -->
          <div
            v-if="activeCall.callType === 'video'"
            ref="localVideoContainerRef"
            class="absolute z-20 cursor-grab active:cursor-grabbing select-none touch-none"
            :class="{ 'ring-2 ring-blue-400 ring-offset-2 ring-offset-transparent': isDragging }"
            :style="localVideoStyle"
            @mousedown.prevent="startDrag"
            @touchstart.prevent="startDrag"
            @click="swapVideos"
          >
            <video 
              ref="localVideoRef"
              autoplay
              playsinline
              muted
              class="rounded-2xl object-cover border-2 border-white/30 shadow-2xl pointer-events-none"
              :class="isVideoSwapped ? 'w-full h-full' : 'w-32 h-44'"
            ></video>
            <!-- Иконка для переключения -->
            <div class="absolute top-2 right-2 w-7 h-7 bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center text-white">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
            </div>
          </div>

          <!-- Remote video контейнер (для swapped режима - маленький) -->
          <div
            v-if="activeCall.callType === 'video' && isVideoSwapped"
            ref="remoteVideoContainerRef"
            class="absolute bottom-24 right-4 z-10 cursor-pointer"
            @click="swapVideos"
          >
            <video 
              ref="remoteVideoSmallRef"
              autoplay
              playsinline
              class="w-32 h-44 rounded-2xl object-cover border-2 border-white/30 shadow-2xl"
            ></video>
            <div class="absolute top-2 right-2 w-7 h-7 bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center text-white">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
            </div>
          </div>
        </div>

        <!-- Controls -->
        <div class="absolute bottom-0 left-0 right-0 z-30 pb-8 pt-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div class="flex justify-center items-center gap-4">
            <!-- Mute -->
            <div class="flex flex-col items-center gap-1.5">
              <button 
                @click="toggleMute"
                :class="[
                  'w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg',
                  isMuted ? 'bg-red-500 shadow-red-500/30' : 'bg-white/15 backdrop-blur-md hover:bg-white/25'
                ]"
              >
                <svg v-if="isMuted" class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/></svg>
                <svg v-else class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>
              </button>
              <span class="text-white/50 text-[10px] font-medium">{{ isMuted ? 'Откл.' : 'Микрофон' }}</span>
            </div>

            <!-- Camera toggle (video calls only) -->
            <div v-if="activeCall.callType === 'video'" class="flex flex-col items-center gap-1.5">
              <button 
                @click="toggleCamera"
                :class="[
                  'w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg',
                  isCameraOff ? 'bg-red-500 shadow-red-500/30' : 'bg-white/15 backdrop-blur-md hover:bg-white/25'
                ]"
              >
                <svg v-if="isCameraOff" class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z"/></svg>
                <svg v-else class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
              </button>
              <span class="text-white/50 text-[10px] font-medium">{{ isCameraOff ? 'Откл.' : 'Камера' }}</span>
            </div>

            <!-- Switch Camera (front/back) - только для мобильных и видеозвонков -->
            <div v-if="activeCall.callType === 'video' && isMobileDevice && !isCameraOff" class="flex flex-col items-center gap-1.5">
              <button 
                @click="switchCamera"
                class="w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg bg-white/15 backdrop-blur-md hover:bg-white/25"
              >
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12c0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3-3 1.34-3 3zm13 0c0 .55-.45 1-1 1h-2c-.55 0-1-.45-1-1s.45-1 1-1h2c.55 0 1 .45 1 1zM4 11h2c.55 0 1 .45 1 1s-.45 1-1 1H4c-.55 0-1-.45-1-1s.45-1 1-1zm8-9c.55 0 1 .45 1 1v2c0 .55-.45 1-1 1s-1-.45-1-1V3c0-.55.45-1 1-1zm0 18c-.55 0-1-.45-1-1v-2c0-.55.45-1 1-1s1 .45 1 1v2c0 .55-.45 1-1 1zM5.99 4.58c.39-.39 1.03-.39 1.42 0l1.42 1.42c.39.39.39 1.02 0 1.42-.39.39-1.03.39-1.42 0L5.99 5.99c-.39-.39-.39-1.02 0-1.41zm12.02 12.02c.39-.39 1.03-.39 1.42 0 .39.39.39 1.02 0 1.42l-1.42 1.42c-.39.39-1.02.39-1.42 0-.39-.39-.39-1.03 0-1.42l1.42-1.42zM5.99 19.42c-.39-.39-.39-1.03 0-1.42l1.42-1.42c.39-.39 1.02-.39 1.42 0 .39.39.39 1.03 0 1.42l-1.43 1.42c-.39.39-1.02.39-1.41 0zM18.01 7.41c.39.39.39 1.03 0 1.42l-1.42 1.42c-.39.39-1.03.39-1.42 0-.39-.39-.39-1.02 0-1.42l1.42-1.42c.39-.39 1.03-.39 1.42 0z"/>
                </svg>
              </button>
              <span class="text-white/50 text-[10px] font-medium">{{ isFrontCamera ? 'Фронт.' : 'Задн.' }}</span>
            </div>

            <!-- Speaker -->
            <div class="flex flex-col items-center gap-1.5">
              <button 
                @click="toggleSpeaker"
                :class="[
                  'w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg',
                  isSpeakerOn ? 'bg-blue-500 shadow-blue-500/30' : 'bg-white/15 backdrop-blur-md hover:bg-white/25'
                ]"
              >
                <svg v-if="isSpeakerOn" class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                <svg v-else class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
              </button>
              <span class="text-white/50 text-[10px] font-medium">{{ isSpeakerOn ? 'Динамик' : 'Откл.' }}</span>
            </div>

            <!-- End call -->
            <div class="flex flex-col items-center gap-1.5">
              <button 
                @click="endCall"
                class="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/40 transition-all hover:scale-105 active:scale-95"
              >
                <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.956.956 0 010-1.36C3.69 8.35 7.64 6 12 6s8.31 2.35 11.71 5.72c.37.37.37.98 0 1.36l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.73-1.68-1.36-2.66-1.85a.996.996 0 01-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/></svg>
              </button>
              <span class="text-white/50 text-[10px] font-medium">Завершить</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { apiService } from '@/services/api'
import { wsService } from '@/services/websocket'
import { getAvatarUrl } from '@/utils/imageUrl'

const authStore = useAuthStore()

const incomingCall = ref(null)
const activeCall = ref(null)
const callStatus = ref('idle') // idle, ringing, connecting, connected
const callDuration = ref(0)
const remoteUser = ref(null)

const localVideoRef = ref(null)
const remoteVideoRef = ref(null)
const remoteAudioRef = ref(null)
const localVideoContainerRef = ref(null)
const remoteVideoSmallRef = ref(null)

const pendingOffer = ref(null)
const pendingIceCandidates = ref([])

const answeredCallId = ref(null)
const answerInProgress = ref(false)

// Drag & drop для локального видео
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const localVideoPosition = ref({ x: null, y: null })
const isVideoSwapped = ref(false)

// Computed стиль для позиционирования локального видео
const localVideoStyle = computed(() => {
  if (isVideoSwapped.value) {
    // Если видео переключено - показываем на весь экран
    return {
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      width: '100%',
      height: '100%',
      zIndex: '1'
    }
  }
  
  if (localVideoPosition.value.x !== null && localVideoPosition.value.y !== null) {
    return {
      top: `${localVideoPosition.value.y}px`,
      left: `${localVideoPosition.value.x}px`,
      width: '128px',
      height: '176px',
      zIndex: '20'
    }
  }
  // Позиция по умолчанию - справа внизу
  return {
    bottom: '16px',
    right: '16px',
    width: '128px',
    height: '176px',
    zIndex: '20'
  }
})

// Начало перетаскивания
const startDrag = (e) => {
  if (isVideoSwapped.value) return // Не перетаскиваем в полноэкранном режиме
  
  isDragging.value = true
  const container = localVideoContainerRef.value
  if (!container) return
  
  const rect = container.getBoundingClientRect()
  const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0
  const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0
  
  dragOffset.value = {
    x: clientX - rect.left,
    y: clientY - rect.top
  }
  
  // Добавляем слушатели для движения и отпускания
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', onDrag, { passive: false })
  document.addEventListener('touchend', stopDrag)
}

// Процесс перетаскивания
const onDrag = (e) => {
  if (!isDragging.value) return
  e.preventDefault()
  
  const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0
  const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0
  
  const newX = clientX - dragOffset.value.x
  const newY = clientY - dragOffset.value.y
  
  // Ограничиваем границами экрана
  const maxX = window.innerWidth - 140 // ширина видео + отступ
  const maxY = window.innerHeight - 190 // высота видео + отступ
  
  localVideoPosition.value = {
    x: Math.max(8, Math.min(newX, maxX)),
    y: Math.max(8, Math.min(newY, maxY))
  }
}

// Конец перетаскивания
const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
}

// Переключение видео местами
const swapVideos = () => {
  if (isDragging.value) return // Не переключаем при перетаскивании
  
  isVideoSwapped.value = !isVideoSwapped.value
  
  // При переключении синхронизируем стримы между видео-элементами
  nextTick(() => {
    if (isVideoSwapped.value) {
      // Локальное видео на весь экран, удалённое в маленькое окно
      if (remoteVideoSmallRef.value && remoteVideoRef.value?.srcObject) {
        remoteVideoSmallRef.value.srcObject = remoteVideoRef.value.srcObject
      }
    } else {
      // Сбрасываем позицию при возврате
      localVideoPosition.value = { x: null, y: null }
    }
  })
}

// Инициализируем из настроек пользователя
const isMuted = ref(authStore.user?.default_mic_enabled === false)
const isCameraOff = ref(authStore.user?.default_camera_enabled === false)
const isSpeakerOn = ref(true)
const isFrontCamera = ref(true) // Фронтальная камера по умолчанию
const isMobileDevice = ref(false) // Проверка мобильного устройства

let peerConnection = null
let localStream = null
let durationInterval = null
let iceServers = []
let ringtoneAudio = null
let dialToneAudio = null
let dialToneInterval = null
let dialToneCtx = null

// Состояние предупреждений о устройствах
const deviceWarning = ref(null)

// Проверка доступности медиа-устройств
const checkMediaDevices = async (needVideo = false) => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const hasAudio = devices.some(d => d.kind === 'audioinput')
    const hasVideo = devices.some(d => d.kind === 'videoinput')
    const hasSpeaker = devices.some(d => d.kind === 'audiooutput')
    
    if (!hasAudio) {
      deviceWarning.value = 'Микрофон не обнаружен. Проверьте подключение микрофона.'
      return false
    }
    
    if (needVideo && !hasVideo) {
      deviceWarning.value = 'Камера не обнаружена. Проверьте подключение камеры.'
      return false
    }
    
    if (!hasSpeaker) {
      deviceWarning.value = 'Динамики не обнаружены. Вы можете не слышать собеседника.'
      // Не блокируем звонок, просто предупреждаем
    }
    
    return true
  } catch (e) {
    console.error('Error checking media devices:', e)
    deviceWarning.value = 'Не удалось проверить медиа-устройства'
    return true // Позволяем продолжить
  }
}

// Запрос разрешений на медиа с проверкой
const requestMediaPermissions = async (callType) => {
  const needVideo = callType === 'video'
  
  // Сначала проверяем наличие устройств
  const devicesOk = await checkMediaDevices(needVideo)
  if (!devicesOk) {
    return null
  }
  
  try {
    const constraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      },
      video: needVideo ? {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: isFrontCamera.value ? 'user' : 'environment'
      } : false
    }
    
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    deviceWarning.value = null
    return stream
  } catch (error) {
    console.error('Media permission error:', error)
    
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      deviceWarning.value = needVideo 
        ? 'Доступ к камере и микрофону запрещён. Разрешите доступ в настройках браузера.'
        : 'Доступ к микрофону запрещён. Разрешите доступ в настройках браузера.'
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      deviceWarning.value = needVideo
        ? 'Камера или микрофон не найдены'
        : 'Микрофон не найден'
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      deviceWarning.value = 'Устройство занято другим приложением'
    } else {
      deviceWarning.value = `Ошибка доступа к медиа: ${error.message}`
    }
    
    return null
  }
}

// Закрыть предупреждение
const dismissWarning = () => {
  deviceWarning.value = null
}

const ensureWebSocketConnected = async () => {
  try {
    if (wsService.isConnected?.value) return true

    const token = authStore.token || localStorage.getItem('token') || sessionStorage.getItem('token')
    if (!token) return false

    wsService.connect(token)
    // Даем немного времени на handshake
    await new Promise(resolve => setTimeout(resolve, 300))
    return !!wsService.isConnected?.value
  } catch (e) {
    console.warn('WebSocket reconnect failed:', e)
    return false
  }
}

// Звук входящего звонка (рингтон)
const playRingtone = () => {
  try {
    if (!ringtoneAudio) {
      ringtoneAudio = new Audio('/notification.mp3')
      ringtoneAudio.loop = true
      ringtoneAudio.volume = 0.7
    }
    ringtoneAudio.currentTime = 0
    ringtoneAudio.play().catch(() => {})
  } catch (e) {
    console.warn('Не удалось воспроизвести звук:', e)
  }
}

const stopRingtone = () => {
  if (ringtoneAudio) {
    ringtoneAudio.pause()
    ringtoneAudio.currentTime = 0
  }
}

// Гудки исходящего звонка (dial tone)
const playDialTone = () => {
  try {
    // Создаём аудио контекст для генерации гудков
    if (!dialToneCtx) {
      dialToneCtx = new (window.AudioContext || window.webkitAudioContext)()
    }
    const audioCtx = dialToneCtx
    audioCtx.resume?.().catch(() => {})
    
    const playBeep = () => {
      const oscillator = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)
      
      oscillator.frequency.value = 440 // Частота гудка (Hz)
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1)
      
      oscillator.start(audioCtx.currentTime)
      oscillator.stop(audioCtx.currentTime + 1) // Гудок длится 1 секунду
    }
    
    // Первый гудок сразу
    playBeep()
    
    // Повторяем каждые 3 секунды
    dialToneInterval = setInterval(playBeep, 3000)
    
    // Сохраняем контекст для закрытия
    dialToneAudio = audioCtx
  } catch (e) {
    console.warn('Не удалось воспроизвести гудки:', e)
  }
}

const stopDialTone = () => {
  if (dialToneInterval) {
    clearInterval(dialToneInterval)
    dialToneInterval = null
  }
  if (dialToneAudio) {
    dialToneAudio.close().catch(() => {})
    dialToneAudio = null
    dialToneCtx = null
  }
}

// Следим за входящим звонком
watch(incomingCall, (newVal) => {
  if (newVal) {
    playRingtone()
  } else {
    stopRingtone()
  }
})

// Следим за статусом исходящего звонка (гудки)
watch(callStatus, (newVal, oldVal) => {
  if (newVal === 'ringing' && activeCall.value?.isOutgoing) {
    playDialTone()
  } else if (oldVal === 'ringing' || newVal === 'connected' || newVal === 'idle') {
    stopDialTone()
  }
})

// Получить инициал имени
const getInitial = (name) => {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

// Форматировать продолжительность
const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Получить ICE серверы
const loadIceServers = async () => {
  try {
    const response = await apiService.client.get('/calls/ice-servers')
    // Поддержка разных форматов ответа
    const data = response?.data || response
    iceServers = data?.iceServers || data?.data?.iceServers || getDefaultIceServers()
  } catch (error) {
    console.warn('Failed to load ICE servers, using defaults:', error?.message)
    iceServers = getDefaultIceServers()
  }
}

// ICE серверы по умолчанию (только UDP для TURN - TCP часто блокируется)
const getDefaultIceServers = () => [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  {
    urls: 'turn:158.160.210.202:3478?transport=udp',
    username: 'helpcar',
    credential: 'helpcar2024secure'
  }
]

// Инициализировать звонок (исходящий)
const initiateCall = async (userId, callType = 'audio') => {
  try {
    const wsOk = await ensureWebSocketConnected()
    if (!wsOk) {
      alert('Нет соединения с сервером звонков (WebSocket). Проверьте интернет и повторите.')
      return
    }

    callStatus.value = 'ringing'
    
    // Запрашиваем медиа с проверкой устройств
    localStream = await requestMediaPermissions(callType)
    if (!localStream) {
      callStatus.value = 'idle'
      return // Предупреждение уже показано в requestMediaPermissions
    }
    
    // Инициируем звонок на сервере
    const response = await apiService.client.post('/calls/initiate', {
      targetUserId: userId,
      callType
    })

    const payload = response?.data || response
    const success = payload?.success
    const nextIceServers = payload?.iceServers || payload?.data?.iceServers

    if (success) {
      activeCall.value = {
        callId: payload.callId,
        callType,
        isOutgoing: true
      }
      remoteUser.value = payload.callee
      iceServers = nextIceServers || iceServers || getDefaultIceServers()
      
      await setupPeerConnection()
      await createOffer()
    }
  } catch (error) {
    console.error('Failed to initiate call:', error)
    cleanup()
    alert('Не удалось начать звонок')
  }
}

// Флаг для предотвращения двойного принятия звонка
const isAccepting = ref(false)

// Принять входящий звонок
const acceptCall = async () => {
  if (!incomingCall.value) return
  
  // Защита от двойного вызова
  if (isAccepting.value) {
    console.log('Accept already in progress, skipping')
    return
  }
  isAccepting.value = true
  
  const callId = incomingCall.value.callId
  const callType = incomingCall.value.callType
  const callerSnapshot = incomingCall.value.caller
  
  try {
    const wsOk = await ensureWebSocketConnected()
    if (!wsOk) {
      alert('Нет соединения с сервером звонков (WebSocket). Проверьте интернет и повторите.')
      isAccepting.value = false
      return
    }

    callStatus.value = 'connecting'
    
    // Запрашиваем медиа с проверкой устройств
    localStream = await requestMediaPermissions(callType)
    if (!localStream) {
      isAccepting.value = false
      callStatus.value = 'idle'
      return // Предупреждение уже показано
    }
    
    // Принимаем звонок на сервере
    const response = await apiService.client.post(`/calls/${callId}/accept`)

    const payload = response?.data || response
    const success = payload?.success
    const nextIceServers = payload?.iceServers || payload?.data?.iceServers

    if (success) {
      activeCall.value = {
        callId,
        callType,
        isOutgoing: false
      }
      remoteUser.value = payload.caller || callerSnapshot
      iceServers = nextIceServers || iceServers || getDefaultIceServers()
      
      incomingCall.value = null
      
      await setupPeerConnection()

      if (payload.offer && (!pendingOffer.value || pendingOffer.value?.callId !== activeCall.value.callId)) {
        pendingOffer.value = null
        try {
          await createAnswer(payload.offer)
        } catch (e) {
          console.error('Failed to createAnswer from payload.offer:', e)
        }
      }

      if (pendingOffer.value?.callId === activeCall.value.callId && pendingOffer.value?.sdp) {
        await createAnswer(pendingOffer.value.sdp)
        pendingOffer.value = null
      }

      if (pendingIceCandidates.value.length) {
        const candidates = pendingIceCandidates.value
        pendingIceCandidates.value = []
        for (const item of candidates) {
          if (item?.callId && activeCall.value?.callId && item.callId !== activeCall.value.callId) continue
          if (item?.candidate) {
            try {
              await peerConnection.addIceCandidate(new RTCIceCandidate(item.candidate))
            } catch (_e) {}
          }
        }
      }
    }
  } catch (error) {
    console.error('Failed to accept call:', error)
    cleanup()
    alert('Не удалось принять звонок')
  } finally {
    isAccepting.value = false
  }
}

// Отклонить входящий звонок
const rejectCall = async () => {
  if (!incomingCall.value) return
  const callId = incomingCall.value.callId
  
  try {
    await apiService.client.post(`/calls/${callId}/end`, { reason: 'rejected' })
  } catch (error) {
    console.error('Failed to reject call:', error)
  }
  
  incomingCall.value = null
}

// Завершить активный звонок
const endCall = async () => {
  if (!activeCall.value) return
  
  try {
    await apiService.client.post(`/calls/${activeCall.value.callId}/end`, { reason: 'ended' })
  } catch (error) {
    console.error('Failed to end call:', error)
  }
  
  cleanup()
}

// Настроить WebRTC соединение
const setupPeerConnection = async () => {
  peerConnection = new RTCPeerConnection({
    iceServers,
    // На LTE/CGNAT часто прямое соединение невозможно: форсим TURN
    iceTransportPolicy: 'relay'
  })
  
  // Добавляем локальный поток
  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream)
  })
  
  // Показываем локальное видео после рендеринга DOM с retry
  if (activeCall.value?.callType === 'video') {
    const attachLocalVideo = async (attempts = 0) => {
      await nextTick()
      if (localVideoRef.value && localStream) {
        localVideoRef.value.srcObject = localStream
        localVideoRef.value.play?.().catch(() => {})
        console.log('✅ Local video stream attached')
        return true
      } else if (attempts < 10) {
        // Retry через 100ms (всего 10 попыток = 1 секунда)
        console.log(`⏳ Waiting for localVideoRef... attempt ${attempts + 1}`)
        await new Promise(r => setTimeout(r, 100))
        return attachLocalVideo(attempts + 1)
      } else {
        console.warn('❌ localVideoRef or localStream not available after retries')
        return false
      }
    }
    await attachLocalVideo()
  }
  
  // Обрабатываем входящий поток
  peerConnection.ontrack = (event) => {
    console.log('📹 ontrack event:', event.track.kind, event.streams.length)
    const remoteStream = event.streams[0]
    if (!remoteStream) {
      console.warn('No remote stream in ontrack event')
      return
    }
    
    // Всегда подключаем аудио через отдельный <audio> элемент
    // Это надежнее работает на мобильных устройствах
    if (remoteAudioRef.value) {
      remoteAudioRef.value.srcObject = remoteStream
      remoteAudioRef.value.muted = false // Звук включен
      remoteAudioRef.value.volume = 1.0
      
      // Принудительно запускаем воспроизведение
      const playAudio = async () => {
        try {
          await remoteAudioRef.value.play()
          console.log('✅ Remote audio playing')
        } catch (e) {
          console.warn('Audio play failed, will retry on user interaction:', e)
          // На некоторых браузерах нужно взаимодействие пользователя
          document.addEventListener('click', async () => {
            try {
              await remoteAudioRef.value?.play()
            } catch (_) {}
          }, { once: true })
        }
      }
      playAudio()
    }

    if (activeCall.value?.callType === 'video') {
      if (remoteVideoRef.value) {
        remoteVideoRef.value.srcObject = remoteStream
        // Видео muted - звук идет через <audio>
        remoteVideoRef.value.muted = true
        remoteVideoRef.value.play?.().catch(() => {})
        console.log('✅ Remote video attached')
      }
    }
    callStatus.value = 'connected'
    startDurationTimer()
  }
  
  // ICE candidates
  peerConnection.onicecandidate = async (event) => {
    if (event.candidate && activeCall.value) {
      await apiService.client.post(`/calls/${activeCall.value.callId}/ice-candidate`, {
        candidate: event.candidate
      })
    }
  }
  
  peerConnection.oniceconnectionstatechange = () => {
    console.log('🧊 ICE state:', peerConnection.iceConnectionState)
    if (peerConnection.iceConnectionState === 'disconnected' || 
        peerConnection.iceConnectionState === 'failed') {
      cleanup()
    }
  }

  peerConnection.onicecandidateerror = (event) => {
    console.warn('🧊 ICE candidate error:', event)
  }

  peerConnection.onconnectionstatechange = () => {
    console.log('🔗 PC connection state:', peerConnection.connectionState)
  }
}

// Создать SDP offer
const createOffer = async () => {
  const offer = await peerConnection.createOffer()
  await peerConnection.setLocalDescription(offer)
  
  await apiService.client.post(`/calls/${activeCall.value.callId}/sdp`, {
    sdp: offer,
    type: 'offer'
  })
}

// Создать SDP answer
const createAnswer = async (offer) => {
  if (!peerConnection || !activeCall.value) return
  if (answeredCallId.value === activeCall.value.callId) {
    console.log('Already answered this call, skipping')
    return
  }
  if (answerInProgress.value) {
    console.log('Answer already in progress, skipping')
    return
  }
  
  // Проверяем состояние - можем принять offer только в stable или have-remote-offer
  const state = peerConnection.signalingState
  if (state !== 'stable' && state !== 'have-remote-offer') {
    console.warn('Cannot create answer in state:', state)
    return
  }
  
  answerInProgress.value = true
  try {
    // Устанавливаем remote description только если ещё не установлен
    if (!peerConnection.currentRemoteDescription) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
    }
    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)
    await apiService.client.post(`/calls/${activeCall.value.callId}/sdp`, {
      sdp: answer,
      type: 'answer'
    })
    answeredCallId.value = activeCall.value.callId
    console.log('Answer created and sent successfully')
  } catch (e) {
    console.error('Error creating answer:', e)
  } finally {
    answerInProgress.value = false
  }
}

// Таймер длительности (оптимизированный)
let callStartTime = null

const startDurationTimer = () => {
  callDuration.value = 0
  callStartTime = Date.now()
  
  // Используем requestAnimationFrame для более точного таймера
  const updateDuration = () => {
    if (!callStartTime || !activeCall.value) {
      return
    }
    callDuration.value = Math.floor((Date.now() - callStartTime) / 1000)
    durationInterval = requestAnimationFrame(updateDuration)
  }
  
  durationInterval = requestAnimationFrame(updateDuration)
}

const stopDurationTimer = () => {
  if (durationInterval) {
    cancelAnimationFrame(durationInterval)
    durationInterval = null
  }
  callStartTime = null
}

// Toggle mute
const toggleMute = () => {
  isMuted.value = !isMuted.value
  if (localStream) {
    localStream.getAudioTracks().forEach(track => {
      track.enabled = !isMuted.value
    })
  }
}

// Toggle camera
const toggleCamera = () => {
  isCameraOff.value = !isCameraOff.value
  if (localStream) {
    localStream.getVideoTracks().forEach(track => {
      track.enabled = !isCameraOff.value
    })
  }
}

// Switch camera (front/back) - для мобильных
const switchCamera = async () => {
  if (!localStream || activeCall.value?.callType !== 'video') return
  
  try {
    // Переключаем направление
    isFrontCamera.value = !isFrontCamera.value
    
    // Останавливаем текущие видео-треки
    localStream.getVideoTracks().forEach(track => track.stop())
    
    // Получаем новый видео-поток с другой камеры
    const newVideoStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: isFrontCamera.value ? 'user' : 'environment'
      }
    })
    
    const newVideoTrack = newVideoStream.getVideoTracks()[0]
    
    // Добавляем новый трек в localStream
    localStream.addTrack(newVideoTrack)
    
    // Обновляем видео-элемент
    if (localVideoRef.value) {
      localVideoRef.value.srcObject = localStream
    }
    
    // Заменяем трек в PeerConnection
    if (peerConnection) {
      const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video')
      if (sender) {
        await sender.replaceTrack(newVideoTrack)
      }
    }
    
    console.log('📷 Camera switched to:', isFrontCamera.value ? 'front' : 'back')
  } catch (error) {
    console.error('❌ Error switching camera:', error)
    // Откатываем состояние
    isFrontCamera.value = !isFrontCamera.value
    deviceWarning.value = 'Не удалось переключить камеру'
    setTimeout(() => deviceWarning.value = null, 3000)
  }
}

// Toggle speaker
const toggleSpeaker = () => {
  isSpeakerOn.value = !isSpeakerOn.value
  if (remoteVideoRef.value) remoteVideoRef.value.muted = !isSpeakerOn.value
  if (remoteAudioRef.value) remoteAudioRef.value.muted = !isSpeakerOn.value
}

// Очистка
const cleanup = () => {
  stopRingtone()
  stopDialTone()
  stopDurationTimer()

  pendingOffer.value = null
  pendingIceCandidates.value = []
  answeredCallId.value = null
  answerInProgress.value = false
  deviceWarning.value = null
  
  // Сбрасываем состояние видео
  isVideoSwapped.value = false
  localVideoPosition.value = { x: null, y: null }
  isDragging.value = false
  
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop())
    localStream = null
  }
  
  if (peerConnection) {
    peerConnection.close()
    peerConnection = null
  }
  
  activeCall.value = null
  callStatus.value = 'idle'
  callDuration.value = 0
  isMuted.value = false
  isCameraOff.value = false
}

// WebSocket handlers
const handleIncomingCall = (data) => {
  incomingCall.value = data
}

const handleCallAccepted = async (data) => {
  if (activeCall.value?.callId === data.callId) {
    callStatus.value = 'connecting'
  }
}

const handleCallEnded = (data) => {
  if (activeCall.value?.callId === data.callId || incomingCall.value?.callId === data.callId) {
    cleanup()
    incomingCall.value = null
  }
}

const handleCallTimeout = (data) => {
  if (activeCall.value?.callId === data.callId || incomingCall.value?.callId === data.callId) {
    cleanup()
    incomingCall.value = null
  }
}

const handleIceCandidate = async (data) => {
  if (peerConnection && data?.candidate) {
    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate))
    } catch (_e) {}
    return
  }
  if (data?.candidate) {
    pendingIceCandidates.value.push({ callId: data.callId, candidate: data.candidate })
  }
}

const handleSdpOffer = async (data) => {
  if (answeredCallId.value && data?.callId && answeredCallId.value === data.callId) return
  if (peerConnection && activeCall.value?.callId === data.callId) {
    await createAnswer(data.sdp)
    return
  }
  pendingOffer.value = { callId: data.callId, sdp: data.sdp }
}

const handleSdpAnswer = async (data) => {
  if (!activeCall.value || activeCall.value.callId !== data.callId) {
    console.log('Ignoring answer for different call')
    return
  }
  
  if (!peerConnection) {
    console.warn('No peer connection for answer')
    return
  }
  
  // Проверяем что мы в правильном состоянии для установки answer
  const state = peerConnection.signalingState
  if (state !== 'have-local-offer') {
    console.log('Skipping answer, state is:', state)
    return  // Просто игнорируем, не логируем как ошибку
  }
  
  try {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp))
    console.log('Remote description set successfully')
  } catch (e) {
    // Игнорируем ошибку если состояние уже изменилось (race condition)
    if (e.name === 'InvalidStateError') {
      console.log('State changed during setRemoteDescription, ignoring')
      return
    }
    console.error('Failed to set remote description:', e)
  }
}

onMounted(async () => {
  // Определяем мобильное устройство
  isMobileDevice.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  // Загружаем ICE серверы только если пользователь авторизован
  if (authStore.isAuthenticated) {
    await loadIceServers()
  }

  // На мобильных WebSocket часто отваливается в фоне — пытаемся поднять заранее
  await ensureWebSocketConnected()
  
  wsService.on('call:incoming', handleIncomingCall)
  wsService.on('call:accepted', handleCallAccepted)
  wsService.on('call:ended', handleCallEnded)
  wsService.on('call:timeout', handleCallTimeout)
  wsService.on('call:ice-candidate', handleIceCandidate)
  wsService.on('call:offer', handleSdpOffer)
  wsService.on('call:answer', handleSdpAnswer)
})

onUnmounted(() => {
  cleanup()
  stopRingtone()
  stopDialTone()
  
  // Очищаем слушатели drag
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
  
  wsService.off('call:incoming', handleIncomingCall)
  wsService.off('call:accepted', handleCallAccepted)
  wsService.off('call:ended', handleCallEnded)
  wsService.off('call:timeout', handleCallTimeout)
  wsService.off('call:ice-candidate', handleIceCandidate)
  wsService.off('call:offer', handleSdpOffer)
  wsService.off('call:answer', handleSdpAnswer)
})

// Обработка аватаров
function handleAvatarError(event) {
  // Показываем дефолтный аватар вместо скрытия
  event.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%236366f1" width="100" height="100"/><text x="50" y="60" text-anchor="middle" fill="white" font-size="40">?</text></svg>'
}

// Экспортируем функции для использования в чатах
defineExpose({ initiateCall })
</script>

<style scoped>
.animate-pulse-slow {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-ping-slow {
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.animate-ping-slower {
  animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
  animation-delay: 0.5s;
}

.animate-ping-slowest {
  animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite;
  animation-delay: 1s;
}

.animate-pulse-call {
  animation: pulse-call 1.5s ease-in-out infinite;
}

.animate-pulse-ring {
  animation: pulse-ring 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

@keyframes ping {
  75%, 100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

@keyframes pulse-call {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 20px rgba(16, 185, 129, 0);
  }
}

@keyframes pulse-ring {
  0%, 100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.1;
  }
}
</style>
