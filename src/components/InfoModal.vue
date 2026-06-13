<script setup lang="ts">
import { computed } from 'vue'
import { X, ExternalLink } from 'lucide-vue-next'

const props = defineProps<{
  show: boolean
  data: any
  type: 'character' | 'staff'
}>()

defineEmits(['close', 'explore'])

const cleanMarkdown = (text: string) => {
  if (!text) return ''
  return text
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    .replace(/~([^~]+)~/g, '<del>$1</del>')
    .replace(/!~([^~]+)~!/g, '<span class="spoiler">$1</span>')
    .replace(/\n/g, '<br>')
}

const parsedDescription = computed(() => {
  return cleanMarkdown(props.data?.description || '')
})
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content sketch-panel">
        <button class="close-btn" @click="$emit('close')">
          <X :size="32" />
        </button>

        <div class="modal-body">
          <div class="side-info">
            <div class="image-container">
              <div class="tape-top-center"></div>
              <img :src="data.image?.large || data.image" class="profile-img" />
            </div>
            
            <button v-if="type === 'character'" class="explore-btn hand-font sketch-panel" @click="$emit('explore', data.id)">
              <span>Explore Tree</span>
              <ExternalLink :size="16" />
            </button>
          </div>

          <div class="main-info">
            <h2 class="native-title serif-font">{{ data.nativeName || data.name?.native }}</h2>
            <h1 class="full-title hand-font">{{ data.name?.full || data.name }}</h1>

            <div class="details-grid">
              <div v-if="data.gender" class="detail-card">
                <span class="label hand-font">Gender:</span>
                <span class="value hand-font">{{ data.gender }}</span>
              </div>
              <div v-if="data.age" class="detail-card">
                <span class="label hand-font">Age:</span>
                <span class="value hand-font">{{ data.age }}</span>
              </div>
              <div v-if="data.homeTown" class="detail-card">
                <span class="label hand-font">Hometown:</span>
                <span class="value hand-font">{{ data.homeTown }}</span>
              </div>
            </div>
            
            <div v-if="data.primaryOccupations" class="occupations">
              <span v-for="occ in data.primaryOccupations" :key="occ" class="occ-badge hand-font">{{ occ }}</span>
            </div>

            <div class="description hand-font" v-html="parsedDescription"></div>

            <div class="media-section" v-if="(type === 'staff' ? data.characterMedia?.edges : data.media)?.length">
              <h3 class="section-title hand-font">Notable Media</h3>
              <div class="media-grid">
                <div 
                  v-for="media in (type === 'staff' ? data.characterMedia?.edges?.map((e: any) => e.node) : data.media)" 
                  :key="media.id" 
                  class="media-card"
                >
                  <img :src="media.coverImage?.large || media.coverImage?.medium" :alt="media.title?.userPreferred" />
                  <div class="media-title hand-font">{{ media.title?.userPreferred }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-content {
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  position: relative;
  overflow-y: auto;
  padding: 0;
}

.modal-body {
  display: flex;
  padding: 3rem;
  gap: 3rem;
  background-image: 
    linear-gradient(transparent 95%, var(--border-color) 95%);
  background-size: 100% 30px; /* Notebook lines */
}

@media (max-width: 768px) {
  .modal-body {
    flex-direction: column;
    padding: 1.5rem;
  }
}

.side-info {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 250px;
}

.image-container {
  position: relative;
  width: 100%;
  padding: 8px;
  background: #fff;
  border: 1px solid var(--border-color);
  box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
  transform: rotate(-1deg);
}

.tape-top-center {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%) rotate(2deg);
  width: 80px;
  height: 25px;
  background-color: var(--tape-color);
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  z-index: 10;
}

.profile-img {
  width: 100%;
  height: 350px;
  object-fit: cover;
  filter: sepia(30%) contrast(1.1);
}

.main-info { 
  flex: 1; 
  display: flex;
  flex-direction: column;
  background: var(--card-bg);
  padding: 0 1rem;
}

.native-title {
  font-size: 3rem;
  margin: 0;
  color: var(--text-muted);
  opacity: 0.3;
}

.full-title {
  font-size: 3rem;
  margin: -20px 0 1.5rem 0;
  color: var(--jp-red);
  line-height: 1.1;
  border-bottom: 3px solid var(--border-color);
  padding-bottom: 10px;
}

.details-grid {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.detail-card {
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
}

.detail-card .label {
  font-size: 1.2rem;
  color: var(--jp-red);
}

.detail-card .value {
  font-size: 1.4rem;
  color: var(--text-color);
}

.occupations {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.occ-badge {
  font-size: 1.1rem;
  border: 2px dashed var(--border-color);
  color: var(--pencil-gray);
  padding: 0.2rem 0.6rem;
}

.description {
  line-height: 1.8;
  font-size: 1.2rem;
  color: var(--pencil-gray);
  margin-bottom: 3rem;
}

.description :deep(strong) {
  color: var(--jp-red);
}

.description :deep(br) {
  display: block;
  margin: 10px 0;
}

.media-section {
  margin-top: auto;
  padding-top: 2rem;
  border-top: 2px solid var(--border-color);
}

.section-title {
  font-size: 2rem;
  color: var(--text-color);
  margin-bottom: 1.5rem;
  border-left: 5px solid var(--jp-red);
  padding-left: 10px;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1.5rem;
}

.media-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.media-card:hover {
  transform: translateY(-5px) rotate(2deg);
}

.media-card img {
  width: 100%;
  aspect-ratio: 2/3;
  object-fit: cover;
  border: 1px solid var(--border-color);
  padding: 2px;
  background: #fff;
  box-shadow: 2px 2px 0 var(--shadow-color);
}

.media-title {
  font-size: 1rem;
  color: var(--text-color);
  line-height: 1.2;
  text-align: center;
}

.close-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-color);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 10;
  opacity: 0.5;
}

.close-btn:hover { 
  color: var(--jp-red);
  transform: rotate(90deg);
  opacity: 1;
}

.explore-btn {
  width: 100%;
  padding: 0.8rem;
  color: var(--jp-red);
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.explore-btn:hover {
  background: var(--jp-red);
  color: #fff;
}

.modal-enter-active, .modal-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.95) rotate(-2deg);
}
</style>
