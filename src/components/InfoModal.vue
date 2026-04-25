<script setup lang="ts">
import { computed } from 'vue'
import { X } from 'lucide-vue-next'

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
      <div class="modal-content">
        <button class="close-btn" @click="$emit('close')">
          <X :size="32" />
        </button>

        <div class="modal-body">
          <div class="side-info">
            <img :src="data.image?.large || data.image" class="profile-img" />
            <div class="hanko-small">鑑定</div>
            <button v-if="type === 'character'" class="explore-btn" @click="$emit('explore', data.id)">
              EXPLORE TREE
            </button>
          </div>

          <div class="main-info">
            <h2 class="native-title serif">{{ data.nativeName || data.name?.native }}</h2>
            <h1 class="full-title serif">{{ data.name?.full || data.name }}</h1>

            <div class="details-grid">
              <div v-if="data.gender" class="detail">
                <span class="label">Gender:</span> {{ data.gender }}
              </div>
              <div v-if="data.age" class="detail">
                <span class="label">Age:</span> {{ data.age }}
              </div>
              <div v-if="data.homeTown" class="detail">
                <span class="label">Hometown:</span> {{ data.homeTown }}
              </div>
              <div v-if="data.primaryOccupations" class="detail">
                <span class="label">Roles:</span> {{ data.primaryOccupations.join(', ') }}
              </div>
            </div>

            <div class="description" v-html="parsedDescription"></div>

            <div class="media-section">
              <h3 class="section-title serif">Notable Media</h3>
              <div class="media-grid">
                <div 
                  v-for="media in (type === 'staff' ? data.characterMedia?.edges?.map((e: any) => e.node) : data.media)" 
                  :key="media.id" 
                  class="media-card"
                >
                  <img :src="media.coverImage?.large || media.coverImage?.medium" :alt="media.title?.userPreferred" />
                  <div class="media-title">{{ media.title?.userPreferred }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="brush-border-bottom"></div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(5px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-content {
  background: var(--card-bg);
  color: var(--text-color);
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  position: relative;
  overflow-y: auto;
  box-shadow: 20px 20px 0 var(--jp-red);
  border: 1px solid var(--text-color);
}

.modal-body {
  display: flex;
  padding: 3rem;
  gap: 3rem;
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
}

.profile-img {
  width: 250px;
  height: 380px;
  object-fit: cover;
  border: 4px solid var(--text-color);
}

.hanko-small {
  border: 2px solid var(--jp-red);
  color: var(--jp-red);
  padding: 0.2rem 0.5rem;
  font-weight: 900;
  transform: rotate(-5deg);
}

.main-info { flex: 1; }

.native-title {
  font-size: 2rem;
  margin: 0;
  opacity: 0.6;
}

.full-title {
  font-size: 3.5rem;
  margin: 0 0 1.5rem 0;
  color: var(--jp-red);
  line-height: 1;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px dashed var(--glass-border);
}

.detail .label {
  font-weight: 700;
  color: var(--jp-red);
}

.description {
  line-height: 1.8;
  font-size: 1.1rem;
  white-space: pre-wrap;
  margin-bottom: 3rem;
}

.description :deep(br) {
  display: block;
  margin: 10px 0;
}

.media-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(0,0,0,0.1);
}

.section-title {
  font-size: 1.5rem;
  color: var(--jp-red);
  margin-bottom: 1.5rem;
  border-left: 4px solid var(--jp-red);
  padding-left: 1rem;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 1.5rem;
}

.media-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.media-card img {
  width: 100%;
  aspect-ratio: 2/3;
  object-fit: cover;
  border: 1px solid rgba(0,0,0,0.1);
  box-shadow: 4px 4px 0 rgba(188, 0, 45, 0.1);
}

.media-title {
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.2;
  opacity: 0.8;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-color);
  opacity: 0.5;
  transition: opacity 0.2s;
}

.close-btn:hover { opacity: 1; }

.explore-btn {
  width: 100%;
  padding: 1rem;
  background: var(--text-color);
  color: var(--card-bg);
  border: none;
  font-family: 'Noto Serif JP', serif;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.explore-btn:hover {
  background: var(--jp-red);
  transform: scale(1.05);
}

.brush-border-bottom {
  height: 10px;
  background: var(--jp-red);
  width: 100%;
}

.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
</style>
