<template>
  <div class="appshell">
    <header class="appbar">
      <div class="appbar__inner">
        <router-link to="/" class="appbar__back">
          <i class="mdi mdi-arrow-left"></i>
          <img :src="logo" alt="LoraText" class="appbar__logo" />
          <span class="appbar__name">LoraText</span>
        </router-link>

        <div class="appbar__status">
          <span class="netpill" :class="online ? 'netpill--on' : 'netpill--off'">
            <i class="mdi" :class="online ? 'mdi-wifi' : 'mdi-wifi-off'"></i>
            <span class="netpill__label">{{ online ? 'Online' : 'Offline' }}</span>
          </span>
          <span class="netpill netpill--offline-ready">
            <i class="mdi mdi-cloud-check-outline"></i>
            <span class="netpill__label">Works offline</span>
          </span>
        </div>
      </div>
    </header>

    <main class="appshell__body">
      <HelloWorld />
    </main>
  </div>
</template>

<script setup>
  import { onMounted, onBeforeUnmount, ref } from 'vue'
  import HelloWorld from '@/components/HelloWorld.vue'

  const logo = '/img/brand-logo.png'
  const online = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)

  function update () {
    online.value = navigator.onLine
  }

  onMounted(() => {
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('online', update)
    window.removeEventListener('offline', update)
  })
</script>

<style scoped>
  .appshell {
    min-height: 100vh;
    background: #0b0b10;
  }

  .appbar {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(11, 11, 16, 0.78);
    backdrop-filter: blur(14px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .appbar__inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0.6rem 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .appbar__back {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    text-decoration: none;
    color: #f4f4f8;
  }

  .appbar__back .mdi {
    font-size: 1.2rem;
    color: #a7a7b4;
    transition: transform 0.25s ease, color 0.25s ease;
  }

  .appbar__back:hover .mdi {
    transform: translateX(-3px);
    color: #f4f4f8;
  }

  .appbar__logo {
    height: 34px;
    width: auto;
    object-fit: contain;
  }

  .appbar__name {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .appbar__status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .netpill {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.78rem;
    font-weight: 600;
    padding: 0.3rem 0.7rem;
    border-radius: 999px;
    border: 1px solid transparent;
  }

  .netpill--on {
    color: #3ddc97;
    background: rgba(61, 220, 151, 0.12);
    border-color: rgba(61, 220, 151, 0.35);
  }

  .netpill--off {
    color: #ffb454;
    background: rgba(255, 180, 84, 0.12);
    border-color: rgba(255, 180, 84, 0.35);
  }

  .netpill--offline-ready {
    color: #b89bff;
    background: rgba(124, 92, 255, 0.12);
    border-color: rgba(124, 92, 255, 0.35);
  }

  @media (max-width: 560px) {
    .netpill__label {
      display: none;
    }
  }
</style>
