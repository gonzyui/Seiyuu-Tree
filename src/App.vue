<script setup lang="ts">
import { ref, shallowRef, onMounted } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { searchCharacters, fetchSeiyuuTree } from './lib/anilist'
import CharacterNode from './components/CharacterNode.vue'
import StaffNode from './components/StaffNode.vue'
import BrushEdge from './components/BrushEdge.vue'
import InfoModal from './components/InfoModal.vue'
import { Search, Loader2, Download, Sun, Moon } from 'lucide-vue-next'
import { toPng } from 'html-to-image'
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'
import MobileBlocker from './components/MobileBlocker.vue'
import { inject } from '@vercel/analytics'

const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobileOrTablet = breakpoints.smaller('lg') // lg is 1024px

const flowId = 'seiyuu-tree-flow'
const { nodes, edges, setNodes, setEdges, fitView, zoomIn, zoomOut } = useVueFlow({
  id: flowId
})

const nodeTypes = {
  character: shallowRef(CharacterNode),
  staff: shallowRef(StaffNode),
}

const edgeTypes = {
  brush: shallowRef(BrushEdge),
}

const theme = ref<'light' | 'dark' | 'ink'>('light')
const toggleTheme = () => {
  if (theme.value === 'light') theme.value = 'dark'
  else theme.value = 'light'
  
  document.documentElement.setAttribute('data-theme', theme.value)
}

onMounted(() => {
  document.documentElement.setAttribute('data-theme', theme.value)
  inject()
})

const searchQuery = ref('')
const searchResults = ref<any[]>([])
const isLoading = ref(false)
const showResults = ref(false)

const isModalOpen = ref(false)
const modalData = ref<any>(null)
const modalType = ref<'character' | 'staff'>('character')

const errorMessage = ref('')
const showError = (msg: string) => {
  errorMessage.value = msg
  setTimeout(() => {
    errorMessage.value = ''
  }, 5000)
}

const handleSearch = async () => {
  if (searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }
  
  isLoading.value = true
  try {
    searchResults.value = await searchCharacters(searchQuery.value)
    showResults.value = true
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

const buildTree = async (characterId: number) => {
  showResults.value = false
  searchQuery.value = ''
  isLoading.value = true
  isModalOpen.value = false
  
  try {
    const data = await fetchSeiyuuTree(characterId)
    
    if (!data.voiceActor) throw new Error('No seiyuu found')

    const newNodes: any[] = []
    const newEdges: any[] = []

    newNodes.push({
      id: `char-${data.rootCharacter.id}`,
      type: 'character',
      position: { x: 0, y: 0 },
      data: {
        ...data.rootCharacter,
        isRoot: true,
        image: data.rootCharacter.image.large,
        name: data.rootCharacter.name.full,
        nativeName: data.rootCharacter.name.native
      }
    })

    newNodes.push({
      id: `staff-${data.voiceActor.id}`,
      type: 'staff',
      position: { x: 500, y: 0 },
      data: {
        ...data.voiceActor,
        image: data.voiceActor.image.large,
        name: data.voiceActor.name.full,
        nativeName: data.voiceActor.name.native
      }
    })

    newEdges.push({
      id: `edge-root-staff`,
      source: `char-${data.rootCharacter.id}`,
      target: `staff-${data.voiceActor.id}`,
      type: 'brush',
      animated: true
    })

    const spacing = 180
    const startY = -((data.otherRoles.length - 1) * spacing) / 2
    
    data.otherRoles.forEach((role, index) => {
      const centerIndex = (data.otherRoles.length - 1) / 2
      const distanceFromCenter = Math.abs(index - centerIndex)
      const curveX = Math.pow(distanceFromCenter, 2) * 12

      newNodes.push({
        id: `char-${role.character.id}`,
        type: 'character',
        position: { x: 1000 + curveX, y: startY + index * spacing },
        data: {
          ...role.character,
          image: role.character.image.medium,
          name: role.character.name.full,
          nativeName: role.character.name.native,
          animeTitle: role.anime.title.userPreferred
        }
      })

      newEdges.push({
        id: `edge-staff-${role.character.id}`,
        source: `staff-${data.voiceActor.id}`,
        target: `char-${role.character.id}`,
        type: 'brush',
        animated: true
      })
    })

    setNodes(newNodes)
    setEdges(newEdges)
    
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 1000, minZoom: 0.5 })
    }, 200)
    
  } catch (e: any) {
    console.error(e)
    showError(e.message || "Impossible to load tree.")
  } finally {
    isLoading.value = false
  }
}

const onNodeClick = (event: any) => {
  const node = event.node
  modalData.value = node.data
  modalType.value = node.type as 'character' | 'staff'
  isModalOpen.value = true
}

const handleExplore = (id: number) => {
  buildTree(id)
}

const exportTree = async () => {
  const el = document.querySelector('.visual-tree') as HTMLElement
  if (!el) return
  
  isLoading.value = true
  try {
    const uiElements = document.querySelectorAll('.top-bar, .app-footer, .ui-overlay')
    uiElements.forEach(el => (el as HTMLElement).style.opacity = '0')
    
    await new Promise(r => setTimeout(r, 100))

    const dataUrl = await toPng(el, {
      backgroundColor: theme.value === 'dark' ? '#1e1e1e' : '#f4f1ea',
      cacheBust: true,
      skipFonts: true,
    })
    
    const link = document.createElement('a')
    link.download = `seiyuu-tree-sketch-${Date.now()}.png`
    link.href = dataUrl
    link.click()
    
    uiElements.forEach(el => (el as HTMLElement).style.opacity = '')
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="app-container hand-font">
    <MobileBlocker v-if="isMobileOrTablet" />
    
    <div class="top-bar">
      <div class="actions-group">
        <button class="action-btn sketch-panel" @click="toggleTheme()" :title="`Theme: ${theme}`">
          <Sun v-if="theme === 'light'" :size="20" />
          <Moon v-else :size="20" />
        </button>
        <button class="action-btn sketch-panel" @click="zoomIn()">+</button>
        <button class="action-btn sketch-panel" @click="zoomOut()">-</button>
        <button class="action-btn sketch-panel highlight" @click="exportTree" :disabled="isLoading">
          <Download :size="18" />
          <span class="btn-text">Draw Export</span>
        </button>
      </div>

      <div class="search-container">
        <div class="search-bar sketch-panel">
          <input 
            v-model="searchQuery" 
            @input="handleSearch" 
            @keyup.enter="handleSearch"
            placeholder="Search character..."
            class="search-input hand-font"
          />
          <div class="search-icon">
            <Loader2 v-if="isLoading" class="animate-spin" />
            <Search v-else :size="18" />
          </div>
        </div>

        <div v-if="showResults && searchResults.length > 0" class="search-results sketch-panel">
          <div 
            v-for="result in searchResults" 
            :key="result.id" 
            class="result-item"
            @click="buildTree(result.id)"
          >
            <img :src="result.image.medium" alt="" />
            <div class="result-info">
              <div class="main-name hand-font">{{ result.name.full }}</div>
              <div class="sub-name serif-font">{{ result.name.native }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <VueFlow
      :id="flowId"
      :nodes="nodes"
      :edges="edges"
      :node-types="nodeTypes"
      :edge-types="edgeTypes"
      @node-click="onNodeClick"
      class="visual-tree"
      :default-zoom="0.6"
      :min-zoom="0.3"
      :max-zoom="4"
    >
      <!-- Background pattern like dot grid paper -->
      <Background pattern-color="var(--border-color)" :gap="25" :size="1.5" />
      
      <!-- SVG Filters for Pencil Effect -->
      <svg style="position: absolute; width: 0; height: 0;">
        <defs>
          <filter id="pencil-stroke" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
    </VueFlow>

    <InfoModal 
      :show="isModalOpen" 
      :data="modalData" 
      :type="modalType"
      @close="isModalOpen = false"
      @explore="handleExplore"
    />

    <div class="ui-overlay">
      <div class="hanko serif-font">声</div>
      <div class="overlay-text">
        <h1 class="serif-font">Seiyuu Tree</h1>
        <p class="hand-font">Discover the voice behind the character (Sketches)</p>
      </div>
    </div>

    <footer class="app-footer">
      <div class="credit-block sketch-panel">
        <span class="credit-label">Drawn by</span>
        <a href="https://gonzyuidev.xyz" target="_blank" class="credit-value hand-font">gonzyui</a>
      </div>
      <div class="credit-block sketch-panel">
        <span class="credit-label">Ink from</span>
        <a href="https://ani-client.js.org" target="_blank" class="credit-value hand-font">ani-client</a>
      </div>
    </footer>

    <Transition name="slide-up">
      <div v-if="errorMessage" class="error-toast sketch-panel">
        <div class="error-icon hand-font">!</div>
        <div class="error-content">
          <div class="error-msg">{{ errorMessage }}</div>
        </div>
        <button class="close-toast" @click="errorMessage = ''">×</button>
      </div>
    </Transition>
  </div>
</template>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';

.top-bar {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 0;
  z-index: 1000;
  pointer-events: none;
}

.actions-group {
  position: absolute;
  top: 2rem; left: 2rem;
  display: flex; gap: 0.75rem;
  pointer-events: auto;
}

.action-btn {
  color: var(--text-color);
  padding: 0 1rem;
  height: 44px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.1rem;
  transition: all 0.2s ease;
  overflow: hidden;
  position: relative;
}

.action-btn:hover {
  transform: translateY(-2px) rotate(-2deg);
  box-shadow: 6px 6px 0 var(--shadow-color);
}

.action-btn.highlight {
  color: var(--jp-red);
  border-color: var(--jp-red);
}

.search-container {
  position: absolute;
  top: 2rem; right: 2rem;
  width: 320px;
  pointer-events: auto;
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 0.3rem 0.5rem;
  transition: transform 0.3s;
}

.search-bar:focus-within {
  transform: scale(1.02);
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-color);
  font-size: 1.2rem;
  padding: 0.4rem 0.8rem;
  outline: none;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

.search-results {
  position: absolute;
  top: calc(100% + 1rem);
  right: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background 0.2s;
  gap: 1rem;
  border-bottom: 2px dashed var(--border-color);
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover {
  background: var(--border-color);
}

.result-item img {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  border: 2px solid var(--text-color);
  box-shadow: 2px 2px 0 var(--shadow-color);
  filter: grayscale(20%) sepia(20%);
}

.result-info {
  display: flex;
  flex-direction: column;
}

.main-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-color);
}

.sub-name {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.visual-tree {
  width: 100%; height: 100%;
  background: transparent;
  z-index: 10;
}

.ui-overlay {
  position: absolute;
  bottom: 3rem; left: 2rem;
  text-align: left;
  z-index: 20;
  pointer-events: none;
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.hanko {
  width: 60px;
  height: 60px;
  background-color: var(--jp-red);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  border-radius: 8px;
  border: 3px solid #fff;
  box-shadow: 0 0 0 3px var(--jp-red), 4px 4px 0 var(--shadow-color);
  transform: rotate(-10deg);
  margin-bottom: 10px;
}

.overlay-text h1 {
  font-size: 4rem;
  color: var(--text-color);
  margin: 0;
  line-height: 1;
}

.overlay-text p {
  margin: 0.5rem 0 0 0;
  font-size: 1.2rem;
  color: var(--text-muted);
}

.app-footer {
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  gap: 1rem;
  z-index: 100;
  pointer-events: auto;
}

.credit-block {
  padding: 0.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0;
  transition: transform 0.2s;
  background: var(--card-bg);
}

.credit-block:hover {
  transform: translateY(-2px) rotate(2deg);
}

.credit-label {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.credit-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-color);
  text-decoration: none;
  transition: color 0.2s;
}

.credit-value:hover {
  color: var(--jp-red);
}

.error-toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 10001;
  border-left: 6px solid var(--jp-red);
}

.error-icon {
  color: var(--jp-red);
  font-weight: bold;
  font-size: 1.5rem;
}

.error-msg {
  font-size: 1.1rem;
  color: var(--text-color);
}

.close-toast {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-muted);
  padding: 0;
  margin-left: 1rem;
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, 40px);
}
</style>
