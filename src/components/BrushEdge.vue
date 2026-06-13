<script setup lang="ts">
import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@vue-flow/core'
import { computed } from 'vue'

const props = defineProps<EdgeProps>()

const path = computed(() => getSmoothStepPath({
  ...props,
  borderRadius: 0,
}))
</script>

<template>
  <g class="brush-edge-group">
    <BaseEdge 
      :path="path[0]" 
      :style="{ 
        stroke: 'var(--pencil-gray)', 
        strokeWidth: '3px',
        opacity: 0.8,
        filter: 'url(#pencil-stroke)'
      }" 
    />
    
    <path
      :d="path[0]"
      fill="none"
      stroke="var(--pencil-gray)"
      stroke-width="1"
      stroke-dasharray="5 10"
      opacity="0.5"
      transform="translate(2, 2)"
    />

    <BaseEdge 
      v-if="props.animated"
      :path="path[0]" 
      class="draw-animation"
    />
  </g>
</template>

<style scoped>
.brush-edge-group {
  pointer-events: none;
}

.draw-animation {
  stroke: var(--jp-red);
  stroke-width: 2px;
  stroke-linecap: square;
  stroke-dasharray: 20, 40;
  animation: drawFlow 1.5s linear infinite;
  opacity: 0.6;
}

@keyframes drawFlow {
  from {
    stroke-dashoffset: 60;
  }
  to {
    stroke-dashoffset: 0;
  }
}
</style>
