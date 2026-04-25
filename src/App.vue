<script setup lang="ts">
import { ref, shallowRef, onMounted } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { searchCharacters, fetchSeiyuuTree } from './lib/anilist'
import CharacterNode from './components/CharacterNode.vue'
import StaffNode from './components/StaffNode.vue'
import InfoModal from './components/InfoModal.vue'
import { Search, Loader2, Download, Sun, Moon } from 'lucide-vue-next'
import { toPng } from 'html-to-image'

const flowId = 'seiyuu-tree-flow'
const { nodes, edges, setNodes, setEdges, fitView, zoomIn, zoomOut } = useVueFlow({
  id: flowId
})

const nodeTypes = {
  character: shallowRef(CharacterNode),
  staff: shallowRef(StaffNode),
}

const theme = ref<'dark' | 'light'>('dark')
const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', theme.value)
}

onMounted(() => {
  document.documentElement.setAttribute('data-theme', theme.value)
})

const searchQuery = ref('')
const searchResults = ref<any[]>([])
const isLoading = ref(false)
const showResults = ref(false)

const isModalOpen = ref(false)
const modalData = ref<any>(null)
const modalType = ref<'character' | 'staff'>('character')

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
      position: { x: 700, y: 0 },
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
      animated: true
    })

    const spacing = 300
    const startY = -((data.otherRoles.length - 1) * spacing) / 2
    
    data.otherRoles.forEach((role, index) => {
      newNodes.push({
        id: `char-${role.character.id}`,
        type: 'character',
        position: { x: 1400, y: startY + index * spacing },
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
        animated: true
      })
    })

    setNodes(newNodes)
    setEdges(newEdges)
    
    setTimeout(() => {
      fitView({ padding: 0.3, duration: 1000 })
    }, 200)
    
  } catch (e) {
    console.error(e)
    alert("Could not load the tree.")
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
    const uiElements = document.querySelectorAll('.top-bar, .app-footer, .ui-overlay p, .bg-kanji')
    uiElements.forEach(el => (el as HTMLElement).style.opacity = '0')
    
    await new Promise(r => setTimeout(r, 100))

    const dataUrl = await toPng(el, {
      backgroundColor: theme.value === 'dark' ? '#0f0f0f' : '#fcfaf2',
      cacheBust: true,
      skipFonts: true,
    })
    
    const link = document.createElement('a')
    link.download = `koe-no-ki-${Date.now()}.png`
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
  <div class="app-container">
    <div class="bg-kanji">声</div>
    <div class="paper-texture"></div>
    <div class="sakura-container">
      <div v-for="i in 15" :key="i" class="petal"></div>
    </div>

    <div class="top-bar">
      <div class="actions-group">
        <button class="action-btn" @click="toggleTheme()" title="Toggle Theme">
          <Sun v-if="theme === 'dark'" :size="18" />
          <Moon v-else :size="18" />
        </button>
        <button class="action-btn" @click="zoomIn()">+</button>
        <button class="action-btn" @click="zoomOut()">-</button>
        <button class="action-btn highlight" @click="exportTree" :disabled="isLoading">
          <Download :size="18" />
          <span>SHIKISHI EXPORT</span>
        </button>
      </div>

      <div class="search-container">
        <div class="search-bar">
          <input 
            v-model="searchQuery" 
            @input="handleSearch" 
            @keyup.enter="handleSearch"
            placeholder="Search character (e.g. Lelouch)"
            class="search-input"
          />
          <div class="search-icon">
            <Loader2 v-if="isLoading" class="animate-spin" />
            <Search v-else />
          </div>
        </div>

        <div v-if="showResults && searchResults.length > 0" class="search-results glass-panel">
          <div 
            v-for="result in searchResults" 
            :key="result.id" 
            class="result-item"
            @click="buildTree(result.id)"
          >
            <img :src="result.image.medium" alt="" />
            <div class="result-info">
              <div class="serif">{{ result.name.full }}</div>
              <div class="native-sub">{{ result.name.native }}</div>
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
      @node-click="onNodeClick"
      class="visual-tree"
      :default-zoom="0.6"
      :min-zoom="0.1"
      :max-zoom="4"
    >
      <Background pattern-color="#ddd" :gap="40" />
    </VueFlow>

    <InfoModal 
      :show="isModalOpen" 
      :data="modalData" 
      :type="modalType"
      @close="isModalOpen = false"
      @explore="handleExplore"
    />

    <div class="ui-overlay serif">
      <div class="hanko">声</div>
      <h1 class="vertical-text">声の木</h1>
      <p>Visual Seiyuu Tree</p>
    </div>

    <footer class="app-footer serif">
      <div class="credit-block">
        <span class="credit-label">制作</span>
        <a href="https://gonzyuidev.xyz" target="_blank" class="credit-value">gonzyui</a>
      </div>
      <div class="credit-block">
        <span class="credit-label">技術</span>
        <a href="https://ani-client.js.org" target="_blank" class="credit-value">ani-client</a>
      </div>
    </footer>
  </div>
</template>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';

.paper-texture {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none; z-index: 999;
  opacity: 0.1;
  background-image: url('https://www.transparenttextures.com/patterns/parchment.png');
}

.petal {
  position: fixed;
  background: #ffb7c5;
  border-radius: 150% 0 150% 0;
  width: 15px;
  height: 15px;
  z-index: 998;
  opacity: 0.3;
  pointer-events: none;
  animation: fall 10s linear infinite;
}

@keyframes fall {
  0% { transform: translateY(-10vh) rotate(0deg); left: var(--left); }
  100% { transform: translateY(110vh) rotate(360deg); left: var(--left-end); }
}

.petal:nth-child(odd) { background: #ffd1dc; }
.petal:nth-child(1) { --left: 10%; --left-end: 20%; animation-delay: 0s; }
.petal:nth-child(2) { --left: 30%; --left-end: 25%; animation-delay: 2s; }
.petal:nth-child(3) { --left: 50%; --left-end: 60%; animation-delay: 4s; }
.petal:nth-child(4) { --left: 70%; --left-end: 65%; animation-delay: 6s; }
.petal:nth-child(5) { --left: 90%; --left-end: 80%; animation-delay: 8s; }

.top-bar {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 0;
  z-index: 1000;
  pointer-events: none;
}

.search-container {
  position: absolute;
  top: 3rem; right: 6rem;
  width: 300px;
  max-width: 30vw;
  pointer-events: auto;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 0.6rem 2.5rem 0.6rem 1.2rem;
  background: var(--card-bg);
  border: 4px solid var(--text-color);
  color: var(--text-color);
  font-family: 'Noto Serif JP', serif;
  font-size: 0.9rem;
  font-weight: 700;
  outline: none;
  box-shadow: 6px 6px 0 var(--jp-red);
}

.search-icon {
  position: absolute;
  right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color);
  opacity: 0.6;
  pointer-events: none;
}

.search-results {
  position: absolute;
  top: 100%;
  right: 0;
  width: 100%;
  margin-top: 2rem;
  border: 5px solid var(--ink-black);
  box-shadow: 15px 15px 0 var(--ink-black);
  z-index: 1000;
}

.result-item {
  background: var(--card-bg);
  display: flex;
  align-items: center;
  padding: 0.4rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid var(--glass-border);
  color: var(--text-color);
  gap: 0.8rem;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover {
  background: var(--jp-red);
  color: var(--paper-white);
}

.result-item img {
  width: 35px;
  height: 50px;
  object-fit: cover;
  border: 1px solid var(--ink-black);
}

.result-info {
  display: flex;
  flex-direction: column;
}

.result-info .serif {
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1.2;
}

.native-sub {
  font-size: 0.6rem;
  opacity: 0.6;
}

.actions-group {
  position: absolute;
  top: 3rem; left: 3rem;
  display: flex; gap: 1rem;
  pointer-events: auto;
}

.action-btn {
  background: var(--card-bg);
  border: 3px solid var(--text-color);
  color: var(--text-color);
  padding: 0.5rem 1.5rem;
  font-family: 'Noto Serif JP', serif;
  font-weight: 900;
  cursor: pointer;
  height: 50px;
  box-shadow: 5px 5px 0 var(--ink-black);
}

.action-btn.highlight {
  background: var(--jp-red);
  color: var(--paper-white);
  border-color: var(--ink-black);
  box-shadow: 5px 5px 0 var(--ink-black);
}

.visual-tree {
  width: 100%; height: 100%;
  background: var(--bg-color);
}

.ui-overlay {
  position: absolute;
  bottom: 4rem; right: 4rem;
  text-align: right;
  display: flex; flex-direction: column; align-items: flex-end;
}

.hanko {
  background: var(--jp-red);
  color: var(--paper-white);
  font-size: 2.5rem;
  padding: 0.2rem 0.8rem;
  margin-bottom: 2rem;
  border: 4px solid var(--paper-white);
  box-shadow: 0 0 0 4px var(--jp-red);
}

.ui-overlay h1 {
  font-size: 8rem;
  color: var(--text-color);
  line-height: 1;
  text-shadow: 6px 6px 0 var(--jp-red);
}

.ui-overlay p {
  margin: 0.5rem 0 0 0;
  font-size: 0.9rem;
  letter-spacing: 0.5em;
  text-transform: uppercase;
  color: var(--jp-red);
  font-weight: 700;
}

.app-footer {
  position: absolute;
  bottom: 3rem;
  left: 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  z-index: 100;
  color: var(--text-color);
}

.credit-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  padding-left: 1rem;
  border-left: 3px solid var(--jp-red);
}

.credit-label {
  font-size: 0.6rem;
  font-weight: 900;
  color: var(--jp-red);
  letter-spacing: 0.3em;
  text-transform: uppercase;
  margin-bottom: 0.2rem;
}

.credit-value {
  font-size: 1rem;
  font-weight: 900;
  color: var(--text-color);
  text-decoration: none;
  letter-spacing: 0.1em;
  transition: all 0.3s;
  display: inline-block;
}

.credit-value:hover {
  color: var(--jp-red);
  transform: translateX(5px);
}

::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-track {
  background: var(--ink-black);
}
::-webkit-scrollbar-thumb {
  background: var(--jp-red);
}
</style>
