<script setup lang="ts">
import { ref } from 'vue'
import { Handle, Position } from '@vue-flow/core'

defineProps<{
  data: {
    image: string
    name: string
    nativeName: string
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
    class="staff-node sketch-panel"
    @mousemove="handleMouseMove"
    @mouseleave="resetTilt"
    :style="{
      transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`
    }"
  >
    <div class="tape-top-left"></div>
    <div class="tape-bottom-right"></div>
    
    <Handle type="target" :position="Position.Left" class="custom-handle" />
    <Handle type="source" :position="Position.Right" class="custom-handle" />
    
    <div class="staff-content">
      <div class="image-frame">
        <img :src="data.image" alt="" />
      </div>
      
      <div class="staff-info">
        <div class="role-badge hand-font">Seiyuu (Voice)</div>
        <div class="native serif-font">{{ data.nativeName }}</div>
        <div class="full hand-font">{{ data.name }}</div>
      </div>
    </div>
    
    <div class="scribble"></div>
  </div>
</template>

<style scoped>
.staff-node {
  padding: 20px;
  min-width: 300px;
  position: relative;
  transform-style: preserve-3d;
  will-change: transform;
  transition: transform 0.2s ease-out, box-shadow 0.3s ease;
  pointer-events: all !important;
  background-color: var(--card-bg);
}

.tape-top-left, .tape-bottom-right {
  position: absolute;
  width: 60px;
  height: 20px;
  background-color: var(--tape-color);
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  z-index: 10;
  opacity: 0.8;
}

.tape-top-left {
  top: -8px;
  left: -15px;
  transform: rotate(-45deg);
}

.tape-bottom-right {
  bottom: -8px;
  right: -15px;
  transform: rotate(-45deg);
}

.staff-node:hover {
  box-shadow: 10px 10px 0 var(--shadow-color);
}

.staff-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.image-frame {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  padding: 4px;
  border: 2px dashed var(--pencil-gray);
  position: relative;
  flex-shrink: 0;
  background: var(--bg-color);
}

.image-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  filter: sepia(50%) hue-rotate(-10deg) saturate(1.5) contrast(1.1);
}

.staff-info {
  text-align: left;
}

.role-badge {
  font-size: 1.2rem;
  color: var(--jp-red);
  margin-bottom: 0.2rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 2px;
}

.native {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1.1;
  margin-bottom: 0.2rem;
}

.full {
  font-size: 1.2rem;
  color: var(--text-muted);
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

.staff-node:hover .custom-handle {
  opacity: 1;
}

.scribble {
  position: absolute;
  bottom: 10px;
  right: 20px;
  width: 40px;
  height: 10px;
  border-bottom: 2px dashed var(--border-color);
  transform: rotate(-5deg);
}
</style>
