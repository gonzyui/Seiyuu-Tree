<script setup lang="ts">
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
</script>

<template>
  <div class="character-card" :class="{ 'root-node': data.isRoot }">
    <div class="card-content">
      <img :src="data.image" alt="" />
      
      <div class="names">
        <div class="native-name vertical-text serif">{{ data.nativeName }}</div>
        <div class="full-name serif">{{ data.name }}</div>
        <div v-if="data.animeTitle" class="anime-title">{{ data.animeTitle }}</div>
      </div>
    </div>

    <div v-if="data.isRoot" class="root-badge">START</div>
  </div>
</template>

<style scoped>
.character-card {
  background: var(--card-bg);
  color: var(--text-color);
  border: 4px solid #d4af37;
  display: flex;
  position: relative;
  min-width: 240px;
  overflow: hidden;
  box-shadow: 10px 10px 0 rgba(0,0,0,0.2);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
}

.character-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 15px 15px 0 rgba(188, 0, 45, 0.2);
}

.root-node {
  border-color: var(--jp-red);
  box-shadow: 10px 10px 0 var(--jp-red);
}

.card-content {
  display: flex;
  flex: 1;
  background: linear-gradient(90deg, transparent 50%, rgba(212, 175, 55, 0.05) 100%);
}

img {
  width: 110px;
  height: 160px;
  object-fit: cover;
  border-right: 2px solid var(--ink-black);
}

.names {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  position: relative;
}

.native-name {
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
  font-size: 1.4rem;
  font-weight: 900;
  color: var(--text-color);
  opacity: 0.9;
}

.full-name {
  font-size: 0.85rem;
  font-weight: 700;
  margin-top: auto;
  color: var(--jp-red);
  letter-spacing: 0.05em;
  border-top: 1px solid var(--glass-border);
  padding-top: 0.5rem;
}

.anime-title {
  font-size: 0.65rem;
  opacity: 0.6;
  margin-top: 0.2rem;
  font-weight: 500;
}

.root-badge {
  position: absolute;
  top: 0;
  left: 0;
  background: var(--jp-red);
  color: white;
  font-size: 0.6rem;
  padding: 0.2rem 0.5rem;
  font-weight: 900;
  letter-spacing: 0.1em;
}
</style>
