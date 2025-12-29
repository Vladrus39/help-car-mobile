<template>
  <div class="absolute inset-0 overflow-hidden">
    <!-- Небо с облаками -->
    <div class="absolute inset-0 bg-gradient-to-b from-sky-400 via-blue-300 to-blue-100" />
    
    <!-- Облака -->
    <div class="clouds-layer">
      <div class="cloud cloud-1" />
      <div class="cloud cloud-2" />
      <div class="cloud cloud-3" />
    </div>

    <!-- Горизонт -->
    <div class="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-b from-green-200/50 via-yellow-100/30 to-gray-400/50" />

    <!-- Асфальт -->
    <div class="absolute bottom-0 left-0 right-0 h-1/4">
      <div class="absolute inset-0 bg-gradient-to-b from-gray-600 to-gray-800" />
      <!-- Дорожная разметка -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="road-marking" />
      </div>
    </div>

    <!-- Overlay для текста -->
    <div class="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-purple-900/80" />
  </div>
</template>

<style scoped>
.clouds-layer {
  position: absolute;
  width: 100%;
  height: 50%;
  top: 10%;
}

.cloud {
  position: absolute;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 100px;
  height: 60px;
  width: 180px;
  animation: float-clouds 60s linear infinite;
}

.cloud::before,
.cloud::after {
  content: '';
  position: absolute;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 100px;
}

.cloud::before {
  width: 100px;
  height: 80px;
  top: -40px;
  left: 20px;
}

.cloud::after {
  width: 120px;
  height: 70px;
  top: -30px;
  right: 20px;
}

.cloud-1 {
  top: 10%;
  left: -10%;
  animation-delay: 0s;
}

.cloud-2 {
  top: 25%;
  left: -15%;
  animation-delay: 20s;
  transform: scale(0.8);
}

.cloud-3 {
  top: 40%;
  left: -20%;
  animation-delay: 40s;
  transform: scale(1.2);
}

@keyframes float-clouds {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(calc(100vw + 200px));
  }
}

.road-marking {
  width: 10px;
  height: 100%;
  background: repeating-linear-gradient(
    to bottom,
    white 0px,
    white 40px,
    transparent 40px,
    transparent 80px
  );
  opacity: 0.8;
}
</style>

