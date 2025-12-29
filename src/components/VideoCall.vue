<template>
  <div class="fixed inset-0 z-50 bg-gray-900 flex flex-col">
    <!-- Header -->
    <div class="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/70 to-transparent">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            {{ remoteName?.charAt(0) || '?' }}
          </div>
          <div>
            <div class="text-white font-medium">
              {{ remoteName || 'Собеседник' }}
            </div>
            <div class="text-gray-300 text-sm">
              {{ connectionStatus }}
            </div>
          </div>
        </div>
        <div class="text-white text-sm">
          {{ callDuration }}
        </div>
      </div>
    </div>

    <!-- Remote Video (full screen) -->
    <video 
      ref="remoteVideo"
      class="w-full h-full object-cover"
      autoplay
      playsinline
    />

    <!-- Local Video (small preview) -->
    <div class="absolute top-20 right-4 w-32 h-44 rounded-xl overflow-hidden shadow-2xl border-2 border-white/30">
      <video 
        ref="localVideo"
        class="w-full h-full object-cover mirror"
        autoplay
        playsinline
        muted
      />
      
      <!-- Camera switch button (mobile) -->
      <button 
        v-if="hasMultipleCameras"
        class="absolute bottom-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
        @click="switchCamera"
      >
        🔄
      </button>
    </div>

    <!-- Controls -->
    <div class="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
      <div class="flex items-center justify-center gap-6">
        <!-- Mute Audio -->
        <button 
          :class="[
            'w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all',
            isAudioMuted 
              ? 'bg-red-500 text-white' 
              : 'bg-white/20 text-white hover:bg-white/30'
          ]"
          @click="toggleAudio"
        >
          {{ isAudioMuted ? '🔇' : '🎤' }}
        </button>

        <!-- End Call -->
        <button 
          class="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-3xl text-white hover:bg-red-600 transition-all"
          @click="endCall"
        >
          📞
        </button>

        <!-- Toggle Video -->
        <button 
          :class="[
            'w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all',
            isVideoOff 
              ? 'bg-red-500 text-white' 
              : 'bg-white/20 text-white hover:bg-white/30'
          ]"
          @click="toggleVideo"
        >
          {{ isVideoOff ? '📷' : '🎥' }}
        </button>
      </div>
    </div>

    <!-- Connection failed overlay -->
    <div 
      v-if="connectionFailed"
      class="absolute inset-0 bg-black/80 flex items-center justify-center z-20"
    >
      <div class="text-center text-white p-6">
        <div class="text-6xl mb-4">
          📵
        </div>
        <h2 class="text-xl font-bold mb-2">
          Соединение потеряно
        </h2>
        <p class="text-gray-400 mb-6">
          Не удалось установить видеосвязь
        </p>
        <button 
          class="px-6 py-3 bg-blue-500 rounded-xl text-white font-medium hover:bg-blue-600 transition"
          @click="retry"
        >
          Попробовать снова
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import webrtcService from '@/services/webrtcService';

const props = defineProps({
  roomId: { type: String, required: true },
  remoteName: { type: String, default: '' },
  isInitiator: { type: Boolean, default: false }
});

const emit = defineEmits(['close', 'error']);

const localVideo = ref(null);
const remoteVideo = ref(null);
const isAudioMuted = ref(false);
const isVideoOff = ref(false);
const connectionFailed = ref(false);
const callStartTime = ref(null);
const callDurationSeconds = ref(0);
const hasMultipleCameras = ref(false);

const connectionStatus = computed(() => {
  if (connectionFailed.value) return 'Соединение потеряно';
  if (!remoteVideo.value?.srcObject) return 'Подключение...';
  return 'Подключено';
});

const callDuration = computed(() => {
  const minutes = Math.floor(callDurationSeconds.value / 60);
  const seconds = callDurationSeconds.value % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});

let durationTimer = null;

onMounted(async () => {
  // Check for multiple cameras
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    hasMultipleCameras.value = devices.filter(d => d.kind === 'videoinput').length > 1;
  } catch (_err) {
    // Ошибка перечисления устройств - игнорируем
    console.warn('Ошибка доступа к устройствам:', _err)
  }

  // Setup WebRTC callbacks
  webrtcService.on('localStream', (stream) => {
    if (localVideo.value) {
      localVideo.value.srcObject = stream;
    }
  });

  webrtcService.on('remoteStream', (stream) => {
    if (remoteVideo.value) {
      remoteVideo.value.srcObject = stream;
      callStartTime.value = Date.now();
      startDurationTimer();
    }
  });

  webrtcService.on('connectionFailed', () => {
    connectionFailed.value = true;
  });

  webrtcService.on('callEnded', () => {
    emit('close');
  });

  // Start or answer call
  try {
    if (props.isInitiator) {
      await webrtcService.startCall(props.roomId, true, true);
    }
  } catch (error) {
    emit('error', error);
  }
});

onUnmounted(() => {
  if (durationTimer) clearInterval(durationTimer);
  webrtcService.endCall();
});

const startDurationTimer = () => {
  durationTimer = setInterval(() => {
    callDurationSeconds.value++;
  }, 1000);
};

const toggleAudio = () => {
  isAudioMuted.value = !isAudioMuted.value;
  webrtcService.toggleAudio(!isAudioMuted.value);
};

const toggleVideo = () => {
  isVideoOff.value = !isVideoOff.value;
  webrtcService.toggleVideo(!isVideoOff.value);
};

const switchCamera = () => {
  webrtcService.switchCamera();
};

const endCall = () => {
  webrtcService.endCall();
  emit('close');
};

const retry = async () => {
  connectionFailed.value = false;
  try {
    await webrtcService.startCall(props.roomId, true, true);
  } catch (error) {
    connectionFailed.value = true;
  }
};
</script>

<style scoped>
.mirror {
  transform: scaleX(-1);
}
</style>
