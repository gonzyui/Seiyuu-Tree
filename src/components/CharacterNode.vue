<script setup lang="ts">
import { ref } from 'vue'
import { Handle, Position } from '@vue-flow/core'

defineProps<{
  data: {
    image: string
    name: string
    nativeName: string
    isRoot?: boolean
    role?: string
    animeTitle?: string
  }
}>()

const cardRef = ref<HTMLElement | null>(null)
const tiltX = ref(0)
const tiltY = ref(0)
let rafId: number | null = null

const handleMouseMove = (e: MouseEvent) => {
  if (rafId) return
  
  rafId = requestAnimationFrame(() => {
    if (!cardRef.value) {
      rafId = null
      return
    }
    const rect = cardRef.value.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    tiltX.value = (y - centerY) / 15
    tiltY.value = (centerX - x) / 15
    rafId = null
  })
}

const resetTilt = () => {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  tiltX.value = 0
  tiltY.value = 0
}
</script>

<template>
  <div 
    ref="cardRef"
    class="character-card sketch-panel" 
    :class="{ 'root-node': data.isRoot }"
    @mousemove="handleMouseMove"
    @mouseleave="resetTilt"
    :style="{
      transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`
    }"
  >
    <div class="tape"></div>
    
    <Handle v-if="data.isRoot" type="source" :position="Position.Right" class="custom-handle" />
    <Handle v-else type="target" :position="Position.Left" class="custom-handle" />

    <div v-if="data.isRoot" class="root-badge hand-font">Protagonist</div>
    
    <div class="card-content">
      <div class="image-wrapper">
        <img :src="data.image" alt="" />
      </div>
      
      <div class="info-section">
        <div class="native-name serif-font">{{ data.nativeName }}</div>
        <div class="full-name hand-font">{{ data.name }}</div>
        <div v-if="data.animeTitle" class="anime-title hand-font">{{ data.animeTitle }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.character-card {
  position: relative;
  min-width: 260px;
  padding: 15px;
  background-color: var(--card-bg);
  transition: transform 0.2s ease-out, box-shadow 0.3s ease;
  cursor: pointer;
  transform-style: preserve-3d;
  will-change: transform;
  pointer-events: all !important;
}

.tape {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%) rotate(-3deg);
  width: 100px;
  height: 25px;
  background-color: var(--tape-color);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  z-index: 10;
  opacity: 0.9;
}

.character-card:hover {
  box-shadow: 8px 8px 0 var(--shadow-color);
  transform: translateY(-2px);
}

.root-node {
  border-width: 3px;
  border-color: var(--jp-red);
}

.card-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.image-wrapper {
  width: 70px;
  height: 100px;
  overflow: hidden;
  border: 2px solid var(--border-color);
  background: #fff;
  padding: 4px;
  box-shadow: 2px 2px 0 var(--shadow-color);
  transform: rotate(-2deg);
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(15%) sepia(25%) contrast(1.1);
}

.info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.native-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-muted);
  opacity: 0.3;
  position: absolute;
  top: 5px;
  right: 10px;
  pointer-events: none;
}

.full-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1.2;
  margin-bottom: 0.3rem;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 5px;
}

.anime-title {
  font-size: 0.95rem;
  color: var(--pencil-gray);
  line-height: 1.3;
}

.root-badge {
  position: absolute;
  bottom: -15px;
  right: -10px;
  background: var(--jp-red);
  color: #fff;
  font-size: 1.1rem;
  padding: 0.2rem 0.8rem;
  border: 2px solid var(--bg-color);
  box-shadow: 2px 2px 0 var(--shadow-color);
  transform: rotate(-5deg);
  z-index: 5;
}

.custom-handle {
  width: 14px;
  height: 14px;
  background: var(--card-bg);
  border: 2px solid var(--pencil-gray);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s;
}

.character-card:hover .custom-handle {
  opacity: 1;
}
</style>
