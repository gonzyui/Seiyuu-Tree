<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

defineProps<{
  data: {
    image: string
    name: string
    nativeName: string
  }
}>()
</script>

<template>
  <div class="staff-node serif">
    <Handle type="target" :position="Position.Left" />
    <Handle type="source" :position="Position.Right" />
    
    <div class="role-label vertical-text">声優</div>

    <div class="staff-content">
      <div class="image-frame">
        <img :src="data.image" alt="" />
      </div>
      
      <div class="staff-info">
        <div class="native">{{ data.nativeName }}</div>
        <div class="full">{{ data.name }}</div>
        <div class="click-hint">Click for Info</div>
      </div>
    </div>

    <div class="brush-stroke"></div>
  </div>
</template>

<style scoped>
.staff-node {
  background: var(--card-bg);
  color: var(--text-color);
  padding: 2rem;
  display: flex;
  align-items: center;
  border-radius: 0;
  min-width: 300px;
  box-shadow: 15px 15px 0 var(--jp-red);
  border: 6px solid var(--text-color);
  position: relative;
}

.staff-node::before {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border: 1px solid var(--text-color);
  pointer-events: none;
}

.role-label {
  font-size: 0.8rem;
  font-weight: 900;
  color: var(--jp-red);
  border: 1px solid var(--jp-red);
  padding: 0.5rem 0.2rem;
  margin-right: 1.5rem;
  background: rgba(188, 0, 45, 0.05);
}

.staff-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.image-frame {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--jp-red);
  flex-shrink: 0;
}

.image-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.staff-info {
  text-align: center;
}

.native {
  font-size: 1.1rem;
  font-weight: 700;
}

.full {
  font-size: 0.75rem;
  opacity: 0.7;
}

.click-hint {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--jp-red);
  margin-top: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s;
}

.staff-node:hover .click-hint {
  opacity: 1;
}
</style>
