<template>
  <div class="bg-layer" aria-hidden="true">
    <div
      class="bg-orb bg-orb-1"
      :style="{ background: color1 }"
    ></div>
    <div
      class="bg-orb bg-orb-2"
      :style="{ background: color2 }"
    ></div>
    <div
      class="bg-orb bg-orb-3"
      :style="{ background: color3 }"
    ></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  color1?: string;
  color2?: string;
  color3?: string;
}>();
</script>

<style scoped lang="less">
.bg-layer {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.12;
  animation: orbFloat 20s ease-in-out infinite;

  &-1 {
    width: 380px; height: 380px;
    top: -100px; right: -80px;
    animation-delay: 0s;
  }
  &-2 {
    width: 260px; height: 260px;
    bottom: 15%; left: -60px;
    animation-delay: -7s;
  }
  &-3 {
    width: 200px; height: 200px;
    top: 30%; right: 20%;
    animation-delay: -14s;
  }
}

@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -40px) scale(1.05); }
  50% { transform: translate(-20px, 20px) scale(0.95); }
  75% { transform: translate(10px, -30px) scale(1.02); }
}
</style>
