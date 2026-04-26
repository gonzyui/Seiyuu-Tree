<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)

interface InkSpot {
  x: number
  y: number
  size: number
  opacity: number
  growth: number
  maxSize: number
}

const spots = ref<InkSpot[]>([])

const addSpot = (x: number, y: number) => {
  spots.value.push({
    x,
    y,
    size: 2,
    opacity: 0.3,
    growth: Math.random() * 2 + 1,
    maxSize: Math.random() * 80 + 40
  })
  
  if (spots.value.length > 30) {
    spots.value.shift()
  }
}

let animationId: number

const draw = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  spots.value.forEach((spot, index) => {
    if (spot.size < spot.maxSize) {
      spot.size += spot.growth
    } else {
      spot.opacity -= 0.002
    }

    if (spot.opacity <= 0) {
      spots.value.splice(index, 1)
      return
    }

    ctx.beginPath()
    const gradient = ctx.createRadialGradient(spot.x, spot.y, 0, spot.x, spot.y, spot.size)
    gradient.addColorStop(0, `rgba(15, 15, 15, ${spot.opacity})`)
    gradient.addColorStop(0.6, `rgba(15, 15, 15, ${spot.opacity * 0.4})`)
    gradient.addColorStop(1, 'rgba(15, 15, 15, 0)')
    
    ctx.fillStyle = gradient
    ctx.arc(spot.x, spot.y, spot.size, 0, Math.PI * 2)
    ctx.fill()
  })

  animationId = requestAnimationFrame(draw)
}

const handleResize = () => {
  if (canvasRef.value) {
    canvasRef.value.width = window.innerWidth
    canvasRef.value.height = window.innerHeight
  }
}

let lastSpotTime = 0
const handleMouseMove = (e: MouseEvent) => {
  const now = Date.now()
  if (now - lastSpotTime > 150) {
    addSpot(e.clientX, e.clientY)
    lastSpotTime = now
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
  window.addEventListener('mousemove', handleMouseMove)
  draw()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('mousemove', handleMouseMove)
  cancelAnimationFrame(animationId)
})
</script>

<template>
  <canvas ref="canvasRef" class="ink-canvas"></canvas>
</template>

<style scoped>
.ink-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  opacity: 0.6;
}
</style>
