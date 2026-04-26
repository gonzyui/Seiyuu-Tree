<script setup lang="ts">
import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@vue-flow/core'
import { computed } from 'vue'

const props = defineProps<EdgeProps>()

const path = computed(() => getSmoothStepPath(props))
</script>

<template>
  <g class="brush-edge-group">
    <BaseEdge 
      :path="path[0]" 
      :style="{ 
        stroke: 'var(--jp-red)', 
        strokeWidth: '4px',
        filter: 'url(#ink-bleed)',
        opacity: 0.8
      }" 
    />
    
    <path
      :d="path[0]"
      fill="none"
      stroke="var(--jp-red)"
      stroke-width="1.5"
      stroke-dasharray="2 4"
      opacity="0.3"
      filter="url(#rough-edge)"
    />

    <BaseEdge 
      v-if="props.animated"
      :path="path[0]" 
      class="ink-animation"
    />
  </g>
</template>

<style scoped>
.brush-edge-group {
  pointer-events: none;
}

.ink-animation {
  stroke: var(--jp-red);
  stroke-width: 6px;
  stroke-linecap: round;
  stroke-dasharray: 10, 20;
  animation: inkFlow 3s linear infinite;
  opacity: 0.2;
  filter: blur(4px);
}

@keyframes inkFlow {
  from {
    stroke-dashoffset: 100;
  }
  to {
    stroke-dashoffset: 0;
  }
}
</style>
