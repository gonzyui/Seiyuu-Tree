<script setup lang="ts">
import { Monitor, ArrowRight } from 'lucide-vue-next'
</script>

<template>
  <div class="mobile-blocker">
    <div class="paper-overlay"></div>
    <div class="bg-kanji-large">大型</div>
    
    <div class="magazine-layout">
      <div class="side-accent">
        <div class="hanko">警告</div>
        <div class="vertical-title serif">
          <span class="jp">画面サイズ不足</span>
          <span class="en">RESTRICTED ACCESS</span>
        </div>
      </div>

      <div class="main-content">
        <div class="brand serif">
          <span class="main">声の木</span>
          <span class="sub">KOE NO KI</span>
        </div>

        <div class="message-section serif">
          <div class="icon-wrap">
            <Monitor :size="40" stroke-width="1.5" />
            <div class="pulse-ring"></div>
          </div>
          
          <h2 class="headline">Optimized for Desktop Experience</h2>
          
          <p class="description">
            This visualization tool requires a larger canvas to display the complex relationships of voice actors and characters.
          </p>
          
          <div class="instruction">
            <ArrowRight :size="16" />
            <span>Please visit us from a PC or a Laptop.</span>
          </div>
        </div>

        <div class="footer-stamp">
          <div class="stamp-box">
            <span class="label">EST. 2026</span>
            <span class="value">DESKTOP ONLY</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mobile-blocker {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background-color: var(--bg-color);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: var(--text-color);
  font-family: 'Noto Serif JP', serif;
}

.paper-overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background-image: url('https://www.transparenttextures.com/patterns/parchment.png');
  opacity: 0.05;
  pointer-events: none;
}

.bg-kanji-large {
  position: absolute;
  right: -10%;
  bottom: -10%;
  font-size: 60vh;
  color: var(--jp-red);
  opacity: 0.03;
  font-weight: 900;
  pointer-events: none;
  line-height: 1;
}

.magazine-layout {
  display: flex;
  width: 85%;
  max-width: 450px;
  background: var(--card-bg);
  border: 1px solid var(--text-color);
  box-shadow: 12px 12px 0 var(--jp-red);
  padding: 0;
  position: relative;
  animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.side-accent {
  width: 80px;
  background: var(--text-color);
  color: var(--card-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 0;
  gap: 2rem;
}

.hanko {
  width: 40px;
  height: 40px;
  border: 2px solid var(--card-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 1.2rem;
  background: var(--jp-red);
  color: var(--paper-white);
}

.vertical-title {
  writing-mode: vertical-rl;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.vertical-title .jp {
  font-size: 1.4rem;
  font-weight: 900;
  letter-spacing: 0.2em;
}

.vertical-title .en {
  font-size: 0.6rem;
  font-weight: 400;
  letter-spacing: 0.3em;
  opacity: 0.5;
}

.main-content {
  flex: 1;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.brand {
  display: flex;
  flex-direction: column;
}

.brand .main {
  font-size: 2.5rem;
  font-weight: 900;
  line-height: 1;
  color: var(--jp-red);
}

.brand .sub {
  font-size: 0.7rem;
  letter-spacing: 0.5em;
  opacity: 0.6;
  margin-top: 0.5rem;
}

.message-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.icon-wrap {
  position: relative;
  width: fit-content;
}

.pulse-ring {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 100%; height: 100%;
  border: 1px solid var(--jp-red);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
  100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
}

.headline {
  font-size: 1.5rem;
  font-weight: 900;
  line-height: 1.2;
  margin: 0;
}

.description {
  font-size: 0.95rem;
  line-height: 1.6;
  opacity: 0.8;
  margin: 0;
}

.instruction {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--jp-red);
}

.footer-stamp {
  margin-top: auto;
  border-top: 1px dashed var(--glass-border);
  padding-top: 1.5rem;
}

.stamp-box {
  display: flex;
  flex-direction: column;
}

.stamp-box .label {
  font-size: 0.6rem;
  opacity: 0.5;
  letter-spacing: 0.1em;
}

.stamp-box .value {
  font-size: 0.8rem;
  font-weight: 900;
  letter-spacing: 0.2em;
}

@media (max-width: 400px) {
  .magazine-layout {
    flex-direction: column;
    width: 90%;
  }
  
  .side-accent {
    width: 100%;
    flex-direction: row;
    height: 60px;
    padding: 0 1.5rem;
    justify-content: space-between;
  }
  
  .vertical-title {
    writing-mode: horizontal-tb;
    flex-direction: row;
    align-items: baseline;
  }
  
  .vertical-title .jp { font-size: 1rem; }
  
  .main-content {
    padding: 1.5rem;
    gap: 2rem;
  }
  
  .brand .main { font-size: 2rem; }
}
</style>
